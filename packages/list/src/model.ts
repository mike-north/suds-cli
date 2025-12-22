import { HelpModel } from "@suds-cli/help";
import { matches } from "@suds-cli/key";
import { PaginatorModel } from "@suds-cli/paginator";
import { SpinnerModel, TickMsg as SpinnerTickMsg } from "@suds-cli/spinner";
import { batch, type Cmd, type Msg, KeyMsg } from "@suds-cli/tea";
import fuzzysort from "fuzzysort";
import { DefaultDelegate, type ItemDelegate } from "./delegate.js";
import type { Item } from "./item.js";
import { defaultKeyMap, type ListKeyMap } from "./keymap.js";
import { mergeStyles, type ListStyles } from "./styles.js";
import type { FilterState, ListOptions } from "./types.js";

type ListState<T extends Item> = {
  items: T[];
  filteredItems: T[];
  cursor: number;
  filterValue: string;
  filterState: FilterState;
  paginator: PaginatorModel;
  help: HelpModel;
  spinner: SpinnerModel;
  delegate: ItemDelegate<T>;
  styles: ListStyles;
  keyMap: ListKeyMap;
  width: number;
  height: number;
  title: string;
  showTitle: boolean;
  showFilter: boolean;
  showStatusBar: boolean;
  showPagination: boolean;
  showHelp: boolean;
  filteringEnabled: boolean;
  loading: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function perPageFromHeight(
  height: number,
  delegate: ItemDelegate<Item>,
  fallback: number,
): number {
  if (height <= 0) {
    return fallback;
  }
  const perItem = Math.max(1, delegate.height() + delegate.spacing());
  return Math.max(1, Math.floor(height / perItem));
}

function setPaginatorPage(
  paginator: PaginatorModel,
  page: number,
  totalItems: number,
): PaginatorModel {
  const clampedPage = clamp(page, 0, Math.max(0, paginator.totalPages - 1));
  return PaginatorModel.new({
    type: paginator.type,
    page: clampedPage,
    perPage: paginator.perPage,
    totalPages: Math.max(1, Math.ceil(totalItems / paginator.perPage)),
    activeDot: paginator.activeDot,
    inactiveDot: paginator.inactiveDot,
    arabicFormat: paginator.arabicFormat,
    keyMap: paginator.keyMap,
  });
}

type FilterTarget<T> = { item: T; text: string };

function filterItems<T extends Item>(items: T[], query: string): T[] {
  if (!query) return items;
  const targets: Array<FilterTarget<T>> = items.map((item) => ({
    item,
    text: item.filterValue(),
  }));
  const results = fuzzysort.go(query, targets, {
    key: "text",
    threshold: -10000,
  });
  return results.map((r) => r.obj.item);
}

/**
 * Composite list component with filtering, pagination, spinner, and help.
 * @public
 */
export class ListModel<T extends Item> {
  readonly items: T[];
  readonly filteredItems: T[];
  readonly cursor: number;
  readonly filterValue: string;
  readonly filterState: FilterState;
  readonly paginator: PaginatorModel;
  readonly help: HelpModel;
  readonly spinner: SpinnerModel;
  readonly delegate: ItemDelegate<T>;
  readonly styles: ListStyles;
  readonly keyMap: ListKeyMap;
  readonly width: number;
  readonly height: number;
  readonly title: string;
  readonly showTitle: boolean;
  readonly showFilter: boolean;
  readonly showStatusBar: boolean;
  readonly showPagination: boolean;
  readonly showHelp: boolean;
  readonly filteringEnabled: boolean;
  readonly loading: boolean;

  private constructor(state: ListState<T>) {
    this.items = state.items;
    this.filteredItems = state.filteredItems;
    this.cursor = state.cursor;
    this.filterValue = state.filterValue;
    this.filterState = state.filterState;
    this.paginator = state.paginator;
    this.help = state.help;
    this.spinner = state.spinner;
    this.delegate = state.delegate;
    this.styles = state.styles;
    this.keyMap = state.keyMap;
    this.width = state.width;
    this.height = state.height;
    this.title = state.title;
    this.showTitle = state.showTitle;
    this.showFilter = state.showFilter;
    this.showStatusBar = state.showStatusBar;
    this.showPagination = state.showPagination;
    this.showHelp = state.showHelp;
    this.filteringEnabled = state.filteringEnabled;
    this.loading = state.loading;
  }

  /** Create a new list model. */
  static new<T extends Item>(options: ListOptions<T>): ListModel<T> {
    const styles = mergeStyles(options.styles, options.styleProvider);
    const delegate =
      options.delegate instanceof DefaultDelegate
        ? options.delegate.withStyles(styles)
        : options.delegate ?? new DefaultDelegate(styles);
    const items = options.items ?? [];
    const filteredItems = items;
    const perPage = perPageFromHeight(options.height ?? 0, delegate, 10);
    let paginator = PaginatorModel.new({ perPage }).setTotalPages(items.length);
    paginator = setPaginatorPage(paginator, 0, filteredItems.length);

    const width = options.width ?? 0;
    const height = options.height ?? 0;

    return new ListModel<T>({
      items,
      filteredItems,
      cursor: 0,
      filterValue: "",
      filterState: "unfiltered",
      paginator,
      help: HelpModel.new({ width }),
      spinner: new SpinnerModel(),
      delegate,
      styles,
      keyMap: options.keyMap ?? defaultKeyMap,
      width,
      height,
      title: options.title ?? "",
      showTitle: options.showTitle ?? true,
      showFilter: options.showFilter ?? true,
      showStatusBar: options.showStatusBar ?? true,
      showPagination: options.showPagination ?? true,
      showHelp: options.showHelp ?? true,
      filteringEnabled: options.filteringEnabled ?? true,
      loading: false,
    });
  }

  /** Currently selected item (after filtering). */
  selectedItem(): T | undefined {
    return this.filteredItems[this.cursor];
  }

  /** Index of the selected item within the filtered collection. */
  selectedIndex(): number {
    return this.cursor;
  }

  /** Items visible on the current page. */
  visibleItems(): T[] {
    if (!this.showPagination) {
      return this.filteredItems;
    }
    const [start, end] = this.paginator.getSliceBounds(
      this.filteredItems.length,
    );
    return this.filteredItems.slice(start, end);
  }

  /** Move cursor up by one item. */
  cursorUp(): ListModel<T> {
    if (this.filteredItems.length === 0) return this;
    const nextCursor = clamp(this.cursor - 1, 0, this.filteredItems.length - 1);
    const nextPaginator = this.showPagination
      ? setPaginatorPage(
          this.paginator,
          Math.floor(nextCursor / this.paginator.perPage),
          this.filteredItems.length,
        )
      : this.paginator;
    return this.with({ cursor: nextCursor, paginator: nextPaginator });
  }

  /** Move cursor down by one item. */
  cursorDown(): ListModel<T> {
    if (this.filteredItems.length === 0) return this;
    const nextCursor = clamp(
      this.cursor + 1,
      0,
      this.filteredItems.length - 1,
    );
    const nextPaginator = this.showPagination
      ? setPaginatorPage(
          this.paginator,
          Math.floor(nextCursor / this.paginator.perPage),
          this.filteredItems.length,
        )
      : this.paginator;
    return this.with({ cursor: nextCursor, paginator: nextPaginator });
  }

  /** Jump to first item. */
  gotoTop(): ListModel<T> {
    if (this.filteredItems.length === 0) return this;
    const nextPaginator = this.showPagination
      ? setPaginatorPage(this.paginator, 0, this.filteredItems.length)
      : this.paginator;
    return this.with({ cursor: 0, paginator: nextPaginator });
  }

  /** Jump to last item. */
  gotoBottom(): ListModel<T> {
    if (this.filteredItems.length === 0) return this;
    const last = this.filteredItems.length - 1;
    const nextPaginator = this.showPagination
      ? setPaginatorPage(
          this.paginator,
          Math.floor(last / this.paginator.perPage),
          this.filteredItems.length,
        )
      : this.paginator;
    return this.with({ cursor: last, paginator: nextPaginator });
  }

  /** Move to next page. */
  nextPage(): ListModel<T> {
    if (!this.showPagination) return this;
    const nextPaginator = this.paginator.nextPage();
    const [start] = nextPaginator.getSliceBounds(this.filteredItems.length);
    const nextCursor = clamp(
      Math.max(start, this.cursor),
      0,
      this.filteredItems.length - 1,
    );
    return this.with({ paginator: nextPaginator, cursor: nextCursor });
  }

  /** Move to previous page. */
  prevPage(): ListModel<T> {
    if (!this.showPagination) return this;
    const nextPaginator = this.paginator.prevPage();
    const [start] = nextPaginator.getSliceBounds(this.filteredItems.length);
    const nextCursor = clamp(
      Math.max(start, this.cursor),
      0,
      this.filteredItems.length - 1,
    );
    return this.with({ paginator: nextPaginator, cursor: nextCursor });
  }

  /** Begin filtering. */
  startFiltering(): ListModel<T> {
    if (!this.filteringEnabled) return this;
    return this.with({ filterState: "filtering" });
  }

  /** Set the filter query. */
  setFilter(value: string): ListModel<T> {
    if (!this.filteringEnabled) return this;
    const filtered = filterItems(this.items, value);
    const nextPaginator = this.showPagination
      ? this.paginator.setTotalPages(filtered.length)
      : this.paginator;
    const boundedCursor =
      filtered.length === 0
        ? 0
        : clamp(this.cursor, 0, Math.max(0, filtered.length - 1));
    return this.with({
      filterValue: value,
      filterState: value ? "filtering" : "unfiltered",
      filteredItems: filtered,
      cursor: boundedCursor,
      paginator: this.showPagination
        ? setPaginatorPage(
            nextPaginator,
            Math.floor(boundedCursor / nextPaginator.perPage),
            filtered.length,
          )
        : nextPaginator,
    });
  }

  /** Accept the current filter value. */
  acceptFilter(): ListModel<T> {
    if (!this.filteringEnabled) return this;
    const state: FilterState = this.filterValue ? "applied" : "unfiltered";
    return this.with({ filterState: state });
  }

  /** Cancel filtering and restore the unfiltered list. */
  cancelFilter(): ListModel<T> {
    if (!this.filteringEnabled) return this;
    return this.with({
      filterValue: "",
      filterState: "unfiltered",
      filteredItems: this.items,
      cursor: clamp(this.cursor, 0, Math.max(0, this.items.length - 1)),
      paginator: this.showPagination
        ? this.paginator.setTotalPages(this.items.length)
        : this.paginator,
    });
  }

  /** Clear the filter text and results. */
  clearFilter(): ListModel<T> {
    return this.cancelFilter();
  }

  /** Replace items with a new list. */
  setItems(items: T[]): ListModel<T> {
    const filtered = filterItems(items, this.filterValue);
    const nextPaginator = this.showPagination
      ? this.paginator.setTotalPages(filtered.length)
      : this.paginator;
    const nextCursor =
      filtered.length === 0
        ? 0
        : clamp(this.cursor, 0, filtered.length - 1);
    return this.with({
      items,
      filteredItems: filtered,
      cursor: nextCursor,
      paginator: this.showPagination
        ? setPaginatorPage(
            nextPaginator,
            Math.floor(nextCursor / nextPaginator.perPage),
            filtered.length,
          )
        : nextPaginator,
    });
  }

  /** Insert a single item. */
  insertItem(index: number, item: T): ListModel<T> {
    const nextItems = [...this.items];
    nextItems.splice(clamp(index, 0, nextItems.length), 0, item);
    return this.setItems(nextItems);
  }

  /** Remove an item by index. */
  removeItem(index: number): ListModel<T> {
    const nextItems = [...this.items];
    if (index < 0 || index >= nextItems.length) return this;
    nextItems.splice(index, 1);
    return this.setItems(nextItems);
  }

  /** Enter loading mode and start the spinner. */
  startLoading(): [ListModel<T>, Cmd<Msg>] {
    const model = this.with({ loading: true });
    return [model, model.spinner.tick()];
  }

  /** Stop loading. */
  stopLoading(): ListModel<T> {
    return this.with({ loading: false });
  }

  /** Update width. */
  setWidth(width: number): ListModel<T> {
    return this.with({ width, help: this.help.withWidth(width) });
  }

  /** Update height and adjust pagination. */
  setHeight(height: number): ListModel<T> {
    const perPage = perPageFromHeight(height, this.delegate, this.paginator.perPage);
    const nextPaginator = this.showPagination
      ? PaginatorModel.new({
          type: this.paginator.type,
          perPage,
          page: this.paginator.page,
          totalPages: Math.max(
            1,
            Math.ceil(this.filteredItems.length / perPage),
          ),
          activeDot: this.paginator.activeDot,
          inactiveDot: this.paginator.inactiveDot,
          arabicFormat: this.paginator.arabicFormat,
          keyMap: this.paginator.keyMap,
        })
      : this.paginator;
    return this.with({ height, paginator: nextPaginator });
  }

  /** Show detailed help. */
  showHelpView(): ListModel<T> {
    return this.with({ showHelp: true, help: this.help.withShowAll(true) });
  }

  /** Hide detailed help. */
  hideHelpView(): ListModel<T> {
    return this.with({ help: this.help.withShowAll(false) });
  }

  /** Tea init - start spinner if already loading. */
  init(): Cmd<Msg> {
    return this.loading ? this.spinner.tick() : null;
  }

  /** Handle Tea messages. */
  update(msg: Msg): [ListModel<T>, Cmd<Msg>] {
    const cmds: Array<Cmd<Msg>> = [];

    if (msg instanceof SpinnerTickMsg) {
      if (!this.loading) {
        return [this, null];
      }
      const [nextSpinner, spinnerCmd] = this.spinner.update(msg);
      cmds.push(spinnerCmd);
      return [this.with({ spinner: nextSpinner }), batch(...cmds)];
    }

    if (msg instanceof KeyMsg) {
      // Navigation
      if (matches(msg, this.keyMap.cursorUp)) {
        return [this.cursorUp(), null];
      }
      if (matches(msg, this.keyMap.cursorDown)) {
        return [this.cursorDown(), null];
      }
      if (matches(msg, this.keyMap.gotoTop)) {
        return [this.gotoTop(), null];
      }
      if (matches(msg, this.keyMap.gotoBottom)) {
        return [this.gotoBottom(), null];
      }
      if (matches(msg, this.keyMap.nextPage)) {
        return [this.nextPage(), null];
      }
      if (matches(msg, this.keyMap.prevPage)) {
        return [this.prevPage(), null];
      }

      // Filtering
      if (matches(msg, this.keyMap.filter)) {
        return [this.startFiltering(), null];
      }
      if (matches(msg, this.keyMap.clearFilter)) {
        return [this.clearFilter(), null];
      }
      if (matches(msg, this.keyMap.acceptFilter)) {
        return [this.acceptFilter(), null];
      }
      if (matches(msg, this.keyMap.cancelFilter)) {
        return [this.cancelFilter(), null];
      }

      // Help toggles
      if (matches(msg, this.keyMap.showFullHelp)) {
        return [this.showHelpView(), null];
      }
      if (matches(msg, this.keyMap.closeFullHelp)) {
        return [this.hideHelpView(), null];
      }
    }

    const [nextPaginator, paginatorCmd] = this.paginator.update(msg);
    if (paginatorCmd) cmds.push(paginatorCmd);
    const nextModel =
      nextPaginator === this.paginator
        ? this
        : this.with({ paginator: nextPaginator });
    return [nextModel, batch(...cmds)];
  }

  /** Render the list to a string. */
  view(): string {
    const lines: string[] = [];

    if (this.showTitle && this.title) {
      lines.push(this.styles.titleBar.render(this.title));
    }

    if (this.showFilter) {
      const prompt = this.styles.filterPrompt.render("Filter: ");
      const cursor = this.styles.filterCursor.render(this.filterValue || "_");
      lines.push(prompt + cursor);
    }

    if (this.filteredItems.length === 0) {
      lines.push(this.styles.noItems.render("No items"));
    } else {
      const visible = this.visibleItems();
      for (const [idx, item] of visible.entries()) {
        const absoluteIndex = this.showPagination
          ? this.paginator.getSliceBounds(this.filteredItems.length)[0] + idx
          : idx;
        const selected = absoluteIndex === this.cursor;
        const rendered = this.delegate.render(item, absoluteIndex, selected);
        lines.push((selected ? "● " : "  ") + rendered);
        if (idx < visible.length - 1 && this.delegate.spacing() > 0) {
          lines.push("".padEnd(this.delegate.spacing(), " "));
        }
      }
    }

    if (this.showStatusBar) {
      const statusText = `${this.filteredItems.length} items`;
      const pagination = this.showPagination
        ? this.styles.pagination.render(this.paginator.view())
        : "";
      const spinner = this.loading ? this.styles.spinner.render(this.spinner.view()) + " " : "";
      const bar = `${spinner}${statusText}${pagination ? " • " + pagination : ""}`;
      const style =
        this.filteredItems.length === 0
          ? this.styles.statusEmpty
          : this.styles.statusBar;
      lines.push(style.render(bar.trim()));
    }

    if (this.showHelp) {
      lines.push(this.styles.help.render(this.help.view(this.keyMap)));
    }

    return lines.join("\n");
  }

  private with(patch: Partial<ListState<T>>): ListModel<T> {
    return new ListModel<T>({
      items: this.items,
      filteredItems: this.filteredItems,
      cursor: this.cursor,
      filterValue: this.filterValue,
      filterState: this.filterState,
      paginator: this.paginator,
      help: this.help,
      spinner: this.spinner,
      delegate: this.delegate,
      styles: this.styles,
      keyMap: this.keyMap,
      width: this.width,
      height: this.height,
      title: this.title,
      showTitle: this.showTitle,
      showFilter: this.showFilter,
      showStatusBar: this.showStatusBar,
      showPagination: this.showPagination,
      showHelp: this.showHelp,
      filteringEnabled: this.filteringEnabled,
      loading: this.loading,
      ...patch,
    });
  }
}



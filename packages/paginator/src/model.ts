import { matches } from "@suds-cli/key";
import { KeyMsg, type Cmd, type Msg } from "@suds-cli/tea";
import { defaultKeyMap, PaginatorType, type KeyMap } from "./types.js";

/**
 * Options for creating a paginator.
 * @public
 */
export interface PaginatorOptions {
  type?: PaginatorType;
  page?: number;
  perPage?: number;
  totalPages?: number;
  activeDot?: string;
  inactiveDot?: string;
  arabicFormat?: string;
  keyMap?: KeyMap;
}

/**
 * Pagination state and rendering.
 * @public
 */
export class PaginatorModel {
  readonly type: PaginatorType;
  readonly page: number;
  readonly perPage: number;
  readonly totalPages: number;
  readonly activeDot: string;
  readonly inactiveDot: string;
  readonly arabicFormat: string;
  readonly keyMap: KeyMap;

  private constructor(options: PaginatorOptions = {}) {
    this.type = options.type ?? PaginatorType.Arabic;
    this.page = Math.max(0, options.page ?? 0);
    this.perPage = Math.max(1, options.perPage ?? 1);
    this.totalPages = Math.max(1, options.totalPages ?? 1);
    this.activeDot = options.activeDot ?? "•";
    this.inactiveDot = options.inactiveDot ?? "○";
    this.arabicFormat = options.arabicFormat ?? "%d/%d";
    this.keyMap = options.keyMap ?? defaultKeyMap;
  }

  /** Create a new paginator with defaults. */
  static new(options: PaginatorOptions = {}): PaginatorModel {
    return new PaginatorModel(options);
  }

  /** Set total pages based on item count (rounded up). */
  setTotalPages(items: number): PaginatorModel {
    if (items < 1) {
      return this;
    }
    const totalPages = Math.max(1, Math.ceil(items / this.perPage));
    return this.with({ totalPages });
  }

  /** Number of items on the current page for a given total. */
  itemsOnPage(totalItems: number): number {
    if (totalItems < 1) {
      return 0;
    }
    const [start, end] = this.getSliceBounds(totalItems);
    return end - start;
  }

  /** Slice bounds for the current page, clamped to length. */
  getSliceBounds(length: number): [number, number] {
    const start = this.page * this.perPage;
    const end = Math.min(start + this.perPage, length);
    return [start, end];
  }

  /** Move to previous page (no-op on first page). */
  prevPage(): PaginatorModel {
    if (this.page <= 0) {
      return this;
    }
    return this.with({ page: this.page - 1 });
  }

  /** Move to next page (no-op on last page). */
  nextPage(): PaginatorModel {
    if (this.onLastPage()) {
      return this;
    }
    return this.with({ page: this.page + 1 });
  }

  /** Whether the current page is the first page. */
  onFirstPage(): boolean {
    return this.page === 0;
  }

  /** Whether the current page is the last page. */
  onLastPage(): boolean {
    return this.page >= this.totalPages - 1;
  }

  /** Handle Tea messages (responds to KeyMsg). */
  update(msg: Msg): [PaginatorModel, Cmd<Msg>] {
    if (!(msg instanceof KeyMsg)) {
      return [this, null];
    }

    if (matches(msg, this.keyMap.nextPage)) {
      return [this.nextPage(), null];
    }
    if (matches(msg, this.keyMap.prevPage)) {
      return [this.prevPage(), null];
    }

    return [this, null];
  }

  /** Render pagination. */
  view(): string {
    switch (this.type) {
      case PaginatorType.Dots:
        return this.dotsView();
      case PaginatorType.Arabic:
      default:
        return this.arabicView();
    }
  }

  private dotsView(): string {
    let s = "";
    for (let i = 0; i < this.totalPages; i++) {
      s += i === this.page ? this.activeDot : this.inactiveDot;
    }
    return s;
  }

  private arabicView(): string {
    const current = this.page + 1;
    return this.arabicFormat
      .replace("%d", String(current))
      .replace("%d", String(this.totalPages));
  }

  private with(patch: Partial<PaginatorOptions>): PaginatorModel {
    return new PaginatorModel({
      type: this.type,
      page: this.page,
      perPage: this.perPage,
      totalPages: this.totalPages,
      activeDot: this.activeDot,
      inactiveDot: this.inactiveDot,
      arabicFormat: this.arabicFormat,
      keyMap: this.keyMap,
      ...patch,
    });
  }
}




import {
  Style,
  borderStyles,
  defaultBorderStyle,
  joinHorizontal,
  width as textWidth,
  type BorderStyle,
} from "@suds-cli/chapstick";
import { matches } from "@suds-cli/key";
import { KeyMsg, type Cmd, type Msg } from "@suds-cli/tea";
import { defaultKeyMap, type TableKeyMap } from "./keymap.js";
import { defaultStyles, type TableStyles } from "./styles.js";
import type { Column, Row, TableOptions } from "./types.js";

const ELLIPSIS = "…";

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

function clampOffset(
  offset: number,
  rowCount: number,
  height: number,
  cursor: number
): number {
  if (height <= 0) return 0;
  const maxOffset = Math.max(0, rowCount - height);
  let nextOffset = clamp(offset, 0, maxOffset);
  if (cursor < nextOffset) {
    nextOffset = cursor;
  } else if (cursor >= nextOffset + height) {
    nextOffset = Math.max(0, cursor - height + 1);
  }
  return nextOffset;
}

function truncateWithEllipsis(text: string, width: number): string {
  const target = Math.max(0, width);
  if (target === 0) return "";
  if (textWidth(text) <= target) return text;
  if (target === 1) return ELLIPSIS;

  let acc = "";
  for (const ch of text) {
    if (textWidth(acc + ch) >= target) {
      break;
    }
    acc += ch;
    if (textWidth(acc) === target - 1) {
      break;
    }
  }
  return `${acc}${ELLIPSIS}`;
}

function padToWidth(input: string, width: number): string {
  const current = textWidth(input);
  const missing = Math.max(0, width - current);
  return `${input}${" ".repeat(missing)}`;
}

function calculateColumnWidths(
  columns: Column[],
  totalWidth: number,
  bordered: boolean,
): number[] {
  const borderWidth = bordered ? columns.length + 1 : 0;
  const available = Math.max(0, totalWidth - borderWidth);
  const fixed = columns.map((c) => Math.max(0, c.width));
  const totalFixed = fixed.reduce((a, b) => a + b, 0);

  if (totalFixed > available && totalFixed > 0) {
    const scale = available / totalFixed;
    return fixed.map((w) => Math.max(0, Math.floor(w * scale)));
  }
  return fixed;
}

function mergeKeyMap(
  base: TableKeyMap,
  overrides?: Partial<TableKeyMap>
): TableKeyMap {
  return {
    lineUp: overrides?.lineUp ?? base.lineUp,
    lineDown: overrides?.lineDown ?? base.lineDown,
    pageUp: overrides?.pageUp ?? base.pageUp,
    pageDown: overrides?.pageDown ?? base.pageDown,
    halfPageUp: overrides?.halfPageUp ?? base.halfPageUp,
    halfPageDown: overrides?.halfPageDown ?? base.halfPageDown,
    gotoTop: overrides?.gotoTop ?? base.gotoTop,
    gotoBottom: overrides?.gotoBottom ?? base.gotoBottom,
  };
}

function mergeStyles(
  overrides?: Partial<TableStyles>,
  borderStyleOverride?: BorderStyle
): TableStyles {
  const base = defaultStyles();
  const merged: TableStyles = {
    ...base,
    ...overrides,
  };
  if (borderStyleOverride) {
    merged.borderStyle = borderStyleOverride;
  } else if (!merged.borderStyle) {
    merged.borderStyle = defaultBorderStyle;
  }
  return merged;
}

function totalColumnWidth(columns: Column[], bordered: boolean): number {
  const base = columns.reduce((sum, col) => sum + Math.max(0, col.width), 0);
  return bordered ? base + Math.max(0, columns.length - 1) : base;
}

function _innerWidthFrom(
  widths: number[],
  bordered: boolean,
  columnCount: number,
): number {
  const base = widths.reduce((sum, w) => sum + Math.max(0, w), 0);
  return bordered ? base + Math.max(0, columnCount - 1) : base;
}

/** Create a fixed-width cell (like lipgloss Width+MaxWidth+Inline). */
function fixedWidthCell(text: string, width: number): string {
  if (width <= 0) return "";
  const truncated = truncateWithEllipsis(text, width);
  // Use alignHorizontal to ensure padding to target width
  return new Style()
    .width(width)
    .maxWidth(width)
    .alignHorizontal("left")
    .inline(true)
    .render(truncated);
}

function _verticalChar(styles: TableStyles): string {
  return styles.borderStyle?.left ?? borderStyles.normal.left;
}

function wrapWithBorder(
  line: string,
  innerWidth: number,
  styles: TableStyles
): string {
  const width = Math.max(0, innerWidth);
  const padded = padToWidth(line, width);
  const wrapped = `${styles.borderStyle.left}${padded}${styles.borderStyle.right}`;
  return styles.border.render(wrapped);
}

function renderTopBorder(innerWidth: number, styles: TableStyles): string {
  const line = `${styles.borderStyle.topLeft}${styles.borderStyle.top.repeat(Math.max(0, innerWidth))}${styles.borderStyle.topRight}`;
  return styles.border.render(line);
}

function renderSeparator(innerWidth: number, styles: TableStyles): string {
  const line = `${styles.borderStyle.left}${styles.borderStyle.top.repeat(Math.max(0, innerWidth))}${styles.borderStyle.right}`;
  return styles.border.render(line);
}

function renderBottomBorder(innerWidth: number, styles: TableStyles): string {
  const line = `${styles.borderStyle.bottomLeft}${styles.borderStyle.bottom.repeat(Math.max(0, innerWidth))}${styles.borderStyle.bottomRight}`;
  return styles.border.render(line);
}

interface TableState {
  columns: Column[];
  rows: Row[];
  cursor: number;
  offset: number;
  focused: boolean;
  height: number;
  width: number;
  autoWidth: boolean;
  keyMap: TableKeyMap;
  styles: TableStyles;
  bordered: boolean;
  columnWidths: number[];
}

/**
 * Scrollable, selectable table model.
 * @public
 */
export class TableModel {
  readonly columns: Column[];
  readonly rows: Row[];
  readonly cursor: number;
  readonly offset: number;
  readonly focused: boolean;
  readonly height: number;
  readonly width: number;
  readonly autoWidth: boolean;
  readonly keyMap: TableKeyMap;
  readonly styles: TableStyles;
  readonly bordered: boolean;
  readonly columnWidths: number[];

  private constructor(state: TableState) {
    this.columns = state.columns;
    this.rows = state.rows;
    this.cursor = state.cursor;
    this.offset = state.offset;
    this.focused = state.focused;
    this.height = state.height;
    this.width = state.width;
    this.autoWidth = state.autoWidth;
    this.keyMap = state.keyMap;
    this.styles = state.styles;
    this.bordered = state.bordered;
    this.columnWidths = state.columnWidths;
  }

  /** Create a new table model. */
  static new(options: TableOptions): TableModel {
    const rows = [...(options.rows ?? [])];
    const bordered = options.bordered ?? false;
    const styles = mergeStyles(options.styles, options.borderStyle);
    const width =
      options.width ?? totalColumnWidth(options.columns, bordered) ?? 0;
    const autoWidth = options.width === undefined;
    const height = Math.max(0, options.height ?? rows.length);
    const columnWidths = autoWidth
      ? options.columns.map((c) => Math.max(0, c.width))
      : calculateColumnWidths(options.columns, width, bordered);
    const cursor = clamp(
      options.focused ? 0 : 0,
      0,
      Math.max(rows.length - 1, 0)
    );
    const offset = clampOffset(0, rows.length, height, cursor);
    return new TableModel({
      columns: [...options.columns],
      rows,
      cursor,
      offset,
      focused: options.focused ?? false,
      height,
      width,
      autoWidth,
      keyMap: mergeKeyMap(defaultKeyMap, options.keyMap),
      styles,
      bordered,
      columnWidths,
    });
  }

  /** Tea init hook (no-op). */
  init(): Cmd<Msg> {
    return null;
  }

  /** Handle key messages when focused. */
  update(msg: Msg): [TableModel, Cmd<Msg>] {
    if (!this.focused || !(msg instanceof KeyMsg)) {
      return [this, null];
    }

    if (matches(msg, this.keyMap.lineUp)) {
      return [this.moveUp(1), null];
    }
    if (matches(msg, this.keyMap.lineDown)) {
      return [this.moveDown(1), null];
    }
    if (matches(msg, this.keyMap.pageUp)) {
      return [this.moveUp(this.height || 1), null];
    }
    if (matches(msg, this.keyMap.pageDown)) {
      return [this.moveDown(this.height || 1), null];
    }
    if (matches(msg, this.keyMap.halfPageUp)) {
      return [this.moveUp(Math.max(1, Math.floor(this.height / 2))), null];
    }
    if (matches(msg, this.keyMap.halfPageDown)) {
      return [this.moveDown(Math.max(1, Math.floor(this.height / 2))), null];
    }
    if (matches(msg, this.keyMap.gotoTop)) {
      return [this.gotoTop(), null];
    }
    if (matches(msg, this.keyMap.gotoBottom)) {
      return [this.gotoBottom(), null];
    }
    return [this, null];
  }

  /** Render the header and visible rows as a string. */
  view(): string {
    const header = this.renderHeader();
    const headerWidth = textWidth(header);

    const start = this.offset;
    const end = Math.min(start + this.height, this.rows.length);
    const visibleRows = this.renderAllRows().slice(start, end);

    // Pad with empty rows if needed
    const paddedRows = [...visibleRows];
    while (paddedRows.length < this.height) {
      paddedRows.push(this.renderEmptyRow());
    }

    // Calculate inner width for borders (max of header and all rows)
    const rowWidth = paddedRows.length > 0 ? textWidth(paddedRows[0] ?? "") : 0;
    const innerWidth = Math.max(headerWidth, rowWidth);

    if (!this.bordered) {
      return [
        padToWidth(header, innerWidth),
        ...paddedRows.map((r) => padToWidth(r, innerWidth)),
      ].join("\n");
    }

    const wrap = (line: string) => wrapWithBorder(line, innerWidth, this.styles);
    return [
      renderTopBorder(innerWidth, this.styles),
      wrap(padToWidth(header, innerWidth)),
      renderSeparator(innerWidth, this.styles),
      ...paddedRows.map((r) => wrap(padToWidth(r, innerWidth))),
      renderBottomBorder(innerWidth, this.styles),
    ].join("\n");
  }

  /** Current selected row, if any. */
  selectedRow(): Row | undefined {
    if (this.rows.length === 0) return undefined;
    return this.rows[this.cursor];
  }

  /** Current selected index. */
  selectedIndex(): number {
    return this.cursor;
  }

  /** Replace columns. */
  setColumns(columns: Column[]): TableModel {
    return this.with({
      columns: [...columns],
    });
  }

  /** Replace rows. */
  setRows(rows: Row[]): TableModel {
    return this.with({
      rows: [...rows],
    });
  }

  /** Append a single row. */
  appendRow(row: Row): TableModel {
    return this.setRows([...this.rows, row]);
  }

  /** Remove a row by index. */
  removeRow(index: number): TableModel {
    if (index < 0 || index >= this.rows.length) return this;
    const next = [...this.rows];
    next.splice(index, 1);
    return this.setRows(next);
  }

  /** Set the selected index (clamped). */
  setSelectedIndex(index: number): TableModel {
    return this.with({ cursor: index });
  }

  /** Move the cursor up by n rows. */
  moveUp(n = 1): TableModel {
    const delta = Math.max(1, n);
    return this.with({ cursor: this.cursor - delta });
  }

  /** Move the cursor down by n rows. */
  moveDown(n = 1): TableModel {
    const delta = Math.max(1, n);
    return this.with({ cursor: this.cursor + delta });
  }

  /** Jump to the first row. */
  gotoTop(): TableModel {
    return this.with({ cursor: 0 });
  }

  /** Jump to the last row. */
  gotoBottom(): TableModel {
    return this.with({ cursor: this.rows.length - 1 });
  }

  /** Focus the table. */
  focus(): TableModel {
    if (this.focused) return this;
    return this.with({ focused: true });
  }

  /** Blur the table. */
  blur(): TableModel {
    if (!this.focused) return this;
    return this.with({ focused: false });
  }

  /** Set the visible height (rows). */
  setHeight(height: number): TableModel {
    return this.with({ height });
  }

  /** Set the total width. */
  setWidth(width: number): TableModel {
    return this.with({ width });
  }

  private renderHeader(): string {
    // Match Go: fixed-width cell → header style (with padding) → joinHorizontal
    const cells = this.columns.map((col, i) => {
      const width = this.columnWidths[i] ?? col.width;
      const fixedCell = fixedWidthCell(col.title, width);
      return this.styles.header.render(fixedCell);
    });
    return joinHorizontal(...cells);
  }

  private renderRow(row: Row, index: number): string {
    // Match Go: fixed-width cell → cell style (with padding) → join → selected wraps whole row
    const isSelected = this.focused && index === this.cursor;

    const cells = this.columns.map((col, i) => {
      const width = this.columnWidths[i] ?? col.width;
      const value = row[i] ?? "";
      const fixedCell = fixedWidthCell(value, width);
      return this.styles.cell.render(fixedCell);
    });

    const joined = joinHorizontal(...cells);

    // Selected style wraps the entire row (just colors, no padding change)
    if (isSelected) {
      return this.styles.selected.render(joined);
    }
    return joined;
  }

  private renderEmptyRow(): string {
    // Same as renderRow but with empty content
    const cells = this.columns.map((col, i) => {
      const width = this.columnWidths[i] ?? col.width;
      const fixedCell = fixedWidthCell("", width);
      return this.styles.cell.render(fixedCell);
    });
    return joinHorizontal(...cells);
  }

  private renderAllRows(): string[] {
    return this.rows.map((row, i) => this.renderRow(row, i));
  }

  private with(patch: Partial<TableState>): TableModel {
    const nextColumns = patch.columns ?? this.columns;
    const nextRows = patch.rows ?? this.rows;
    const nextHeight = patch.height ?? this.height;
    const nextWidth = patch.width ?? this.width;
    const autoWidth = patch.width !== undefined ? false : this.autoWidth;
    const nextBordered = patch.bordered ?? this.bordered;
    const nextColumnWidths = autoWidth
      ? nextColumns.map((c) => Math.max(0, c.width))
      : calculateColumnWidths(nextColumns, nextWidth, nextBordered);
    const cursor = clamp(
      patch.cursor ?? this.cursor,
      0,
      Math.max(nextRows.length - 1, 0)
    );
    const offset = clampOffset(
      patch.offset ?? this.offset,
      nextRows.length,
      nextHeight,
      cursor
    );
    return new TableModel({
      columns: [...nextColumns],
      rows: [...nextRows],
      cursor,
      offset,
      focused: patch.focused ?? this.focused,
      height: Math.max(0, nextHeight),
      width: Math.max(0, nextWidth),
      autoWidth,
      keyMap: patch.keyMap ?? this.keyMap,
      styles: patch.styles ?? this.styles,
      bordered: nextBordered,
      columnWidths: nextColumnWidths,
    });
  }
}




import { type Cmd, type Msg } from '@boba-cli/tea'
import type { BorderStyle } from '@boba-cli/chapstick'
import {
  TableModel,
  type Column,
  type Row,
  type TableKeyMap,
  type TableStyles,
  type TableOptions,
} from '@boba-cli/table'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the table component builder.
 *
 * @remarks
 * Configure the table's columns, data, dimensions, and behavior when creating a table component.
 *
 * @public
 */
export interface TableBuilderOptions {
  /**
   * Column definitions for the table (required).
   *
   * @remarks
   * Each column specifies a title and width. Columns define the structure of the table.
   */
  columns: Column[]
  /**
   * Row data for the table.
   *
   * @remarks
   * Each row is an array of strings corresponding to the columns.
   * If not provided, the table will be empty.
   */
  rows?: Row[]
  /**
   * Visible height in rows.
   *
   * @remarks
   * Controls how many rows are visible at once. The table will scroll if there are more rows.
   * If not specified, defaults to the number of rows.
   *
   * When explicitly set to 0, the table shows no rows (effectively hidden). This is rarely
   * desired - omit this option to show all rows, or set a positive value to create a scrollable
   * window showing that many rows at once.
   */
  height?: number
  /**
   * Total width of the table.
   *
   * @remarks
   * If not specified, the width is calculated from column widths.
   *
   * When explicitly set to 0, the table has no width constraint and uses the sum of column
   * widths. This is typically not useful since the default behavior already calculates width
   * from columns - prefer omitting this option to use auto-calculated width.
   */
  width?: number
  /**
   * Whether the table is focused and can accept keyboard input.
   *
   * @remarks
   * When focused, the table responds to navigation keys (arrow keys, page up/down, etc.).
   */
  focused?: boolean
  /**
   * Whether to render borders around the table.
   *
   * @remarks
   * When true, draws borders using the specified or default border style.
   */
  bordered?: boolean
  /**
   * Border style to use when bordered is true.
   *
   * @remarks
   * Uses `BorderStyle` from `@boba-cli/chapstick` to control border characters.
   */
  borderStyle?: BorderStyle
  /**
   * Styling for table elements (header, cells, selected row, border).
   *
   * @remarks
   * Customize the appearance of different table parts using `Style` objects.
   */
  styles?: Partial<TableStyles>
  /**
   * Keyboard navigation bindings.
   *
   * @remarks
   * Override default key bindings for navigation actions (up, down, page up/down, etc.).
   */
  keyMap?: Partial<TableKeyMap>
}

/**
 * Create a table component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/table` package.
 * The table supports scrolling, row selection, and keyboard navigation when focused.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('data', table({
 *     columns: [
 *       { title: 'Name', width: 20 },
 *       { title: 'Age', width: 10 },
 *     ],
 *     rows: [
 *       ['Alice', '30'],
 *       ['Bob', '25'],
 *     ],
 *   }))
 *   .view(({ components }) => components.data)
 *   .build()
 * ```
 *
 * @example
 * With borders and focus:
 * ```typescript
 * const app = createApp()
 *   .component('data', table({
 *     columns: [
 *       { title: 'Item', width: 15 },
 *       { title: 'Status', width: 10 },
 *     ],
 *     rows: [
 *       ['Task 1', 'Done'],
 *       ['Task 2', 'Pending'],
 *     ],
 *     bordered: true,
 *     focused: true,
 *     height: 5,
 *   }))
 *   .view(({ components }) => components.data)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the table
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function table(options: TableBuilderOptions): ComponentBuilder<TableModel> {
  const tableOpts: TableOptions = {
    columns: options.columns,
    rows: options.rows,
    height: options.height,
    width: options.width,
    focused: options.focused,
    bordered: options.bordered,
    borderStyle: options.borderStyle,
    styles: options.styles,
    keyMap: options.keyMap,
  }

  return {
    init(): [TableModel, Cmd<Msg>] {
      const model = TableModel.new(tableOpts)
      return [model, model.init()]
    },

    update(model: TableModel, msg: Msg): [TableModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: TableModel): string {
      return model.view()
    },
  }
}

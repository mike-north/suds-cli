import type { Cmd, Msg } from '@boba-cli/tea'
import {
  ListModel,
  type Item,
  type ItemDelegate,
  type ListKeyMap,
  type ListStyles,
} from '@boba-cli/list'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the list component builder.
 *
 * @remarks
 * Configure the list component with items, styling, and behavior when creating a list component.
 *
 * @typeParam T - The item type, must extend `Item`
 *
 * @public
 */
export interface ListBuilderOptions<T extends Item> {
  /**
   * Items to display in the list (required).
   *
   * @remarks
   * Each item must implement the `Item` interface with `filterValue()`,
   * `title()`, and `description()` methods.
   */
  items: T[]
  /**
   * Custom delegate for rendering items.
   *
   * @remarks
   * Provides control over how items are rendered, including height, spacing,
   * and custom styling. If not provided, uses the default delegate.
   */
  delegate?: ItemDelegate<T>
  /**
   * Height of the list component in lines.
   *
   * @remarks
   * Used to calculate pagination. If not provided, defaults to 0.
   *
   * When set to 0 (the default), the height is calculated based on the item delegate's
   * height calculations with a default page size. When set to a positive value, pagination
   * is calculated to fit that many lines, creating a scrollable list if items exceed the height.
   */
  height?: number
  /**
   * Width of the list component in characters.
   *
   * @remarks
   * Used for help text wrapping. If not provided, defaults to 0 (no width limit).
   */
  width?: number
  /**
   * Title displayed at the top of the list.
   *
   * @remarks
   * Only shown if `showTitle` is true (default: true).
   */
  title?: string
  /**
   * Whether to show the title bar (default: true).
   */
  showTitle?: boolean
  /**
   * Whether to show the filter input (default: true).
   */
  showFilter?: boolean
  /**
   * Whether to show pagination controls (default: true).
   */
  showPagination?: boolean
  /**
   * Whether to show help text (default: true).
   */
  showHelp?: boolean
  /**
   * Whether to show the status bar (default: true).
   */
  showStatusBar?: boolean
  /**
   * Whether filtering is enabled (default: true).
   *
   * @remarks
   * When false, filter-related keybindings and UI are disabled.
   */
  filteringEnabled?: boolean
  /**
   * Custom styles for the list components.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   * Partial styles are merged with defaults.
   */
  styles?: Partial<ListStyles>
  /**
   * Custom key mappings for list navigation and actions.
   *
   * @remarks
   * Provides control over which keys trigger list actions like navigation,
   * filtering, and help display. If not provided, uses default key bindings.
   */
  keyMap?: ListKeyMap
}

/**
 * Create a list component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/list` package.
 * The list provides filtering, pagination, keyboard navigation, and help display.
 *
 * @example
 * Basic usage:
 * ```typescript
 * import { list, type Item } from '@boba-cli/dsl'
 *
 * interface TodoItem extends Item {
 *   filterValue: () => string
 *   title: () => string
 *   description: () => string
 * }
 *
 * const items: TodoItem[] = [
 *   { filterValue: () => 'Buy milk', title: () => 'Buy milk', description: () => 'From the store' },
 *   { filterValue: () => 'Walk dog', title: () => 'Walk dog', description: () => 'In the park' },
 * ]
 *
 * const app = createApp()
 *   .component('todos', list({ items }))
 *   .view(({ components }) => components.todos)
 *   .build()
 * ```
 *
 * @example
 * With custom styling and options:
 * ```typescript
 * import { list } from '@boba-cli/dsl'
 * import { Style } from '@boba-cli/chapstick'
 *
 * const app = createApp()
 *   .component('todos', list({
 *     items: todoItems,
 *     title: 'My Tasks',
 *     height: 20,
 *     width: 80,
 *     styles: {
 *       titleBar: new Style().foreground('#50fa7b').bold(),
 *       filterPrompt: new Style().foreground('#8be9fd'),
 *     },
 *     showPagination: true,
 *     filteringEnabled: true,
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Welcome to the Todo App').bold(),
 *     components.todos
 *   ))
 *   .build()
 * ```
 *
 * @typeParam T - The item type, must extend `Item`
 * @param options - Configuration options for the list
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function list<T extends Item>(
  options: ListBuilderOptions<T>,
): ComponentBuilder<ListModel<T>> {
  return {
    init(): [ListModel<T>, Cmd<Msg>] {
      const model = ListModel.new({
        items: options.items,
        delegate: options.delegate,
        height: options.height,
        width: options.width,
        title: options.title,
        showTitle: options.showTitle,
        showFilter: options.showFilter,
        showPagination: options.showPagination,
        showHelp: options.showHelp,
        showStatusBar: options.showStatusBar,
        filteringEnabled: options.filteringEnabled,
        styles: options.styles,
        keyMap: options.keyMap,
      })
      return [model, model.init()]
    },

    update(model: ListModel<T>, msg: Msg): [ListModel<T>, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: ListModel<T>): string {
      return model.view()
    },
  }
}

// Re-export Item type for convenience
export type { Item } from '@boba-cli/list'

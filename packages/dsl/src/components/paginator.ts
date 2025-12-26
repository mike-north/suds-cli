import { type Cmd, type Msg } from '@boba-cli/tea'
import { PaginatorModel, PaginatorType, type KeyMap } from '@boba-cli/paginator'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the paginator component builder.
 *
 * @remarks
 * Configure the paginator display style and behavior when creating a paginator component.
 *
 * @public
 */
export interface PaginatorBuilderOptions {
  /**
   * Pagination display style (required).
   *
   * @remarks
   * - `'dots'`: Renders dots representing each page (e.g., '• ○ ○')
   * - `'arabic'`: Renders page numbers (e.g., '2/5')
   */
  type: 'dots' | 'arabic'

  /**
   * Number of items per page (required).
   *
   * @remarks
   * Must be at least 1. Used with `totalItems` to calculate total pages.
   */
  perPage: number

  /**
   * Total number of items to paginate (required).
   *
   * @remarks
   * Combined with `perPage` to automatically calculate the total number of pages.
   * For example, 100 items with 10 per page results in 10 pages.
   */
  totalItems: number

  /**
   * Initial page index (default: 0).
   *
   * @remarks
   * Zero-indexed page number. Will be clamped to valid range [0, totalPages - 1].
   */
  page?: number

  /**
   * Character for the active page dot (default: '•').
   *
   * @remarks
   * Only used when `type` is `'dots'`.
   */
  activeDot?: string

  /**
   * Character for inactive page dots (default: '○').
   *
   * @remarks
   * Only used when `type` is `'dots'`.
   */
  inactiveDot?: string

  /**
   * Format string for arabic pagination (default: '%d/%d').
   *
   * @remarks
   * Only used when `type` is `'arabic'`. The first `%d` is replaced with
   * the current page number (1-indexed), and the second `%d` is replaced with
   * the total number of pages.
   *
   * @example
   * ```typescript
   * arabicFormat: '%d/%d'     // '3/10'
   * arabicFormat: 'Page %d of %d'  // 'Page 3 of 10'
   * ```
   */
  arabicFormat?: string

  /**
   * Custom key bindings for paginator navigation.
   *
   * @remarks
   * Override default key bindings for navigating between pages.
   * By default, the paginator responds to:
   * - Next page: `pgdown`, `right`, `l`
   * - Previous page: `pgup`, `left`, `h`
   */
  keyMap?: KeyMap
}

/**
 * Create a paginator component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/paginator` package.
 * The paginator handles keyboard navigation and renders page indicators. It automatically
 * calculates total pages from `totalItems` and `perPage`.
 *
 * Use `PaginatorModel.getSliceBounds()` to get the [start, end] indices for slicing
 * your data array for the current page.
 *
 * @example
 * Basic arabic pagination:
 * ```typescript
 * const app = createApp<{ items: string[] }>()
 *   .state({ items: [...Array(100)].map((_, i) => `Item ${i}`) })
 *   .component('pager', paginator({
 *     type: 'arabic',
 *     perPage: 10,
 *     totalItems: 100
 *   }))
 *   .view(({ state, components }) => {
 *     const [start, end] = components.pager.getSliceBounds(state.items.length)
 *     const pageItems = state.items.slice(start, end)
 *     return vstack(
 *       ...pageItems.map(item => text(item)),
 *       components.pager
 *     )
 *   })
 *   .build()
 * ```
 *
 * @example
 * Dots-style pagination:
 * ```typescript
 * const app = createApp()
 *   .component('pager', paginator({
 *     type: 'dots',
 *     perPage: 1,
 *     totalItems: 5,
 *     activeDot: '●',
 *     inactiveDot: '○'
 *   }))
 *   .view(({ components }) => hstack(
 *     text('Navigate: '),
 *     components.pager
 *   ))
 *   .build()
 * ```
 *
 * @example
 * Custom arabic format:
 * ```typescript
 * const app = createApp()
 *   .component('pager', paginator({
 *     type: 'arabic',
 *     perPage: 20,
 *     totalItems: 200,
 *     arabicFormat: 'Page %d of %d'
 *   }))
 *   .view(({ components }) => components.pager)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the paginator (type, perPage, and totalItems are required)
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function paginator(options: PaginatorBuilderOptions): ComponentBuilder<PaginatorModel> {
  return {
    init(): [PaginatorModel, Cmd<Msg>] {
      // Convert the 'dots' | 'arabic' string type to PaginatorType enum
      const paginatorType =
        options.type === 'dots' ? PaginatorType.Dots : PaginatorType.Arabic

      // Create the base model with provided options
      const model = PaginatorModel.new({
        type: paginatorType,
        page: options.page,
        perPage: options.perPage,
        activeDot: options.activeDot,
        inactiveDot: options.inactiveDot,
        arabicFormat: options.arabicFormat,
        keyMap: options.keyMap,
      }).setTotalPages(options.totalItems)

      // Paginator doesn't need any initialization commands
      return [model, null]
    },

    update(model: PaginatorModel, msg: Msg): [PaginatorModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: PaginatorModel): string {
      return model.view()
    },
  }
}

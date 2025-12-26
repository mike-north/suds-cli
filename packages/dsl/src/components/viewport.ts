import { type Cmd, type Msg } from '@boba-cli/tea'
import { Style } from '@boba-cli/chapstick'
import { ViewportModel, type ViewportOptions } from '@boba-cli/viewport'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the viewport component builder.
 *
 * @remarks
 * Configure the viewport dimensions, scrolling behavior, and content when creating a viewport component.
 *
 * @public
 */
export interface ViewportBuilderOptions {
  /**
   * Viewport width in characters.
   *
   * @remarks
   * Defines the horizontal size of the viewport. Defaults to 0.
   *
   * When set to 0 (the default), the viewport has no width constraint and will use
   * the natural width of the content. When set to a positive value, content will be
   * clipped or wrapped to fit the specified width.
   */
  width?: number

  /**
   * Viewport height in lines.
   *
   * @remarks
   * Defines the vertical size (number of visible lines) of the viewport. Defaults to 0.
   *
   * When set to 0 (the default), the viewport shows no lines (effectively disabled).
   * Set this to a positive value to create a scrollable window showing that many lines
   * at once. If there are more content lines than the height, the viewport becomes scrollable.
   */
  height?: number

  /**
   * Enable or disable mouse wheel scrolling (default: true).
   *
   * @remarks
   * When enabled, the viewport responds to mouse wheel events for scrolling.
   */
  mouseWheelEnabled?: boolean

  /**
   * Use high performance rendering mode (default: false).
   *
   * @remarks
   * When enabled, optimizes rendering for better performance with large content.
   * This is a placeholder for future optimization features.
   */
  highPerformanceRendering?: boolean

  /**
   * Initial content to display in the viewport.
   *
   * @remarks
   * The content will be split into lines and displayed in the scrollable viewport.
   * Use newline characters (`\n`) to separate lines.
   */
  content?: string

  /**
   * Style for rendering the viewport content.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   */
  style?: Style
}

/**
 * Create a viewport component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/viewport` package.
 * The viewport provides a scrollable window onto text content with keyboard and
 * mouse wheel navigation support.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('logs', viewport({
 *     width: 80,
 *     height: 20,
 *     content: 'Line 1\nLine 2\nLine 3'
 *   }))
 *   .view(({ components }) => components.logs)
 *   .build()
 * ```
 *
 * @example
 * With custom styling:
 * ```typescript
 * const app = createApp()
 *   .component('output', viewport({
 *     width: 100,
 *     height: 30,
 *     content: generateLongContent(),
 *     style: new Style().foreground('#8be9fd'),
 *     mouseWheelEnabled: true
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Scrollable Output:'),
 *     components.output
 *   ))
 *   .build()
 * ```
 *
 * @example
 * High performance mode for large content:
 * ```typescript
 * const app = createApp()
 *   .component('largeLog', viewport({
 *     width: 120,
 *     height: 40,
 *     content: fs.readFileSync('large-log.txt', 'utf-8'),
 *     highPerformanceRendering: true
 *   }))
 *   .view(({ components }) => components.largeLog)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the viewport
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function viewport(options: ViewportBuilderOptions = {}): ComponentBuilder<ViewportModel> {
  const viewportOpts: ViewportOptions = {
    width: options.width,
    height: options.height,
    mouseWheelEnabled: options.mouseWheelEnabled,
    style: options.style,
  }

  return {
    init(): [ViewportModel, Cmd<Msg>] {
      let model = ViewportModel.new(viewportOpts)
      if (options.content !== undefined) {
        model = model.setContent(options.content)
      }
      return [model, model.init()]
    },

    update(model: ViewportModel, msg: Msg): [ViewportModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: ViewportModel): string {
      return model.view()
    },
  }
}

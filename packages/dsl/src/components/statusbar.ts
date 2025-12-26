import type { Cmd, Msg } from '@boba-cli/tea'
import type { ColorInput } from '@boba-cli/chapstick'
import { StatusbarModel, type ColorConfig } from '@boba-cli/statusbar'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the statusbar component builder.
 *
 * @remarks
 * Configure the color scheme for the four columns of the statusbar.
 * Each column can have independent foreground and background colors.
 *
 * The statusbar is typically displayed at the bottom of your application and
 * provides a 4-column layout for displaying status information.
 *
 * Column layout:
 * - First column: Left-aligned, max 30 characters (truncated with ellipsis if exceeded)
 * - Second column: Fills remaining space, truncates as needed
 * - Third column: Right-aligned, no truncation
 * - Fourth column: Right-most column, right-aligned, no truncation
 *
 * @public
 */
export interface StatusBarBuilderOptions {
  /**
   * Color configuration for the first column.
   *
   * @remarks
   * The first column is left-aligned and truncates if content exceeds
   * 30 characters. Typically used for app name or mode display.
   */
  first: {
    foreground: ColorInput
    background: ColorInput
  }

  /**
   * Color configuration for the second column.
   *
   * @remarks
   * The second column fills the remaining space between the first
   * and third columns, truncating content as needed. Typically used
   * for contextual information or current file/state.
   */
  second: {
    foreground: ColorInput
    background: ColorInput
  }

  /**
   * Color configuration for the third column.
   *
   * @remarks
   * The third column is right-aligned and does not truncate. Typically
   * used for brief status indicators or counts.
   */
  third: {
    foreground: ColorInput
    background: ColorInput
  }

  /**
   * Color configuration for the fourth column.
   *
   * @remarks
   * The fourth column is right-aligned at the edge and does not truncate.
   * Typically used for time, position, or resource usage display.
   */
  fourth: {
    foreground: ColorInput
    background: ColorInput
  }
}

/**
 * Create a statusbar component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/statusbar` package.
 * The statusbar displays a 4-column layout at the bottom of the screen with
 * customizable colors for each column.
 *
 * The statusbar automatically responds to window resize events and manages
 * column layout and truncation. To update statusbar content, use the
 * `sendToComponent()` method in event handlers with the model's `setContent()` method.
 *
 * @example
 * Basic usage with color configuration:
 * ```typescript
 * const app = createApp()
 *   .component('status', statusbar({
 *     first: { foreground: '#ffffff', background: '#5555ff' },
 *     second: { foreground: '#ffffff', background: '#333333' },
 *     third: { foreground: '#ffffff', background: '#555555' },
 *     fourth: { foreground: '#ffffff', background: '#ff5555' }
 *   }))
 *   .view(({ components }) => components.status)
 *   .build()
 * ```
 *
 * @example
 * With dynamic content updates via key handlers:
 * ```typescript
 * const app = createApp<{ count: number }>()
 *   .state({ count: 0 })
 *   .component('status', statusbar({
 *     first: { foreground: '#ffffff', background: '#5555ff' },
 *     second: { foreground: '#ffffff', background: '#333333' },
 *     third: { foreground: '#ffffff', background: '#555555' },
 *     fourth: { foreground: '#ffffff', background: '#ff5555' }
 *   }))
 *   .onKey('up', ({ state, sendToComponent }) => {
 *     sendToComponent('status', (model) =>
 *       model.setContent(
 *         'MyApp v1.0',
 *         'Ready',
 *         `Count: ${state.count}`,
 *         new Date().toLocaleTimeString()
 *       )
 *     )
 *   })
 *   .view(({ components }) => vstack(
 *     text('Press up to update status'),
 *     components.status
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom colors from Dracula theme:
 * ```typescript
 * const app = createApp()
 *   .component('status', statusbar({
 *     first: { foreground: '#f8f8f2', background: '#bd93f9' },
 *     second: { foreground: '#f8f8f2', background: '#44475a' },
 *     third: { foreground: '#f8f8f2', background: '#6272a4' },
 *     fourth: { foreground: '#282a36', background: '#50fa7b' }
 *   }))
 *   .onKey('space', ({ sendToComponent }) => {
 *     sendToComponent('status', (model) =>
 *       model.setContent('Editor', 'file.ts', 'Ln 42', '12:34 PM')
 *     )
 *   })
 *   .view(({ components }) => components.status)
 *   .build()
 * ```
 *
 * @param options - Color configuration for the four statusbar columns
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function statusBar(
  options: StatusBarBuilderOptions,
): ComponentBuilder<StatusbarModel> {
  const firstColors: ColorConfig = {
    foreground: options.first.foreground,
    background: options.first.background,
  }
  const secondColors: ColorConfig = {
    foreground: options.second.foreground,
    background: options.second.background,
  }
  const thirdColors: ColorConfig = {
    foreground: options.third.foreground,
    background: options.third.background,
  }
  const fourthColors: ColorConfig = {
    foreground: options.fourth.foreground,
    background: options.fourth.background,
  }

  return {
    init(): [StatusbarModel, Cmd<Msg>] {
      const model = StatusbarModel.new(
        firstColors,
        secondColors,
        thirdColors,
        fourthColors,
      )
      return [model, null]
    },

    update(model: StatusbarModel, msg: Msg): [StatusbarModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: StatusbarModel): string {
      return model.view()
    },
  }
}

import { type Cmd, type Msg } from '@boba-cli/tea'
import { HelpModel, type HelpOptions, type KeyMap } from '@boba-cli/help'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the help component builder.
 *
 * @remarks
 * Configure the help view appearance and behavior when creating a help component.
 *
 * @public
 */
export interface HelpBuilderOptions {
  /**
   * Key map providing help bindings (required).
   *
   * @remarks
   * The key map provides the bindings to display in the help view via
   * `shortHelp()` and `fullHelp()` methods.
   */
  keyMap: KeyMap

  /**
   * Maximum width for the help view (default: 0, unlimited).
   *
   * @remarks
   * When set, the help view will truncate content that exceeds this width
   * and append an ellipsis indicator.
   */
  width?: number

  /**
   * Show full help with all key bindings (default: false).
   *
   * @remarks
   * When false, displays a compact single-line view.
   * When true, displays a multi-column view with all available bindings.
   */
  showAll?: boolean

  /**
   * Separator string for short help mode (default: ' • ').
   *
   * @remarks
   * Appears between key bindings in the compact single-line view.
   */
  shortSeparator?: string

  /**
   * Separator string for full help mode (default: '    ').
   *
   * @remarks
   * Appears between columns in the multi-column full help view.
   */
  fullSeparator?: string

  /**
   * Ellipsis indicator when truncating content (default: '…').
   *
   * @remarks
   * Displayed when help content exceeds the configured width.
   */
  ellipsis?: string

  /**
   * Custom styles for help text rendering.
   *
   * @remarks
   * Partial object of `HelpStyles` to override default styling.
   * Available style properties: shortKey, shortDesc, shortSeparator,
   * fullKey, fullDesc, fullSeparator, ellipsis.
   */
  styles?: HelpOptions['styles']
}

/**
 * Create a help component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/help` package.
 * The help component renders keyboard shortcuts and their descriptions,
 * with support for both compact and full-screen modes.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const keyMap = {
 *   shortHelp: () => [bindings.up, bindings.down, bindings.quit],
 *   fullHelp: () => [[bindings.up, bindings.down], [bindings.quit]]
 * }
 *
 * const app = createApp()
 *   .component('help', help({ keyMap }))
 *   .view(({ components }) => vstack(
 *     text('My App'),
 *     components.help
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom configuration:
 * ```typescript
 * const app = createApp()
 *   .component('help', help({
 *     keyMap,
 *     width: 80,
 *     showAll: false,
 *     styles: {
 *       shortKey: new Style().foreground('#50fa7b').bold(),
 *       shortDesc: new Style().foreground('#f8f8f2')
 *     }
 *   }))
 *   .view(({ components }) => components.help)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the help component (keyMap is required)
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function help(options: HelpBuilderOptions): ComponentBuilder<HelpModel> {
  const { keyMap } = options
  const helpOpts: HelpOptions = {
    width: options.width,
    showAll: options.showAll,
    shortSeparator: options.shortSeparator,
    fullSeparator: options.fullSeparator,
    ellipsis: options.ellipsis,
    styles: options.styles,
  }

  return {
    init(): [HelpModel, Cmd<Msg>] {
      const model = HelpModel.new(helpOpts)
      return [model, null]
    },

    update(model: HelpModel, msg: Msg): [HelpModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: HelpModel): string {
      return model.view(keyMap)
    },
  }
}

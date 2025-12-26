import { type Cmd, type Msg } from '@boba-cli/tea'
import { HelpBubble, type Entry, type TitleColor } from '@boba-cli/help'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the help bubble component builder.
 *
 * @remarks
 * Configure the help bubble's title, colors, and entries when creating the component.
 *
 * @public
 */
export interface HelpBubbleBuilderOptions {
  /**
   * Array of help entries to display (required).
   *
   * @remarks
   * Each entry contains a key binding and its description.
   */
  entries: Entry[]
  /**
   * Title text for the help screen (default: 'Help').
   *
   * @remarks
   * Displayed at the top of the help bubble with styled background and foreground colors.
   */
  title?: string
  /**
   * Color configuration for the title bar.
   *
   * @remarks
   * Supports adaptive colors for light and dark terminals.
   * Uses `ColorInput` from `@boba-cli/chapstick`.
   */
  titleColor?: TitleColor
  /**
   * Whether the help bubble starts in active state (default: false).
   *
   * @remarks
   * When active, the help bubble receives keyboard input for scrolling.
   * When inactive, it ignores input messages.
   */
  active?: boolean
}

/**
 * Create a help bubble component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/help` package.
 * The help bubble displays a scrollable list of key bindings with descriptions,
 * using a viewport for navigation.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('help', helpBubble({
 *     entries: [
 *       { key: 'q/esc', description: 'Quit' },
 *       { key: 'j/down', description: 'Move down' },
 *       { key: 'k/up', description: 'Move up' }
 *     ]
 *   }))
 *   .view(({ components }) => components.help)
 *   .build()
 * ```
 *
 * @example
 * With custom title and colors:
 * ```typescript
 * const app = createApp()
 *   .component('help', helpBubble({
 *     entries: [
 *       { key: 'enter', description: 'Select item' },
 *       { key: 'tab', description: 'Switch focus' }
 *     ],
 *     title: 'Keyboard Shortcuts',
 *     titleColor: {
 *       background: '#282a36',
 *       foreground: '#f8f8f2'
 *     },
 *     active: true
 *   }))
 *   .view(({ components }) => components.help)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the help bubble
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function helpBubble(
  options: HelpBubbleBuilderOptions,
): ComponentBuilder<HelpBubble> {
  const title = options.title ?? 'Help'
  const titleColor = options.titleColor ?? {
    background: { dark: '#5f5f87', light: '#d7d7ff' },
    foreground: { dark: '#ffffff', light: '#000000' },
  }
  const active = options.active ?? false

  return {
    init(): [HelpBubble, Cmd<Msg>] {
      const model = HelpBubble.new(active, title, titleColor, options.entries)
      return [model, null]
    },

    update(model: HelpBubble, msg: Msg): [HelpBubble, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: HelpBubble): string {
      return model.view()
    },
  }
}

/**
 * Re-export Entry type for convenience.
 *
 * @public
 */
export type { Entry }

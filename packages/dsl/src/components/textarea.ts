import { type Cmd, type Msg } from '@boba-cli/tea'
import { Style } from '@boba-cli/chapstick'
import {
  TextareaModel,
  CursorMode,
  type TextareaOptions,
  type ValidateFunc,
  type KeyMap,
} from '@boba-cli/textarea'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the textArea component builder.
 *
 * @remarks
 * Configure the multi-line text area appearance, validation, and behavior when creating
 * a text area component.
 *
 * @public
 */
export interface TextAreaBuilderOptions {
  /**
   * Initial value (multi-line text).
   *
   * @remarks
   * The starting content of the textarea. Use `\n` for line breaks.
   */
  value?: string

  /**
   * Placeholder text shown when textarea is empty.
   *
   * @remarks
   * Displayed in a dimmed style when the textarea has no content. Disappears once
   * the user starts typing. Uses `placeholderStyle` for styling.
   */
  placeholder?: string

  /**
   * Width constraint for the textarea.
   *
   * @remarks
   * When set to 0 or not specified, the textarea has no width constraint and grows with content.
   * When set to a positive value, lines longer than the width will wrap to the next line.
   */
  width?: number

  /**
   * Maximum visible height in lines.
   *
   * @remarks
   * When set to 0 (the default), there is no maximum height constraint - the textarea
   * will grow to accommodate all lines of content. When set to a positive value, the
   * textarea will not exceed that height and will become scrollable if content exceeds
   * the limit.
   */
  maxHeight?: number

  /**
   * Maximum width constraint.
   *
   * @remarks
   * When set, prevents lines from exceeding this width. Works together with `width`
   * to control horizontal sizing.
   */
  maxWidth?: number

  /**
   * Prompt string shown before each line.
   *
   * @remarks
   * Displayed at the start of each line in the textarea. Uses `promptStyle` for styling.
   * Common patterns include empty string (no prompt), `'| '`, or `'  '` for indentation.
   */
  prompt?: string

  /**
   * Show line numbers on the left (default: false).
   *
   * @remarks
   * When enabled, displays line numbers in the left margin using `lineNumberStyle` for styling.
   * Useful for code editing or when line references are important.
   */
  showLineNumbers?: boolean

  /**
   * Cursor display mode.
   *
   * @remarks
   * Controls how the cursor is displayed:
   * - `CursorMode.Blink`: Cursor blinks on and off (default)
   * - `CursorMode.Static`: Cursor is always visible
   * - `CursorMode.Hidden`: Cursor is not displayed
   */
  cursorMode?: CursorMode

  /**
   * Validation function.
   *
   * @remarks
   * Called on every change to validate the current textarea content. Return `null` for
   * valid input, or an `Error` with a descriptive message for invalid input. The error
   * message can be displayed to the user in the UI.
   *
   * @example
   * ```typescript
   * validate: (value) => {
   *   const lines = value.split('\n')
   *   if (lines.length > 10) return new Error('Maximum 10 lines allowed')
   *   return null
   * }
   * ```
   */
  validate?: ValidateFunc

  /**
   * Style for the prompt.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting to the prompt.
   */
  promptStyle?: Style

  /**
   * Style for the text content.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting to typed text.
   */
  textStyle?: Style

  /**
   * Style for the placeholder text.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting to the placeholder.
   */
  placeholderStyle?: Style

  /**
   * Style for the cursor.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting to the cursor.
   */
  cursorStyle?: Style

  /**
   * Style for line numbers.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting to line numbers
   * when `showLineNumbers` is enabled.
   */
  lineNumberStyle?: Style

  /**
   * Custom key bindings.
   *
   * @remarks
   * Override default key bindings for navigation and editing actions. If not provided,
   * uses default Vi-like key bindings (arrow keys, j/k for up/down, etc.).
   */
  keyMap?: KeyMap
}

/**
 * Create a textArea component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/textarea` package.
 * The text area supports multi-line editing, scrolling, line numbers, validation,
 * and extensive styling options.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('editor', textArea({
 *     placeholder: 'Enter your text...',
 *     maxHeight: 10
 *   }))
 *   .view(({ components }) => components.editor)
 *   .build()
 * ```
 *
 * @example
 * With line numbers and validation:
 * ```typescript
 * const app = createApp()
 *   .component('editor', textArea({
 *     placeholder: 'Type code here...',
 *     maxHeight: 20,
 *     width: 80,
 *     showLineNumbers: true,
 *     validate: (value) => {
 *       const lines = value.split('\n')
 *       if (lines.length > 100) return new Error('Maximum 100 lines')
 *       return null
 *     }
 *   }))
 *   .view(({ components }) => components.editor)
 *   .build()
 * ```
 *
 * @example
 * With custom styling and cursor mode:
 * ```typescript
 * import { textArea, CursorMode } from '@boba-cli/dsl'
 * import { Style } from '@boba-cli/chapstick'
 *
 * const app = createApp()
 *   .component('styledEditor', textArea({
 *     prompt: '| ',
 *     showLineNumbers: true,
 *     cursorMode: CursorMode.Static,
 *     promptStyle: new Style().foreground('#6272a4'),
 *     textStyle: new Style().foreground('#f8f8f2'),
 *     lineNumberStyle: new Style().foreground('#44475a').dim(),
 *     cursorStyle: new Style().foreground('#ff79c6').bold()
 *   }))
 *   .view(({ components }) => components.styledEditor)
 *   .build()
 * ```
 *
 * @example
 * Multi-line input with initial value:
 * ```typescript
 * const app = createApp()
 *   .component('notes', textArea({
 *     value: 'Line 1\nLine 2\nLine 3',
 *     placeholder: 'Enter notes...',
 *     maxHeight: 15,
 *     maxWidth: 60
 *   }))
 *   .view(({ components }) => components.notes)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the text area
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function textArea(
  options: TextAreaBuilderOptions = {},
): ComponentBuilder<TextareaModel> {
  const textareaOpts: TextareaOptions = {
    value: options.value,
    placeholder: options.placeholder,
    width: options.width,
    maxHeight: options.maxHeight,
    maxWidth: options.maxWidth,
    prompt: options.prompt ?? '',
    showLineNumbers: options.showLineNumbers ?? false,
    cursorMode: options.cursorMode,
    validate: options.validate,
    promptStyle: options.promptStyle ?? new Style(),
    textStyle: options.textStyle ?? new Style(),
    placeholderStyle: options.placeholderStyle ?? new Style(),
    cursorStyle: options.cursorStyle ?? new Style(),
    lineNumberStyle: options.lineNumberStyle ?? new Style(),
    keyMap: options.keyMap,
  }

  return {
    init(): [TextareaModel, Cmd<Msg>] {
      const model = TextareaModel.new(textareaOpts)
      const [focused, cmd] = model.focus()
      return [focused, cmd]
    },

    update(model: TextareaModel, msg: Msg): [TextareaModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: TextareaModel): string {
      return model.view()
    },
  }
}

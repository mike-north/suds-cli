import { type Cmd, type Msg } from '@boba-cli/tea'
import { Style } from '@boba-cli/chapstick'
import {
  TextInputModel,
  EchoMode,
  type TextInputOptions,
  type ValidateFunc,
} from '@boba-cli/textinput'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the textInput component builder.
 *
 * @remarks
 * Configure the text input's appearance, behavior, and validation when creating
 * a text input component.
 *
 * @public
 */
export interface TextInputBuilderOptions {
  /**
   * Placeholder text shown when input is empty.
   *
   * @remarks
   * Displayed in a dimmed style when the input has no content. Uses `placeholderStyle` for styling.
   */
  placeholder?: string

  /**
   * Width constraint for the input field.
   *
   * @remarks
   * When set to 0 or not specified, the input field has no width constraint.
   * When set to a positive value, the input will be constrained to that width.
   */
  width?: number

  /**
   * Echo mode for input display (default: `EchoMode.Normal`).
   *
   * @remarks
   * Controls how input characters are displayed:
   * - `EchoMode.Normal`: Characters are displayed as typed
   * - `EchoMode.Password`: Characters are hidden with asterisks or dots
   * - `EchoMode.None`: No characters are displayed
   */
  echoMode?: EchoMode

  /**
   * Character limit for input (default: 0 = unlimited).
   *
   * @remarks
   * When set to a positive value, prevents input beyond the specified character count.
   * When 0 or not specified, there is no character limit.
   */
  charLimit?: number

  /**
   * Prompt string shown before the input.
   *
   * @remarks
   * Displayed at the start of the input line. Uses `promptStyle` for styling.
   * Common examples: `'> '`, `'$ '`, or `'Name: '`.
   */
  prompt?: string

  /**
   * Style for the prompt.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   */
  promptStyle?: Style

  /**
   * Style for the input text.
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
   * Validation function.
   *
   * @remarks
   * Called on every change to validate the current input value. Return `null` for
   * valid input, or an `Error` with a descriptive message for invalid input.
   *
   * @example
   * ```typescript
   * validate: (value) => {
   *   if (value.length < 3) return new Error('Too short')
   *   if (!/^[a-z]+$/.test(value)) return new Error('Lowercase letters only')
   *   return null
   * }
   * ```
   */
  validate?: ValidateFunc
}

/**
 * Create a textInput component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/textinput` package.
 * The text input accepts user keyboard input and supports validation, placeholders,
 * password masking, and character limits. The component is automatically focused
 * on initialization.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('nameInput', textInput({
 *     placeholder: 'Enter your name...',
 *     width: 40
 *   }))
 *   .view(({ components }) => components.nameInput)
 *   .build()
 * ```
 *
 * @example
 * With validation:
 * ```typescript
 * const app = createApp()
 *   .component('emailInput', textInput({
 *     placeholder: 'Email address',
 *     validate: (value) => {
 *       if (!value.includes('@')) return new Error('Invalid email')
 *       return null
 *     }
 *   }))
 *   .view(({ components }) => components.emailInput)
 *   .build()
 * ```
 *
 * @example
 * Password input:
 * ```typescript
 * const app = createApp()
 *   .component('password', textInput({
 *     placeholder: 'Password',
 *     echoMode: EchoMode.Password,
 *     charLimit: 50
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Enter your password:'),
 *     components.password
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom styling:
 * ```typescript
 * import { textInput, EchoMode } from '@boba-cli/dsl'
 * import { Style } from '@boba-cli/chapstick'
 *
 * const app = createApp()
 *   .component('styledInput', textInput({
 *     prompt: '> ',
 *     placeholder: 'Type something...',
 *     promptStyle: new Style().foreground('#50fa7b').bold(),
 *     textStyle: new Style().foreground('#f8f8f2'),
 *     placeholderStyle: new Style().foreground('#6272a4').italic()
 *   }))
 *   .view(({ components }) => components.styledInput)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the text input
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function textInput(
  options: TextInputBuilderOptions = {},
): ComponentBuilder<TextInputModel> {
  const inputOpts: TextInputOptions = {
    placeholder: options.placeholder ?? '',
    width: options.width,
    echoMode: options.echoMode ?? EchoMode.Normal,
    charLimit: options.charLimit ?? 0,
    prompt: options.prompt ?? '',
    promptStyle: options.promptStyle ?? new Style(),
    textStyle: options.textStyle ?? new Style(),
    placeholderStyle: options.placeholderStyle ?? new Style(),
    validate: options.validate,
  }

  return {
    init(): [TextInputModel, Cmd<Msg>] {
      const model = TextInputModel.new(inputOpts)
      const [focused, cmd] = model.focus()
      return [focused, cmd]
    },

    update(model: TextInputModel, msg: Msg): [TextInputModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: TextInputModel): string {
      return model.view()
    },
  }
}

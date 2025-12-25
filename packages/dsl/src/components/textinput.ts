import { type Cmd, type Msg } from '@suds-cli/tea'
import { Style } from '@suds-cli/chapstick'
import {
  TextInputModel,
  EchoMode,
  type TextInputOptions,
  type ValidateFunc,
} from '@suds-cli/textinput'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the textInput component builder.
 * @public
 */
export interface TextInputBuilderOptions {
  /** Placeholder text shown when input is empty. */
  placeholder?: string
  /** Width constraint for the input field. */
  width?: number
  /** Echo mode for input display (Normal, Password, or None). */
  echoMode?: EchoMode
  /** Character limit for input. */
  charLimit?: number
  /** Prompt string shown before the input. */
  prompt?: string
  /** Style for the prompt. */
  promptStyle?: Style
  /** Style for the input text. */
  textStyle?: Style
  /** Style for the placeholder text. */
  placeholderStyle?: Style
  /** Validation function. */
  validate?: ValidateFunc
}

/**
 * Create a textInput component builder.
 *
 * @example
 * ```typescript
 * const app = createApp()
 *   .component('nameInput', textInput({
 *     placeholder: 'Enter your name...',
 *     width: 40,
 *     validate: (value) => value.length < 3 ? new Error('Too short') : null
 *   }))
 *   .view(({ components }) => components.nameInput)
 *   .build()
 * ```
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

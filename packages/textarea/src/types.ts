import { Style } from '@suds-cli/chapstick'
import { CursorMode } from '@suds-cli/cursor'
import { Binding, newBinding } from '@suds-cli/key'

/**
 * Validation callback. Return an Error to indicate invalid input.
 * @public
 */
export type ValidateFunc = (value: string) => Error | null

/**
 * Options for creating a textarea model.
 * @public
 */
export interface TextareaOptions {
  value?: string
  placeholder?: string
  charLimit?: number
  width?: number
  prompt?: string
  cursorMode?: CursorMode
  promptStyle?: Style
  textStyle?: Style
  placeholderStyle?: Style
  cursorStyle?: Style
  validate?: ValidateFunc
  maxHeight?: number
  maxWidth?: number
  showLineNumbers?: boolean
  lineNumberStyle?: Style
  endOfBufferCharacter?: string
  keyMap?: KeyMap
}

/**
 * Key bindings for textarea actions.
 * @public
 */
export interface KeyMap {
  characterLeft: Binding
  characterRight: Binding
  lineUp: Binding
  lineDown: Binding
  lineStart: Binding
  lineEnd: Binding
  insertNewline: Binding
  deleteCharBackward: Binding
  deleteCharForward: Binding
  deleteLine: Binding
  gotoLineStart: Binding
  gotoLineEnd: Binding
  paste: Binding
}

/**
 * Default key bindings (Vi-like arrows plus enter/backspace/delete).
 * @public
 */
export const defaultKeyMap: KeyMap = {
  characterLeft: newBinding({ keys: ['left'] }),
  characterRight: newBinding({ keys: ['right'] }),
  lineUp: newBinding({ keys: ['up', 'k'] }),
  lineDown: newBinding({ keys: ['down', 'j'] }),
  lineStart: newBinding({ keys: ['home', 'ctrl+a'] }),
  lineEnd: newBinding({ keys: ['end', 'ctrl+e'] }),
  insertNewline: newBinding({ keys: ['enter'] }),
  deleteCharBackward: newBinding({ keys: ['backspace', 'ctrl+h'] }),
  deleteCharForward: newBinding({ keys: ['delete', 'ctrl+d'] }),
  deleteLine: newBinding({ keys: ['ctrl+u'] }),
  gotoLineStart: newBinding({ keys: ['home'] }),
  gotoLineEnd: newBinding({ keys: ['end'] }),
  paste: newBinding({ keys: ['ctrl+v'] }),
}

export { CursorMode }

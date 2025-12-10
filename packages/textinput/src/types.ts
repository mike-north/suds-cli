import { Style } from "@suds-cli/chapstick";
import { CursorMode } from "@suds-cli/cursor";
import { Binding, newBinding } from "@suds-cli/key";

/**
 * Echo rendering mode for text input.
 * @public
 */
export enum EchoMode {
  Normal = "normal",
  Password = "password",
  None = "none",
}

/**
 * Validation callback. Return an Error to indicate invalid input.
 * @public
 */
export type ValidateFunc = (value: string) => Error | null;

/**
 * Key bindings for editing/navigation.
 * @public
 */
export interface KeyMap {
  characterForward: Binding;
  characterBackward: Binding;
  wordForward: Binding;
  wordBackward: Binding;
  deleteWordBackward: Binding;
  deleteWordForward: Binding;
  deleteAfterCursor: Binding;
  deleteBeforeCursor: Binding;
  deleteCharacterBackward: Binding;
  deleteCharacterForward: Binding;
  lineStart: Binding;
  lineEnd: Binding;
  paste: Binding;
}

/**
 * Default key bindings (mirrors Bubbles textinput defaults).
 * @public
 */
export const defaultKeyMap: KeyMap = {
  characterForward: newBinding({ keys: ["right", "ctrl+f"] }),
  characterBackward: newBinding({ keys: ["left", "ctrl+b"] }),
  wordForward: newBinding({ keys: ["alt+right", "ctrl+right", "alt+f"] }),
  wordBackward: newBinding({ keys: ["alt+left", "ctrl+left", "alt+b"] }),
  deleteWordBackward: newBinding({ keys: ["alt+backspace", "ctrl+w"] }),
  deleteWordForward: newBinding({ keys: ["alt+delete", "alt+d"] }),
  deleteAfterCursor: newBinding({ keys: ["ctrl+k"] }),
  deleteBeforeCursor: newBinding({ keys: ["ctrl+u"] }),
  deleteCharacterBackward: newBinding({ keys: ["backspace", "ctrl+h"] }),
  deleteCharacterForward: newBinding({ keys: ["delete", "ctrl+d"] }),
  lineStart: newBinding({ keys: ["home", "ctrl+a"] }),
  lineEnd: newBinding({ keys: ["end", "ctrl+e"] }),
  paste: newBinding({ keys: ["ctrl+v"] }),
};

/**
 * Configuration for creating a text input model.
 * @public
 */
export interface TextInputOptions {
  value?: string;
  placeholder?: string;
  echoMode?: EchoMode;
  echoCharacter?: string;
  charLimit?: number;
  width?: number;
  prompt?: string;
  cursorMode?: CursorMode;
  promptStyle?: Style;
  textStyle?: Style;
  placeholderStyle?: Style;
  cursorStyle?: Style;
  validate?: ValidateFunc;
  keyMap?: KeyMap;
}

export { CursorMode };




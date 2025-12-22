import { Binding, newBinding } from "@suds-cli/key";

/**
 * Keyboard bindings for the filetree component.
 * @public
 */
export interface FiletreeKeyMap {
  down: Binding;
  up: Binding;
}

/**
 * Default key bindings for the filetree.
 * @public
 */
export const defaultKeyMap: FiletreeKeyMap = {
  down: newBinding({ keys: ["j", "down", "ctrl+n"] }).withHelp("j/↓", "down"),
  up: newBinding({ keys: ["k", "up", "ctrl+p"] }).withHelp("k/↑", "up"),
};

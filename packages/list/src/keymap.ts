import type { KeyMap as HelpKeyMap } from "@suds-cli/help";
import { Binding, newBinding } from "@suds-cli/key";

/**
 * Keyboard bindings for the list component.
 * @public
 */
export interface ListKeyMap extends HelpKeyMap {
  cursorUp: Binding;
  cursorDown: Binding;
  gotoTop: Binding;
  gotoBottom: Binding;
  nextPage: Binding;
  prevPage: Binding;
  filter: Binding;
  clearFilter: Binding;
  acceptFilter: Binding;
  cancelFilter: Binding;
  showFullHelp: Binding;
  closeFullHelp: Binding;
  quit: Binding;
  forceQuit: Binding;
}

/** Default bindings modeled after the Go bubbles list. @public */
export const defaultKeyMap: ListKeyMap = {
  cursorUp: newBinding({ keys: ["up", "k"] }),
  cursorDown: newBinding({ keys: ["down", "j"] }),
  prevPage: newBinding({ keys: ["left", "h", "pgup", "b", "u"] }),
  nextPage: newBinding({ keys: ["right", "l", "pgdown", "f", "d"] }),
  gotoTop: newBinding({ keys: ["home", "g"] }),
  gotoBottom: newBinding({ keys: ["end", "G"] }),
  filter: newBinding({ keys: ["/"] }),
  clearFilter: newBinding({ keys: ["esc"] }),
  acceptFilter: newBinding({
    keys: ["enter", "tab", "shift+tab", "ctrl+k", "up", "ctrl+j", "down"],
  }),
  cancelFilter: newBinding({ keys: ["esc"] }),
  showFullHelp: newBinding({ keys: ["?"] }),
  closeFullHelp: newBinding({ keys: ["?"] }),
  quit: newBinding({ keys: ["q", "esc"] }),
  forceQuit: newBinding({ keys: ["ctrl+c"] }),
  shortHelp() {
    return [
      this.cursorUp,
      this.cursorDown,
      this.prevPage,
      this.nextPage,
      this.filter,
      this.quit,
    ];
  },
  fullHelp() {
    return [
      [this.cursorUp, this.cursorDown, this.gotoTop, this.gotoBottom],
      [this.prevPage, this.nextPage, this.filter, this.clearFilter],
      [this.showFullHelp, this.acceptFilter, this.cancelFilter, this.quit],
    ];
  },
};



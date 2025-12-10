import { newBinding } from "@suds-cli/key";
import type { FilepickerKeyMap } from "./types.js";

/** Default filepicker keymap. @public */
export const defaultKeyMap: FilepickerKeyMap = {
  up: newBinding({ keys: ["up", "k"] }),
  down: newBinding({ keys: ["down", "j"] }),
  select: newBinding({ keys: ["enter"] }),
  back: newBinding({ keys: ["backspace", "h", "left"] }),
  open: newBinding({ keys: ["right", "l"] }),
  toggleHidden: newBinding({ keys: ["."] }),
  pageUp: newBinding({ keys: ["pgup", "u"] }),
  pageDown: newBinding({ keys: ["pgdown", "d"] }),
  gotoTop: newBinding({ keys: ["home", "g"] }),
  gotoBottom: newBinding({ keys: ["end", "G"] }),
  shortHelp() {
    return [this.up, this.down, this.select, this.back];
  },
  fullHelp() {
    return [
      [this.up, this.down, this.pageUp, this.pageDown],
      [this.select, this.open, this.back, this.toggleHidden],
      [this.gotoTop, this.gotoBottom],
    ];
  },
};




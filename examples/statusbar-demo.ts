/**
 * Suds Demo: Statusbar
 *
 * Demonstrates @suds-cli/tea, @suds-cli/statusbar, @suds-cli/chapstick, and @suds-cli/key.
 *
 * Controls:
 *   q      - Quit
 *   Ctrl+C - Quit
 *   esc    - Quit
 */

import {
  Program,
  KeyMsg,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from "@suds-cli/tea";
import { StatusbarModel, Height } from "@suds-cli/statusbar";
import { Style, joinVertical } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

// Keybindings
const keys = {
  quit: newBinding({ keys: ["q", "Q", "ctrl+c", "esc"] }).withHelp("q", "quit"),
};

// Demo model
class DemoModel implements Model<Msg, DemoModel> {
  constructor(
    readonly statusbar: StatusbarModel = StatusbarModel.new(
      {
        foreground: { dark: "#ffffff", light: "#ffffff" },
        background: { light: "#F25D94", dark: "#F25D94" },
      }, // Pink
      {
        foreground: { light: "#ffffff", dark: "#ffffff" },
        background: { light: "#3c3836", dark: "#3c3836" },
      }, // Gray
      {
        foreground: { light: "#ffffff", dark: "#ffffff" },
        background: { light: "#A550DF", dark: "#A550DF" },
      }, // Purple
      {
        foreground: { light: "#ffffff", dark: "#ffffff" },
        background: { light: "#6124DF", dark: "#6124DF" },
      }, // Indigo
    ),
    readonly height: number = 0,
  ) {}

  init(): Cmd<Msg> {
    return null;
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    // Handle window resize
    if (msg instanceof WindowSizeMsg) {
      const updatedStatusbar = this.statusbar
        .setSize(msg.width)
        .setContent("test.txt", "~/.config/nvim", "1/23", "SB");
      return [new DemoModel(updatedStatusbar, msg.height), null];
    }

    // Handle key events
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()];
      }
    }

    return [this, null];
  }

  view(): string {
    const contentStyle = new Style().height(
      Math.max(0, this.height - Height),
    );
    const content = contentStyle.render("Content");

    return joinVertical(content, this.statusbar.view());
  }
}

// Run the demo
async function main() {
  console.clear();
  const program = new Program(new DemoModel(), { altScreen: true });
  await program.run();
}

main().catch(console.error);

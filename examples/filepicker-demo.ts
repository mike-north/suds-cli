/**
 * Suds Demo: Filepicker
 *
 * Demonstrates @suds-cli/filepicker for browsing the filesystem.
 *
 * Controls (built into the filepicker keymap):
 *   j / k / arrows  - move selection
 *   enter / →       - open directory or select file
 *   backspace / ←   - go up a directory
 *   .               - toggle hidden files
 *   g / G           - go to top / bottom
 *   q               - quit
 */

import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";
import {
  KeyMsg,
  Program,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from "@suds-cli/tea";
import { FileSelectedMsg, FilepickerModel } from "@suds-cli/filepicker";

const quitBinding = newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp(
  "q",
  "quit",
);

const headerStyle = new Style().bold(true).foreground("#8be9fd");
const helpStyle = new Style().foreground("#6272a4").italic(true);
const statusStyle = new Style().foreground("#50fa7b");

class DemoModel implements Model<Msg, DemoModel> {
  readonly picker: FilepickerModel;
  readonly status: string;

  constructor(picker?: FilepickerModel, status = "Select a file or folder") {
    this.picker = picker ?? FilepickerModel.new({ showHidden: false })[0];
    this.status = status;
  }

  init(): Cmd<Msg> {
    return this.picker.init();
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()];
    }

    const [nextPicker, cmd] = this.picker.update(msg);

    if (msg instanceof FileSelectedMsg) {
      const nextStatus = msg.file.path;
      if (nextStatus !== this.status) {
        return [new DemoModel(nextPicker, nextStatus), cmd];
      }
    }

    // When selection happens, FileSelectedMsg is emitted via command; we also reflect current picker state
    const nextStatus = nextPicker.selectedFile?.path ?? this.status;

    if (nextPicker !== this.picker || nextStatus !== this.status) {
      return [new DemoModel(nextPicker, nextStatus), cmd];
    }

    return [this, cmd];
  }

  view(): string {
    const header = headerStyle.render("🧼 Suds Demo — Filepicker");
    const help = helpStyle.render(
      "Use arrows/enter/backspace. '.' toggles hidden. q to quit.",
    );
    const status = statusStyle.render(`Selection: ${this.status}`);
    return [header, "", this.picker.view(), "", status, "", help, ""].join(
      "\n",
    );
  }
}

async function main(): Promise<void> {
  console.clear();
  const program = new Program(new DemoModel());
  await program.run();
}

main().catch(console.error);



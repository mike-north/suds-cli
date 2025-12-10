/**
 * Suds Demo: Textarea
 *
 * Multi-line input with validation, line numbers, and scrolling.
 * Controls:
 *   type to edit
 *   enter to add lines
 *   backspace/delete to remove
 *   up/down to move lines
 *   ctrl+v to paste
 *   q or ctrl+c to quit (handled here)
 */

import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Msg,
  type Model,
} from "@suds-cli/tea";
import { TextareaModel } from "@suds-cli/textarea";
import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

const keys = {
  quit: newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp("q", "quit"),
};

const titleStyle = new Style().bold(true).foreground("#00d7ff");
const infoStyle = new Style().foreground("#999");
const promptStyle = new Style().foreground("#6ee7b7").bold(true);
const textStyle = new Style().foreground("#e0def4");
const placeholderStyle = new Style().foreground("#5c6773").italic(true);
const lineNumberStyle = new Style().foreground("#7c3aed");
const okStyle = new Style().foreground("#8be9fd");
const errStyle = new Style().foreground("#ff5370");

class DemoModel implements Model<Msg, DemoModel> {
  readonly editor: TextareaModel;
  readonly initCmd: Cmd<Msg>;

  constructor(editor?: TextareaModel, initCmd?: Cmd<Msg>) {
    if (editor) {
      this.editor = editor;
      this.initCmd = initCmd ?? null;
      return;
    }

    const base = TextareaModel.new({
      placeholder: "Write a few lines here…",
      width: 60,
      maxHeight: 6,
      showLineNumbers: true,
      lineNumberStyle,
      prompt: "> ",
      promptStyle,
      textStyle,
      placeholderStyle,
      validate: (v) => (v.trim().length < 5 ? new Error("Need at least 5 chars") : null),
    });
    const [focused, cmd] = base.focus();
    this.editor = focused;
    this.initCmd = cmd as Cmd<Msg>;
  }

  init(): Cmd<Msg> {
    return this.initCmd;
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, keys.quit)) {
      return [this, quit()];
    }

    const [nextEditor, cmd] = this.editor.update(msg);
    if (nextEditor !== this.editor) {
      return [new DemoModel(nextEditor, this.initCmd), cmd];
    }
    return [this, cmd];
  }

  view(): string {
    const lines: string[] = [];
    lines.push(titleStyle.render("🧼 Suds Textarea Demo"));
    lines.push("");
    lines.push(this.editor.view());

    const err = this.editor.error;
    if (err) {
      lines.push(errStyle.render(`Error: ${err.message}`));
    } else if (!this.editor.isEmpty()) {
      lines.push(okStyle.render(`Length: ${this.editor.value().length} chars`));
    } else {
      lines.push(okStyle.render("Start typing to validate..."));
    }

    lines.push("");
    lines.push(
      infoStyle.render("Controls: type • enter for newline • ctrl+v paste • q/ctrl+c quit"),
    );

    return lines.join("\n");
  }
}

async function main() {
  console.clear();
  const program = new Program(new DemoModel());
  await program.run();
}

main().catch(console.error);




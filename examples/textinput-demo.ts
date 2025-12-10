/**
 * Suds Demo: Text Input
 *
 * Demonstrates @suds-cli/textinput with validation, placeholder,
 * width-constrained scrolling, and styles.
 *
 * Controls:
 *   type to edit
 *   ctrl+v to paste
 *   ctrl+c or q to quit
 */

import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Msg,
  type Model,
} from "@suds-cli/tea";
import { TextInputModel, EchoMode, type ValidateFunc } from "@suds-cli/textinput";
import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

const keys = {
  quit: newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp("q", "quit"),
};

const titleStyle = new Style().bold(true).foreground("#00d7ff");
const labelStyle = new Style().foreground("#c792ea");
const successStyle = new Style().foreground("#89ddff");
const errorStyle = new Style().foreground("#ff5370");
const placeholderStyle = new Style().foreground("#5c6773").italic(true);
const promptStyle = new Style().foreground("#6ee7b7").bold(true);
const textStyle = new Style().foreground("#e0def4");

const validateName: ValidateFunc = (value) => {
  if (value.trim().length < 3) {
    return new Error("Name must be at least 3 characters");
  }
  return null;
};

class DemoModel implements Model<Msg, DemoModel> {
  readonly input: TextInputModel;
  readonly focusCmd: Cmd<Msg>;

  constructor(input?: TextInputModel, focusCmd?: Cmd<Msg>) {
    if (input) {
      this.input = input;
      this.focusCmd = focusCmd ?? null;
      return;
    }

    const base = TextInputModel.new({
      placeholder: "Type your name…",
      width: 40,
      echoMode: EchoMode.Normal,
      charLimit: 100,
      prompt: "> ",
      promptStyle,
      textStyle,
      placeholderStyle,
      validate: validateName,
    });

    const [focused, cmd] = base.focus();
    this.input = focused;
    this.focusCmd = cmd as Cmd<Msg>;
  }

  init(): Cmd<Msg> {
    // Kick off cursor blinking if needed
    return this.focusCmd;
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, keys.quit)) {
      return [this, quit()];
    }

    const [nextInput, cmd] = this.input.update(msg);
    if (nextInput !== this.input) {
      return [new DemoModel(nextInput, this.focusCmd), cmd];
    }

    return [this, cmd];
  }

  view(): string {
    const lines: string[] = [];
    lines.push(titleStyle.render("🧼 Suds Text Input Demo"));
    lines.push("");
    lines.push(labelStyle.render("Name:"));
    lines.push(this.input.view());

    const err = this.input.error;
    if (err) {
      lines.push(errorStyle.render(`Error: ${err.message}`));
    } else if (!this.input.isEmpty()) {
      lines.push(successStyle.render(`Looks good, ${this.input.valueOf()}!`));
    } else {
      lines.push(successStyle.render("Enter at least 3 characters"));
    }

    lines.push("");
    lines.push(
      new Style()
        .foreground("#999")
        .render("Controls: type to edit • ctrl+v to paste • q/ctrl+c to quit"),
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




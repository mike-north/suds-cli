/**
 * Suds Demo: Spinner with Styling
 *
 * Demonstrates @suds/tea, @suds/spinner, @suds/chapstick, and @suds/key
 * working together.
 *
 * Controls:
 *   s     - Cycle through spinner styles
 *   q     - Quit
 *   Ctrl+C - Quit
 */

import { Program, KeyMsg, quit, type Cmd, type Model, type Msg } from "@suds-cli/tea";
import { SpinnerModel, line, dot, miniDot, pulse, points, moon, meter, ellipsis, type Spinner } from "@suds-cli/spinner";
import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

// Available spinners to cycle through
const SPINNERS: { name: string; spinner: Spinner }[] = [
  { name: "line", spinner: line },
  { name: "dot", spinner: dot },
  { name: "miniDot", spinner: miniDot },
  { name: "pulse", spinner: pulse },
  { name: "points", spinner: points },
  { name: "moon", spinner: moon },
  { name: "meter", spinner: meter },
  { name: "ellipsis", spinner: ellipsis },
];

// Keybindings
const keys = {
  nextSpinner: newBinding({ keys: ["s", "S"] }).withHelp("s", "change spinner"),
  quit: newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp("q", "quit"),
};

// Styles
const titleStyle = new Style()
  .bold(true)
  .foreground("#ff79c6");

const spinnerStyle = new Style()
  .foreground("#50fa7b");

const textStyle = new Style()
  .foreground("#f8f8f2");

const helpStyle = new Style()
  .foreground("#6272a4")
  .italic(true);

const keyStyle = new Style()
  .foreground("#bd93f9")
  .bold(true);

// Demo model
class DemoModel implements Model<Msg, DemoModel> {
  readonly spinner: SpinnerModel;
  readonly spinnerIndex: number;

  constructor(spinnerIndex = 0, spinner?: SpinnerModel) {
    this.spinnerIndex = spinnerIndex;
    const current = SPINNERS[spinnerIndex];
    if (!current) {
      throw new Error(`Invalid spinner index: ${spinnerIndex}`);
    }
    this.spinner = spinner ?? new SpinnerModel({
      spinner: current.spinner,
      style: spinnerStyle,
    });
  }

  init(): Cmd<Msg> {
    // Start the spinner animation
    return this.spinner.tick() as Cmd<Msg>;
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    // Handle key events
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()];
      }

      if (matches(msg, keys.nextSpinner)) {
        // Cycle to next spinner
        const nextIndex = (this.spinnerIndex + 1) % SPINNERS.length;
        const nextSpinnerDef = SPINNERS[nextIndex];
        if (!nextSpinnerDef) {
          return [this, null];
        }
        const newSpinner = new SpinnerModel({
          spinner: nextSpinnerDef.spinner,
          style: spinnerStyle,
        });
        const next = new DemoModel(nextIndex, newSpinner);
        return [next, newSpinner.tick() as Cmd<Msg>];
      }
    }

    // Pass other messages to spinner
    const [nextSpinner, cmd] = this.spinner.update(msg);
    if (nextSpinner !== this.spinner) {
      return [new DemoModel(this.spinnerIndex, nextSpinner), cmd as Cmd<Msg>];
    }

    return [this, cmd as Cmd<Msg>];
  }

  view(): string {
    const current = SPINNERS[this.spinnerIndex];
    const spinnerName = current?.name ?? "unknown";

    const title = titleStyle.render("🧼 Suds Demo");

    const spinnerLine = `${this.spinner.view()}  ${textStyle.render("Loading something amazing...")}`;

    const status = helpStyle.render(
      `Spinner: ${keyStyle.render(spinnerName)} • ` +
      `Press ${keyStyle.render("[s]")} to change • ` +
      `${keyStyle.render("[q]")} to quit`
    );

    return [
      "",
      title,
      "",
      spinnerLine,
      "",
      status,
      "",
    ].join("\n");
  }
}

// Run the demo
async function main() {
  console.clear();
  const program = new Program(new DemoModel());
  await program.run();
}

main().catch(console.error);


/**
 * Suds Demo: Stopwatch
 *
 * Demonstrates @suds-cli/tea, @suds-cli/stopwatch, @suds-cli/chapstick, and @suds-cli/key.
 *
 * Controls:
 *   space  - Start/stop
 *   r      - Reset elapsed
 *   q      - Quit
 */

import { Program, KeyMsg, quit, type Cmd, type Model, type Msg } from "@suds-cli/tea";
import { StopwatchModel, TickMsg, StartStopMsg, ResetMsg } from "@suds-cli/stopwatch";
import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

const keys = {
  toggle: newBinding({ keys: ["space"] }).withHelp("space", "start/stop"),
  reset: newBinding({ keys: ["r", "R"] }).withHelp("r", "reset"),
  quit: newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp("q", "quit"),
};

const title = new Style().bold(true).foreground("#8be9fd");
const text = new Style().foreground("#f8f8f2");
const value = new Style().bold(true).foreground("#50fa7b");
const statusStyle = new Style().foreground("#ffb86c");
const help = new Style().foreground("#6272a4");
const keyStyle = new Style().foreground("#bd93f9").bold(true);

class StopwatchDemo implements Model<Msg, StopwatchDemo> {
  constructor(
    readonly stopwatch = StopwatchModel.new({ interval: 1_000 }),
    readonly status: "running" | "paused" = "running",
  ) {}

  init(): Cmd<Msg> {
    // Start immediately
    return this.stopwatch.init() as Cmd<Msg>;
  }

  update(msg: Msg): [StopwatchDemo, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()];
      }

      if (matches(msg, keys.toggle)) {
        const cmd = this.stopwatch.toggle();
        return [this, cmd as Cmd<Msg>];
      }

      if (matches(msg, keys.reset)) {
        const cmd = this.stopwatch.reset();
        return [this, cmd as Cmd<Msg>];
      }
    }

    if (msg instanceof StartStopMsg || msg instanceof TickMsg || msg instanceof ResetMsg) {
      const [nextStopwatch, cmd] = this.stopwatch.update(msg) as [StopwatchModel, Cmd<Msg>];
      const nextStatus = msg instanceof StartStopMsg
        ? msg.running ? "running" : "paused"
        : this.status;
      return [new StopwatchDemo(nextStopwatch, nextStatus), cmd as Cmd<Msg>];
    }

    return [this, null];
  }

  view(): string {
    const state = this.status === "running" ? statusStyle.foreground("#50fa7b") : statusStyle.foreground("#f1fa8c");

    return [
      "",
      title.render("⏱️ Suds Stopwatch Demo"),
      "",
      text.render(`Elapsed: ${value.render(this.stopwatch.view())}`),
      text.render(`Status: ${state.render(this.status)}`),
      "",
      help.render(
        `Controls: ${keyStyle.render("[space]")} start/stop • ${keyStyle.render("[r]")} reset • ${keyStyle.render("[q]")} quit`,
      ),
      "",
    ].join("\n");
  }
}

async function main() {
  console.clear();
  const program = new Program(new StopwatchDemo());
  await program.run();
}

main().catch(console.error);




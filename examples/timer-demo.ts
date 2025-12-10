/**
 * Suds Demo: Timer countdown
 *
 * Demonstrates @suds-cli/tea, @suds-cli/timer, @suds-cli/chapstick, and @suds-cli/key.
 *
 * Controls:
 *   space  - Start/stop
 *   r      - Restart timer
 *   q      - Quit
 */

import { Program, KeyMsg, quit, batch, type Cmd, type Model, type Msg } from "@suds-cli/tea";
import { TimerModel, TickMsg, TimeoutMsg, StartStopMsg } from "@suds-cli/timer";
import { Style } from "@suds-cli/chapstick";
import { newBinding, matches } from "@suds-cli/key";

const keys = {
  // Space renders as " " from KeyMsg.toString()
  toggle: newBinding({ keys: [" "] }).withHelp("space", "start/stop"),
  restart: newBinding({ keys: ["r", "R"] }).withHelp("r", "restart"),
  quit: newBinding({ keys: ["q", "Q", "ctrl+c"] }).withHelp("q", "quit"),
};

const title = new Style().bold(true).foreground("#ff79c6");
const text = new Style().foreground("#f8f8f2");
const value = new Style().bold(true).foreground("#50fa7b");
const statusStyle = new Style().foreground("#8be9fd");
const help = new Style().foreground("#6272a4");
const keyStyle = new Style().foreground("#bd93f9").bold(true);

class TimerDemo implements Model<Msg, TimerDemo> {
  constructor(
    readonly initialTimeout = 30_000,
    readonly timer = TimerModel.new({ timeout: initialTimeout }),
    readonly status: "running" | "paused" | "done" = "running",
  ) {}

  init(): Cmd<Msg> {
    return this.timer.init() as Cmd<Msg>;
  }

  update(msg: Msg): [TimerDemo, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()];
      }

      if (matches(msg, keys.toggle)) {
        const cmd = this.timer.toggle();
        return [this, cmd as Cmd<Msg>];
      }

      if (matches(msg, keys.restart)) {
        const fresh = TimerModel.new({ timeout: this.initialTimeout, interval: this.timer.interval });
        return [new TimerDemo(this.initialTimeout, fresh, "running"), fresh.init() as Cmd<Msg>];
      }
    }

    if (msg instanceof StartStopMsg || msg instanceof TickMsg || msg instanceof TimeoutMsg) {
      const [nextTimer, cmd] = this.timer.update(msg) as [TimerModel, Cmd<Msg>];
      const nextStatus = msg instanceof TimeoutMsg
        ? "done"
        : msg instanceof StartStopMsg
          ? msg.running ? "running" : "paused"
          : this.status;
      return [new TimerDemo(this.initialTimeout, nextTimer, nextStatus), cmd as Cmd<Msg>];
    }

    return [this, null];
  }

  view(): string {
    const state = this.status === "done" ? statusStyle.foreground("#ff5555") : this.status === "paused" ? statusStyle.foreground("#f1fa8c") : statusStyle;

    const lines = [
      "",
      title.render("⏳ Suds Timer Demo"),
      "",
      text.render(`Remaining: ${value.render(this.timer.view())}`),
      text.render(`Status: ${state.render(this.status)}`),
      "",
      help.render(
        `Controls: ${keyStyle.render("[space]")} start/stop • ${keyStyle.render("[r]")} restart • ${keyStyle.render("[q]")} quit`,
      ),
    ];

    if (this.status === "done") {
      lines.push(help.render("Timer expired. Press [r] to restart."));
    }

    lines.push("");
    return lines.join("\n");
  }
}

async function main() {
  console.clear();
  const program = new Program(new TimerDemo());
  await program.run();
}

main().catch(console.error);




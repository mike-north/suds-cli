/**
 * Boba Demo: Stopwatch
 *
 * Demonstrates \@boba-cli/tea, \@boba-cli/stopwatch, \@boba-cli/chapstick, and \@boba-cli/key.
 *
 * Controls:
 *   space  - Start/stop
 *   r      - Reset elapsed
 *   q      - Quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'
import {
  StopwatchModel,
  TickMsg,
  StartStopMsg,
  ResetMsg,
} from '\@boba-cli/stopwatch'
import { Style } from '\@boba-cli/chapstick'
import { newBinding, matches } from '\@boba-cli/key'

const keys = {
  toggle: newBinding({ keys: ['space'] }).withHelp('space', 'start/stop'),
  reset: newBinding({ keys: ['r', 'R'] }).withHelp('r', 'reset'),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

const title = new Style().bold(true).foreground('#8be9fd')
const text = new Style().foreground('#f8f8f2')
const value = new Style().bold(true).foreground('#50fa7b')
const statusStyle = new Style().foreground('#ffb86c')
const help = new Style().foreground('#6272a4')
const keyStyle = new Style().foreground('#bd93f9').bold(true)

class StopwatchDemo implements Model<Msg, StopwatchDemo> {
  constructor(
    readonly stopwatch = StopwatchModel.new({ interval: 1_000 }),
    readonly status: 'running' | 'paused' = 'running',
  ) {}

  init(): Cmd<Msg> {
    // Start immediately
    return this.stopwatch.init()
  }

  update(msg: Msg): [StopwatchDemo, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }

      if (matches(msg, keys.toggle)) {
        const cmd = this.stopwatch.toggle()
        return [this, cmd]
      }

      if (matches(msg, keys.reset)) {
        const cmd = this.stopwatch.reset()
        return [this, cmd]
      }
    }

    if (
      msg instanceof StartStopMsg ||
      msg instanceof TickMsg ||
      msg instanceof ResetMsg
    ) {
      const [nextStopwatch, cmd] = this.stopwatch.update(msg) as [
        StopwatchModel,
        Cmd<Msg>,
      ]
      const nextStatus =
        msg instanceof StartStopMsg
          ? msg.running
            ? 'running'
            : 'paused'
          : this.status
      return [new StopwatchDemo(nextStopwatch, nextStatus), cmd]
    }

    return [this, null]
  }

  view(): string {
    const state =
      this.status === 'running'
        ? statusStyle.foreground('#50fa7b')
        : statusStyle.foreground('#f1fa8c')

    return [
      '',
      title.render('⏱️ Boba Stopwatch Demo'),
      '',
      text.render(`Elapsed: ${value.render(this.stopwatch.view())}`),
      text.render(`Status: ${state.render(this.status)}`),
      '',
      help.render(
        `Controls: ${keyStyle.render('[space]')} start/stop • ${keyStyle.render('[r]')} reset • ${keyStyle.render('[q]')} quit`,
      ),
      '',
    ].join('\n')
  }
}

/**
 * Run the stopwatch demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new StopwatchDemo(), { platform })
  await program.run()
}

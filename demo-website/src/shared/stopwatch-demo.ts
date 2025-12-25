/**
 * Stopwatch Demo - Shared Model
 *
 * Controls:
 *   space  - Start/stop
 *   r      - Reset elapsed
 *   q      - Quit
 */

import {
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import {
  StopwatchModel,
  TickMsg,
  StartStopMsg,
  ResetMsg,
} from '@suds-cli/stopwatch'
import { newBinding, matches } from '@suds-cli/key'
import { createStyle } from '../browser-style'

const keys = {
  toggle: newBinding({ keys: ['space', ' '] }).withHelp('space', 'start/stop'),
  reset: newBinding({ keys: ['r', 'R'] }).withHelp('r', 'reset'),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

const title = createStyle().bold(true).foreground('#8be9fd')
const text = createStyle().foreground('#f8f8f2')
const value = createStyle().bold(true).foreground('#50fa7b')
const statusStyle = createStyle().foreground('#ffb86c')
const help = createStyle().foreground('#6272a4')
const keyStyle = createStyle().foreground('#bd93f9').bold(true)

export class StopwatchDemoModel implements Model<Msg, StopwatchDemoModel> {
  readonly stopwatch: StopwatchModel
  readonly status: 'running' | 'paused'

  constructor(
    stopwatch?: StopwatchModel,
    status: 'running' | 'paused' = 'running',
  ) {
    this.stopwatch = stopwatch ?? StopwatchModel.new({ interval: 1_000 })
    this.status = status
  }

  init(): Cmd<Msg> {
    return this.stopwatch.init()
  }

  update(msg: Msg): [StopwatchDemoModel, Cmd<Msg>] {
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
      return [new StopwatchDemoModel(nextStopwatch, nextStatus), cmd]
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
      title.render('Suds Stopwatch Demo'),
      '',
      text.render(`Elapsed: ${value.render(this.stopwatch.view())}`),
      text.render(`Status: ${state.render(this.status)}`),
      '',
      help.render(
        `${keyStyle.render('[space]')} start/stop | ${keyStyle.render('[r]')} reset | ${keyStyle.render('[q]')} quit`,
      ),
      '',
    ].join('\n')
  }
}

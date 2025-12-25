/**
 * Timer Demo - Shared Model
 *
 * Controls:
 *   space  - Start/stop
 *   r      - Restart timer
 *   q      - Quit
 */

import {
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { TimerModel, TickMsg, TimeoutMsg, StartStopMsg } from '@suds-cli/timer'
import { newBinding, matches } from '@suds-cli/key'
import { createStyle } from '../browser-style'

const keys = {
  toggle: newBinding({ keys: [' '] }).withHelp('space', 'start/stop'),
  restart: newBinding({ keys: ['r', 'R'] }).withHelp('r', 'restart'),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

const title = createStyle().bold(true).foreground('#ff79c6')
const text = createStyle().foreground('#f8f8f2')
const value = createStyle().bold(true).foreground('#50fa7b')
const statusStyle = createStyle().foreground('#8be9fd')
const help = createStyle().foreground('#6272a4')
const keyStyle = createStyle().foreground('#bd93f9').bold(true)

export class TimerDemoModel implements Model<Msg, TimerDemoModel> {
  readonly timer: TimerModel
  readonly initialTimeout: number
  readonly status: 'running' | 'paused' | 'done'

  constructor(
    initialTimeout = 30_000,
    timer?: TimerModel,
    status: 'running' | 'paused' | 'done' = 'running',
  ) {
    this.initialTimeout = initialTimeout
    this.timer = timer ?? TimerModel.new({ timeout: initialTimeout })
    this.status = status
  }

  init(): Cmd<Msg> {
    return this.timer.init()
  }

  update(msg: Msg): [TimerDemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }

      if (matches(msg, keys.toggle)) {
        const cmd = this.timer.toggle()
        return [this, cmd]
      }

      if (matches(msg, keys.restart)) {
        const fresh = TimerModel.new({
          timeout: this.initialTimeout,
          interval: this.timer.interval,
        })
        return [
          new TimerDemoModel(this.initialTimeout, fresh, 'running'),
          fresh.init(),
        ]
      }
    }

    if (
      msg instanceof StartStopMsg ||
      msg instanceof TickMsg ||
      msg instanceof TimeoutMsg
    ) {
      const [nextTimer, cmd] = this.timer.update(msg) as [TimerModel, Cmd<Msg>]
      const nextStatus =
        msg instanceof TimeoutMsg
          ? 'done'
          : msg instanceof StartStopMsg
            ? msg.running
              ? 'running'
              : 'paused'
            : this.status
      return [
        new TimerDemoModel(this.initialTimeout, nextTimer, nextStatus),
        cmd,
      ]
    }

    return [this, null]
  }

  view(): string {
    const state =
      this.status === 'done'
        ? statusStyle.foreground('#ff5555')
        : this.status === 'paused'
          ? statusStyle.foreground('#f1fa8c')
          : statusStyle

    const lines = [
      '',
      title.render('Suds Timer Demo'),
      '',
      text.render(`Remaining: ${value.render(this.timer.view())}`),
      text.render(`Status: ${state.render(this.status)}`),
      '',
      help.render(
        `${keyStyle.render('[space]')} start/stop | ${keyStyle.render('[r]')} restart | ${keyStyle.render('[q]')} quit`,
      ),
    ]

    if (this.status === 'done') {
      lines.push(help.render('Timer expired. Press [r] to restart.'))
    }

    lines.push('')
    return lines.join('\n')
  }
}

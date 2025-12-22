import {
  batch,
  msg as lift,
  tick,
  type Cmd,
  type Msg as TeaMsg,
  type Model as TeaModel,
} from '@suds-cli/tea'
import { StartStopMsg, TickMsg, TimeoutMsg } from './messages.js'

// Module-level ID counter for unique timers
let lastId = 0
function nextId(): number {
  return ++lastId
}

/** Options for creating a timer. @public */
export interface TimerOptions {
  /** Milliseconds until the timer expires. */
  timeout: number
  /** Tick interval in milliseconds (default: 1000). */
  interval?: number
}

/** Timer messages. @public */
export type TimerMsg = TickMsg | TimeoutMsg | StartStopMsg

/** Countdown timer model. @public */
export class TimerModel implements TeaModel<TimerMsg, TimerModel> {
  readonly timeout: number
  readonly interval: number
  readonly #id: number
  readonly #tag: number
  readonly #running: boolean

  private constructor(options: {
    timeout: number
    interval: number
    running: boolean
    id: number
    tag: number
  }) {
    this.timeout = options.timeout
    this.interval = options.interval
    this.#running = options.running
    this.#id = options.id
    this.#tag = options.tag
  }

  /** Create a new timer with the given options. */
  static new(options: TimerOptions): TimerModel {
    const interval = options.interval ?? 1000
    return new TimerModel({
      timeout: options.timeout,
      interval,
      running: true,
      id: nextId(),
      tag: 0,
    })
  }

  /** Create a new timer with explicit timeout and interval. */
  static withInterval(timeout: number, interval: number): TimerModel {
    return TimerModel.new({ timeout, interval })
  }

  /** Unique ID for message routing. */
  id(): number {
    return this.#id
  }

  /** Whether the timer is currently running (false once timed out). */
  running(): boolean {
    if (this.timedOut()) {
      return false
    }
    return this.#running
  }

  /** Whether the timer has expired. */
  timedOut(): boolean {
    return this.timeout <= 0
  }

  /** Start ticking. */
  init(): Cmd<TimerMsg> {
    return this.tick()
  }

  /** Update the timer in response to a message. */
  update(msg: TeaMsg): [TimerModel, Cmd<TimerMsg>] {
    if (msg instanceof StartStopMsg) {
      if (msg.id !== 0 && msg.id !== this.#id) {
        return [this, null]
      }
      const next = new TimerModel({
        timeout: this.timeout,
        interval: this.interval,
        running: msg.running,
        id: this.#id,
        tag: this.#tag,
      })
      return [next, next.tick()]
    }

    if (msg instanceof TickMsg) {
      if (!this.running() || (msg.id !== 0 && msg.id !== this.#id)) {
        return [this, null]
      }

      if (msg.tag > 0 && msg.tag !== this.#tag) {
        return [this, null]
      }

      const nextTimeout = this.timeout - this.interval
      const nextTag = this.#tag + 1

      const next = new TimerModel({
        timeout: nextTimeout,
        interval: this.interval,
        running: this.#running,
        id: this.#id,
        tag: nextTag,
      })

      const timeoutCmd = next.timedOut() ? lift(new TimeoutMsg(this.#id)) : null
      const tickCmd = next.timedOut() ? null : next.tick()

      return [next, batch(tickCmd, timeoutCmd)]
    }

    return [this, null]
  }

  /** Render remaining time as a human-readable string. */
  view(): string {
    return formatDuration(Math.max(0, this.timeout))
  }

  /** Command to start the timer. */
  start(): Cmd<TimerMsg> {
    return this.startStop(true)
  }

  /** Command to stop/pause the timer. */
  stop(): Cmd<TimerMsg> {
    return this.startStop(false)
  }

  /** Command to toggle running state. */
  toggle(): Cmd<TimerMsg> {
    return this.startStop(!this.running())
  }

  private tick(): Cmd<TimerMsg> {
    const id = this.#id
    const tag = this.#tag
    return tick(this.interval, () => new TickMsg(id, tag, this.timedOut()))
  }

  private startStop(running: boolean): Cmd<TimerMsg> {
    return lift(new StartStopMsg(this.#id, running))
  }
}

// Simple duration formatter (e.g., 1h2m3s)
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60
  const minutes = Math.floor(ms / 60000) % 60
  const hours = Math.floor(ms / 3600000)

  if (hours > 0) return `${hours}h${minutes}m${seconds}s`
  if (minutes > 0) return `${minutes}m${seconds}s`
  return `${seconds}s`
}

import { msg as lift, sequence, tick, type Cmd, type Msg as TeaMsg, type Model as TeaModel } from "@suds-cli/tea";
import { ResetMsg, StartStopMsg, TickMsg } from "./messages.js";

// Module-level ID counter for unique stopwatches
let lastId = 0;
function nextId(): number {
  return ++lastId;
}

/** Options for creating a stopwatch. @public */
export interface StopwatchOptions {
  /** Tick interval in milliseconds (default: 1000). */
  interval?: number;
}

/** Stopwatch messages. @public */
export type StopwatchMsg = TickMsg | StartStopMsg | ResetMsg;

/** Stopwatch model. @public */
export class StopwatchModel implements TeaModel<StopwatchMsg, StopwatchModel> {
  readonly interval: number;
  readonly #elapsed: number;
  readonly #id: number;
  readonly #tag: number;
  readonly #running: boolean;

  private constructor(options: {
    elapsed: number;
    interval: number;
    running: boolean;
    id: number;
    tag: number;
  }) {
    this.interval = options.interval;
    this.#elapsed = options.elapsed;
    this.#running = options.running;
    this.#id = options.id;
    this.#tag = options.tag;
  }

  /** Create a new stopwatch. */
  static new(options: StopwatchOptions = {}): StopwatchModel {
    const interval = options.interval ?? 1000;
    return new StopwatchModel({
      elapsed: 0,
      interval,
      running: false,
      id: nextId(),
      tag: 0,
    });
  }

  /** Create a new stopwatch with explicit interval. */
  static withInterval(interval: number): StopwatchModel {
    return StopwatchModel.new({ interval });
  }

  /** Unique ID for message routing. */
  id(): number {
    return this.#id;
  }

  /** Whether the stopwatch is running. */
  running(): boolean {
    return this.#running;
  }

  /** Milliseconds elapsed. */
  elapsed(): number {
    return this.#elapsed;
  }

  /** Start the stopwatch on init. */
  init(): Cmd<StopwatchMsg> {
    return this.start();
  }

  /** Update the stopwatch in response to a message. */
  update(msg: TeaMsg): [StopwatchModel, Cmd<StopwatchMsg>] {
    if (msg instanceof StartStopMsg) {
      if (msg.id !== this.#id) {
        return [this, null];
      }
      const next = new StopwatchModel({
        elapsed: this.#elapsed,
        interval: this.interval,
        running: msg.running,
        id: this.#id,
        tag: this.#tag,
      });
      return [next, null];
    }

    if (msg instanceof ResetMsg) {
      if (msg.id !== this.#id) {
        return [this, null];
      }
      const next = new StopwatchModel({
        elapsed: 0,
        interval: this.interval,
        running: this.#running,
        id: this.#id,
        tag: this.#tag,
      });
      return [next, null];
    }

    if (msg instanceof TickMsg) {
      if (!this.running() || msg.id !== this.#id) {
        return [this, null];
      }

      if (msg.tag !== this.#tag) {
        return [this, null];
      }

      const next = new StopwatchModel({
        elapsed: this.#elapsed + this.interval,
        interval: this.interval,
        running: this.#running,
        id: this.#id,
        tag: this.#tag + 1,
      });

      return [next, next.tick()];
    }

    return [this, null];
  }

  /** Render elapsed time as a human-readable string. */
  view(): string {
    return formatDuration(this.#elapsed);
  }

  /** Command to start the stopwatch. */
  start(): Cmd<StopwatchMsg> {
    return sequence(lift(new StartStopMsg(this.#id, true)), this.tick());
  }

  /** Command to stop the stopwatch. */
  stop(): Cmd<StopwatchMsg> {
    return lift(new StartStopMsg(this.#id, false));
  }

  /** Command to toggle running state. */
  toggle(): Cmd<StopwatchMsg> {
    return this.running() ? this.stop() : this.start();
  }

  /** Command to reset elapsed time. */
  reset(): Cmd<StopwatchMsg> {
    return lift(new ResetMsg(this.#id));
  }

  private tick(): Cmd<StopwatchMsg> {
    const id = this.#id;
    const tag = this.#tag;
    return tick(this.interval, () => new TickMsg(id, tag));
  }
}

// Simple duration formatter (e.g., 1h2m3s)
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000);

  if (hours > 0) return `${hours}h${minutes}m${seconds}s`;
  if (minutes > 0) return `${minutes}m${seconds}s`;
  return `${seconds}s`;
}




import { tick, type Cmd, type Msg } from '@suds-cli/tea'
import { Style } from '@suds-cli/chapstick'
import { type Spinner, line } from './spinner.js'
import { TickMsg } from './messages.js'

// Module-level ID counter for unique spinner identification
let lastId = 0
function nextId(): number {
  return ++lastId
}

/**
 * Options for creating a SpinnerModel.
 * @public
 */
export interface SpinnerOptions {
  /** Spinner animation to use (default: line) */
  spinner?: Spinner
  /** Style for rendering the spinner */
  style?: Style
}

/**
 * Spinner component model.
 *
 * Use `tick()` to start the animation, then handle `TickMsg` in your
 * update function by calling `model.update(msg)`.
 *
 * @public
 */
export class SpinnerModel {
  readonly spinner: Spinner
  readonly style: Style
  readonly #frame: number
  readonly #id: number
  readonly #tag: number

  constructor(
    options: SpinnerOptions = {},
    state?: { frame: number; id: number; tag: number },
  ) {
    this.spinner = options.spinner ?? line
    this.style = options.style ?? new Style()
    this.#frame = state?.frame ?? 0
    this.#id = state?.id ?? nextId()
    this.#tag = state?.tag ?? 0
  }

  /** Unique ID for this spinner instance (for message routing). */
  id(): number {
    return this.#id
  }

  /**
   * Command to start/continue the spinner animation.
   * Call this in your model's init() or after handling a TickMsg.
   */
  tick(): Cmd<TickMsg> {
    const id = this.#id
    const tag = this.#tag
    return tick(this.spinner.fps, (time) => new TickMsg(time, id, tag))
  }

  /**
   * Update the model in response to messages.
   * Returns a new model and an optional command.
   */
  update(msg: Msg): [SpinnerModel, Cmd<Msg>] {
    if (!(msg instanceof TickMsg)) {
      return [this, null]
    }

    // If an ID is set and doesn't match, reject the message
    if (msg.id > 0 && msg.id !== this.#id) {
      return [this, null]
    }

    // If a tag is set and doesn't match, reject the message
    // This prevents duplicate ticks from causing too-fast animation
    if (msg.tag > 0 && msg.tag !== this.#tag) {
      return [this, null]
    }

    // Advance frame
    let nextFrame = this.#frame + 1
    if (nextFrame >= this.spinner.frames.length) {
      nextFrame = 0
    }

    const nextTag = this.#tag + 1

    const next = new SpinnerModel(
      { spinner: this.spinner, style: this.style },
      { frame: nextFrame, id: this.#id, tag: nextTag },
    )

    return [next, next.tick()]
  }

  /** Render the current frame with styling. */
  view(): string {
    const frame = this.spinner.frames[this.#frame]
    if (frame === undefined) {
      return '(error)'
    }
    return this.style.render(frame)
  }

  /** Create a new model with a different spinner. */
  withSpinner(spinner: Spinner): SpinnerModel {
    return new SpinnerModel(
      { spinner, style: this.style },
      { frame: 0, id: this.#id, tag: this.#tag },
    )
  }

  /** Create a new model with a different style. */
  withStyle(style: Style): SpinnerModel {
    return new SpinnerModel(
      { spinner: this.spinner, style },
      { frame: this.#frame, id: this.#id, tag: this.#tag },
    )
  }
}

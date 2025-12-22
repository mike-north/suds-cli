import { tick, type Cmd, type Msg, FocusMsg, BlurMsg } from '@suds-cli/tea'
import { Style } from '@suds-cli/chapstick'
import { BlinkMsg, InitialBlinkMsg } from './messages.js'

const defaultBlinkSpeed = 530 // ms

// Module-level ID counter for unique cursor identification
let lastId = 0
function nextId(): number {
  return ++lastId
}

/** Available cursor behaviors. @public */
export enum CursorMode {
  Blink = 'blink',
  Static = 'static',
  Hidden = 'hidden',
}

/** Options for creating a CursorModel. @public */
export interface CursorOptions {
  blinkSpeed?: number
  style?: Style
  textStyle?: Style
  char?: string
  mode?: CursorMode
  focused?: boolean
}

type CursorState = {
  id: number
  tag: number
  blink: boolean
  focus: boolean
  mode: CursorMode
}

/**
 * Cursor component model.
 *
 * Use `tickBlink()` to start blinking, or handle `InitialBlinkMsg` from `initBlink()`.
 * Handle `BlinkMsg`, `FocusMsg`, and `BlurMsg` in your update loop.
 *
 * @public
 */
export class CursorModel {
  readonly blinkSpeed: number
  readonly style: Style
  readonly textStyle: Style
  readonly char: string
  readonly #id: number
  readonly #tag: number
  readonly #blink: boolean
  readonly #focus: boolean
  readonly #mode: CursorMode

  constructor(options: CursorOptions = {}, state?: CursorState) {
    this.blinkSpeed = options.blinkSpeed ?? defaultBlinkSpeed
    this.style = options.style ?? new Style()
    this.textStyle = options.textStyle ?? new Style()
    this.char = options.char ?? ' '
    this.#id = state?.id ?? nextId()
    this.#tag = state?.tag ?? 0
    this.#blink = state?.blink ?? true
    this.#focus = state?.focus ?? false
    this.#mode = state?.mode ?? options.mode ?? CursorMode.Blink
  }

  /** Unique ID for this cursor (for message routing). */
  id(): number {
    return this.#id
  }

  /** Current cursor mode. */
  mode(): CursorMode {
    return this.#mode
  }

  /** Whether the cursor is currently in the "text" state (hidden block). */
  isBlinkHidden(): boolean {
    return this.#blink
  }

  /** Whether this cursor currently has focus. */
  isFocused(): boolean {
    return this.#focus
  }

  /** Kick off blinking at init (emits InitialBlinkMsg). */
  initBlink(): Cmd<InitialBlinkMsg> {
    return () => new InitialBlinkMsg()
  }

  /** Command to schedule the next blink toggle. */
  tickBlink(): [CursorModel, Cmd<BlinkMsg>] {
    const nextTag = this.#tag + 1
    const id = this.#id
    const speed = this.blinkSpeed
    const next = this.#withState({ ...this.#state(), tag: nextTag })
    const cmd: Cmd<BlinkMsg> = tick(
      speed,
      (time: Date) => new BlinkMsg(id, nextTag, time),
    )
    return [next, cmd]
  }

  /** Set the character under the cursor. */
  withChar(char: string): CursorModel {
    return this.#withState(this.#state(), { char })
  }

  /** Set the cursor mode. Returns a new model and optional blink command. */
  withMode(mode: CursorMode): [CursorModel, Cmd<Msg>] {
    const bounded =
      mode === CursorMode.Blink ||
      mode === CursorMode.Static ||
      mode === CursorMode.Hidden
        ? mode
        : CursorMode.Blink

    const blink =
      bounded === CursorMode.Hidden || !this.#focus ? true : this.#blink
    const next = this.#withState({ ...this.#state(), blink, mode: bounded })

    if (bounded === CursorMode.Blink && this.#focus) {
      const [scheduled, cmd] = next.tickBlink()
      return [scheduled, cmd]
    }
    return [next, null]
  }

  /** Focus the cursor. Returns new model and optional blink command. */
  focus(): [CursorModel, Cmd<Msg>] {
    const blink = this.#mode === CursorMode.Hidden ? true : this.#blink
    const next = this.#withState({ ...this.#state(), blink, focus: true })
    if (this.#mode === CursorMode.Blink) {
      const [scheduled, cmd] = next.tickBlink()
      return [scheduled, cmd]
    }
    return [next, null]
  }

  /** Blur the cursor. */
  blur(): CursorModel {
    return this.#withState({ ...this.#state(), blink: true, focus: false })
  }

  /**
   * Update the cursor model with an incoming message.
   * Returns a new model and an optional command.
   */
  update(msg: Msg): [CursorModel, Cmd<Msg>] {
    if (msg instanceof InitialBlinkMsg) {
      if (this.#mode !== CursorMode.Blink || !this.#focus) {
        return [this, null]
      }
      const [next, cmd] = this.tickBlink()
      return [next, cmd as Cmd<Msg>]
    }

    if (msg instanceof FocusMsg) {
      return this.focus()
    }

    if (msg instanceof BlurMsg) {
      const next = this.blur()
      return [next, null]
    }

    if (msg instanceof BlinkMsg) {
      // Is this model blink-able and expecting this tick?
      if (this.#mode !== CursorMode.Blink || !this.#focus) {
        return [this, null]
      }
      if (msg.id !== this.#id || msg.tag !== this.#tag) {
        return [this, null]
      }

      const toggled = this.#withState({ ...this.#state(), blink: !this.#blink })
      const [next, cmd] = toggled.tickBlink()
      return [next, cmd as Cmd<Msg>]
    }

    return [this, null]
  }

  /** Render the cursor. */
  view(): string {
    const char = this.char
    if (this.#blink) {
      return this.textStyle.inline(true).render(char)
    }
    return this.style.inline(true).render(char)
  }

  #state(): CursorState {
    return {
      id: this.#id,
      tag: this.#tag,
      blink: this.#blink,
      focus: this.#focus,
      mode: this.#mode,
    }
  }

  #withState(state: CursorState, overrides?: { char?: string }): CursorModel {
    return new CursorModel(
      {
        blinkSpeed: this.blinkSpeed,
        style: this.style,
        textStyle: this.textStyle,
        char: overrides?.char ?? this.char,
        mode: state.mode,
        focused: state.focus,
      },
      state,
    )
  }
}

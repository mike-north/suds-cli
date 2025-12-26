import { tick, type Cmd, type Msg } from '@boba-cli/tea'
import {
  Style,
  createDefaultContext,
  resolveColor,
  width as textWidth,
  type ColorInput,
} from '@boba-cli/chapstick'
import { FrameMsg } from './messages.js'
import { Spring } from './spring.js'
import { interpolateColor } from './gradient.js'

const FPS = 60
const FRAME_MS = Math.round(1000 / FPS)
const DEFAULT_WIDTH = 40
const DEFAULT_FULL = '█'
const DEFAULT_EMPTY = '░'
const DEFAULT_FULL_COLOR = '#7571F9'
const DEFAULT_EMPTY_COLOR = '#606060'
const DEFAULT_PERCENT_FORMAT = ' %3.0f%%'
const DEFAULT_GRADIENT_START = '#5A56E0'
const DEFAULT_GRADIENT_END = '#EE6FF8'
const SETTLE_DISTANCE = 0.002
const SETTLE_VELOCITY = 0.01

// Module-level ID counter for message routing
let lastId = 0
function nextId(): number {
  return ++lastId
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function ensureChar(input: string | undefined, fallback: string): string {
  if (!input) return fallback
  // Use the first Unicode grapheme; for simplicity take first code unit
  return input.slice(0, 1)
}

function formatPercent(value: number, fmt: string): string {
  const percentValue = clamp01(value) * 100
  const match = fmt.match(/%(\d+)?(?:\.(\d+))?f/)
  if (!match) {
    return `${percentValue.toFixed(0)}%`
  }
  const precision = match[2] ? Number.parseInt(match[2], 10) : 0
  const replacement = percentValue.toFixed(precision)
  return fmt.replace(/%(\d+)?(?:\.(\d+))?f/, replacement).replace(/%%/g, '%')
}

function settle(percent: number, target: number, velocity: number): boolean {
  const dist = Math.abs(percent - target)
  return dist < SETTLE_DISTANCE && Math.abs(velocity) < SETTLE_VELOCITY
}

/**
 * Lazily get the current default environment.
 * This is called at render time to respect any context set via setDefaultContext().
 */
function getDefaultEnv() {
  return createDefaultContext().env
}

function resolvedColor(
  color: ColorInput | undefined,
  fallback: string,
): string {
  return resolveColor(color, getDefaultEnv()) ?? fallback
}

/**
 * Options for the progress bar model.
 * @public
 */
export interface ProgressOptions {
  width?: number
  full?: string
  empty?: string
  fullColor?: ColorInput
  emptyColor?: ColorInput
  showPercentage?: boolean
  percentFormat?: string
  gradientStart?: ColorInput
  gradientEnd?: ColorInput
  scaleGradient?: boolean
  springFrequency?: number
  springDamping?: number
  percentageStyle?: Style
}

interface ProgressState {
  percent: number
  target: number
  velocity: number
  id: number
  tag: number
  spring: Spring
  lastFrameTime: Date | null
}

type ProgressInit = Partial<ProgressState>

function defaultState(): ProgressState {
  return {
    percent: 0,
    target: 0,
    velocity: 0,
    id: nextId(),
    tag: 0,
    spring: new Spring(),
    lastFrameTime: null,
  }
}

/**
 * Animated progress bar model with spring-based easing.
 * @public
 */
export class ProgressModel {
  readonly width: number
  readonly full: string
  readonly empty: string
  readonly fullColor: string
  readonly emptyColor: string
  readonly showPercentage: boolean
  readonly percentFormat: string
  readonly gradientStart?: string
  readonly gradientEnd?: string
  readonly scaleGradient: boolean
  readonly useGradient: boolean
  readonly percentageStyle: Style

  readonly #percent: number
  readonly #target: number
  readonly #velocity: number
  readonly #id: number
  readonly #tag: number
  readonly #spring: Spring
  readonly #lastFrameTime: Date | null

  constructor(options: ProgressOptions = {}, state: ProgressInit = {}) {
    this.width = options.width ?? DEFAULT_WIDTH
    this.full = ensureChar(options.full, DEFAULT_FULL)
    this.empty = ensureChar(options.empty, DEFAULT_EMPTY)
    this.fullColor = resolvedColor(options.fullColor, DEFAULT_FULL_COLOR)
    this.emptyColor = resolvedColor(options.emptyColor, DEFAULT_EMPTY_COLOR)
    this.showPercentage = options.showPercentage ?? true
    this.percentFormat = options.percentFormat ?? DEFAULT_PERCENT_FORMAT
    this.percentageStyle = options.percentageStyle ?? new Style()

    const start = options.gradientStart
      ? resolveColor(options.gradientStart, getDefaultEnv())
      : undefined
    const end = options.gradientEnd
      ? resolveColor(options.gradientEnd, getDefaultEnv())
      : undefined
    this.gradientStart = start
    this.gradientEnd = end
    this.scaleGradient = options.scaleGradient ?? false
    this.useGradient = Boolean(start && end)

    const frequency = options.springFrequency ?? state.spring?.frequency ?? 18
    const damping = options.springDamping ?? state.spring?.damping ?? 1
    const baseState = { ...defaultState(), ...state }
    const spring = state.spring ?? new Spring({ frequency, damping })
    this.#spring = spring.withOptions(frequency, damping)

    this.#percent = clamp01(baseState.percent)
    this.#target = clamp01(baseState.target)
    this.#velocity = baseState.velocity
    this.#id = baseState.id
    this.#tag = baseState.tag
    this.#lastFrameTime = baseState.lastFrameTime
  }

  /** Create a new progress bar with defaults. */
  static new(options: ProgressOptions = {}): ProgressModel {
    return new ProgressModel(options)
  }

  /** Convenience constructor with default gradient. */
  static withDefaultGradient(options: ProgressOptions = {}): ProgressModel {
    return new ProgressModel({
      ...options,
      gradientStart: options.gradientStart ?? DEFAULT_GRADIENT_START,
      gradientEnd: options.gradientEnd ?? DEFAULT_GRADIENT_END,
    })
  }

  /** Convenience constructor with a custom gradient. */
  static withGradient(
    colorA: ColorInput,
    colorB: ColorInput,
    options: ProgressOptions = {},
  ): ProgressModel {
    return new ProgressModel({
      ...options,
      gradientStart: colorA,
      gradientEnd: colorB,
    })
  }

  /** Convenience constructor with solid fill. */
  static withSolidFill(
    color: ColorInput,
    options: ProgressOptions = {},
  ): ProgressModel {
    return new ProgressModel({
      ...options,
      fullColor: color,
      gradientStart: undefined,
      gradientEnd: undefined,
    })
  }

  /** Unique ID for message routing. */
  id(): number {
    return this.#id
  }

  /** Current animated percent (0-1). */
  percent(): number {
    return clamp01(this.#percent)
  }

  /** Target percent (0-1). */
  targetPercent(): number {
    return clamp01(this.#target)
  }

  /** Tea init hook (no-op). */
  init(): Cmd<Msg> {
    return null
  }

  /** Handle messages; consumes FrameMsg for animation. */
  update(msg: Msg): [ProgressModel, Cmd<Msg>] {
    if (!(msg instanceof FrameMsg)) {
      return [this, null]
    }
    if (msg.id !== this.#id || msg.tag !== this.#tag) {
      return [this, null]
    }

    const dt =
      this.#lastFrameTime === null
        ? FRAME_MS
        : Math.max(1, msg.time.getTime() - this.#lastFrameTime.getTime())

    const spring = this.#spring.update(this.#target, dt)
    const nextPercent = clamp01(spring.position())
    const nextVelocity = spring.velocity()

    const next = this.withState({
      percent: nextPercent,
      velocity: nextVelocity,
      tag: this.#tag,
      spring,
      lastFrameTime: msg.time,
    })

    if (settle(nextPercent, this.#target, nextVelocity)) {
      return [next, null]
    }

    return [next, next.nextFrame()]
  }

  /** Set a new target percent and start animation. */
  setPercent(percent: number): [ProgressModel, Cmd<Msg>] {
    const clamped = clamp01(percent)
    const next = this.withState({
      target: clamped,
      tag: this.#tag + 1,
      lastFrameTime: null,
    })
    return [next, next.nextFrame()]
  }

  /** Increment the target percent. */
  incrPercent(delta: number): [ProgressModel, Cmd<Msg>] {
    return this.setPercent(this.#target + delta)
  }

  /** Update the spring configuration (keeps current state). */
  setSpringOptions(frequency: number, damping: number): ProgressModel {
    const spring = this.#spring.withOptions(frequency, damping)
    return this.withState({ spring })
  }

  /** Render the animated progress bar. */
  view(): string {
    return this.viewAs(this.percent())
  }

  /** Render the bar at an explicit percent (0-1). */
  viewAs(percent: number): string {
    const pct = clamp01(percent)
    const percentText = this.showPercentage
      ? this.percentageStyle.render(formatPercent(pct, this.percentFormat))
      : ''

    const percentWidth = this.showPercentage ? textWidth(percentText) : 0
    const totalBarWidth = Math.max(0, this.width - percentWidth)
    const filledWidth = Math.max(0, Math.round(totalBarWidth * pct))
    const emptyWidth = Math.max(0, totalBarWidth - filledWidth)

    const bar = `${this.useGradient ? this.renderGradient(filledWidth, totalBarWidth) : this.renderSolid(filledWidth)}${this.renderEmpty(emptyWidth)}`

    return `${bar}${percentText}`
  }

  private renderGradient(filledWidth: number, totalWidth: number): string {
    if (
      !this.useGradient ||
      filledWidth <= 0 ||
      !this.gradientStart ||
      !this.gradientEnd
    ) {
      return ''
    }

    const parts: string[] = []
    const denominator = this.scaleGradient
      ? Math.max(1, filledWidth - 1)
      : Math.max(1, totalWidth - 1)

    for (let i = 0; i < filledWidth; i++) {
      const t = filledWidth === 1 ? 0.5 : i / denominator
      const color = interpolateColor(this.gradientStart, this.gradientEnd, t)
      parts.push(new Style().foreground(color).render(this.full))
    }

    return parts.join('')
  }

  private renderSolid(filledWidth: number): string {
    if (filledWidth <= 0) return ''
    const styled = new Style().foreground(this.fullColor).render(this.full)
    return styled.repeat(filledWidth)
  }

  private renderEmpty(emptyWidth: number): string {
    if (emptyWidth <= 0) return ''
    const styled = new Style().foreground(this.emptyColor).render(this.empty)
    return styled.repeat(emptyWidth)
  }

  private nextFrame(): Cmd<FrameMsg> {
    const id = this.#id
    const tag = this.#tag
    return tick(FRAME_MS, (time) => new FrameMsg(id, tag, time))
  }

  private withState(state: ProgressInit): ProgressModel {
    return new ProgressModel(
      {
        width: this.width,
        full: this.full,
        empty: this.empty,
        fullColor: this.fullColor,
        emptyColor: this.emptyColor,
        showPercentage: this.showPercentage,
        percentFormat: this.percentFormat,
        gradientStart: this.gradientStart,
        gradientEnd: this.gradientEnd,
        scaleGradient: this.scaleGradient,
        springFrequency: this.#spring.frequency,
        springDamping: this.#spring.damping,
        percentageStyle: this.percentageStyle,
      },
      {
        percent: this.#percent,
        target: this.#target,
        velocity: this.#velocity,
        id: this.#id,
        tag: this.#tag,
        spring: this.#spring,
        lastFrameTime: this.#lastFrameTime,
        ...state,
      },
    )
  }
}

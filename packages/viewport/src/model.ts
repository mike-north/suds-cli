import { Style } from '@suds-cli/chapstick'
import { matches } from '@suds-cli/key'
import {
  KeyMsg,
  MouseAction,
  MouseButton,
  MouseMsg,
  type Cmd,
  type Msg,
} from '@suds-cli/tea'
import { defaultKeyMap, type ViewportKeyMap } from './keymap.js'
import { ScrollMsg, SyncMsg } from './messages.js'

/**
 * Options for creating a viewport.
 * @public
 */
export interface ViewportOptions {
  width?: number
  height?: number
  keyMap?: ViewportKeyMap
  mouseWheelEnabled?: boolean
  mouseWheelDelta?: number
  style?: Style
}

/**
 * Scrollable window onto a list of lines.
 * @public
 */
export class ViewportModel {
  readonly width: number
  readonly height: number
  readonly keyMap: ViewportKeyMap
  readonly mouseWheelEnabled: boolean
  readonly mouseWheelDelta: number
  readonly yOffset: number
  readonly lines: string[]
  readonly style: Style

  private constructor(options: {
    width: number
    height: number
    keyMap: ViewportKeyMap
    mouseWheelEnabled: boolean
    mouseWheelDelta: number
    yOffset: number
    lines: string[]
    style: Style
  }) {
    this.width = Math.max(0, options.width)
    this.height = Math.max(0, options.height)
    this.keyMap = options.keyMap
    this.mouseWheelEnabled = options.mouseWheelEnabled
    this.mouseWheelDelta = Math.max(0, options.mouseWheelDelta)
    this.yOffset = Math.max(0, options.yOffset)
    this.lines = options.lines
    this.style = options.style
  }

  /** Create a new viewport with defaults. */
  static new(options: ViewportOptions = {}): ViewportModel {
    return new ViewportModel({
      width: options.width ?? 0,
      height: options.height ?? 0,
      keyMap: options.keyMap ?? defaultKeyMap,
      mouseWheelEnabled: options.mouseWheelEnabled ?? true,
      mouseWheelDelta: options.mouseWheelDelta ?? 3,
      yOffset: 0,
      lines: [],
      style: options.style ?? new Style(),
    })
  }

  /** Split string content into lines and store it. */
  setContent(content: string): ViewportModel {
    const normalized = content.replace(/\r\n/g, '\n')
    return this.setContentLines(normalized.split('\n'))
  }

  /** Replace content with a line array. Y offset is clamped if needed. */
  setContentLines(lines: string[]): ViewportModel {
    const copy = [...lines]
    const nextOffset = this.clampOffset(this.yOffset, copy, this.height)
    return this.with({ lines: copy, yOffset: nextOffset })
  }

  /** Change width. */
  setWidth(width: number): ViewportModel {
    if (width === this.width) return this
    return this.with({ width: Math.max(0, width) })
  }

  /** Change height (and clamp offset if new height is smaller). */
  setHeight(height: number): ViewportModel {
    const normalized = Math.max(0, height)
    if (normalized === this.height) return this
    const nextOffset = this.clampOffset(this.yOffset, this.lines, normalized)
    return this.with({ height: normalized, yOffset: nextOffset })
  }

  /** Scroll upward by the given number of lines. */
  scrollUp(lines: number): ViewportModel {
    if (lines <= 0) return this
    const nextOffset = Math.max(0, this.yOffset - lines)
    if (nextOffset === this.yOffset) return this
    return this.with({ yOffset: nextOffset })
  }

  /** Scroll downward by the given number of lines. */
  scrollDown(lines: number): ViewportModel {
    if (lines <= 0) return this
    const maxOffset = this.maxYOffset()
    const nextOffset = Math.min(this.yOffset + lines, maxOffset)
    if (nextOffset === this.yOffset) return this
    return this.with({ yOffset: nextOffset })
  }

  /** Jump to the top. */
  scrollToTop(): ViewportModel {
    if (this.atTop()) return this
    return this.with({ yOffset: 0 })
  }

  /** Jump to the bottom. */
  scrollToBottom(): ViewportModel {
    const maxOffset = this.maxYOffset()
    if (this.yOffset === maxOffset) return this
    return this.with({ yOffset: maxOffset })
  }

  /** Get or set scroll percentage (0-1). */
  scrollPercent(): number
  scrollPercent(percent: number): ViewportModel
  scrollPercent(percent?: number): number | ViewportModel {
    if (percent === undefined) {
      if (this.height === 0 || this.lines.length === 0) {
        return 1
      }
      if (this.lines.length <= this.height) {
        return 1
      }
      const denom = Math.max(1, this.lines.length - this.height)
      return clamp01(this.yOffset / denom)
    }
    const clamped = clamp01(percent)
    const maxOffset = this.maxYOffset()
    const targetOffset = Math.round(maxOffset * clamped)
    if (targetOffset === this.yOffset) return this
    return this.with({ yOffset: targetOffset })
  }

  /** True when Y offset is at the top. */
  atTop(): boolean {
    return this.yOffset <= 0
  }

  /** True when Y offset is at the bottom. */
  atBottom(): boolean {
    return this.yOffset >= this.maxYOffset()
  }

  /** Number of visible lines (without padding). */
  visibleLineCount(): number {
    return Math.max(0, Math.min(this.height, this.lines.length - this.yOffset))
  }

  /** Total number of content lines. */
  totalLineCount(): number {
    return this.lines.length
  }

  /** Move up by n lines (default: 1). */
  lineUp(n = 1): ViewportModel {
    return this.scrollUp(Math.max(1, n))
  }

  /** Move down by n lines (default: 1). */
  lineDown(n = 1): ViewportModel {
    return this.scrollDown(Math.max(1, n))
  }

  /** Move up by half the viewport height. */
  halfViewUp(): ViewportModel {
    const delta = Math.max(1, Math.floor(this.height / 2))
    return this.scrollUp(delta)
  }

  /** Move down by half the viewport height. */
  halfViewDown(): ViewportModel {
    const delta = Math.max(1, Math.floor(this.height / 2))
    return this.scrollDown(delta)
  }

  /** Move up by one viewport height. */
  viewUp(): ViewportModel {
    return this.scrollUp(this.height)
  }

  /** Move down by one viewport height. */
  viewDown(): ViewportModel {
    return this.scrollDown(this.height)
  }

  /** Go to a specific line (0-based). Optionally center it. */
  gotoLine(line: number, centered = false): ViewportModel {
    if (this.lines.length === 0 || this.height === 0) {
      return this
    }
    const maxIndex = Math.max(0, this.lines.length - 1)
    const targetLine = clamp(Math.floor(line), 0, maxIndex)
    const maxOffset = this.maxYOffset()
    let yOffset = targetLine
    if (centered) {
      yOffset = targetLine - Math.floor((this.height - 1) / 2)
    }
    const clamped = clamp(yOffset, 0, maxOffset)
    if (clamped === this.yOffset) return this
    return this.with({ yOffset: clamped })
  }

  /** Tea init hook (no-op). */
  init(): Cmd<Msg> {
    return null
  }

  /** Handle key + mouse scrolling. */
  update(msg: Msg): [ViewportModel, Cmd<Msg>] {
    if (msg instanceof MouseMsg) {
      return this.handleMouse(msg)
    }
    if (msg instanceof KeyMsg) {
      return this.handleKey(msg)
    }
    return [this, null]
  }

  /** Render the visible window as a string (padded to height). */
  view(): string {
    return this.style.render(this.visibleLines().join('\n'))
  }

  /** Build a SyncMsg for high-level renderers. */
  sync(): Cmd<Msg> {
    const topLine = this.yOffset
    const bottomLine = clamp(
      this.yOffset + this.height - 1,
      topLine,
      Math.max(topLine, this.lines.length - 1),
    )
    return () => new SyncMsg(this.visibleLines(), topLine, bottomLine)
  }

  private handleKey(msg: KeyMsg): [ViewportModel, Cmd<Msg>] {
    if (matches(msg, this.keyMap.down)) {
      const next = this.lineDown()
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (matches(msg, this.keyMap.up)) {
      const next = this.lineUp()
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (matches(msg, this.keyMap.pageDown)) {
      const next = this.viewDown()
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (matches(msg, this.keyMap.pageUp)) {
      const next = this.viewUp()
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (matches(msg, this.keyMap.halfPageDown)) {
      const next = this.halfViewDown()
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (matches(msg, this.keyMap.halfPageUp)) {
      const next = this.halfViewUp()
      return [next, next.scrollCmdIfChanged(this)]
    }
    return [this, null]
  }

  private handleMouse(msg: MouseMsg): [ViewportModel, Cmd<Msg>] {
    if (
      !this.mouseWheelEnabled ||
      msg.event.action !== MouseAction.Press ||
      this.height === 0
    ) {
      return [this, null]
    }

    if (msg.event.button === MouseButton.WheelUp) {
      const next = this.scrollUp(this.mouseWheelDelta)
      return [next, next.scrollCmdIfChanged(this)]
    }
    if (msg.event.button === MouseButton.WheelDown) {
      const next = this.scrollDown(this.mouseWheelDelta)
      return [next, next.scrollCmdIfChanged(this)]
    }
    return [this, null]
  }

  private visibleLines(): string[] {
    const start = this.yOffset
    const end = Math.min(start + this.height, this.lines.length)
    const window = this.lines.slice(start, end)
    while (window.length < this.height) {
      window.push('')
    }
    return window
  }

  private maxYOffset(lines = this.lines, height = this.height): number {
    return Math.max(0, lines.length - height)
  }

  private clampOffset(offset: number, lines: string[], height: number): number {
    return clamp(offset, 0, this.maxYOffset(lines, height))
  }

  private with(patch: Partial<ViewportModel>): ViewportModel {
    return new ViewportModel({
      width: patch.width ?? this.width,
      height: patch.height ?? this.height,
      keyMap: patch.keyMap ?? this.keyMap,
      mouseWheelEnabled: patch.mouseWheelEnabled ?? this.mouseWheelEnabled,
      mouseWheelDelta: patch.mouseWheelDelta ?? this.mouseWheelDelta,
      yOffset: patch.yOffset ?? this.yOffset,
      lines: patch.lines ?? this.lines,
      style: patch.style ?? this.style,
    })
  }

  private scrollCmdIfChanged(previous: ViewportModel): Cmd<Msg> {
    if (this === previous || this.yOffset === previous.yOffset) {
      return null
    }
    return () => new ScrollMsg(this.scrollPercent(), this.yOffset)
  }
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.min(max, Math.max(min, value))
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return clamp(value, 0, 1)
}

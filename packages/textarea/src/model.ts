import { Style } from '@suds-cli/chapstick'
import { CursorModel, CursorMode } from '@suds-cli/cursor'
import { matches } from '@suds-cli/key'
import { batch, type Cmd, type Msg, KeyMsg, KeyType } from '@suds-cli/tea'
import { newSanitizer } from '@suds-cli/runeutil'
import GraphemeSplitter from 'grapheme-splitter'
import { PasteErrorMsg, PasteMsg, pasteCommand } from './messages.js'
import {
  type KeyMap,
  type TextareaOptions,
  type ValidateFunc,
  defaultKeyMap,
} from './types.js'

const splitter = new GraphemeSplitter()
const sanitizer = newSanitizer() // keep newlines, strip control/ansi

type Position = { line: number; column: number }

type State = {
  lines: string[]
  pos: Position
  focused: boolean
  width: number
  maxHeight: number
  maxWidth: number
  prompt: string
  promptStyle: Style
  textStyle: Style
  placeholderStyle: Style
  cursorStyle: Style
  lineNumberStyle: Style
  showLineNumbers: boolean
  endOfBufferCharacter: string
  validateFn?: ValidateFunc
  keyMap: KeyMap
  cursor: CursorModel
  error: Error | null
  scrollTop: number
  placeholder?: string
}

/**
 * Multi-line textarea model.
 * @public
 */
export class TextareaModel {
  readonly lines: string[]
  readonly pos: Position
  readonly focused: boolean
  readonly width: number
  readonly maxHeight: number
  readonly maxWidth: number
  readonly prompt: string
  readonly promptStyle: Style
  readonly textStyle: Style
  readonly placeholderStyle: Style
  readonly cursorStyle: Style
  readonly lineNumberStyle: Style
  readonly showLineNumbers: boolean
  readonly endOfBufferCharacter: string
  readonly validateFn?: ValidateFunc
  readonly keyMap: KeyMap
  readonly cursor: CursorModel
  readonly error: Error | null
  readonly scrollTop: number
  readonly placeholder?: string

  private constructor(state: State) {
    this.lines = state.lines
    this.pos = state.pos
    this.focused = state.focused
    this.width = state.width
    this.maxHeight = state.maxHeight
    this.maxWidth = state.maxWidth
    this.prompt = state.prompt
    this.promptStyle = state.promptStyle
    this.textStyle = state.textStyle
    this.placeholderStyle = state.placeholderStyle
    this.cursorStyle = state.cursorStyle
    this.lineNumberStyle = state.lineNumberStyle
    this.showLineNumbers = state.showLineNumbers
    this.endOfBufferCharacter = state.endOfBufferCharacter
    this.validateFn = state.validateFn
    this.keyMap = state.keyMap
    this.cursor = state.cursor
    this.error = state.error
    this.scrollTop = state.scrollTop
    this.placeholder = state.placeholder
  }

  /** Create a new textarea model. */
  static new(options: TextareaOptions = {}): TextareaModel {
    const rawValue = options.value ?? ''
    const sanitized = sanitize(rawValue)
    const lines = splitLines(sanitized)
    const cursorMode = options.cursorMode ?? CursorMode.Blink
    const textStyle = options.textStyle ?? new Style()
    const cursor = new CursorModel({
      style: options.cursorStyle ?? new Style(),
      textStyle,
      mode: cursorMode,
      focused: false,
      char: '▌',
    })

    const model = new TextareaModel({
      lines: lines.length > 0 ? lines : [''],
      pos: {
        line: Math.max(0, lines.length - 1),
        column: lines.length > 0 ? runeCount(last(lines) ?? '') : 0,
      },
      focused: false,
      width: options.width ?? 0,
      maxHeight: options.maxHeight ?? 0,
      maxWidth: options.maxWidth ?? 0,
      prompt: options.prompt ?? '',
      promptStyle: options.promptStyle ?? new Style(),
      textStyle,
      placeholderStyle: options.placeholderStyle ?? new Style(),
      cursorStyle: options.cursorStyle ?? new Style(),
      lineNumberStyle: options.lineNumberStyle ?? new Style(),
      showLineNumbers: options.showLineNumbers ?? false,
      endOfBufferCharacter: options.endOfBufferCharacter ?? '~',
      validateFn: options.validate,
      keyMap: options.keyMap ?? defaultKeyMap,
      cursor,
      error: null,
      scrollTop: 0,
      placeholder: options.placeholder,
    })

    return model.#withError(model.#runValidation(model.value()))
  }

  /** Initial command (none by default). */
  init(): Cmd<Msg> {
    return null
  }

  /** Full text value. */
  value(): string {
    return this.lines.join('\n')
  }

  /** Number of lines. */
  lineCount(): number {
    return this.lines.length
  }

  /** Current line index (0-based). */
  currentLine(): number {
    return this.pos.line
  }

  /** Current column (grapheme index). */
  currentColumn(): number {
    return this.pos.column
  }

  /** Content of a line (empty string if out of bounds). */
  lineContent(line: number): string {
    return this.lines[line] ?? ''
  }

  /** Is textarea empty. */
  isEmpty(): boolean {
    return this.lines.length === 1 && this.lines[0]?.length === 0
  }

  /** Focus the textarea (enables key handling). */
  focus(): [TextareaModel, Cmd<Msg>] {
    if (this.focused) {
      return [this, null]
    }
    const [cursor, cmd] = this.cursor.focus()
    const next = this.#with({ focused: true, cursor })
    return [next, cmd]
  }

  /** Blur the textarea. */
  blur(): TextareaModel {
    if (!this.focused) {
      return this
    }
    return this.#with({ focused: false, cursor: this.cursor.blur() })
  }

  /** Move cursor to start of current line. */
  gotoLineStart(): TextareaModel {
    return this.#withPosition({ line: this.pos.line, column: 0 })
  }

  /** Move cursor to end of current line. */
  gotoLineEnd(): TextareaModel {
    const len = runeCount(this.lines[this.pos.line] ?? '')
    return this.#withPosition({ line: this.pos.line, column: len })
  }

  /** Move up n lines (default 1). */
  lineUp(n = 1): TextareaModel {
    const target = clamp(
      this.pos.line - Math.max(1, n),
      0,
      this.lines.length - 1,
    )
    return this.#withPosition({ line: target, column: this.pos.column })
  }

  /** Move cursor left, possibly across lines. */
  cursorLeft(): TextareaModel {
    if (this.pos.column > 0) {
      return this.#withPosition({
        line: this.pos.line,
        column: this.pos.column - 1,
      })
    }
    if (this.pos.line > 0) {
      const prevLine = this.lines[this.pos.line - 1] ?? ''
      return this.#withPosition({
        line: this.pos.line - 1,
        column: runeCount(prevLine),
      })
    }
    return this
  }

  /** Move cursor right, possibly across lines. */
  cursorRight(): TextareaModel {
    const line = this.lines[this.pos.line] ?? ''
    const len = runeCount(line)
    if (this.pos.column < len) {
      return this.#withPosition({
        line: this.pos.line,
        column: this.pos.column + 1,
      })
    }
    if (this.pos.line < this.lines.length - 1) {
      return this.#withPosition({ line: this.pos.line + 1, column: 0 })
    }
    return this
  }

  /** Move down n lines (default 1). */
  lineDown(n = 1): TextareaModel {
    const target = clamp(
      this.pos.line + Math.max(1, n),
      0,
      this.lines.length - 1,
    )
    return this.#withPosition({ line: target, column: this.pos.column })
  }

  /** Jump to a specific line (0-based). */
  gotoLine(line: number): TextareaModel {
    const target = clamp(line, 0, this.lines.length - 1)
    return this.#withPosition({ line: target, column: this.pos.column })
  }

  /** Insert text at cursor (supports multi-line). */
  insertRunes(text: string): TextareaModel {
    if (!text) {
      return this
    }
    const sanitized = sanitize(text)
    if (!sanitized) {
      return this
    }
    const parts = sanitized.split('\n')
    const current = this.lines[this.pos.line] ?? ''
    const before = sliceGraphemes(current, 0, this.pos.column)
    const after = sliceGraphemes(current, this.pos.column)

    let nextLines: string[] = []
    if (parts.length === 1) {
      const merged = before + parts[0]! + after
      nextLines = replaceLine(this.lines, this.pos.line, merged)
    } else {
      const first = before + parts[0]!
      const last = parts[parts.length - 1]!
      const middle = parts.slice(1, -1)
      const tail = last + after

      nextLines = [
        ...this.lines.slice(0, this.pos.line),
        first,
        ...middle,
        tail,
        ...this.lines.slice(this.pos.line + 1),
      ]
    }

    const newLine = this.pos.line + (parts.length - 1)
    const newColumn =
      parts.length === 1
        ? this.pos.column + runeCount(parts[0]!)
        : runeCount(last(parts)!)

    return this.#withValue(nextLines, { line: newLine, column: newColumn })
  }

  /** Insert a newline at the cursor. */
  insertNewline(): TextareaModel {
    return this.insertRunes('\n')
  }

  /** Delete character to the left (backspace). */
  deleteLeft(n = 1): TextareaModel {
    if (n <= 0) return this
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let model: TextareaModel = this
    for (let i = 0; i < n; i++) {
      const next = model.#deleteLeftOnce()
      if (next === model) break
      model = next
    }
    return model
  }

  #deleteLeftOnce(): TextareaModel {
    if (this.pos.column > 0) {
      const line = this.lines[this.pos.line] ?? ''
      const before = sliceGraphemes(line, 0, this.pos.column - 1)
      const after = sliceGraphemes(line, this.pos.column)
      const merged = before + after
      return this.#withValue(replaceLine(this.lines, this.pos.line, merged), {
        line: this.pos.line,
        column: this.pos.column - 1,
      })
    }
    if (this.pos.line === 0) {
      return this
    }
    const prevLine = this.lines[this.pos.line - 1] ?? ''
    const current = this.lines[this.pos.line] ?? ''
    const mergedLine = prevLine + current
    const nextLines = [
      ...this.lines.slice(0, this.pos.line - 1),
      mergedLine,
      ...this.lines.slice(this.pos.line + 1),
    ]
    return this.#withValue(nextLines, {
      line: this.pos.line - 1,
      column: runeCount(prevLine),
    })
  }

  /** Delete character to the right (delete). */
  deleteRight(n = 1): TextareaModel {
    if (n <= 0) return this
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let model: TextareaModel = this
    for (let i = 0; i < n; i++) {
      const next = model.#deleteRightOnce()
      if (next === model) break
      model = next
    }
    return model
  }

  #deleteRightOnce(): TextareaModel {
    const line = this.lines[this.pos.line] ?? ''
    const len = runeCount(line)
    if (this.pos.column < len) {
      const before = sliceGraphemes(line, 0, this.pos.column)
      const after = sliceGraphemes(line, this.pos.column + 1)
      const merged = before + after
      return this.#withValue(replaceLine(this.lines, this.pos.line, merged), {
        line: this.pos.line,
        column: this.pos.column,
      })
    }
    if (this.pos.line >= this.lines.length - 1) {
      return this
    }
    const nextLine = this.lines[this.pos.line + 1] ?? ''
    const merged = line + nextLine
    const nextLines = [
      ...this.lines.slice(0, this.pos.line),
      merged,
      ...this.lines.slice(this.pos.line + 2),
    ]
    return this.#withValue(nextLines, {
      line: this.pos.line,
      column: this.pos.column,
    })
  }

  /** Delete the current line. Keeps one empty line minimum. */
  deleteLine(): TextareaModel {
    if (this.lines.length === 1) {
      return this.reset()
    }
    const nextLines = this.lines.filter((_, i) => i !== this.pos.line)
    const nextLine = clamp(this.pos.line, 0, nextLines.length - 1)
    const nextColumn = clamp(
      this.pos.column,
      0,
      runeCount(nextLines[nextLine] ?? ''),
    )
    return this.#withValue(nextLines, { line: nextLine, column: nextColumn })
  }

  /** Duplicate the current line below. */
  duplicateLine(): TextareaModel {
    const line = this.lines[this.pos.line] ?? ''
    const nextLines = [
      ...this.lines.slice(0, this.pos.line + 1),
      line,
      ...this.lines.slice(this.pos.line + 1),
    ]
    return this.#withValue(nextLines, {
      line: this.pos.line + 1,
      column: this.pos.column,
    })
  }

  /** Scroll up by n lines (no cursor move). */
  scrollUp(n = 1): TextareaModel {
    const nextScroll = clamp(
      this.scrollTop - Math.max(1, n),
      0,
      this.maxScroll(),
    )
    return this.#with({ scrollTop: nextScroll })
  }

  /** Scroll down by n lines (no cursor move). */
  scrollDown(n = 1): TextareaModel {
    const nextScroll = clamp(
      this.scrollTop + Math.max(1, n),
      0,
      this.maxScroll(),
    )
    return this.#with({ scrollTop: nextScroll })
  }

  /** Reset to empty content. */
  reset(): TextareaModel {
    return this.#withValue([''], { line: 0, column: 0 })
  }

  /** Set a new value (replaces all lines). */
  setValue(value: string): TextareaModel {
    const sanitized = sanitize(value ?? '')
    const lines = splitLines(sanitized)
    return this.#withValue(lines.length > 0 ? lines : [''], {
      line: Math.max(0, lines.length - 1),
      column: lines.length ? runeCount(last(lines) ?? '') : 0,
    })
  }

  /** Validation function setter. */
  setValidateFunc(fn: ValidateFunc): TextareaModel {
    const next = this.#with({ validateFn: fn })
    return next.#withError(next.#runValidation(next.value()))
  }

  /** Validate current value. */
  validate(): Error | null {
    return this.#runValidation(this.value())
  }

  /** Command to paste from clipboard. */
  paste(): [TextareaModel, Cmd<Msg>] {
    return [this, pasteCommand() as Cmd<Msg>]
  }

  /** Tea update loop. */
  update(msg: Msg): [TextareaModel, Cmd<Msg>] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let model: TextareaModel = this
    const cmds: Cmd<Msg>[] = []

    if (msg instanceof KeyMsg) {
      if (model.focused) {
        const [nextModel, cmd] = model.#handleKey(msg)
        model = nextModel
        if (cmd) cmds.push(cmd)
      }
    } else if (msg instanceof PasteMsg) {
      model = model.insertRunes(msg.text)
    } else if (msg instanceof PasteErrorMsg) {
      model = model.#withError(asError(msg.error))
    }

    const [cursor, cursorCmd] = model.cursor.update(msg)
    model = model.#with({ cursor })
    if (cursorCmd) {
      cmds.push(cursorCmd as Cmd<Msg>)
    }

    // Keep blink scheduling alive on movement: if the cursor changed columns/line,
    // ensure the cursor is visible (blink off) by toggling blink flag.
    if (
      msg instanceof KeyMsg &&
      (msg.key.type === KeyType.Left ||
        msg.key.type === KeyType.Right ||
        msg.key.type === KeyType.Home ||
        msg.key.type === KeyType.End)
    ) {
      const refreshed = model.cursor.withChar(
        model.cursor.isBlinkHidden() ? '▌' : model.cursor.char,
      )
      model = model.#with({ cursor: refreshed })
    }

    return [model, batch(...cmds)]
  }

  /** Render textarea with cursor and optional line numbers. */
  view(): string {
    if (this.isEmpty() && this.placeholder) {
      return this.#placeholderView()
    }

    const height = this.viewportHeight()
    const start = clamp(this.scrollTop, 0, Math.max(0, this.lineCount() - 1))
    const visible = this.lines.slice(start, start + height)

    const linesOut = visible.map((line, idx) => {
      const lineIndex = start + idx
      const isCursorLine = lineIndex === this.pos.line
      return this.#renderLine(line, lineIndex, isCursorLine)
    })

    const remaining = height - visible.length
    if (remaining > 0) {
      for (let i = 0; i < remaining; i++) {
        const filler = this.endOfBufferCharacter
        const prefix = this.#linePrefix(start + visible.length + i, false)
        linesOut.push(prefix + filler)
      }
    }

    return linesOut.join('\n')
  }

  #handleKey(msg: KeyMsg): [TextareaModel, Cmd<Msg> | null] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let next: TextareaModel = this
    let cmd: Cmd<Msg> | null = null
    const keyMap = this.keyMap

    switch (true) {
      case matches(msg, keyMap.lineUp):
        next = next.lineUp()
        break
      case matches(msg, keyMap.lineDown):
        next = next.lineDown()
        break
      case matches(msg, keyMap.characterLeft):
        next = next.cursorLeft()
        break
      case matches(msg, keyMap.characterRight):
        next = next.cursorRight()
        break
      case matches(msg, keyMap.lineStart):
      case matches(msg, keyMap.gotoLineStart):
        next = next.gotoLineStart()
        break
      case matches(msg, keyMap.lineEnd):
      case matches(msg, keyMap.gotoLineEnd):
        next = next.gotoLineEnd()
        break
      case matches(msg, keyMap.insertNewline):
        next = next.insertNewline()
        break
      case matches(msg, keyMap.deleteCharBackward):
        next = next.deleteLeft()
        break
      case matches(msg, keyMap.deleteCharForward):
        next = next.deleteRight()
        break
      case matches(msg, keyMap.deleteLine):
        next = next.deleteLine()
        break
      case matches(msg, keyMap.paste):
        cmd = pasteCommand() as Cmd<Msg>
        break
      default:
        if (msg.key.type === KeyType.Enter) {
          next = next.insertNewline()
        } else if (
          (msg.key.type === KeyType.Runes || msg.key.type === KeyType.Space) &&
          !msg.key.alt
        ) {
          next = next.insertRunes(msg.key.runes)
        }
        break
    }

    return [next.#ensureCursorVisible(), cmd]
  }

  #placeholderView(): string {
    const prefix = this.#linePrefix(0, true)
    const graphemes = splitter.splitGraphemes(this.placeholder ?? '')
    const cursorChar = graphemes[0] ?? '▌'
    const rest = graphemes.slice(1).join('')
    const cursorView = this.cursor.withChar(cursorChar).view()
    const body = this.placeholderStyle.inline(true).render(rest)
    return prefix + cursorView + body
  }

  #renderLine(line: string, index: number, isCursorLine: boolean): string {
    const prefix = this.#linePrefix(index, isCursorLine)
    if (!isCursorLine) {
      return prefix + this.textStyle.inline(true).render(line)
    }
    const graphemes = splitter.splitGraphemes(line ?? '')
    const col = clamp(this.pos.column, 0, graphemes.length)
    const before = graphemes.slice(0, col).join('')
    const after = graphemes.slice(col).join('') // draw block over gap/char
    const cursorChar = '▌' // always show block cursor for visibility

    const beforeStyled = this.textStyle.inline(true).render(before)
    const afterStyled = this.textStyle.inline(true).render(after)
    const cursorView = this.cursor.withChar(cursorChar).view()

    return prefix + beforeStyled + cursorView + afterStyled
  }

  #linePrefix(lineIndex: number, _isCursorLine: boolean): string {
    const prompt = this.prompt
      ? this.promptStyle.inline(true).render(this.prompt)
      : ''
    const ln =
      this.showLineNumbers && this.lines.length > 0
        ? this.#renderLineNumber(lineIndex)
        : ''
    return ln + prompt
  }

  #renderLineNumber(lineIndex: number): string {
    const width = String(this.lines.length).length
    const num = String(lineIndex + 1).padStart(width, ' ')
    return this.lineNumberStyle.inline(true).render(`${num} `)
  }

  #runValidation(value: string): Error | null {
    return this.validateFn ? this.validateFn(value) : null
  }

  #withError(error: Error | null): TextareaModel {
    if (error === this.error) return this
    return this.#with({ error })
  }

  #withValue(lines: string[], pos: Position): TextareaModel {
    const normalized = lines.length > 0 ? lines : ['']
    const nextPos = this.#clampPosition(pos, normalized)
    const next = this.#with({
      lines: normalized,
      pos: nextPos,
    })
    return next
      .#withError(next.#runValidation(next.value()))
      .#ensureCursorVisible()
  }

  #withPosition(pos: Position): TextareaModel {
    return this.#withValue(this.lines, pos)
  }

  #with(patch: Partial<State>): TextareaModel {
    return new TextareaModel({
      lines: this.lines,
      pos: this.pos,
      focused: this.focused,
      width: this.width,
      maxHeight: this.maxHeight,
      maxWidth: this.maxWidth,
      prompt: this.prompt,
      promptStyle: this.promptStyle,
      textStyle: this.textStyle,
      placeholderStyle: this.placeholderStyle,
      cursorStyle: this.cursorStyle,
      lineNumberStyle: this.lineNumberStyle,
      showLineNumbers: this.showLineNumbers,
      endOfBufferCharacter: this.endOfBufferCharacter,
      validateFn: this.validateFn,
      keyMap: this.keyMap,
      cursor: this.cursor,
      error: this.error,
      scrollTop: this.scrollTop,
      placeholder: this.placeholder,
      ...patch,
    })
  }

  #clampPosition(pos: Position, lines: string[]): Position {
    const line = clamp(pos.line, 0, Math.max(0, lines.length - 1))
    const lineContent = lines[line] ?? ''
    const column = clamp(pos.column, 0, runeCount(lineContent))
    return { line, column }
  }

  #ensureCursorVisible(): TextareaModel {
    const height = this.viewportHeight()
    if (height <= 0) return this
    let top = this.scrollTop
    if (this.pos.line < top) {
      top = this.pos.line
    } else if (this.pos.line >= top + height) {
      top = this.pos.line - height + 1
    }
    top = clamp(top, 0, this.maxScroll())
    if (top === this.scrollTop) return this
    return this.#with({ scrollTop: top })
  }

  viewportHeight(): number {
    if (this.maxHeight && this.maxHeight > 0) {
      return this.maxHeight
    }
    return Math.max(1, this.lines.length)
  }

  maxScroll(): number {
    const height = this.viewportHeight()
    return Math.max(0, this.lines.length - height)
  }
}

function sanitize(value: string): string {
  return sanitizer.sanitize(value ?? '')
}

function splitLines(value: string): string[] {
  return value.split('\n')
}

function sliceGraphemes(value: string, start: number, end?: number): string {
  const graphemes = splitter.splitGraphemes(value ?? '')
  return graphemes.slice(start, end).join('')
}

function runeCount(value: string): number {
  return splitter.countGraphemes(value ?? '')
}

function clamp(v: number, min: number, max: number): number {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  return Math.min(hi, Math.max(lo, v))
}

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1]
}

function replaceLine(lines: string[], index: number, value: string): string[] {
  return lines.map((l, i) => (i === index ? value : l))
}

function asError(err: unknown): Error {
  if (err instanceof Error) return err
  if (typeof err === 'string') return new Error(err)
  if (typeof err === 'number' || typeof err === 'boolean')
    return new Error(String(err))
  return new Error('textarea error')
}

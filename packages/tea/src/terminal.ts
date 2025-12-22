/** @public Options for the terminal controller. */
export interface TerminalOptions {
  input?: NodeJS.ReadableStream
  output?: NodeJS.WritableStream
}

const CURSOR_SHOW = '\u001b[?25h'
const CURSOR_HIDE = '\u001b[?25l'
const CLEAR_SCREEN = '\u001b[2J'
const CURSOR_HOME = '\u001b[H'
const ALT_SCREEN_ON = '\u001b[?1049h'
const ALT_SCREEN_OFF = '\u001b[?1049l'
const MOUSE_CELL_ON = '\u001b[?1002h'
const MOUSE_ALL_ON = '\u001b[?1003h'
const MOUSE_SGR_ON = '\u001b[?1006h'
const MOUSE_CELL_OFF = '\u001b[?1002l'
const MOUSE_ALL_OFF = '\u001b[?1003l'
const MOUSE_SGR_OFF = '\u001b[?1006l'
const BRACKETED_PASTE_ON = '\u001b[?2004h'
const BRACKETED_PASTE_OFF = '\u001b[?2004l'
const REPORT_FOCUS_ON = '\u001b[?1004h'
const REPORT_FOCUS_OFF = '\u001b[?1004l'

export class TerminalController {
  private rawMode = false
  private altScreen = false
  private bracketedPaste = false
  private focusReporting = false

  constructor(
    private readonly input: NodeJS.ReadableStream = process.stdin,
    private readonly output: NodeJS.WritableStream = process.stdout,
  ) {}

  enableRawMode(): void {
    const asTty = this.input as NodeJS.ReadStream
    if (
      typeof asTty.isTTY === 'boolean' &&
      asTty.isTTY &&
      typeof asTty.setRawMode === 'function'
    ) {
      asTty.setRawMode(true)
      asTty.resume()
      this.rawMode = true
    }
  }

  disableRawMode(): void {
    const asTty = this.input as NodeJS.ReadStream
    if (this.rawMode && typeof asTty.setRawMode === 'function') {
      asTty.setRawMode(false)
      asTty.pause()
      this.rawMode = false
    }
  }

  enterAltScreen(): void {
    this.write(ALT_SCREEN_ON)
    this.altScreen = true
  }

  exitAltScreen(): void {
    this.write(ALT_SCREEN_OFF)
    this.altScreen = false
  }

  clearScreen(): void {
    this.write(`${CLEAR_SCREEN}${CURSOR_HOME}`)
  }

  showCursor(): void {
    this.write(CURSOR_SHOW)
  }

  hideCursor(): void {
    this.write(CURSOR_HIDE)
  }

  enableMouseCellMotion(): void {
    this.write(MOUSE_CELL_ON)
    this.write(MOUSE_SGR_ON)
  }

  enableMouseAllMotion(): void {
    this.write(MOUSE_ALL_ON)
    this.write(MOUSE_SGR_ON)
  }

  disableMouse(): void {
    this.write(MOUSE_CELL_OFF)
    this.write(MOUSE_ALL_OFF)
    this.write(MOUSE_SGR_OFF)
  }

  enableBracketedPaste(): void {
    this.write(BRACKETED_PASTE_ON)
    this.bracketedPaste = true
  }

  disableBracketedPaste(): void {
    this.write(BRACKETED_PASTE_OFF)
    this.bracketedPaste = false
  }

  enableReportFocus(): void {
    this.write(REPORT_FOCUS_ON)
    this.focusReporting = true
  }

  disableReportFocus(): void {
    this.write(REPORT_FOCUS_OFF)
    this.focusReporting = false
  }

  setWindowTitle(title: string): void {
    this.write(`\u001b]0;${title}\u0007`)
  }

  cleanup(): void {
    this.disableMouse()
    if (this.focusReporting) {
      this.disableReportFocus()
    }
    if (this.bracketedPaste) {
      this.disableBracketedPaste()
    }
    this.showCursor()
    if (this.altScreen) {
      this.exitAltScreen()
    }
    this.disableRawMode()
  }

  write(data: string): void {
    if (data.length === 0) {
      return
    }
    this.output.write(data)
  }
}

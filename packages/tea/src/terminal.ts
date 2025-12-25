import type { PlatformAdapter, TerminalAdapter } from '@suds-cli/machine'
import {
  CURSOR_SHOW,
  CURSOR_HIDE,
  CLEAR_SCREEN,
  CURSOR_HOME,
  ALT_SCREEN_ON,
  ALT_SCREEN_OFF,
  MOUSE_CELL_ON,
  MOUSE_ALL_ON,
  MOUSE_SGR_ON,
  MOUSE_CELL_OFF,
  MOUSE_ALL_OFF,
  MOUSE_SGR_OFF,
  BRACKETED_PASTE_ON,
  BRACKETED_PASTE_OFF,
  REPORT_FOCUS_ON,
  REPORT_FOCUS_OFF,
} from '@suds-cli/machine'

/** @public Options for the terminal controller. */
export interface TerminalOptions {
  platform?: PlatformAdapter
}

export class TerminalController {
  private rawMode = false
  private altScreen = false
  private bracketedPaste = false
  private focusReporting = false
  private readonly terminal: TerminalAdapter | null

  constructor(platform?: PlatformAdapter) {
    this.terminal = platform?.terminal ?? null
  }

  enableRawMode(): void {
    if (this.terminal && !this.rawMode) {
      this.terminal.enableRawMode()
      this.rawMode = true
    }
  }

  disableRawMode(): void {
    if (this.terminal && this.rawMode) {
      this.terminal.disableRawMode()
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
    if (this.terminal) {
      this.terminal.write(data)
    }
  }
}

import { encodeString } from '../bytes.js'
import type {
  Disposable,
  InputHandler,
  ResizeHandler,
  TerminalAdapter,
  TerminalSize,
} from '../types.js'

/**
 * Minimal xterm.js Terminal interface.
 * This matches the core xterm.js API we need.
 * @public
 */
export interface XtermTerminal {
  readonly cols: number
  readonly rows: number
  write(data: string): void
  onData(listener: (data: string) => void): { dispose(): void }
  onResize(listener: (size: { cols: number; rows: number }) => void): {
    dispose(): void
  }
}

/**
 * Browser terminal adapter using xterm.js.
 * @public
 */
export class XtermTerminalAdapter implements TerminalAdapter {
  private disposed = false
  private readonly inputHandlers: Set<InputHandler> = new Set()
  private readonly resizeHandlers: Set<ResizeHandler> = new Set()
  private dataDisposable: { dispose(): void } | null = null
  private resizeDisposable: { dispose(): void } | null = null

  /**
   * Create a new xterm.js terminal adapter.
   * @param terminal - xterm.js Terminal instance
   */
  constructor(private readonly terminal: XtermTerminal) {}

  onInput(handler: InputHandler): Disposable {
    if (this.inputHandlers.size === 0) {
      this.dataDisposable = this.terminal.onData((data) => {
        const bytes = encodeString(data)
        for (const h of this.inputHandlers) {
          h(bytes)
        }
      })
    }
    this.inputHandlers.add(handler)

    return {
      dispose: () => {
        this.inputHandlers.delete(handler)
        if (this.inputHandlers.size === 0 && this.dataDisposable) {
          this.dataDisposable.dispose()
          this.dataDisposable = null
        }
      },
    }
  }

  onResize(handler: ResizeHandler): Disposable {
    if (this.resizeHandlers.size === 0) {
      this.resizeDisposable = this.terminal.onResize((size) => {
        const terminalSize: TerminalSize = {
          columns: size.cols,
          rows: size.rows,
        }
        for (const h of this.resizeHandlers) {
          h(terminalSize)
        }
      })
    }
    this.resizeHandlers.add(handler)

    return {
      dispose: () => {
        this.resizeHandlers.delete(handler)
        if (this.resizeHandlers.size === 0 && this.resizeDisposable) {
          this.resizeDisposable.dispose()
          this.resizeDisposable = null
        }
      },
    }
  }

  write(data: string): void {
    if (data.length === 0) {
      return
    }
    // Convert lone \n to \r\n for proper terminal line handling
    // xterm.js requires \r\n for carriage return + line feed
    const normalized = data.replace(/(?<!\r)\n/g, '\r\n')
    this.terminal.write(normalized)
  }

  getSize(): TerminalSize {
    return {
      columns: this.terminal.cols,
      rows: this.terminal.rows,
    }
  }

  enableRawMode(): void {
    // xterm.js is always in "raw mode" - no action needed
  }

  disableRawMode(): void {
    // xterm.js is always in "raw mode" - no action needed
  }

  isTTY(): boolean {
    // xterm.js is always a TTY
    return true
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true

    if (this.dataDisposable) {
      this.dataDisposable.dispose()
      this.dataDisposable = null
    }
    if (this.resizeDisposable) {
      this.resizeDisposable.dispose()
      this.resizeDisposable = null
    }

    this.inputHandlers.clear()
    this.resizeHandlers.clear()
  }
}

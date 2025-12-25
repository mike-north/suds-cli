import type { PlatformAdapter } from '@suds-cli/machine'
import { startInput } from './input.js'
import {
  ClearScreenMsg,
  DisableMouseMsg,
  EnableMouseAllMotionMsg,
  EnableMouseCellMotionMsg,
  EnterAltScreenMsg,
  ExitAltScreenMsg,
  HideCursorMsg,
  InterruptMsg,
  QuitMsg,
  ResumeMsg,
  SetWindowTitleMsg,
  ShowCursorMsg,
} from './messages.js'
import { StandardRenderer } from './renderer.js'
import { TerminalController } from './terminal.js'
import type { Cmd, Model, ModelMsg, Msg, ProgramResult } from './types.js'
import { WindowSizeMsg } from './messages.js'

/** @public Configure program runtime options. */
export interface ProgramOptions {
  altScreen?: boolean
  mouseMode?: 'cell' | 'all' | false
  platform?: PlatformAdapter
  fps?: number
  reportFocus?: boolean
  bracketedPaste?: boolean
}

/** @public Bubble Tea-style program runner. */
export class Program<M extends Model<Msg, M>> {
  private model: M
  private readonly terminal: TerminalController
  private readonly renderer: StandardRenderer
  private readonly opts: ProgramOptions
  private readonly platform: PlatformAdapter | undefined
  private stopInput?: () => void
  private running = false
  private queue: Msg[] = []
  private draining = false
  private result: ProgramResult<M> | null = null
  private resolveWait?: () => void

  constructor(model: M, options: ProgramOptions = {}) {
    this.model = model
    this.opts = options
    this.platform = options.platform
    this.terminal = new TerminalController(options.platform)
    this.renderer = new StandardRenderer({
      platform: options.platform,
      fps: options.fps,
    })
  }

  async run(): Promise<ProgramResult<M>> {
    this.running = true
    this.setupTerminal()
    this.setupSignals()
    this.renderer.start()

    try {
      this.runCmd(this.model.init())
      this.renderer.write(this.model.view())
      this.startInputLoop()
      // Wait until the program is explicitly quit
      await this.waitUntilDone()
      this.result = { model: this.model }
    } catch (err) {
      this.result = { model: this.model, error: err }
    } finally {
      this.shutdown()
    }

    return this.result ?? { model: this.model }
  }

  private waitUntilDone(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveWait = resolve
      // If already not running, resolve immediately
      if (!this.running) {
        resolve()
      }
    })
  }

  send(msg: Msg): void {
    if (!msg) {
      return
    }
    this.queue.push(msg)
    if (!this.draining) {
      void this.drainQueue()
    }
  }

  quit(): void {
    this.send(new QuitMsg())
  }

  kill(): void {
    this.running = false
    this.shutdown()
  }

  private drainQueue(): void {
    if (this.draining) {
      return
    }
    this.draining = true

    while (this.running && this.queue.length > 0) {
      const msg = this.queue.shift()
      if (msg === undefined) {
        continue
      }

      const consumed = this.handleInternal(msg)
      if (consumed) {
        continue
      }

      const [nextModel, cmd] = this.model.update(msg)
      this.model = nextModel

      this.runCmd(cmd)
      this.renderer.write(this.model.view())
    }

    this.draining = false
  }

  private handleInternal(msg: Msg): boolean {
    if (msg instanceof QuitMsg || msg instanceof InterruptMsg) {
      this.running = false
      if (this.resolveWait) {
        this.resolveWait()
      }
      return true
    }
    if (msg instanceof ClearScreenMsg) {
      this.terminal.clearScreen()
      return false
    }
    if (msg instanceof EnterAltScreenMsg) {
      this.terminal.enterAltScreen()
      this.renderer.repaint()
      return false
    }
    if (msg instanceof ExitAltScreenMsg) {
      this.terminal.exitAltScreen()
      this.renderer.repaint()
      return false
    }
    if (msg instanceof EnableMouseCellMotionMsg) {
      this.terminal.enableMouseCellMotion()
      return false
    }
    if (msg instanceof EnableMouseAllMotionMsg) {
      this.terminal.enableMouseAllMotion()
      return false
    }
    if (msg instanceof DisableMouseMsg) {
      this.terminal.disableMouse()
      return false
    }
    if (msg instanceof ShowCursorMsg) {
      this.terminal.showCursor()
      return false
    }
    if (msg instanceof HideCursorMsg) {
      this.terminal.hideCursor()
      return false
    }
    if (msg instanceof SetWindowTitleMsg) {
      this.terminal.setWindowTitle(msg.title)
      return false
    }
    if (msg instanceof ResumeMsg) {
      return false
    }
    return false
  }

  private runCmd<T extends Msg>(cmd: Cmd<T> | undefined): void {
    if (!cmd) {
      return
    }

    const handleResult = (result: T | T[] | null | undefined) => {
      if (result === null || result === undefined) {
        return
      }
      if (Array.isArray(result)) {
        for (const msg of result) {
          this.send(msg)
        }
      } else {
        this.send(result)
      }
    }

    try {
      const effect = cmd()
      if (effect instanceof Promise) {
        effect.then(handleResult).catch((err) => {
          // Preserve behavior but don't block other messages
          console.error(err)
        })
      } else {
        handleResult(effect)
      }
    } catch (err) {
      console.error(err)
    }
  }

  private setupTerminal(): void {
    this.terminal.enableRawMode()
    this.terminal.hideCursor()

    if (this.opts.altScreen) {
      this.terminal.enterAltScreen()
      this.terminal.clearScreen()
    }

    if (this.opts.mouseMode === 'cell') {
      this.terminal.enableMouseCellMotion()
    } else if (this.opts.mouseMode === 'all') {
      this.terminal.enableMouseAllMotion()
    }

    if (this.opts.bracketedPaste !== false) {
      this.terminal.enableBracketedPaste()
    }

    if (this.opts.reportFocus) {
      this.terminal.enableReportFocus()
    }
  }

  private startInputLoop(): void {
    this.stopInput = startInput({
      platform: this.platform,
      onMessage: (msg) => this.send(msg as ModelMsg<M>),
    })
  }

  private setupSignals(): void {
    const disposables: (() => void)[] = []

    // Set up signal handlers if platform adapter is available
    if (this.platform) {
      const intDisposable = this.platform.signals.onInterrupt(this.onSigInt)
      const termDisposable = this.platform.signals.onTerminate(this.onSigTerm)
      disposables.push(
        () => intDisposable.dispose(),
        () => termDisposable.dispose(),
      )

      // Set up resize handler
      const handleResize = (size: { columns: number; rows: number }) => {
        this.send(new WindowSizeMsg(size.columns, size.rows))
      }
      const resizeDisposable =
        this.platform.terminal.onResize(handleResize)
      disposables.push(() => resizeDisposable.dispose())

      // Send initial size
      const initialSize = this.platform.terminal.getSize()
      this.send(new WindowSizeMsg(initialSize.columns, initialSize.rows))
    }

    this.disposeSignals = () => {
      for (const dispose of disposables) {
        dispose()
      }
    }
  }

  private disposeSignals: (() => void) | null = null

  private onSigInt = (): void => {
    this.send(new InterruptMsg())
  }

  private onSigTerm = (): void => {
    this.send(new QuitMsg())
  }

  private shutdown(): void {
    if (this.disposeSignals) {
      this.disposeSignals()
      this.disposeSignals = null
    }
    if (this.stopInput) {
      this.stopInput()
      this.stopInput = undefined
    }
    this.renderer.stop()
    this.terminal.cleanup()
    if (this.platform) {
      this.platform.dispose()
    }
  }
}

import type { PlatformAdapter, TerminalAdapter } from '@suds-cli/machine'
import { CURSOR_HOME, CLEAR_SCREEN } from '@suds-cli/machine'

/** @public Options for the standard renderer. */
export interface RendererOptions {
  platform?: PlatformAdapter
  fps?: number
}

export class StandardRenderer {
  private nextFrame: string | null = null
  private lastFrame = ''
  private ticker: ReturnType<typeof setInterval> | null = null
  private readonly terminal: TerminalAdapter | null
  private readonly frameInterval: number

  constructor(options: RendererOptions = {}) {
    this.terminal = options.platform?.terminal ?? null
    const fps = Math.min(Math.max(options.fps ?? 60, 1), 120)
    this.frameInterval = Math.round(1000 / fps)
  }

  start(): void {
    if (this.ticker) {
      return
    }
    this.ticker = setInterval(() => this.flush(), this.frameInterval)
  }

  stop(): void {
    this.flush()
    if (this.ticker) {
      clearInterval(this.ticker)
      this.ticker = null
    }
  }

  write(view: string): void {
    this.nextFrame = view ?? ''
  }

  repaint(): void {
    this.lastFrame = ''
  }

  private flush(): void {
    if (this.nextFrame === null) {
      return
    }
    const frame = this.nextFrame
    if (frame === this.lastFrame) {
      return
    }
    this.lastFrame = frame
    // Clear the full screen before writing the next frame to avoid leftover characters
    if (this.terminal) {
      this.terminal.write(`${CLEAR_SCREEN}${CURSOR_HOME}${frame}`)
    }
  }
}

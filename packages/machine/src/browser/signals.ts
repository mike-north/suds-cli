import type { Disposable, SignalAdapter, SignalHandler } from '../types.js'

/**
 * Browser signal adapter using window events.
 * Maps browser events to the signal interface:
 * - beforeunload -\> interrupt
 * - pagehide -\> terminate
 * @public
 */
export class BrowserSignalAdapter implements SignalAdapter {
  private readonly interruptHandlers: Set<SignalHandler> = new Set()
  private readonly terminateHandlers: Set<SignalHandler> = new Set()
  private disposed = false
  private boundBeforeUnload: ((e: BeforeUnloadEvent) => void) | null = null
  private boundPageHide: (() => void) | null = null

  private handleBeforeUnload = (e: BeforeUnloadEvent): void => {
    for (const handler of this.interruptHandlers) {
      handler()
    }
    // Prevent the unload to allow handlers to run
    // This may show a confirmation dialog in some browsers
    if (this.interruptHandlers.size > 0) {
      e.preventDefault()
    }
  }

  private handlePageHide = (): void => {
    for (const handler of this.terminateHandlers) {
      handler()
    }
  }

  onInterrupt(handler: SignalHandler): Disposable {
    if (this.interruptHandlers.size === 0 && typeof window !== 'undefined') {
      this.boundBeforeUnload = this.handleBeforeUnload
      window.addEventListener('beforeunload', this.boundBeforeUnload)
    }
    this.interruptHandlers.add(handler)

    return {
      dispose: () => {
        this.interruptHandlers.delete(handler)
        if (
          this.interruptHandlers.size === 0 &&
          this.boundBeforeUnload &&
          typeof window !== 'undefined'
        ) {
          window.removeEventListener('beforeunload', this.boundBeforeUnload)
          this.boundBeforeUnload = null
        }
      },
    }
  }

  onTerminate(handler: SignalHandler): Disposable {
    if (this.terminateHandlers.size === 0 && typeof window !== 'undefined') {
      this.boundPageHide = this.handlePageHide
      window.addEventListener('pagehide', this.boundPageHide)
    }
    this.terminateHandlers.add(handler)

    return {
      dispose: () => {
        this.terminateHandlers.delete(handler)
        if (
          this.terminateHandlers.size === 0 &&
          this.boundPageHide &&
          typeof window !== 'undefined'
        ) {
          window.removeEventListener('pagehide', this.boundPageHide)
          this.boundPageHide = null
        }
      },
    }
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true

    if (typeof window !== 'undefined') {
      if (this.boundBeforeUnload) {
        window.removeEventListener('beforeunload', this.boundBeforeUnload)
      }
      if (this.boundPageHide) {
        window.removeEventListener('pagehide', this.boundPageHide)
      }
    }

    this.interruptHandlers.clear()
    this.terminateHandlers.clear()
  }
}

import { createRequire } from 'node:module'
import type { ClipboardAdapter } from '../types.js'

const require = createRequire(import.meta.url)

/**
 * Clipboard interface matching the clipboardy module.
 */
interface ClipboardModule {
  read(): Promise<string>
  write(text: string): Promise<void>
}

/**
 * Node.js clipboard adapter using the clipboardy package.
 * clipboardy is an optional peer dependency.
 * @public
 */
export class NodeClipboardAdapter implements ClipboardAdapter {
  private clipboard: ClipboardModule | null = null
  private available: boolean | null = null

  /**
   * Create a new Node.js clipboard adapter.
   * Optionally pass a pre-loaded clipboardy module for dependency injection.
   * @param clipboardModule - Optional pre-loaded clipboard module
   */
  constructor(clipboardModule?: ClipboardModule) {
    if (clipboardModule) {
      this.clipboard = clipboardModule
      this.available = true
    }
  }

  private async loadClipboard(): Promise<ClipboardModule | null> {
    if (this.clipboard !== null) {
      return this.clipboard
    }

    try {
      // Dynamic import of optional peer dependency
      const module = (await import('clipboardy')) as { default: ClipboardModule }
      this.clipboard = module.default
      this.available = true
      return this.clipboard
    } catch {
      this.available = false
      return null
    }
  }

  async read(): Promise<string> {
    const clipboard = await this.loadClipboard()
    if (!clipboard) {
      throw new Error('Clipboard not available. Install clipboardy: npm install clipboardy')
    }
    return clipboard.read()
  }

  async write(text: string): Promise<void> {
    const clipboard = await this.loadClipboard()
    if (!clipboard) {
      throw new Error('Clipboard not available. Install clipboardy: npm install clipboardy')
    }
    await clipboard.write(text)
  }

  isAvailable(): boolean {
    // If we already checked, return cached result
    if (this.available !== null) {
      return this.available
    }

    // Try synchronous check first
    try {
      require.resolve('clipboardy')
      return true
    } catch {
      return false
    }
  }
}

import process from 'node:process'
import { createRequire } from 'node:module'
import type {
  ColorSupport,
  EnvironmentAdapter,
  TerminalBackground,
} from '../types.js'

const require = createRequire(import.meta.url)

/**
 * Supports-color module interface.
 */
interface SupportsColorModule {
  stdout?: { level?: number } | false
}

/**
 * Node.js environment adapter.
 * Uses process.env and supports-color for environment detection.
 * @public
 */
export class NodeEnvironmentAdapter implements EnvironmentAdapter {
  private supportsColorModule: SupportsColorModule | null = null
  private colorSupportCached: ColorSupport | null = null
  private backgroundCached: TerminalBackground | null = null

  /**
   * Create a new Node.js environment adapter.
   * Optionally pass a pre-loaded supports-color module for dependency injection.
   * @param supportsColor - Optional pre-loaded supports-color module
   */
  constructor(supportsColor?: SupportsColorModule) {
    if (supportsColor) {
      this.supportsColorModule = supportsColor
    }
  }

  get(name: string): string | undefined {
    return process.env[name]
  }

  getColorSupport(): ColorSupport {
    if (this.colorSupportCached) {
      return this.colorSupportCached
    }

    const support = this.detectColorSupport()
    this.colorSupportCached = support
    return support
  }

  private detectColorSupport(): ColorSupport {
    // Try to use supports-color if available
    const module = this.loadSupportsColor()
    if (module) {
      const stdout = module.stdout
      if (stdout && typeof stdout.level === 'number') {
        const level = stdout.level
        return {
          level,
          hasBasic: level >= 1,
          has256: level >= 2,
          has16m: level >= 3,
        }
      }
    }

    // Fallback to environment variable detection
    return this.detectColorSupportFromEnv()
  }

  private loadSupportsColor(): SupportsColorModule | null {
    if (this.supportsColorModule !== null) {
      return this.supportsColorModule
    }

    try {
      // Dynamic require of optional peer dependency
      const module = require('supports-color') as SupportsColorModule
      this.supportsColorModule = module
      return module
    } catch {
      return null
    }
  }

  private detectColorSupportFromEnv(): ColorSupport {
    // Check COLORTERM for true color support
    const colorTerm = process.env.COLORTERM?.toLowerCase()
    if (colorTerm === 'truecolor' || colorTerm === '24bit') {
      return { level: 3, hasBasic: true, has256: true, has16m: true }
    }

    // Check TERM for 256 color support
    const term = process.env.TERM?.toLowerCase() ?? ''
    if (term.includes('256color') || term.includes('256-color')) {
      return { level: 2, hasBasic: true, has256: true, has16m: false }
    }

    // Check for basic color terminals
    if (
      term.includes('color') ||
      term.includes('ansi') ||
      term.includes('xterm') ||
      term.includes('vt100') ||
      term.includes('screen') ||
      term.includes('linux')
    ) {
      return { level: 1, hasBasic: true, has256: false, has16m: false }
    }

    // Check CI environments
    if (process.env.CI) {
      return { level: 1, hasBasic: true, has256: false, has16m: false }
    }

    // Check if we have a TTY
    if (process.stdout?.isTTY) {
      return { level: 1, hasBasic: true, has256: false, has16m: false }
    }

    // No color support detected
    return { level: 0, hasBasic: false, has256: false, has16m: false }
  }

  getTerminalBackground(): TerminalBackground {
    if (this.backgroundCached) {
      return this.backgroundCached
    }

    const background = this.detectTerminalBackground()
    this.backgroundCached = background
    return background
  }

  private detectTerminalBackground(): TerminalBackground {
    // COLORFGBG is the most reliable indicator when present
    // Format: "fg;bg" where bg < 7 typically means dark, bg >= 7 means light
    const colorFgBg = process.env.COLORFGBG
    if (colorFgBg) {
      const parts = colorFgBg.split(';')
      const bg = parseInt(parts[parts.length - 1] ?? '', 10)
      if (!isNaN(bg)) {
        // Standard ANSI colors: 0-6 are dark, 7+ (white) is light
        // 256-color: 0-7 dark, 8-15 bright versions
        return bg < 7 || (bg >= 8 && bg < 16 && bg !== 15) ? 'dark' : 'light'
      }
    }

    // Some terminals set TERM_BACKGROUND directly
    const termBackground = process.env.TERM_BACKGROUND?.toLowerCase()
    if (termBackground === 'dark' || termBackground === 'light') {
      return termBackground
    }

    // macOS Terminal.app and iTerm2 default to dark themes commonly
    const termProgram = process.env.TERM_PROGRAM ?? ''
    if (/iTerm/i.test(termProgram)) {
      // iTerm2's default is dark, but users can change it
      return 'dark'
    }

    // VS Code integrated terminal
    if (process.env.TERM_PROGRAM === 'vscode') {
      // VS Code defaults to matching the editor theme
      // Most devs use dark themes
      return 'dark'
    }

    return 'unknown'
  }
}

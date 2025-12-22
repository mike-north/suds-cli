import stripAnsi from 'strip-ansi'

/**
 * Options for creating a Sanitizer.
 * @public
 */
export interface SanitizerOptions {
  /** Replacement for newlines/carriage returns (default: newline) */
  replaceNewLine?: string
  /** Replacement for tabs (default: 4 spaces) */
  replaceTab?: string
}

/**
 * Sanitizes input strings by removing ANSI escape sequences and control
 * characters, and optionally replacing newlines/tabs.
 * @public
 */
export class Sanitizer {
  readonly #replaceNewLine: string
  readonly #replaceTab: string

  constructor(options: SanitizerOptions = {}) {
    this.#replaceNewLine = options.replaceNewLine ?? '\n'
    this.#replaceTab = options.replaceTab ?? '    '
  }

  /**
   * Sanitize a string by removing ANSI escape sequences and control
   * characters, and replacing newlines/tabs per configuration.
   *
   * - ANSI escape sequences (colors, cursor codes) are stripped first
   * - Newlines and carriage returns are replaced with `replaceNewLine`
   * - Tabs are replaced with `replaceTab`
   * - Other control characters are removed
   * - Invalid Unicode replacement characters are skipped
   */
  sanitize(input: string): string {
    // First strip ANSI escape sequences
    const stripped = stripAnsi(input)

    let result = ''

    for (const char of stripped) {
      const code = char.codePointAt(0) ?? 0

      // Skip Unicode replacement character (invalid UTF-8 equivalent)
      if (code === 0xfffd) {
        continue
      }

      if (char === '\r' || char === '\n') {
        result += this.#replaceNewLine
      } else if (char === '\t') {
        result += this.#replaceTab
      } else if (isControl(code)) {
        // Skip other control characters
      } else {
        result += char
      }
    }

    return result
  }
}

/**
 * Check if a code point is a control character.
 * Covers C0 controls (0x00-0x1F), DEL (0x7F), and C1 controls (0x80-0x9F).
 */
function isControl(code: number): boolean {
  return (
    (code >= 0x00 && code <= 0x1f) ||
    code === 0x7f ||
    (code >= 0x80 && code <= 0x9f)
  )
}

/**
 * Create a new Sanitizer with optional configuration.
 *
 * @example
 * ```ts
 * const sanitizer = newSanitizer({
 *   replaceNewLine: " ",  // Replace newlines with space
 *   replaceTab: "",       // Remove tabs
 * });
 *
 * sanitizer.sanitize("hello\nworld"); // "hello world"
 * ```
 * @public
 */
export function newSanitizer(options?: SanitizerOptions): Sanitizer {
  return new Sanitizer(options)
}

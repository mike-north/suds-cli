/**
 * Pure JavaScript ANSI styling utility for terminal text.
 * Works identically in Node.js and browser/xterm.js contexts.
 * @packageDocumentation
 */

import type { ColorSupport, StyleFn } from '../types.js'

// ANSI escape codes
const ESC = '\x1b['
const RESET = `${ESC}0m`

// Modifier codes
const CODES = {
  // Modifiers (open, close)
  bold: ['1', '22'],
  dim: ['2', '22'],
  italic: ['3', '23'],
  underline: ['4', '24'],
  inverse: ['7', '27'],
  hidden: ['8', '28'],
  strikethrough: ['9', '29'],

  // Basic foreground colors (30-37)
  black: ['30', '39'],
  red: ['31', '39'],
  green: ['32', '39'],
  yellow: ['33', '39'],
  blue: ['34', '39'],
  magenta: ['35', '39'],
  cyan: ['36', '39'],
  white: ['37', '39'],

  // Bright foreground colors (90-97)
  blackBright: ['90', '39'],
  redBright: ['91', '39'],
  greenBright: ['92', '39'],
  yellowBright: ['93', '39'],
  blueBright: ['94', '39'],
  magentaBright: ['95', '39'],
  cyanBright: ['96', '39'],
  whiteBright: ['97', '39'],

  // Basic background colors (40-47)
  bgBlack: ['40', '49'],
  bgRed: ['41', '49'],
  bgGreen: ['42', '49'],
  bgYellow: ['43', '49'],
  bgBlue: ['44', '49'],
  bgMagenta: ['45', '49'],
  bgCyan: ['46', '49'],
  bgWhite: ['47', '49'],

  // Bright background colors (100-107)
  bgBlackBright: ['100', '49'],
  bgRedBright: ['101', '49'],
  bgGreenBright: ['102', '49'],
  bgYellowBright: ['103', '49'],
  bgBlueBright: ['104', '49'],
  bgMagentaBright: ['105', '49'],
  bgCyanBright: ['106', '49'],
  bgWhiteBright: ['107', '49'],
} as const

type CodeName = keyof typeof CODES

/**
 * Apply ANSI codes to text.
 * @param text - Text to style
 * @param open - Opening ANSI code
 * @param close - Closing ANSI code
 * @returns Styled text
 */
function applyStyle(text: string, open: string, close: string): string {
  const openSeq = `${ESC}${open}m`
  const closeSeq = `${ESC}${close}m`

  // Replace any existing close codes with close+open to properly nest styles
  // This handles cases like style.bold(style.bold('text')) where the inner
  // bold close would prematurely end the outer bold
  const replaced = text.replace(
    new RegExp(closeSeq.replace(/[[\](){}|^$+*?.\\]/g, '\\$&'), 'g'),
    closeSeq + openSeq,
  )

  return openSeq + replaced + closeSeq
}

/**
 * Convert hex color to RGB.
 * @param hex - Hex color string (with or without #)
 * @returns RGB array [r, g, b]
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace(/^#/, '')
  const num = parseInt(clean, 16)

  if (clean.length === 3) {
    // Short form: #RGB -> #RRGGBB
    const r = ((num >> 8) & 0xf) * 17
    const g = ((num >> 4) & 0xf) * 17
    const b = (num & 0xf) * 17
    return [r, g, b]
  }

  // Long form: #RRGGBB
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return [r, g, b]
}

/**
 * Create a chainable style function.
 * @param colorSupport - Color support level information
 * @returns Chainable style function
 * @public
 */
export function createStyle(colorSupport: ColorSupport): StyleFn {
  const enabled = colorSupport.level > 0

  /**
   * Build a style function that can be chained.
   * @param stack - Array of [open, close] code pairs to apply
   * @returns Style function
   */
  function build(stack: Array<[string, string]>): StyleFn {
    // The function itself - applies all stacked styles
    const fn = (text: string): string => {
      if (!enabled || stack.length === 0) {
        return text
      }

      // Apply styles from inside out
      let result = text
      for (let i = stack.length - 1; i >= 0; i--) {
        const [open, close] = stack[i]!
        result = applyStyle(result, open, close)
      }
      return result
    }

    // Add all code-based style properties
    const codeNames = Object.keys(CODES) as CodeName[]
    for (const name of codeNames) {
      const [open, close] = CODES[name]
      Object.defineProperty(fn, name, {
        get() {
          return build([...stack, [open, close]])
        },
      })
    }

    // Add gray as alias for blackBright
    Object.defineProperty(fn, 'gray', {
      get() {
        const [open, close] = CODES.blackBright
        return build([...stack, [open, close]])
      },
    })

    // Add grey as alias for blackBright
    Object.defineProperty(fn, 'grey', {
      get() {
        const [open, close] = CODES.blackBright
        return build([...stack, [open, close]])
      },
    })

    // Add extended color methods

    // hex(color: string): StyleFn
    Object.defineProperty(fn, 'hex', {
      value: (color: string): StyleFn => {
        if (!enabled || !colorSupport.has16m) {
          return build(stack)
        }
        const [r, g, b] = hexToRgb(color)
        return build([...stack, [`38;2;${r};${g};${b}`, '39']])
      },
      writable: true,
    })

    // rgb(r: number, g: number, b: number): StyleFn
    Object.defineProperty(fn, 'rgb', {
      value: (r: number, g: number, b: number): StyleFn => {
        if (!enabled || !colorSupport.has16m) {
          return build(stack)
        }
        return build([...stack, [`38;2;${r};${g};${b}`, '39']])
      },
      writable: true,
    })

    // bgHex(color: string): StyleFn
    Object.defineProperty(fn, 'bgHex', {
      value: (color: string): StyleFn => {
        if (!enabled || !colorSupport.has16m) {
          return build(stack)
        }
        const [r, g, b] = hexToRgb(color)
        return build([...stack, [`48;2;${r};${g};${b}`, '49']])
      },
      writable: true,
    })

    // bgRgb(r: number, g: number, b: number): StyleFn
    Object.defineProperty(fn, 'bgRgb', {
      value: (r: number, g: number, b: number): StyleFn => {
        if (!enabled || !colorSupport.has16m) {
          return build(stack)
        }
        return build([...stack, [`48;2;${r};${g};${b}`, '49']])
      },
      writable: true,
    })

    // ansi256(code: number): StyleFn
    Object.defineProperty(fn, 'ansi256', {
      value: (code: number): StyleFn => {
        if (!enabled || !colorSupport.has256) {
          return build(stack)
        }
        return build([...stack, [`38;5;${code}`, '39']])
      },
      writable: true,
    })

    // bgAnsi256(code: number): StyleFn
    Object.defineProperty(fn, 'bgAnsi256', {
      value: (code: number): StyleFn => {
        if (!enabled || !colorSupport.has256) {
          return build(stack)
        }
        return build([...stack, [`48;5;${code}`, '49']])
      },
      writable: true,
    })

    return fn as StyleFn
  }

  return build([])
}

/**
 * Create a style function that always applies colors (for xterm.js).
 * @returns Chainable style function with full color support
 * @public
 */
export function createAlwaysEnabledStyle(): StyleFn {
  return createStyle({ level: 3, hasBasic: true, has256: true, has16m: true })
}

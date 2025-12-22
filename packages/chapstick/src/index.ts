// Entry point for @suds/chapstick.

// Types
export type {
  Align,
  HAlign,
  VAlign,
  BorderStyle,
  ColorInput,
  StyleOptions,
  Spacing,
} from './types.js'

// Borders
export { borderStyles, defaultBorderStyle } from './borders.js'

// Colors
export {
  getColorSupport,
  getTerminalBackground,
  resolveColor,
  type ColorSupport,
  type TerminalBackground,
} from './colors.js'

// Measurement utilities
export { width, clampWidth, wrapWidth, padLines } from './measure.js'

// Style class
export { Style, type StyleKey } from './style.js'

// Style providers for dependency injection
export {
  ChapstickStyleProvider,
  defaultStyleProvider,
  type ChainableStyle,
  type SemanticStyles,
  type StyleProvider,
} from './provider.js'

// Layout utilities
export { joinHorizontal, joinVertical, place } from './join.js'

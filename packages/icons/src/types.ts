/**
 * IconInfo represents information about an icon including its glyph and color.
 * @public
 */
export interface IconInfo {
  /** Unicode glyph for the icon */
  readonly glyph: string;
  /** RGB color values [r, g, b] for the icon */
  readonly color: readonly [number, number, number];
}

/**
 * Result of getIcon function containing the glyph and ANSI color code.
 * @public
 */
export interface IconResult {
  /** Unicode glyph for the icon */
  readonly glyph: string;
  /** ANSI color code for the icon */
  readonly color: string;
}

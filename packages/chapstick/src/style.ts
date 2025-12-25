import type { ColorSupport, EnvironmentAdapter, StyleFn } from '@suds-cli/machine'
import { createStyle } from '@suds-cli/machine'
import { defaultBorderStyle } from './borders.js'
import { resolveColor } from './colors.js'
import { clampWidth, width as textWidth, wrapWidth } from './measure.js'
import type {
  BorderStyle,
  ColorInput,
  HAlign,
  Spacing,
  StyleOptions,
  VAlign,
} from './types.js'

type PaddingInput = number | Partial<Spacing>
type MarginInput = number | Partial<Spacing>

/**
 * Keys that can be explicitly set on a style.
 * Used to track which properties have been set vs using defaults.
 * @public
 */
export type StyleKey = keyof StyleOptions

/**
 * Context required for rendering styles.
 * @public
 */
export interface StyleContext {
  /** Environment adapter for detecting terminal capabilities. */
  readonly env: EnvironmentAdapter
  /** Style function for applying ANSI styling. */
  readonly styleFn: StyleFn
}

// Lazy-initialized default context for layout-only styling (no colors)
let defaultContext: StyleContext | undefined

/**
 * Create a default StyleContext for layout-only styling (no ANSI colors).
 * This is used internally when no context is provided.
 * @public
 */
export function createDefaultContext(): StyleContext {
  if (!defaultContext) {
    const noColors: ColorSupport = { level: 0, hasBasic: false, has256: false, has16m: false }
    const noopEnv: EnvironmentAdapter = {
      get: () => undefined,
      getColorSupport: () => noColors,
      getTerminalBackground: () => 'unknown',
    }
    defaultContext = {
      env: noopEnv,
      styleFn: createStyle(noColors),
    }
  }
  return defaultContext
}

/**
 * Set the default StyleContext used when no context is explicitly provided.
 * This is useful for browser environments (xterm.js) where colors should always be enabled.
 * @param context - The context to use as default, or undefined to reset to no-colors default
 * @public
 */
export function setDefaultContext(context: StyleContext | undefined): void {
  defaultContext = context
}

/**
 * Fluent style builder for terminal strings.
 * @public
 */
export class Style {
  private readonly options: StyleOptions
  /** Track which properties have been explicitly set */
  private readonly setKeys: Set<StyleKey>
  /** Optional context for rendering - if not set, rendering will throw */
  private readonly context?: StyleContext

  constructor(
    options: StyleOptions = {},
    setKeys?: Set<StyleKey>,
    context?: StyleContext,
  ) {
    this.options = { ...options }
    this.setKeys = setKeys
      ? new Set(setKeys)
      : new Set(Object.keys(options) as StyleKey[])
    this.context = context
  }

  /**
   * Create a deep copy of this style.
   */
  copy(): Style {
    return new Style(structuredClone(this.options), new Set(this.setKeys), this.context)
  }

  /**
   * Create a copy of this style with a new context.
   * @param context - The new context to use for rendering
   */
  withContext(context: StyleContext): Style {
    return new Style(this.options, this.setKeys, context)
  }

  /**
   * Inherit unset properties from another style.
   * Only copies properties that are set in `other` but not set in `this`.
   * Margins and padding are NOT inherited (matching Go Lip Gloss behavior).
   */
  inherit(other: Style): Style {
    const newOptions = { ...this.options }
    const newSetKeys = new Set(this.setKeys)

    // Keys that should not be inherited
    const noInherit: StyleKey[] = ['padding', 'margin']

    for (const key of other.setKeys) {
      // Skip padding and margin - they are not inherited
      if (noInherit.includes(key)) continue

      // Only copy if not already set in this style
      if (!this.setKeys.has(key)) {
        ;(newOptions as Record<string, unknown>)[key] = structuredClone(
          (other.options as Record<string, unknown>)[key],
        )
        newSetKeys.add(key)
      }
    }

    return new Style(newOptions, newSetKeys, this.context)
  }

  /**
   * Check if a property has been explicitly set.
   */
  isSet(key: StyleKey): boolean {
    return this.setKeys.has(key)
  }

  /**
   * Unset a property, reverting to default behavior.
   */
  unset(...keys: StyleKey[]): Style {
    const newOptions = { ...this.options }
    const newSetKeys = new Set(this.setKeys)
    for (const key of keys) {
      delete (newOptions as Record<string, unknown>)[key]
      newSetKeys.delete(key)
    }
    return new Style(newOptions, newSetKeys, this.context)
  }

  foreground(color: ColorInput): Style {
    return this.with({ foreground: color })
  }

  background(color: ColorInput): Style {
    return this.with({ background: color })
  }

  bold(value = true): Style {
    return this.with({ bold: value })
  }

  italic(value = true): Style {
    return this.with({ italic: value })
  }

  underline(value = true): Style {
    return this.with({ underline: value })
  }

  strikethrough(value = true): Style {
    return this.with({ strikethrough: value })
  }

  padding(all: number): Style
  padding(vertical: number, horizontal: number): Style
  padding(top: number, right: number, bottom: number, left: number): Style
  padding(
    input: PaddingInput,
    right?: number,
    bottom?: number,
    left?: number,
  ): Style {
    const next = normalizeSpacing(input, right, bottom, left)
    return this.with({ padding: { ...this.options.padding, ...next } })
  }

  margin(all: number): Style
  margin(vertical: number, horizontal: number): Style
  margin(top: number, right: number, bottom: number, left: number): Style
  margin(
    input: MarginInput,
    right?: number,
    bottom?: number,
    left?: number,
  ): Style {
    const next = normalizeSpacing(input, right, bottom, left)
    return this.with({ margin: { ...this.options.margin, ...next } })
  }

  width(value: number): Style {
    return this.with({ width: value })
  }

  height(value: number): Style {
    return this.with({ height: value })
  }

  maxWidth(value: number): Style {
    return this.with({ maxWidth: value })
  }

  maxHeight(value: number): Style {
    return this.with({ maxHeight: value })
  }

  /**
   * Enable borders with the default or specified style.
   * Use borderStyle() to change the border characters without re-enabling.
   */
  border(enabled: boolean): Style
  border(style: BorderStyle): Style
  border(arg: boolean | BorderStyle = true): Style {
    if (typeof arg === 'boolean') {
      if (arg) {
        // Enable borders with current or default style
        return this.with({
          borderStyle: this.options.borderStyle ?? defaultBorderStyle,
        })
      } else {
        // Disable borders by unsetting borderStyle and borderColor
        return this.unset('borderStyle', 'borderColor')
      }
    }
    return this.with({ borderStyle: arg })
  }

  /**
   * Set the border style characters.
   */
  borderStyle(style: BorderStyle): Style {
    return this.with({ borderStyle: style })
  }

  /**
   * Set the border foreground color.
   */
  borderForeground(color: ColorInput): Style {
    return this.with({ borderColor: color })
  }

  /**
   * Set horizontal alignment.
   * @deprecated Use alignHorizontal() instead.
   */
  align(value: HAlign): Style {
    return this.alignHorizontal(value)
  }

  /**
   * Set horizontal alignment (left, center, right).
   */
  alignHorizontal(value: HAlign): Style {
    return this.with({ alignHorizontal: value })
  }

  /**
   * Set vertical alignment (top, center, bottom).
   * Only applies when height is set.
   */
  alignVertical(value: VAlign): Style {
    return this.with({ alignVertical: value })
  }

  /**
   * Enable inline mode. When true:
   * - Newlines are stripped from the input
   * - Padding and margins are not applied
   */
  inline(value = true): Style {
    return this.with({ inline: value })
  }

  /**
   * Render the style to a string.
   * Uses the default no-op context if none was provided.
   */
  render(text: string): string {
    const ctx = this.context ?? createDefaultContext()
    return this.renderWithContext(text, ctx)
  }

  /**
   * Render the style to a string with an explicit context.
   * @param text - Text to render
   * @param ctx - Context for rendering
   */
  renderWithContext(text: string, ctx: StyleContext): string {
    const opts = this.options
    const isInline = opts.inline ?? false

    // In inline mode, strip newlines first
    let content = text ?? ''
    if (isInline) {
      content = content.replace(/\r?\n/g, '')
    }

    const targetWidth = opts.width ?? opts.maxWidth
    const hasBorder =
      opts.borderStyle !== undefined || this.setKeys.has('borderColor')

    // In inline mode, skip padding/margin
    const padding = isInline
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : normalizeSpacing(opts.padding ?? 0)
    const borderWidth = hasBorder ? 2 : 0
    const innerTargetWidth =
      targetWidth !== undefined
        ? Math.max(0, targetWidth - padding.left - padding.right - borderWidth)
        : undefined

    if (opts.maxWidth && innerTargetWidth !== undefined) {
      content = wrapWidth(content, innerTargetWidth)
    }
    if (opts.width && opts.width > 0 && innerTargetWidth !== undefined) {
      content = clampWidth(content, innerTargetWidth)
    }

    const lines: string[] = content.split('\n')
    const aligned = alignLinesHorizontal(
      lines,
      opts.alignHorizontal,
      innerTargetWidth,
    )

    const padded = isInline ? aligned : applySpacing(aligned, padding)
    const borderStyle = opts.borderStyle ?? defaultBorderStyle
    const bordered = hasBorder
      ? applyBorder(padded, borderStyle, opts.borderColor, ctx)
      : padded

    // Apply height and vertical alignment
    const sized = applyHeight(
      bordered,
      opts.height,
      opts.maxHeight,
      opts.alignVertical,
    )
    const colored = applyTextStyle(sized, opts, ctx)

    // In inline mode, skip margin
    if (isInline) {
      return colored.join('')
    }

    const withMargin = applySpacing(
      colored,
      normalizeSpacing(opts.margin ?? 0),
    ).join('\n')

    return withMargin
  }

  private with(patch: Partial<StyleOptions>): Style {
    const newSetKeys = new Set(this.setKeys)
    for (const key of Object.keys(patch) as StyleKey[]) {
      newSetKeys.add(key)
    }
    return new Style({ ...this.options, ...patch }, newSetKeys, this.context)
  }
}

function normalizeSpacing(
  input: PaddingInput,
  right?: number,
  bottom?: number,
  left?: number,
): Spacing {
  if (typeof input === 'number') {
    const v = input
    if (right === undefined && bottom === undefined && left === undefined) {
      return { top: v, right: v, bottom: v, left: v }
    }
    if (right !== undefined && bottom === undefined && left === undefined) {
      return { top: v, right, bottom: v, left: right }
    }
    return {
      top: v,
      right: right ?? 0,
      bottom: bottom ?? 0,
      left: left ?? 0,
    }
  }
  return {
    top: input.top ?? 0,
    right: input.right ?? 0,
    bottom: input.bottom ?? 0,
    left: input.left ?? 0,
  }
}

function alignLinesHorizontal(
  lines: string[],
  align: HAlign | undefined,
  targetWidth?: number,
): string[] {
  // When no width is specified and no alignment, return as-is
  if (!targetWidth && !align) {
    return lines
  }
  const maxLineWidth = lines.reduce(
    (acc, line) => Math.max(acc, textWidth(line)),
    0,
  )
  const width = targetWidth ?? maxLineWidth
  // Default to left alignment when width is set but no alignment specified
  const effectiveAlign = align ?? 'left'
  return lines.map((line) => {
    const w = textWidth(line)
    const space = Math.max(0, width - w)
    switch (effectiveAlign) {
      case 'center': {
        const left = Math.floor(space / 2)
        const right = space - left
        return `${' '.repeat(left)}${line}${' '.repeat(right)}`
      }
      case 'right':
        return `${' '.repeat(space)}${line}`
      case 'left':
      default:
        return `${line}${' '.repeat(space)}`
    }
  })
}

function applySpacing(lines: string[], spacing: Spacing): string[] {
  const { top, right, bottom, left } = spacing
  const spaceLeft = ' '.repeat(Math.max(0, left))
  const spaceRight = ' '.repeat(Math.max(0, right))
  const spaced = lines.map((line) => `${spaceLeft}${line}${spaceRight}`)
  const maxWidth = spaced.reduce(
    (acc, line) => Math.max(acc, textWidth(line)),
    0,
  )
  const empty = ' '.repeat(maxWidth)
  const withTop = Array.from({ length: Math.max(0, top) }, () => empty).concat(
    spaced,
  )
  return withTop.concat(
    Array.from({ length: Math.max(0, bottom) }, () => empty),
  )
}

function applyBorder(
  lines: string[],
  style: BorderStyle,
  borderColor: ColorInput | undefined,
  ctx: StyleContext,
): string[] {
  if (!style) return lines
  const widthMax = lines.reduce(
    (acc, line) => Math.max(acc, textWidth(line)),
    0,
  )
  const top = style.top.repeat(Math.max(0, widthMax))
  const bottom = style.bottom.repeat(Math.max(0, widthMax))

  const wrap = (line: string) => `${style.left}${line}${style.right}`
  const sidePadded = lines.map((line) => {
    const pad = Math.max(0, widthMax - textWidth(line))
    return wrap(`${line}${' '.repeat(pad)}`)
  })

  const topLine = `${style.topLeft}${top}${style.topRight}`
  const bottomLine = `${style.bottomLeft}${bottom}${style.bottomRight}`

  const withBorder = [topLine, ...sidePadded, bottomLine]

  if (!borderColor) {
    return withBorder
  }
  const colored = applyColor(withBorder.join('\n'), borderColor, ctx)
  return colored.split('\n')
}

function applyHeight(
  lines: string[],
  height?: number,
  maxHeight?: number,
  vAlign?: VAlign,
): string[] {
  let result = [...lines]

  if (height !== undefined && height > 0) {
    const widthMax = Math.max(...result.map(textWidth), 0)
    const blank = ' '.repeat(widthMax)

    if (result.length < height) {
      const missing = height - result.length
      const topPad =
        vAlign === 'bottom'
          ? missing
          : vAlign === 'center'
            ? Math.floor(missing / 2)
            : 0
      const bottomPad = missing - topPad

      const topFill: string[] = []
      for (let i = 0; i < topPad; i++) topFill.push(blank)
      const bottomFill: string[] = []
      for (let i = 0; i < bottomPad; i++) bottomFill.push(blank)
      result = [...topFill, ...result, ...bottomFill]
    } else if (result.length > height) {
      result = result.slice(0, height)
    }
  }

  if (maxHeight !== undefined && maxHeight > 0 && result.length > maxHeight) {
    result = result.slice(0, maxHeight)
  }

  return result
}

function applyTextStyle(lines: string[], opts: StyleOptions, ctx: StyleContext): string[] {
  const fg = resolveColor(opts.foreground, ctx.env)
  const bg = resolveColor(opts.background, ctx.env)

  const styleFn = (input: string) => {
    let instance = ctx.styleFn
    if (fg) instance = applyForeground(instance, fg)
    if (bg) instance = applyBackground(instance, bg)
    if (opts.bold) instance = instance.bold
    if (opts.italic) instance = instance.italic
    if (opts.underline) instance = instance.underline
    if (opts.strikethrough) instance = instance.strikethrough
    return instance(input)
  }

  return lines.map(styleFn)
}

/**
 * Apply foreground color, handling hex, named colors, and rgb().
 */
function applyForeground(instance: StyleFn, color: string): StyleFn {
  // Hex color
  if (color.startsWith('#')) {
    return instance.hex(color)
  }
  // RGB function format: rgb(r, g, b)
  const rgbMatch = color.match(
    /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
  )
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] ?? '0', 10)
    const g = parseInt(rgbMatch[2] ?? '0', 10)
    const b = parseInt(rgbMatch[3] ?? '0', 10)
    return instance.rgb(r, g, b)
  }
  // Named color - check if it's a valid style property
  const namedColor = color.toLowerCase() as keyof StyleFn
  const prop = instance[namedColor]
  if (typeof prop === 'function' || (typeof prop === 'object' && prop !== null)) {
    return prop as StyleFn
  }
  // Fallback: try hex anyway
  return instance.hex(color)
}

/**
 * Apply background color, handling hex, named colors, and rgb().
 */
function applyBackground(instance: StyleFn, color: string): StyleFn {
  // Hex color
  if (color.startsWith('#')) {
    return instance.bgHex(color)
  }
  // RGB function format: rgb(r, g, b)
  const rgbMatch = color.match(
    /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
  )
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] ?? '0', 10)
    const g = parseInt(rgbMatch[2] ?? '0', 10)
    const b = parseInt(rgbMatch[3] ?? '0', 10)
    return instance.bgRgb(r, g, b)
  }
  // Named color - check if style has a bg version
  const bgColor =
    `bg${color.charAt(0).toUpperCase()}${color.slice(1).toLowerCase()}` as keyof StyleFn
  const prop = instance[bgColor]
  if (typeof prop === 'function' || (typeof prop === 'object' && prop !== null)) {
    return prop as StyleFn
  }
  // Fallback: try bgHex anyway
  return instance.bgHex(color)
}

function applyColor(text: string, color: ColorInput, ctx: StyleContext): string {
  const resolved = resolveColor(color, ctx.env)
  if (!resolved) return text

  return text
    .split('\n')
    .map((line) => {
      let instance = ctx.styleFn
      instance = applyForeground(instance, resolved)
      return instance(line)
    })
    .join('\n')
}

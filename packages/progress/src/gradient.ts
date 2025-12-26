interface RGB {
  r: number
  g: number
  b: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function hexToRgb(hex: string): RGB | null {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex
  if (normalized.length !== 6) return null
  const int = Number.parseInt(normalized, 16)
  if (Number.isNaN(int)) return null
  return {
    r: (int >> 16) & 0xff,
    g: (int >> 8) & 0xff,
    b: int & 0xff,
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * @internal
 * Linearly interpolate between two hex colors in RGB space.
 * Returns the first color if parsing fails.
 */
export function interpolateColor(
  colorA: string,
  colorB: string,
  t: number,
): string {
  const a = hexToRgb(colorA)
  const b = hexToRgb(colorB)
  if (!a || !b) return colorA

  const tClamped = clamp01(t)
  const mix = (start: number, end: number) =>
    Math.round(start + (end - start) * tClamped)

  return rgbToHex({
    r: mix(a.r, b.r),
    g: mix(a.g, b.g),
    b: mix(a.b, b.b),
  })
}

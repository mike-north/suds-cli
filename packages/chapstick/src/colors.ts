import type {
  ColorSupport,
  EnvironmentAdapter,
  TerminalBackground,
} from '@suds-cli/machine'
import type { ColorInput } from './types.js'

// Re-export types from machine for convenience
export type { ColorSupport, TerminalBackground }

/**
 * Detect terminal color support levels using an environment adapter.
 * @param env - Environment adapter to query color support
 * @returns Color support information
 * @public
 */
export function getColorSupport(env: EnvironmentAdapter): ColorSupport {
  return env.getColorSupport()
}

/**
 * Detect whether the terminal is using a dark or light background.
 * @param env - Environment adapter to query terminal background
 * @returns Terminal background mode
 * @public
 */
export function getTerminalBackground(env: EnvironmentAdapter): TerminalBackground {
  return env.getTerminalBackground()
}

/**
 * Check if the terminal appears to be using a dark background.
 * Returns true if dark or unknown (dark is a safer default for contrast).
 * @param env - Environment adapter to query terminal background
 * @returns True if the terminal is likely using a dark background
 */
function isDarkTerminal(env: EnvironmentAdapter): boolean {
  const bg = getTerminalBackground(env)
  // Default to dark when unknown - it's more common and safer for contrast
  return bg !== 'light'
}

/**
 * Resolve a color input (string or adaptive light/dark) to a hex string when available.
 * @param input - Color input to resolve
 * @param env - Environment adapter for detecting terminal background
 * @returns Resolved color string or undefined
 * @public
 */
export function resolveColor(
  input: ColorInput | undefined,
  env: EnvironmentAdapter,
): string | undefined {
  if (!input) {
    return undefined
  }
  if (typeof input === 'string') {
    return input
  }
  const preferDark = isDarkTerminal(env)
  return preferDark ? (input.dark ?? input.light) : (input.light ?? input.dark)
}

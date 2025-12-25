/**
 * Browser style utilities for suds-cli demos.
 * Provides a StyleContext with full color support for xterm.js.
 */

import { createAlwaysEnabledStyle } from '@suds-cli/machine'
import { Style, setDefaultContext, type StyleContext } from '@suds-cli/chapstick'
import type { EnvironmentAdapter, ColorSupport } from '@suds-cli/machine'

// Browser environment adapter with full color support
const browserEnv: EnvironmentAdapter = {
  get: () => undefined,
  getColorSupport: (): ColorSupport => ({
    level: 3,
    hasBasic: true,
    has256: true,
    has16m: true,
  }),
  getTerminalBackground: () => 'dark' as const,
}

// Style context for browser with full color support
export const browserStyleContext: StyleContext = {
  env: browserEnv,
  styleFn: createAlwaysEnabledStyle(),
}

// Set the global default context so all Style instances (including those
// created internally by components) will use browser colors
setDefaultContext(browserStyleContext)

/**
 * Create a new Style with browser color support.
 */
export function createStyle(): Style {
  return new Style({}, undefined, browserStyleContext)
}

/**
 * Wrap an existing style with browser color context.
 */
export function withBrowserContext(style: Style): Style {
  return style.withContext(browserStyleContext)
}

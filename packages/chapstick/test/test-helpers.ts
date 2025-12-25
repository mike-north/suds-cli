import type { ColorSupport, EnvironmentAdapter, StyleFn, TerminalBackground } from '@suds-cli/machine'
import { createStyle } from '@suds-cli/machine'
import { StyleContext } from '../src/style.js'

/**
 * Create a mock EnvironmentAdapter for testing.
 */
export function createMockEnv(options: {
  colorSupport?: ColorSupport
  terminalBackground?: TerminalBackground
  env?: Record<string, string>
} = {}): EnvironmentAdapter {
  const colorSupport = options.colorSupport ?? {
    level: 3,
    hasBasic: true,
    has256: true,
    has16m: true,
  }
  const terminalBackground = options.terminalBackground ?? 'dark'

  return {
    get: (name: string) => options.env?.[name],
    getColorSupport: () => colorSupport,
    getTerminalBackground: () => terminalBackground,
  }
}

/**
 * Create a mock StyleFn that applies no styling (passthrough).
 */
export function createNoopStyleFn(): StyleFn {
  return createStyle({ level: 0, hasBasic: false, has256: false, has16m: false })
}

/**
 * Create a full StyleContext for testing with styling disabled.
 * This makes output predictable for testing layout without ANSI codes.
 */
export function createTestContext(): StyleContext {
  return {
    env: createMockEnv(),
    styleFn: createNoopStyleFn(),
  }
}

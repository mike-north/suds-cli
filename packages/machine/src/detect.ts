/**
 * Platform detection utilities.
 * @packageDocumentation
 */

/**
 * Checks if the current environment is Node.js.
 *
 * @remarks
 * Uses a runtime check that works without requiring `@types/node`.
 *
 * @returns `true` if running in Node.js, `false` otherwise
 * @public
 */
export function isNodeEnvironment(): boolean {
  const g = globalThis as Record<string, unknown>
  const proc = g['process'] as Record<string, unknown> | undefined
  return (
    !!proc &&
    typeof (proc['versions'] as Record<string, unknown> | undefined)?.[
      'node'
    ] === 'string'
  )
}

/**
 * Checks if the current environment is a browser.
 *
 * @remarks
 * Uses a runtime check for the presence of `window` and `document` objects.
 *
 * @returns `true` if running in a browser, `false` otherwise
 * @public
 */
export function isBrowserEnvironment(): boolean {
  const g = globalThis as Record<string, unknown>
  return (
    typeof g['window'] !== 'undefined' &&
    typeof g['document'] !== 'undefined' &&
    !isNodeEnvironment()
  )
}

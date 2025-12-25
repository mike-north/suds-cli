import { describe, expect, test } from 'vitest'
import {
  getColorSupport,
  resolveColor,
  getTerminalBackground,
} from '../src/colors.js'
import type { ColorSupport, EnvironmentAdapter, TerminalBackground } from '@suds-cli/machine'

// Mock environment adapter for testing
function createMockEnv(options: {
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

describe('colors', () => {
  describe('resolveColor', () => {
    const mockEnv = createMockEnv({ terminalBackground: 'dark' })

    test('returns undefined when no input', () => {
      expect(resolveColor(undefined, mockEnv)).toBeUndefined()
    })

    test('passes through string colors', () => {
      expect(resolveColor('red', mockEnv)).toBe('red')
      expect(resolveColor('#ff0000', mockEnv)).toBe('#ff0000')
      expect(resolveColor('rgb(255, 0, 0)', mockEnv)).toBe('rgb(255, 0, 0)')
    })

    test('handles adaptive colors with both light and dark', () => {
      const color = { light: '#ffffff', dark: '#000000' }
      const darkEnv = createMockEnv({ terminalBackground: 'dark' })
      const lightEnv = createMockEnv({ terminalBackground: 'light' })

      expect(resolveColor(color, darkEnv)).toBe('#000000')
      expect(resolveColor(color, lightEnv)).toBe('#ffffff')
    })

    test('falls back to available color when one is missing', () => {
      const darkEnv = createMockEnv({ terminalBackground: 'dark' })
      expect(resolveColor({ dark: '#000000' }, darkEnv)).toBe('#000000')
      expect(resolveColor({ light: '#ffffff' }, darkEnv)).toBe('#ffffff') // falls back
    })
  })

  describe('getColorSupport', () => {
    test('exposes capability fields', () => {
      const env = createMockEnv()
      const support = getColorSupport(env)
      expect(support).toHaveProperty('level')
      expect(support).toHaveProperty('hasBasic')
      expect(support).toHaveProperty('has256')
      expect(support).toHaveProperty('has16m')
      expect(typeof support.level).toBe('number')
      expect(typeof support.hasBasic).toBe('boolean')
      expect(typeof support.has256).toBe('boolean')
      expect(typeof support.has16m).toBe('boolean')
    })

    test('level determines capability flags', () => {
      const env = createMockEnv()
      const support = getColorSupport(env)
      if (support.level >= 1) {
        expect(support.hasBasic).toBe(true)
      }
      if (support.level >= 2) {
        expect(support.has256).toBe(true)
      }
      if (support.level >= 3) {
        expect(support.has16m).toBe(true)
      }
    })
  })

  describe('getTerminalBackground', () => {
    test('detects dark terminal', () => {
      const env = createMockEnv({ terminalBackground: 'dark' })
      expect(getTerminalBackground(env)).toBe('dark')
    })

    test('detects light terminal', () => {
      const env = createMockEnv({ terminalBackground: 'light' })
      expect(getTerminalBackground(env)).toBe('light')
    })

    test('returns unknown when not determinable', () => {
      const env = createMockEnv({ terminalBackground: 'unknown' })
      expect(getTerminalBackground(env)).toBe('unknown')
    })
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import {
  detectColorSupport,
  detectTerminalBackground,
  createAutoEnvironmentAdapter,
} from '../src/detect.js'

describe('detectColorSupport', () => {
  const originalProcess = globalThis.process

  afterEach(() => {
    // Restore original process
    ;(globalThis as Record<string, unknown>)['process'] = originalProcess
  })

  it('should return no colors when NO_COLOR is set', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { NO_COLOR: '1' },
      stdout: { isTTY: true },
    }

    const result = detectColorSupport()
    expect(result.level).toBe(0)
    expect(result.hasBasic).toBe(false)
    expect(result.has256).toBe(false)
    expect(result.has16m).toBe(false)
  })

  it('should respect FORCE_COLOR level', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { FORCE_COLOR: '3' },
      stdout: { isTTY: false },
    }

    const result = detectColorSupport()
    expect(result.level).toBe(3)
    expect(result.hasBasic).toBe(true)
    expect(result.has256).toBe(true)
    expect(result.has16m).toBe(true)
  })

  it('should detect truecolor from COLORTERM', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { COLORTERM: 'truecolor' },
      stdout: { isTTY: true },
    }

    const result = detectColorSupport()
    expect(result.level).toBe(3)
    expect(result.has16m).toBe(true)
  })

  it('should detect 256 colors from TERM', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { TERM: 'xterm-256color' },
      stdout: { isTTY: true },
    }

    const result = detectColorSupport()
    expect(result.level).toBe(2)
    expect(result.has256).toBe(true)
    expect(result.has16m).toBe(false)
  })

  it('should detect basic colors from xterm', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { TERM: 'xterm' },
      stdout: { isTTY: true },
    }

    const result = detectColorSupport()
    expect(result.level).toBe(1)
    expect(result.hasBasic).toBe(true)
  })

  it('should return no colors when process.env is unavailable', () => {
    ;(globalThis as Record<string, unknown>)['process'] = undefined

    const result = detectColorSupport()
    expect(result.level).toBe(0)
    expect(result.hasBasic).toBe(false)
  })
})

describe('detectTerminalBackground', () => {
  const originalProcess = globalThis.process

  afterEach(() => {
    ;(globalThis as Record<string, unknown>)['process'] = originalProcess
  })

  it('should detect dark from COLORFGBG', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { COLORFGBG: '15;0' },
    }

    const result = detectTerminalBackground()
    expect(result).toBe('dark')
  })

  it('should detect light from COLORFGBG', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { COLORFGBG: '0;15' },
    }

    const result = detectTerminalBackground()
    expect(result).toBe('light')
  })

  it('should detect from TERM_BACKGROUND', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { TERM_BACKGROUND: 'light' },
    }

    const result = detectTerminalBackground()
    expect(result).toBe('light')
  })

  it('should default to dark when no indicators present', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: {},
    }

    const result = detectTerminalBackground()
    expect(result).toBe('dark')
  })

  it('should return unknown when process.env is unavailable', () => {
    ;(globalThis as Record<string, unknown>)['process'] = undefined

    const result = detectTerminalBackground()
    expect(result).toBe('unknown')
  })
})

describe('createAutoEnvironmentAdapter', () => {
  const originalProcess = globalThis.process

  afterEach(() => {
    ;(globalThis as Record<string, unknown>)['process'] = originalProcess
  })

  it('should create an adapter that gets env variables', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { TEST_VAR: 'test_value' },
    }

    const adapter = createAutoEnvironmentAdapter()
    expect(adapter.get('TEST_VAR')).toBe('test_value')
  })

  it('should return undefined for missing env variables', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: {},
    }

    const adapter = createAutoEnvironmentAdapter()
    expect(adapter.get('NONEXISTENT')).toBeUndefined()
  })

  it('should provide color support', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { COLORTERM: 'truecolor' },
      stdout: { isTTY: true },
    }

    const adapter = createAutoEnvironmentAdapter()
    const colorSupport = adapter.getColorSupport()
    expect(colorSupport.has16m).toBe(true)
  })

  it('should provide terminal background', () => {
    ;(globalThis as Record<string, unknown>)['process'] = {
      env: { TERM_BACKGROUND: 'light' },
    }

    const adapter = createAutoEnvironmentAdapter()
    expect(adapter.getTerminalBackground()).toBe('light')
  })
})

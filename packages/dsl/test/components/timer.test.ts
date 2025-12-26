import { describe, expect, it } from 'vitest'
import { timer } from '../../src/components/timer.js'

describe('timer component builder', () => {
  it('should create a component builder with required timeout', () => {
    const builder = timer({ timeout: 5000 })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options (auto-start enabled)', () => {
    const builder = timer({ timeout: 10000 })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.timeout).toBe(10000)
    expect(model.interval).toBe(1000) // default interval
    expect(cmd).not.toBeNull() // auto-start command should be present
  })

  it('should initialize with autoStart: true explicitly', () => {
    const builder = timer({ timeout: 5000, autoStart: true })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.timeout).toBe(5000)
    expect(cmd).not.toBeNull() // start command should be present
  })

  it('should initialize with autoStart: false', () => {
    const builder = timer({ timeout: 5000, autoStart: false })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.timeout).toBe(5000)
    expect(cmd).toBeNull() // no start command when autoStart is false
  })

  it('should use custom interval when provided', () => {
    const builder = timer({ timeout: 10000, interval: 500 })

    const [model] = builder.init()

    expect(model.interval).toBe(500)
  })

  it('should use default interval of 1000ms when not provided', () => {
    const builder = timer({ timeout: 5000 })

    const [model] = builder.init()

    expect(model.interval).toBe(1000)
  })

  it('should handle timeout of 0', () => {
    const builder = timer({ timeout: 0 })

    const [model] = builder.init()

    expect(model.timeout).toBe(0)
    expect(model.timedOut()).toBe(true)
  })

  it('should handle very large timeout', () => {
    const largeTimeout = Number.MAX_SAFE_INTEGER
    const builder = timer({ timeout: largeTimeout })

    const [model] = builder.init()

    expect(model.timeout).toBe(largeTimeout)
    expect(model.timedOut()).toBe(false)
  })

  it('should handle interval greater than timeout', () => {
    const builder = timer({ timeout: 100, interval: 1000 })

    const [model] = builder.init()

    expect(model.timeout).toBe(100)
    expect(model.interval).toBe(1000)
    // Timer logic should handle this edge case correctly
  })

  it('should format duration correctly in view (seconds only)', () => {
    const builder = timer({ timeout: 5000 }) // 5 seconds

    const [model] = builder.init()
    const view = builder.view(model)

    expect(view).toBe('5s')
  })

  it('should format duration correctly in view (minutes and seconds)', () => {
    const builder = timer({ timeout: 65000 }) // 1m5s

    const [model] = builder.init()
    const view = builder.view(model)

    expect(view).toBe('1m5s')
  })

  it('should format duration correctly in view (hours, minutes, seconds)', () => {
    const builder = timer({ timeout: 3665000 }) // 1h1m5s

    const [model] = builder.init()
    const view = builder.view(model)

    expect(view).toBe('1h1m5s')
  })

  it('should handle update messages by delegating to model', () => {
    const builder = timer({ timeout: 5000 })

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should render 0s when timer has expired', () => {
    const builder = timer({ timeout: 0 })

    const [model] = builder.init()
    const view = builder.view(model)

    expect(view).toBe('0s')
  })

  // Negative tests
  it('should handle negative timeout (edge case)', () => {
    const builder = timer({ timeout: -5000 })

    const [model] = builder.init()

    expect(model.timeout).toBe(-5000)
    // Negative timeout should be treated as timed out
    expect(model.timedOut()).toBe(true)
  })

  it('should handle very small interval', () => {
    const builder = timer({ timeout: 1000, interval: 1 })

    const [model] = builder.init()

    expect(model.interval).toBe(1)
  })

  it('should handle interval of 0', () => {
    const builder = timer({ timeout: 5000, interval: 0 })

    const [model] = builder.init()

    expect(model.interval).toBe(0)
  })

  it('should create unique model instances on each init', () => {
    const builder = timer({ timeout: 5000 })

    const [model1] = builder.init()
    const [model2] = builder.init()

    // Each model should have a unique ID
    expect(model1.id()).not.toBe(model2.id())
  })
})

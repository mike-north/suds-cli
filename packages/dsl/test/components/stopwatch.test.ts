import { describe, expect, it } from 'vitest'
import { stopwatch } from '../../src/components/stopwatch.js'

describe('stopwatch component builder', () => {
  it('should create a component builder with default options', () => {
    const builder = stopwatch()

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options (auto-start disabled)', () => {
    const builder = stopwatch()

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.interval).toBe(1000) // default interval
    expect(model.elapsed()).toBe(0) // starts at 0
    expect(model.running()).toBe(false) // not running by default
    expect(cmd).toBeNull() // no command when autoStart is false (default)
  })

  it('should initialize with autoStart: false explicitly', () => {
    const builder = stopwatch({ autoStart: false })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.running()).toBe(false)
    expect(cmd).toBeNull() // no start command
  })

  it('should initialize with autoStart: true', () => {
    const builder = stopwatch({ autoStart: true })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.running()).toBe(false) // model.init() doesn't set running state, only returns start command
    expect(cmd).not.toBeNull() // start command should be present
  })

  it('should use custom interval when provided', () => {
    const builder = stopwatch({ interval: 500 })

    const [model] = builder.init()

    expect(model.interval).toBe(500)
  })

  it('should use default interval of 1000ms when not provided', () => {
    const builder = stopwatch()

    const [model] = builder.init()

    expect(model.interval).toBe(1000)
  })

  it('should initialize with interval and autoStart options', () => {
    const builder = stopwatch({ interval: 250, autoStart: true })

    const [model, cmd] = builder.init()

    expect(model.interval).toBe(250)
    expect(cmd).not.toBeNull() // auto-start command
  })

  it('should handle interval of 0', () => {
    const builder = stopwatch({ interval: 0 })

    const [model] = builder.init()

    expect(model.interval).toBe(0)
  })

  it('should handle very small interval', () => {
    const builder = stopwatch({ interval: 1 })

    const [model] = builder.init()

    expect(model.interval).toBe(1)
  })

  it('should handle very large interval', () => {
    const largeInterval = 60000 // 1 minute
    const builder = stopwatch({ interval: largeInterval })

    const [model] = builder.init()

    expect(model.interval).toBe(largeInterval)
  })

  it('should format elapsed time correctly in view (seconds only)', () => {
    const builder = stopwatch()

    const [model] = builder.init()
    const view = builder.view(model)

    // Initially 0s
    expect(view).toBe('0s')
  })

  it('should handle update messages by delegating to model', () => {
    const builder = stopwatch()

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should maintain elapsed time of 0 initially', () => {
    const builder = stopwatch()

    const [model] = builder.init()

    expect(model.elapsed()).toBe(0)
  })

  it('should not be running initially when autoStart is false', () => {
    const builder = stopwatch({ autoStart: false })

    const [model] = builder.init()

    expect(model.running()).toBe(false)
  })

  it('should create unique model instances on each init', () => {
    const builder = stopwatch()

    const [model1] = builder.init()
    const [model2] = builder.init()

    // Each model should have a unique ID
    expect(model1.id()).not.toBe(model2.id())
  })

  // Negative tests
  it('should handle negative interval (edge case)', () => {
    const builder = stopwatch({ interval: -1000 })

    const [model] = builder.init()

    expect(model.interval).toBe(-1000)
    // Implementation should handle or guard against negative intervals
  })

  it('should allow both options to be omitted', () => {
    const builder = stopwatch({})

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.interval).toBe(1000)
    expect(cmd).toBeNull()
  })

  it('should handle extremely large interval values', () => {
    const builder = stopwatch({ interval: Number.MAX_SAFE_INTEGER })

    const [model] = builder.init()

    expect(model.interval).toBe(Number.MAX_SAFE_INTEGER)
  })
})

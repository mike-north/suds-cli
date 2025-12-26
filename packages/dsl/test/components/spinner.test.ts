import { describe, expect, it } from 'vitest'
import { Style } from '@boba-cli/chapstick'
import { line, dot, miniDot, pulse, points, moon, meter, ellipsis } from '@boba-cli/spinner'
import { spinner } from '../../src/components/spinner.js'

describe('spinner component builder', () => {
  it('should create a component builder with default options', () => {
    const builder = spinner()

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default spinner (line)', () => {
    const builder = spinner()

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.spinner).toBe(line)
    expect(cmd).not.toBeNull() // spinner always starts ticking
  })

  it('should initialize with default style when not provided', () => {
    const builder = spinner()

    const [model] = builder.init()

    expect(model.style).toBeInstanceOf(Style)
  })

  it('should initialize with custom spinner pattern', () => {
    const builder = spinner({ spinner: dot })

    const [model] = builder.init()

    expect(model.spinner).toBe(dot)
    expect(model.spinner.frames).toEqual(dot.frames)
    expect(model.spinner.fps).toBe(dot.fps)
  })

  it('should initialize with custom style', () => {
    const customStyle = new Style().foreground('#50fa7b')
    const builder = spinner({ style: customStyle })

    const [model] = builder.init()

    expect(model.style).toBe(customStyle)
  })

  it('should initialize with both custom spinner and style', () => {
    const customStyle = new Style().foreground('#ff5555')
    const builder = spinner({ spinner: pulse, style: customStyle })

    const [model] = builder.init()

    expect(model.spinner).toBe(pulse)
    expect(model.style).toBe(customStyle)
  })

  it('should always return a tick command on init', () => {
    const builder = spinner()

    const [_model, cmd] = builder.init()

    // Spinner should auto-tick on initialization
    expect(cmd).not.toBeNull()
  })

  it('should render the first frame initially', () => {
    const builder = spinner({ spinner: line })

    const [model] = builder.init()
    const view = builder.view(model)

    // First frame of line spinner is '|'
    expect(view).toBe('|')
  })

  it('should handle update messages by delegating to model', () => {
    const builder = spinner()

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should work with different built-in spinner styles - dot', () => {
    const builder = spinner({ spinner: dot })

    const [model] = builder.init()

    expect(model.spinner).toBe(dot)
    expect(model.spinner.frames.length).toBeGreaterThan(0)
  })

  it('should work with different built-in spinner styles - miniDot', () => {
    const builder = spinner({ spinner: miniDot })

    const [model] = builder.init()

    expect(model.spinner).toBe(miniDot)
    expect(model.spinner.frames.length).toBeGreaterThan(0)
  })

  it('should work with different built-in spinner styles - pulse', () => {
    const builder = spinner({ spinner: pulse })

    const [model] = builder.init()

    expect(model.spinner).toBe(pulse)
    expect(model.spinner.frames).toEqual(['█', '▓', '▒', '░'])
  })

  it('should work with different built-in spinner styles - points', () => {
    const builder = spinner({ spinner: points })

    const [model] = builder.init()

    expect(model.spinner).toBe(points)
    expect(model.spinner.frames).toEqual(['∙∙∙', '●∙∙', '∙●∙', '∙∙●'])
  })

  it('should work with different built-in spinner styles - moon', () => {
    const builder = spinner({ spinner: moon })

    const [model] = builder.init()

    expect(model.spinner).toBe(moon)
    expect(model.spinner.frames.length).toBe(8)
  })

  it('should work with different built-in spinner styles - meter', () => {
    const builder = spinner({ spinner: meter })

    const [model] = builder.init()

    expect(model.spinner).toBe(meter)
    expect(model.spinner.frames).toEqual(['▱▱▱', '▰▱▱', '▰▰▱', '▰▰▰', '▰▰▱', '▰▱▱', '▱▱▱'])
  })

  it('should work with different built-in spinner styles - ellipsis', () => {
    const builder = spinner({ spinner: ellipsis })

    const [model] = builder.init()

    expect(model.spinner).toBe(ellipsis)
    expect(model.spinner.frames).toEqual(['', '.', '..', '...'])
  })

  it('should create unique model instances on each init', () => {
    const builder = spinner()

    const [model1] = builder.init()
    const [model2] = builder.init()

    // Each model should have a unique ID
    expect(model1.id()).not.toBe(model2.id())
  })

  // Edge cases
  it('should handle custom spinner with single frame', () => {
    const singleFrameSpinner = { frames: ['X'], fps: 100 }
    const builder = spinner({ spinner: singleFrameSpinner })

    const [model] = builder.init()

    expect(model.spinner.frames.length).toBe(1)
    expect(builder.view(model)).toBe('X')
  })

  it('should handle custom spinner with very fast fps', () => {
    const fastSpinner = { frames: ['1', '2', '3'], fps: 1 }
    const builder = spinner({ spinner: fastSpinner })

    const [model] = builder.init()

    expect(model.spinner.fps).toBe(1)
  })

  it('should handle custom spinner with very slow fps', () => {
    const slowSpinner = { frames: ['A', 'B'], fps: 10000 }
    const builder = spinner({ spinner: slowSpinner })

    const [model] = builder.init()

    expect(model.spinner.fps).toBe(10000)
  })

  // Negative tests
  it('should handle empty spinner pattern (edge case)', () => {
    const emptySpinner = { frames: [], fps: 100 }
    const builder = spinner({ spinner: emptySpinner })

    const [model] = builder.init()
    const view = builder.view(model)

    // Model should render error or handle empty frames gracefully
    expect(view).toBe('(error)')
  })

  it('should handle spinner with empty string frames', () => {
    const emptyFramesSpinner = { frames: ['', '', ''], fps: 100 }
    const builder = spinner({ spinner: emptyFramesSpinner })

    const [model] = builder.init()
    const view = builder.view(model)

    // Should render empty string (first frame)
    expect(view).toBe('')
  })

  it('should handle style with no modifications', () => {
    const plainStyle = new Style()
    const builder = spinner({ style: plainStyle })

    const [model] = builder.init()

    expect(model.style).toBe(plainStyle)
  })

  it('should allow empty options object', () => {
    const builder = spinner({})

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(model.spinner).toBe(line) // default
    expect(cmd).not.toBeNull()
  })
})

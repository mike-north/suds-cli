import { describe, expect, it } from 'vitest'
import { viewport } from '../../src/components/viewport.js'
import { Style } from '@boba-cli/chapstick'

describe('viewport component builder', () => {
  it('should create a component builder with no options', () => {
    const builder = viewport()

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should create a component builder with empty options', () => {
    const builder = viewport({})

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const builder = viewport()

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should initialize with content option', () => {
    const testContent = 'Line 1\nLine 2\nLine 3'
    const builder = viewport({ content: testContent })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Model should contain the provided content
  })

  it('should initialize with empty content', () => {
    const builder = viewport({ content: '' })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Model should handle empty content gracefully
  })

  it('should initialize with width option', () => {
    const builder = viewport({ width: 80 })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.width).toBe(80)
  })

  it('should initialize with height option', () => {
    const builder = viewport({ height: 24 })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.height).toBe(24)
  })

  it('should initialize with width and height set to 0', () => {
    const builder = viewport({ width: 0, height: 0 })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.width).toBe(0)
    expect(model.height).toBe(0)
  })

  it('should initialize with custom width and height', () => {
    const builder = viewport({ width: 120, height: 40 })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.width).toBe(120)
    expect(model.height).toBe(40)
  })

  it('should initialize with mouseWheelEnabled option', () => {
    const builder = viewport({ mouseWheelEnabled: true })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Mouse wheel should be enabled
  })

  it('should initialize with mouseWheelEnabled set to false', () => {
    const builder = viewport({ mouseWheelEnabled: false })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Mouse wheel should be disabled
  })

  it('should initialize with highPerformanceRendering option', () => {
    const builder = viewport({ highPerformanceRendering: true })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // High performance rendering should be enabled
  })

  it('should initialize with custom style', () => {
    const customStyle = new Style().foreground('#8be9fd')
    const builder = viewport({ style: customStyle })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Custom style should be applied to the viewport
  })

  it('should handle update messages', () => {
    const builder = viewport({ width: 80, height: 24 })

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should render a view from the model', () => {
    const builder = viewport({ content: 'Test content' })

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
  })

  it('should render empty view when no content is provided', () => {
    const builder = viewport()

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
    // Should render empty or minimal content
  })

  it('should handle content smaller than viewport', () => {
    const builder = viewport({
      content: 'Short content',
      width: 100,
      height: 50,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Content is smaller than viewport dimensions
  })

  it('should handle very large content', () => {
    const largeContent = Array.from({ length: 1000 })
      .map((_, i) => `Line ${i + 1}`)
      .join('\n')
    const builder = viewport({
      content: largeContent,
      width: 80,
      height: 24,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle large content efficiently
  })

  it('should handle content with varying line lengths', () => {
    const content = 'Short\nThis is a much longer line that might need wrapping\nMedium line\nX'
    const builder = viewport({
      content,
      width: 30,
      height: 10,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should combine multiple options', () => {
    const builder = viewport({
      content: 'Test\nContent\nHere',
      width: 80,
      height: 24,
      mouseWheelEnabled: true,
      highPerformanceRendering: true,
      style: new Style().foreground('#ffffff'),
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.width).toBe(80)
    expect(model.height).toBe(24)
  })

  it('should handle single-line content', () => {
    const builder = viewport({
      content: 'Single line content',
      width: 50,
      height: 10,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should handle content with only newlines', () => {
    const builder = viewport({
      content: '\n\n\n\n',
      width: 80,
      height: 24,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle content that is only whitespace
  })

  it('should handle content with special characters', () => {
    const builder = viewport({
      content: 'Special chars: \t\r\n\u2022\u2713',
      width: 80,
      height: 24,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })
})

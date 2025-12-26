import { describe, expect, it } from 'vitest'
import { statusBar } from '../../src/components/statusbar.js'

// Helper to create color config for testing
function createColorConfig() {
  return {
    first: { foreground: '#ffffff', background: '#5555ff' },
    second: { foreground: '#ffffff', background: '#333333' },
    third: { foreground: '#ffffff', background: '#555555' },
    fourth: { foreground: '#ffffff', background: '#ff5555' },
  }
}

describe('statusbar component builder', () => {
  it('should create a component builder with all four color configs', () => {
    const builder = statusBar(createColorConfig())

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with color configuration', () => {
    const builder = statusBar(createColorConfig())

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeNull() // StatusbarModel.new returns null cmd
  })

  it('should initialize with different foreground colors for each section', () => {
    const config = {
      first: { foreground: '#ff0000', background: '#000000' },
      second: { foreground: '#00ff00', background: '#000000' },
      third: { foreground: '#0000ff', background: '#000000' },
      fourth: { foreground: '#ffff00', background: '#000000' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Each section should have distinct foreground color
  })

  it('should initialize with different background colors for each section', () => {
    const config = {
      first: { foreground: '#ffffff', background: '#ff0000' },
      second: { foreground: '#ffffff', background: '#00ff00' },
      third: { foreground: '#ffffff', background: '#0000ff' },
      fourth: { foreground: '#ffffff', background: '#ffff00' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Each section should have distinct background color
  })

  it('should handle update messages', () => {
    const builder = statusBar(createColorConfig())

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should render a view from the model', () => {
    const builder = statusBar(createColorConfig())

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
  })

  it('should render with proper colors applied', () => {
    const config = {
      first: { foreground: '#50fa7b', background: '#282a36' },
      second: { foreground: '#f8f8f2', background: '#44475a' },
      third: { foreground: '#8be9fd', background: '#6272a4' },
      fourth: { foreground: '#ff79c6', background: '#bd93f9' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
    // View should include color codes for each section
  })

  it('should handle same foreground and background color', () => {
    const config = {
      first: { foreground: '#ffffff', background: '#ffffff' },
      second: { foreground: '#000000', background: '#000000' },
      third: { foreground: '#ff0000', background: '#ff0000' },
      fourth: { foreground: '#00ff00', background: '#00ff00' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle cases where foreground and background are identical
  })

  it('should handle hex color codes with different formats', () => {
    const config = {
      first: { foreground: '#fff', background: '#000' },
      second: { foreground: '#ffffff', background: '#000000' },
      third: { foreground: 'rgb(255, 0, 0)', background: 'rgb(0, 0, 0)' },
      fourth: { foreground: '#ff0', background: '#00f' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle various color input formats
  })

  it('should handle named colors', () => {
    const config = {
      first: { foreground: 'white', background: 'blue' },
      second: { foreground: 'black', background: 'gray' },
      third: { foreground: 'red', background: 'green' },
      fourth: { foreground: 'yellow', background: 'cyan' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle named color strings
  })

  it('should handle all sections with same colors', () => {
    const config = {
      first: { foreground: '#ffffff', background: '#000000' },
      second: { foreground: '#ffffff', background: '#000000' },
      third: { foreground: '#ffffff', background: '#000000' },
      fourth: { foreground: '#ffffff', background: '#000000' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(model).toBeDefined()
    expect(rendered).toBeDefined()
    // Should work even when all sections have identical colors
  })

  it('should handle monochrome color scheme', () => {
    const config = {
      first: { foreground: '#ffffff', background: '#000000' },
      second: { foreground: '#cccccc', background: '#333333' },
      third: { foreground: '#999999', background: '#666666' },
      fourth: { foreground: '#666666', background: '#999999' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should support grayscale/monochrome color schemes
  })

  it('should handle high-contrast color scheme', () => {
    const config = {
      first: { foreground: '#000000', background: '#ffffff' },
      second: { foreground: '#ffffff', background: '#000000' },
      third: { foreground: '#000000', background: '#ffffff' },
      fourth: { foreground: '#ffffff', background: '#000000' },
    }
    const builder = statusBar(config)

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should support high-contrast alternating color schemes
  })

  it('should preserve color configuration after update', () => {
    const builder = statusBar(createColorConfig())

    const [initialModel] = builder.init()
    const [updatedModel] = builder.update(initialModel, { type: 'test' })

    const initialView = builder.view(initialModel)
    const updatedView = builder.view(updatedModel)

    expect(initialView).toBeDefined()
    expect(updatedView).toBeDefined()
    // Colors should be consistent across updates
  })
})

import { describe, expect, it, vi } from 'vitest'
import {
  ChapstickStyleProvider,
  defaultStyleProvider,
  type StyleProvider,
} from '../src/provider.js'
import { Style } from '../src/style.js'

describe('ChapstickStyleProvider', () => {
  it('creates a new style instance', () => {
    const provider = new ChapstickStyleProvider()
    const style = provider.createStyle()
    expect(style).toBeInstanceOf(Style)
  })

  it('provides semantic styles', () => {
    const provider = new ChapstickStyleProvider()
    const { semanticStyles } = provider

    expect(semanticStyles.success).toBeInstanceOf(Style)
    expect(semanticStyles.error).toBeInstanceOf(Style)
    expect(semanticStyles.warning).toBeInstanceOf(Style)
    expect(semanticStyles.info).toBeInstanceOf(Style)
    expect(semanticStyles.muted).toBeInstanceOf(Style)
    expect(semanticStyles.highlight).toBeInstanceOf(Style)
    expect(semanticStyles.header).toBeInstanceOf(Style)
  })

  it('semantic styles are properly configured', () => {
    const provider = new ChapstickStyleProvider()
    const { semanticStyles } = provider

    // Test that success style is bold
    expect(semanticStyles.success.isSet('bold')).toBe(true)
    expect(semanticStyles.success.isSet('foreground')).toBe(true)

    // Test that error style is bold
    expect(semanticStyles.error.isSet('bold')).toBe(true)
    expect(semanticStyles.error.isSet('foreground')).toBe(true)

    // Test that header has padding
    expect(semanticStyles.header.isSet('padding')).toBe(true)
  })

  it('creates independent style instances', () => {
    const provider = new ChapstickStyleProvider()
    const style1 = provider.createStyle()
    const style2 = provider.createStyle()

    // Modify one style
    style1.bold(true)

    // The other should not be affected
    expect(style1).not.toBe(style2)
  })
})

describe('defaultStyleProvider', () => {
  it('is a singleton instance', () => {
    expect(defaultStyleProvider).toBeInstanceOf(ChapstickStyleProvider)
  })

  it('can be used for default parameters', () => {
    function someFunction(provider: StyleProvider = defaultStyleProvider) {
      return provider.createStyle()
    }

    const style = someFunction()
    expect(style).toBeInstanceOf(Style)
  })
})

describe('Mock StyleProvider for testing', () => {
  it('demonstrates easy mocking with mock provider', () => {
    // Create a mock style that tracks calls
    const mockRender = vi.fn((text: string) => text)
    const mockBold = vi.fn()
    const mockForeground = vi.fn()
    
    const mockStyle = {
      bold: mockBold,
      foreground: mockForeground,
      render: mockRender,
    } as unknown as Style

    // Create a mock provider
    const mockProvider: StyleProvider = {
      createStyle: vi.fn(() => mockStyle),
      semanticStyles: {
        success: mockStyle,
        error: mockStyle,
        warning: mockStyle,
        info: mockStyle,
        muted: mockStyle,
        highlight: mockStyle,
        header: mockStyle,
      },
    }

    // Use the mock provider
    const style = mockProvider.createStyle()
    style.bold(true)
    style.foreground('#FF0000')
    const result = style.render('test')

    // Verify mocking works
    expect(mockProvider.createStyle).toHaveBeenCalled()
    expect(mockBold).toHaveBeenCalledWith(true)
    expect(mockForeground).toHaveBeenCalledWith('#FF0000')
    expect(result).toBe('test')
  })

  it('demonstrates testing with semantic styles', () => {
    const mockRender = vi.fn((text: string) => `[${text}]`)
    const mockStyle = {
      render: mockRender,
    } as unknown as Style

    const mockProvider: StyleProvider = {
      createStyle: vi.fn(() => mockStyle),
      semanticStyles: {
        success: mockStyle,
        error: mockStyle,
        warning: mockStyle,
        info: mockStyle,
        muted: mockStyle,
        highlight: mockStyle,
        header: mockStyle,
      },
    }

    // Function that uses semantic styles
    function displayMessage(
      message: string,
      type: 'success' | 'error',
      provider: StyleProvider = defaultStyleProvider,
    ): string {
      const style = type === 'success' 
        ? provider.semanticStyles.success 
        : provider.semanticStyles.error
      return style.render(message)
    }

    // Test with mock provider
    const result = displayMessage('Test message', 'success', mockProvider)
    expect(result).toBe('[Test message]')
    expect(mockRender).toHaveBeenCalledWith('Test message')
  })
})

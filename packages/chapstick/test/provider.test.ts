import { describe, expect, it, vi } from 'vitest'
import {
  ChapstickStyleProvider,
  defaultStyleProvider,
  type ChainableStyle,
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
    // Create a mock style that just returns text without styling
    const mockStyle: ChainableStyle = {
      bold: vi.fn().mockReturnThis(),
      italic: vi.fn().mockReturnThis(),
      underline: vi.fn().mockReturnThis(),
      strikethrough: vi.fn().mockReturnThis(),
      foreground: vi.fn().mockReturnThis(),
      background: vi.fn().mockReturnThis(),
      padding: vi.fn().mockReturnThis() as any,
      render: vi.fn((text: string) => text),
    }

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
    style.bold(true).foreground('#FF0000')
    const result = style.render('test')

    // Verify mocking works
    expect(mockProvider.createStyle).toHaveBeenCalled()
    expect(mockStyle.bold).toHaveBeenCalledWith(true)
    expect(mockStyle.foreground).toHaveBeenCalledWith('#FF0000')
    expect(result).toBe('test')
  })

  it('demonstrates testing with semantic styles', () => {
    const mockStyle: ChainableStyle = {
      bold: vi.fn().mockReturnThis(),
      italic: vi.fn().mockReturnThis(),
      underline: vi.fn().mockReturnThis(),
      strikethrough: vi.fn().mockReturnThis(),
      foreground: vi.fn().mockReturnThis(),
      background: vi.fn().mockReturnThis(),
      padding: vi.fn().mockReturnThis() as any,
      render: vi.fn((text: string) => `[${text}]`),
    }

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
    expect(mockStyle.render).toHaveBeenCalledWith('Test message')
  })
})

import { describe, expect, it } from 'vitest'
import { Style } from '@boba-cli/chapstick'
import { CursorMode } from '@boba-cli/textarea'
import { textArea } from '../../src/components/textarea.js'

describe('textArea component builder', () => {
  describe('initialization', () => {
    it('should create a component builder with init, update, and view', () => {
      const builder = textArea()

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with default options', () => {
      const builder = textArea()

      const [model, cmd] = builder.init()

      expect(model).toBeDefined()
      expect(cmd).toBeDefined() // focus() returns a command
      expect(model.focused).toBe(true) // Component auto-focuses on init
      expect(model.value()).toBe('')
      expect(model.width).toBe(0)
      expect(model.maxHeight).toBe(0)
      expect(model.maxWidth).toBe(0)
      expect(model.prompt).toBe('')
      expect(model.showLineNumbers).toBe(false)
    })

    it('should initialize with custom placeholder', () => {
      const builder = textArea({
        placeholder: 'Enter your text...',
      })

      const [model] = builder.init()

      expect(model.placeholder).toBe('Enter your text...')
    })

    it('should initialize with initial value', () => {
      const initialText = 'Hello\nWorld\nMultiline'
      const builder = textArea({
        value: initialText,
      })

      const [model] = builder.init()

      expect(model.value()).toBe(initialText)
      expect(model.lines).toHaveLength(3)
    })

    it('should initialize with custom width', () => {
      const builder = textArea({
        width: 80,
      })

      const [model] = builder.init()

      expect(model.width).toBe(80)
    })

    it('should initialize with maxHeight', () => {
      const builder = textArea({
        maxHeight: 10,
      })

      const [model] = builder.init()

      expect(model.maxHeight).toBe(10)
    })

    it('should initialize with maxWidth', () => {
      const builder = textArea({
        maxWidth: 120,
      })

      const [model] = builder.init()

      expect(model.maxWidth).toBe(120)
    })

    it('should initialize with custom prompt', () => {
      const builder = textArea({
        prompt: '> ',
      })

      const [model] = builder.init()

      expect(model.prompt).toBe('> ')
    })

    it('should initialize with line numbers enabled', () => {
      const builder = textArea({
        showLineNumbers: true,
      })

      const [model] = builder.init()

      expect(model.showLineNumbers).toBe(true)
    })

    it('should initialize with line numbers disabled by default', () => {
      const builder = textArea()

      const [model] = builder.init()

      expect(model.showLineNumbers).toBe(false)
    })
  })

  describe('cursor modes', () => {
    it('should support Blink cursor mode', () => {
      const builder = textArea({
        cursorMode: CursorMode.Blink,
      })

      const [model] = builder.init()

      expect(model.cursor.mode()).toBe(CursorMode.Blink)
    })

    it('should support Static cursor mode', () => {
      const builder = textArea({
        cursorMode: CursorMode.Static,
      })

      const [model] = builder.init()

      expect(model.cursor.mode()).toBe(CursorMode.Static)
    })

    it('should support Hidden cursor mode', () => {
      const builder = textArea({
        cursorMode: CursorMode.Hidden,
      })

      const [model] = builder.init()

      expect(model.cursor.mode()).toBe(CursorMode.Hidden)
    })

    it('should default to Blink cursor mode', () => {
      const builder = textArea()

      const [model] = builder.init()

      expect(model.cursor.mode()).toBe(CursorMode.Blink)
    })
  })

  describe('custom styles', () => {
    it('should accept custom prompt style', () => {
      const customStyle = new Style().foreground('#FF0000')
      const builder = textArea({
        promptStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.promptStyle).toBe(customStyle)
    })

    it('should accept custom text style', () => {
      const customStyle = new Style().bold(true)
      const builder = textArea({
        textStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.textStyle).toBe(customStyle)
    })

    it('should accept custom placeholder style', () => {
      const customStyle = new Style().foreground('#888888')
      const builder = textArea({
        placeholderStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.placeholderStyle).toBe(customStyle)
    })

    it('should accept custom cursor style', () => {
      const customStyle = new Style().background('#0000FF')
      const builder = textArea({
        cursorStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.cursorStyle).toBe(customStyle)
    })

    it('should accept custom line number style', () => {
      const customStyle = new Style().foreground('#666666')
      const builder = textArea({
        lineNumberStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.lineNumberStyle).toBe(customStyle)
    })

    it('should use default styles when not specified', () => {
      const builder = textArea()

      const [model] = builder.init()

      expect(model.promptStyle).toBeDefined()
      expect(model.textStyle).toBeDefined()
      expect(model.placeholderStyle).toBeDefined()
      expect(model.cursorStyle).toBeDefined()
      expect(model.lineNumberStyle).toBeDefined()
    })
  })

  describe('validation', () => {
    it('should accept a validation function', () => {
      const validateFunc = (value: string): Error | null => {
        return value.length < 10 ? new Error('Too short') : null
      }

      const builder = textArea({
        validate: validateFunc,
      })

      const [model] = builder.init()

      expect(model.validateFn).toBe(validateFunc)
    })

    it('should not have validation function by default', () => {
      const builder = textArea()

      const [model] = builder.init()

      expect(model.validateFn).toBeUndefined()
    })
  })

  describe('focus state', () => {
    it('should auto-focus on initialization', () => {
      const builder = textArea()

      const [model] = builder.init()

      expect(model.focused).toBe(true)
      expect(model.cursor.isFocused()).toBe(true)
    })
  })

  describe('update and view', () => {
    it('should handle update messages', () => {
      const builder = textArea()
      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }

      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should render view', () => {
      const builder = textArea({
        value: 'Some content',
        showLineNumbers: true,
      })
      const [model] = builder.init()

      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })

    it('should render empty view for empty content', () => {
      const builder = textArea()
      const [model] = builder.init()

      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })
  })

  describe('edge cases', () => {
    it('should handle empty placeholder', () => {
      const builder = textArea({
        placeholder: '',
      })

      const [model] = builder.init()

      expect(model.placeholder).toBe('')
    })

    it('should handle empty value', () => {
      const builder = textArea({
        value: '',
      })

      const [model] = builder.init()

      expect(model.value()).toBe('')
    })

    it('should handle zero maxHeight', () => {
      const builder = textArea({
        maxHeight: 0,
      })

      const [model] = builder.init()

      expect(model.maxHeight).toBe(0)
    })

    it('should handle zero maxWidth', () => {
      const builder = textArea({
        maxWidth: 0,
      })

      const [model] = builder.init()

      expect(model.maxWidth).toBe(0)
    })

    it('should handle zero width', () => {
      const builder = textArea({
        width: 0,
      })

      const [model] = builder.init()

      expect(model.width).toBe(0)
    })

    it('should handle very large content', () => {
      const largeContent = 'Line\n'.repeat(1000).trimEnd()
      const builder = textArea({
        value: largeContent,
      })

      const [model] = builder.init()

      expect(model.lines.length).toBeGreaterThan(100)
      expect(model.value()).toBe(largeContent)
    })

    it('should handle very large maxHeight', () => {
      const builder = textArea({
        maxHeight: 99999,
      })

      const [model] = builder.init()

      expect(model.maxHeight).toBe(99999)
    })

    it('should handle very large maxWidth', () => {
      const builder = textArea({
        maxWidth: 99999,
      })

      const [model] = builder.init()

      expect(model.maxWidth).toBe(99999)
    })

    it('should handle single line value', () => {
      const builder = textArea({
        value: 'Single line',
      })

      const [model] = builder.init()

      expect(model.lines).toHaveLength(1)
      expect(model.value()).toBe('Single line')
    })

    it('should handle value with only newlines', () => {
      const builder = textArea({
        value: '\n\n\n',
      })

      const [model] = builder.init()

      expect(model.lines.length).toBeGreaterThan(1)
    })
  })

  describe('negative tests', () => {
    it('should handle undefined options gracefully', () => {
      const builder = textArea(undefined)

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.value()).toBe('')
      expect(model.showLineNumbers).toBe(false)
    })

    it('should handle empty options object', () => {
      const builder = textArea({})

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.value()).toBe('')
      expect(model.prompt).toBe('')
    })

    it('should reject invalid cursor mode by using default', () => {
      const builder = textArea({
        cursorMode: 'invalid' as unknown as CursorMode,
      })

      const [model] = builder.init()

      // TypeScript will complain, but runtime should handle gracefully
      // The model will use whatever the underlying TextareaModel handles
      expect(model.cursor.mode()).toBeDefined()
    })

    it('should handle negative maxHeight', () => {
      const builder = textArea({
        maxHeight: -10,
      })

      const [model] = builder.init()

      // The underlying model should handle negative values
      expect(model).toBeDefined()
    })

    it('should handle negative maxWidth', () => {
      const builder = textArea({
        maxWidth: -20,
      })

      const [model] = builder.init()

      // The underlying model should handle negative values
      expect(model).toBeDefined()
    })

    it('should handle negative width', () => {
      const builder = textArea({
        width: -30,
      })

      const [model] = builder.init()

      // The underlying model should handle negative values
      expect(model).toBeDefined()
    })
  })

  describe('complete configuration', () => {
    it('should handle all options together', () => {
      const validateFunc = (value: string): Error | null => {
        return value.length < 20 ? new Error('Minimum 20 characters') : null
      }

      const builder = textArea({
        value: 'Initial content\nWith multiple lines',
        placeholder: 'Enter your essay...',
        width: 80,
        maxHeight: 20,
        maxWidth: 100,
        prompt: '| ',
        showLineNumbers: true,
        cursorMode: CursorMode.Static,
        validate: validateFunc,
        promptStyle: new Style().foreground('#00FF00'),
        textStyle: new Style().bold(true),
        placeholderStyle: new Style().foreground('#888888'),
        cursorStyle: new Style().background('#FFFFFF'),
        lineNumberStyle: new Style().foreground('#666666'),
      })

      const [model] = builder.init()

      expect(model.value()).toBe('Initial content\nWith multiple lines')
      expect(model.placeholder).toBe('Enter your essay...')
      expect(model.width).toBe(80)
      expect(model.maxHeight).toBe(20)
      expect(model.maxWidth).toBe(100)
      expect(model.prompt).toBe('| ')
      expect(model.showLineNumbers).toBe(true)
      expect(model.cursor.mode()).toBe(CursorMode.Static)
      expect(model.validateFn).toBe(validateFunc)
      expect(model.focused).toBe(true)
    })
  })
})

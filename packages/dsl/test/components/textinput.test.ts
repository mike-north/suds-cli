import { describe, expect, it } from 'vitest'
import { Style } from '@boba-cli/chapstick'
import { EchoMode, CursorMode } from '@boba-cli/textinput'
import { textInput } from '../../src/components/textinput.js'

describe('textInput component builder', () => {
  describe('initialization', () => {
    it('should create a component builder with init, update, and view', () => {
      const builder = textInput()

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with default options', () => {
      const builder = textInput()

      const [model, cmd] = builder.init()

      expect(model).toBeDefined()
      expect(cmd).toBeDefined() // focus() returns a command
      expect(model.focused).toBe(true) // Component auto-focuses on init
      expect(model.value).toBe('')
      expect(model.placeholder).toBe('')
      expect(model.echoMode).toBe(EchoMode.Normal)
      expect(model.charLimit).toBe(0)
      expect(model.width).toBe(0)
      expect(model.prompt).toBe('')
    })

    it('should initialize with custom placeholder', () => {
      const builder = textInput({
        placeholder: 'Enter your name...',
      })

      const [model] = builder.init()

      expect(model.placeholder).toBe('Enter your name...')
    })

    it('should initialize with custom width', () => {
      const builder = textInput({
        width: 40,
      })

      const [model] = builder.init()

      expect(model.width).toBe(40)
    })

    it('should initialize with custom prompt', () => {
      const builder = textInput({
        prompt: '> ',
      })

      const [model] = builder.init()

      expect(model.prompt).toBe('> ')
    })

    it('should initialize with character limit', () => {
      const builder = textInput({
        charLimit: 50,
      })

      const [model] = builder.init()

      expect(model.charLimit).toBe(50)
    })
  })

  describe('echo modes', () => {
    it('should support Normal echo mode', () => {
      const builder = textInput({
        echoMode: EchoMode.Normal,
      })

      const [model] = builder.init()

      expect(model.echoMode).toBe(EchoMode.Normal)
    })

    it('should support Password echo mode', () => {
      const builder = textInput({
        echoMode: EchoMode.Password,
      })

      const [model] = builder.init()

      expect(model.echoMode).toBe(EchoMode.Password)
    })

    it('should support None echo mode', () => {
      const builder = textInput({
        echoMode: EchoMode.None,
      })

      const [model] = builder.init()

      expect(model.echoMode).toBe(EchoMode.None)
    })

    it('should default to Normal echo mode', () => {
      const builder = textInput()

      const [model] = builder.init()

      expect(model.echoMode).toBe(EchoMode.Normal)
    })
  })

  describe('custom styles', () => {
    it('should accept custom prompt style', () => {
      const customStyle = new Style().foreground('#FF0000')
      const builder = textInput({
        promptStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.promptStyle).toBe(customStyle)
    })

    it('should accept custom text style', () => {
      const customStyle = new Style().bold(true)
      const builder = textInput({
        textStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.textStyle).toBe(customStyle)
    })

    it('should accept custom placeholder style', () => {
      const customStyle = new Style().foreground('#888888')
      const builder = textInput({
        placeholderStyle: customStyle,
      })

      const [model] = builder.init()

      expect(model.placeholderStyle).toBe(customStyle)
    })

    it('should use default styles when not specified', () => {
      const builder = textInput()

      const [model] = builder.init()

      expect(model.promptStyle).toBeDefined()
      expect(model.textStyle).toBeDefined()
      expect(model.placeholderStyle).toBeDefined()
    })
  })

  describe('validation', () => {
    it('should accept a validation function', () => {
      const validateFunc = (value: string): Error | null => {
        return value.length < 3 ? new Error('Too short') : null
      }

      const builder = textInput({
        validate: validateFunc,
      })

      const [model] = builder.init()

      expect(model.validateFn).toBe(validateFunc)
    })

    it('should not have validation function by default', () => {
      const builder = textInput()

      const [model] = builder.init()

      expect(model.validateFn).toBeUndefined()
    })
  })

  describe('update and view', () => {
    it('should handle update messages', () => {
      const builder = textInput()
      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }

      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should render view', () => {
      const builder = textInput({
        placeholder: 'Type here...',
      })
      const [model] = builder.init()

      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })
  })

  describe('edge cases', () => {
    it('should handle empty placeholder', () => {
      const builder = textInput({
        placeholder: '',
      })

      const [model] = builder.init()

      expect(model.placeholder).toBe('')
    })

    it('should handle zero character limit', () => {
      const builder = textInput({
        charLimit: 0,
      })

      const [model] = builder.init()

      expect(model.charLimit).toBe(0)
    })

    it('should handle zero width', () => {
      const builder = textInput({
        width: 0,
      })

      const [model] = builder.init()

      expect(model.width).toBe(0)
    })

    it('should handle empty prompt', () => {
      const builder = textInput({
        prompt: '',
      })

      const [model] = builder.init()

      expect(model.prompt).toBe('')
    })

    it('should handle very large character limit', () => {
      const builder = textInput({
        charLimit: 999999,
      })

      const [model] = builder.init()

      expect(model.charLimit).toBe(999999)
    })

    it('should handle very large width', () => {
      const builder = textInput({
        width: 10000,
      })

      const [model] = builder.init()

      expect(model.width).toBe(10000)
    })
  })

  describe('negative tests', () => {
    it('should handle undefined options gracefully', () => {
      const builder = textInput(undefined)

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.placeholder).toBe('')
      expect(model.echoMode).toBe(EchoMode.Normal)
    })

    it('should handle empty options object', () => {
      const builder = textInput({})

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.placeholder).toBe('')
      expect(model.echoMode).toBe(EchoMode.Normal)
    })

    it('should reject invalid echo mode by using default', () => {
      const builder = textInput({
        echoMode: 'invalid' as unknown as EchoMode,
      })

      const [model] = builder.init()

      // TypeScript will complain, but runtime should handle gracefully
      // The model will use whatever the underlying TextInputModel handles
      expect(model.echoMode).toBeDefined()
    })

    it('should handle negative character limit', () => {
      const builder = textInput({
        charLimit: -10,
      })

      const [model] = builder.init()

      // The underlying model should handle negative values
      expect(model).toBeDefined()
    })

    it('should handle negative width', () => {
      const builder = textInput({
        width: -20,
      })

      const [model] = builder.init()

      // The underlying model should handle negative values
      expect(model).toBeDefined()
    })
  })

  describe('complete configuration', () => {
    it('should handle all options together', () => {
      const validateFunc = (value: string): Error | null => {
        return value.length < 5 ? new Error('Minimum 5 characters') : null
      }

      const builder = textInput({
        placeholder: 'Enter your email...',
        width: 50,
        echoMode: EchoMode.Normal,
        charLimit: 100,
        prompt: 'Email: ',
        promptStyle: new Style().foreground('#00FF00'),
        textStyle: new Style().bold(true),
        placeholderStyle: new Style().foreground('#888888'),
        validate: validateFunc,
      })

      const [model] = builder.init()

      expect(model.placeholder).toBe('Enter your email...')
      expect(model.width).toBe(50)
      expect(model.echoMode).toBe(EchoMode.Normal)
      expect(model.charLimit).toBe(100)
      expect(model.prompt).toBe('Email: ')
      expect(model.validateFn).toBe(validateFunc)
      expect(model.focused).toBe(true)
    })
  })
})

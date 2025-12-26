import { describe, expect, it } from 'vitest'
import { Binding } from '@boba-cli/key'
import { Style } from '@boba-cli/chapstick'
import { help } from '../../src/components/help.js'
import type { KeyMap } from '@boba-cli/help'

// Mock KeyMap implementation for testing
function createMockKeyMap(
  shortBindings: Binding[],
  fullBindingGroups: Binding[][],
): KeyMap {
  return {
    shortHelp: () => shortBindings,
    fullHelp: () => fullBindingGroups,
  }
}

// Helper to create test bindings
function createBinding(key: string, desc: string, disabled = false): Binding {
  return new Binding({
    keys: [key.toLowerCase()],
    help: { key, desc },
    disabled,
  })
}

describe('help component builder', () => {
  it('should create a component builder with required keyMap', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap })
    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeNull()
    expect(model.width).toBe(0)
    expect(model.showAll).toBe(false)
    expect(model.shortSeparator).toBe(' • ')
    expect(model.fullSeparator).toBe('    ')
    expect(model.ellipsis).toBe('…')
  })

  it('should initialize with custom width option', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, width: 80 })
    const [model] = builder.init()

    expect(model.width).toBe(80)
  })

  it('should initialize with showAll option set to true', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, showAll: true })
    const [model] = builder.init()

    expect(model.showAll).toBe(true)
  })

  it('should initialize with showAll option set to false (short help)', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, showAll: false })
    const [model] = builder.init()

    expect(model.showAll).toBe(false)
  })

  it('should initialize with custom shortSeparator', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, shortSeparator: ' | ' })
    const [model] = builder.init()

    expect(model.shortSeparator).toBe(' | ')
  })

  it('should initialize with custom fullSeparator', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, fullSeparator: '  ' })
    const [model] = builder.init()

    expect(model.fullSeparator).toBe('  ')
  })

  it('should initialize with custom ellipsis', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, ellipsis: '...' })
    const [model] = builder.init()

    expect(model.ellipsis).toBe('...')
  })

  it('should initialize with custom styles', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const customStyles = {
      shortKey: new Style().foreground('#50fa7b').bold(),
      shortDesc: new Style().foreground('#f8f8f2'),
    }

    const builder = help({ keyMap, styles: customStyles })
    const [model] = builder.init()

    expect(model.styles.shortKey).toBeDefined()
    expect(model.styles.shortDesc).toBeDefined()
  })

  it('should render short help view when showAll is false', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit'), createBinding('j', 'down')],
      [[createBinding('q', 'quit'), createBinding('j', 'down')]],
    )

    const builder = help({ keyMap, showAll: false })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(rendered).toContain('q')
    expect(rendered).toContain('quit')
  })

  it('should render full help view when showAll is true', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit'), createBinding('j', 'down')]],
    )

    const builder = help({ keyMap, showAll: true })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(rendered).toContain('q')
    expect(rendered).toContain('quit')
  })

  it('should handle update messages (view-only component returns unchanged model)', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap })
    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBe(initialModel)
    expect(cmd).toBeNull()
  })

  // Edge cases

  it('should handle empty keyMap gracefully', () => {
    const keyMap = createMockKeyMap([], [[]])

    const builder = help({ keyMap })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBe('')
  })

  it('should handle keyMap with only disabled bindings', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit', true)],
      [[createBinding('q', 'quit', true)]],
    )

    const builder = help({ keyMap, showAll: false })
    const [model] = builder.init()
    const rendered = builder.view(model)

    // Disabled bindings should not appear in help
    expect(rendered).toBe('')
  })

  it('should handle very wide width', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, width: 10000 })
    const [model] = builder.init()

    expect(model.width).toBe(10000)
  })

  it('should handle width of 0 (unlimited)', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, width: 0 })
    const [model] = builder.init()

    expect(model.width).toBe(0)
  })

  it('should render multiple bindings in short help mode', () => {
    const keyMap = createMockKeyMap(
      [
        createBinding('q', 'quit'),
        createBinding('j', 'down'),
        createBinding('k', 'up'),
      ],
      [
        [
          createBinding('q', 'quit'),
          createBinding('j', 'down'),
          createBinding('k', 'up'),
        ],
      ],
    )

    const builder = help({ keyMap, showAll: false })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('q')
    expect(rendered).toContain('quit')
    expect(rendered).toContain('j')
    expect(rendered).toContain('down')
    expect(rendered).toContain('k')
    expect(rendered).toContain('up')
  })

  it('should render multiple binding groups in full help mode', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [
        [createBinding('j', 'down'), createBinding('k', 'up')],
        [createBinding('q', 'quit'), createBinding('h', 'help')],
      ],
    )

    const builder = help({ keyMap, showAll: true })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('j')
    expect(rendered).toContain('down')
    expect(rendered).toContain('k')
    expect(rendered).toContain('up')
    expect(rendered).toContain('q')
    expect(rendered).toContain('quit')
  })

  it('should skip disabled bindings in short help', () => {
    const keyMap = createMockKeyMap(
      [
        createBinding('q', 'quit'),
        createBinding('j', 'down', true), // disabled
        createBinding('k', 'up'),
      ],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({ keyMap, showAll: false })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('q')
    expect(rendered).toContain('k')
    // Should not contain disabled binding
    expect(rendered).not.toContain('j')
  })

  it('should handle all options combined', () => {
    const keyMap = createMockKeyMap(
      [createBinding('q', 'quit')],
      [[createBinding('q', 'quit')]],
    )

    const builder = help({
      keyMap,
      width: 80,
      showAll: true,
      shortSeparator: ' | ',
      fullSeparator: '  ',
      ellipsis: '...',
      styles: {
        shortKey: new Style().bold(),
        fullKey: new Style().foreground('#ffffff'),
      },
    })

    const [model] = builder.init()

    expect(model.width).toBe(80)
    expect(model.showAll).toBe(true)
    expect(model.shortSeparator).toBe(' | ')
    expect(model.fullSeparator).toBe('  ')
    expect(model.ellipsis).toBe('...')
    expect(model.styles).toBeDefined()
  })
})

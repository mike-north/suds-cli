import { describe, expect, it } from 'vitest'
import { helpBubble, type Entry } from '../../src/components/help-bubble.js'

// Helper to create test entries
function createEntry(key: string, description: string): Entry {
  return { key, description }
}

describe('helpBubble component builder', () => {
  it('should create a component builder with required entries', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeNull()
    expect(model.entries).toEqual(entries)
    expect(model.title).toBe('Help')
    expect(model.active).toBe(false)
    expect(model.viewport.width).toBe(0)
    expect(model.viewport.height).toBe(0)
  })

  it('should initialize with custom title', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries, title: 'Keyboard Shortcuts' })
    const [model] = builder.init()

    expect(model.title).toBe('Keyboard Shortcuts')
  })

  it('should initialize with custom title color', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]
    const titleColor = {
      background: '#282a36',
      foreground: '#f8f8f2',
    }

    const builder = helpBubble({ entries, titleColor })
    const [model] = builder.init()

    expect(model.titleColor).toEqual(titleColor)
  })

  it('should initialize with default title color when not specified', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.titleColor).toBeDefined()
    expect(model.titleColor.background).toEqual({
      dark: '#5f5f87',
      light: '#d7d7ff',
    })
    expect(model.titleColor.foreground).toEqual({
      dark: '#ffffff',
      light: '#000000',
    })
  })

  it('should initialize with active state set to false by default', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.active).toBe(false)
  })

  it('should initialize with active state set to true', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries, active: true })
    const [model] = builder.init()

    expect(model.active).toBe(true)
  })

  it('should render initial view', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
  })

  it('should handle update messages when active', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries, active: true })
    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should ignore update messages when inactive', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries, active: false })
    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBe(initialModel)
    expect(cmd).toBeNull()
  })

  // Edge cases

  it('should handle empty entries array', () => {
    const entries: Entry[] = []

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries).toEqual([])
    expect(model).toBeDefined()
  })

  it('should handle single entry', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(1)
    expect(model.entries[0]).toEqual(createEntry('q', 'quit'))
  })

  it('should handle many entries', () => {
    const entries: Entry[] = [
      createEntry('q', 'quit'),
      createEntry('j', 'down'),
      createEntry('k', 'up'),
      createEntry('h', 'left'),
      createEntry('l', 'right'),
      createEntry('g', 'go to top'),
      createEntry('G', 'go to bottom'),
      createEntry('/', 'search'),
      createEntry('n', 'next match'),
      createEntry('N', 'previous match'),
      createEntry('enter', 'select'),
      createEntry('esc', 'cancel'),
      createEntry('tab', 'switch focus'),
      createEntry('shift+tab', 'reverse focus'),
      createEntry('ctrl+c', 'force quit'),
    ]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(15)
    expect(model.entries).toEqual(entries)
  })

  it('should handle entries with complex key descriptions', () => {
    const entries: Entry[] = [
      createEntry('ctrl+c', 'copy to clipboard'),
      createEntry('ctrl+v', 'paste from clipboard'),
      createEntry('shift+tab', 'reverse tab order'),
      createEntry('alt+enter', 'submit form'),
      createEntry('j/down', 'move cursor down'),
    ]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(5)
  })

  it('should handle entries with long descriptions', () => {
    const entries: Entry[] = [
      createEntry(
        'q',
        'quit the application and return to the terminal prompt',
      ),
      createEntry('?', 'show this help screen with all available commands'),
    ]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(2)
  })

  it('should handle entries with empty key', () => {
    const entries: Entry[] = [createEntry('', 'no key binding')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(1)
    expect(model.entries[0]?.key).toBe('')
  })

  it('should handle entries with empty description', () => {
    const entries: Entry[] = [createEntry('q', '')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    expect(model.entries.length).toBe(1)
    expect(model.entries[0]?.description).toBe('')
  })

  it('should render content with multiple entries', () => {
    const entries: Entry[] = [
      createEntry('q', 'quit'),
      createEntry('j', 'down'),
      createEntry('k', 'up'),
    ]

    const builder = helpBubble({ entries })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
  })

  it('should handle all options combined', () => {
    const entries: Entry[] = [
      createEntry('q', 'quit'),
      createEntry('j', 'down'),
      createEntry('k', 'up'),
    ]
    const titleColor = {
      background: { dark: '#282a36', light: '#ffffff' },
      foreground: { dark: '#f8f8f2', light: '#000000' },
    }

    const builder = helpBubble({
      entries,
      title: 'Custom Help',
      titleColor,
      active: true,
    })

    const [model] = builder.init()

    expect(model.entries).toEqual(entries)
    expect(model.title).toBe('Custom Help')
    expect(model.titleColor).toEqual(titleColor)
    expect(model.active).toBe(true)
  })

  it('should preserve model state through view rendering', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()
    const rendered1 = builder.view(model)
    const rendered2 = builder.view(model)

    expect(rendered1).toBe(rendered2)
  })

  it('should handle viewport size changes through model methods', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    // Test that model has setSize method (from HelpBubble class)
    const resizedModel = model.setSize(80, 24)
    expect(resizedModel.viewport.width).toBe(80)
    expect(resizedModel.viewport.height).toBe(24)
  })

  it('should handle active state changes through model methods', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    // Test that model has setIsActive method (from HelpBubble class)
    expect(model.active).toBe(false)
    const activeModel = model.setIsActive(true)
    expect(activeModel.active).toBe(true)
    const inactiveModel = activeModel.setIsActive(false)
    expect(inactiveModel.active).toBe(false)
  })

  it('should handle title color changes through model methods', () => {
    const entries: Entry[] = [createEntry('q', 'quit')]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    const newColor = {
      background: '#ff0000',
      foreground: '#00ff00',
    }
    const updatedModel = model.setTitleColor(newColor)
    expect(updatedModel.titleColor).toEqual(newColor)
  })

  it('should handle scrolling to top through model methods', () => {
    const entries: Entry[] = [
      createEntry('1', 'first'),
      createEntry('2', 'second'),
      createEntry('3', 'third'),
    ]

    const builder = helpBubble({ entries })
    const [model] = builder.init()

    // Test that model has gotoTop method (from HelpBubble class)
    const topModel = model.gotoTop()
    expect(topModel).toBeDefined()
  })
})

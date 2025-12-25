import { describe, expect, it } from 'vitest'
import {
  text,
  vstack,
  hstack,
  spacer,
  divider,
  when,
  choose,
  map,
  componentView,
} from '../src/view/nodes.js'
import { render } from '../src/view/renderer.js'

describe('text', () => {
  it('creates a text node', () => {
    const node = text('hello')
    expect(node._type).toBe('text')
    expect(node.content).toBe('hello')
  })

  it('defaults to no styles', () => {
    const node = text('hello')
    expect(node._bold).toBe(false)
    expect(node._dim).toBe(false)
    expect(node._italic).toBe(false)
    expect(node._foreground).toBeUndefined()
    expect(node._background).toBeUndefined()
  })

  describe('chainable style methods', () => {
    it('bold() sets bold flag', () => {
      const node = text('hello').bold()
      expect(node._bold).toBe(true)
      expect(node.content).toBe('hello')
    })

    it('dim() sets dim flag', () => {
      const node = text('hello').dim()
      expect(node._dim).toBe(true)
    })

    it('italic() sets italic flag', () => {
      const node = text('hello').italic()
      expect(node._italic).toBe(true)
    })

    it('foreground() sets foreground color', () => {
      const node = text('hello').foreground('#ff0000')
      expect(node._foreground).toBe('#ff0000')
    })

    it('background() sets background color', () => {
      const node = text('hello').background('#00ff00')
      expect(node._background).toBe('#00ff00')
    })

    it('methods can be chained', () => {
      const node = text('hello')
        .bold()
        .italic()
        .foreground('#ff0000')
        .background('#00ff00')

      expect(node._bold).toBe(true)
      expect(node._italic).toBe(true)
      expect(node._foreground).toBe('#ff0000')
      expect(node._background).toBe('#00ff00')
    })

    it('methods are immutable', () => {
      const original = text('hello')
      const bold = original.bold()

      expect(original._bold).toBe(false)
      expect(bold._bold).toBe(true)
    })
  })
})

describe('vstack', () => {
  it('creates a vertical stack layout', () => {
    const node = vstack(text('a'), text('b'))
    expect(node._type).toBe('vstack')
    expect(node.children).toHaveLength(2)
    expect(node.spacing).toBe(0)
  })

  it('accepts mixed node types', () => {
    const node = vstack('plain string', text('text node'))
    expect(node.children).toHaveLength(2)
  })

  it('accepts empty children', () => {
    const node = vstack()
    expect(node.children).toHaveLength(0)
  })
})

describe('hstack', () => {
  it('creates a horizontal stack layout', () => {
    const node = hstack(text('a'), text('b'))
    expect(node._type).toBe('hstack')
    expect(node.children).toHaveLength(2)
    expect(node.spacing).toBe(0)
  })

  it('accepts mixed node types', () => {
    const node = hstack('plain', text('styled'))
    expect(node.children).toHaveLength(2)
  })
})

describe('spacer', () => {
  it('creates empty vertical space', () => {
    const space = spacer()
    expect(space).toBe('\n')
  })

  it('accepts custom height', () => {
    const space = spacer(3)
    expect(space).toBe('\n\n\n')
  })
})

describe('divider', () => {
  it('creates a divider line', () => {
    const line = divider()
    expect(line).toBe('─'.repeat(40))
  })

  it('accepts custom character', () => {
    const line = divider('=')
    expect(line).toBe('='.repeat(40))
  })

  it('accepts custom width', () => {
    const line = divider('-', 20)
    expect(line).toBe('-'.repeat(20))
  })
})

describe('when', () => {
  it('returns node when condition is true', () => {
    const node = text('visible')
    const result = when(true, node)
    expect(result).toBe(node)
  })

  it('returns empty string when condition is false', () => {
    const result = when(false, text('hidden'))
    expect(result).toBe('')
  })
})

describe('choose', () => {
  it('returns ifTrue when condition is true', () => {
    const yes = text('yes')
    const no = text('no')
    const result = choose(true, yes, no)
    expect(result).toBe(yes)
  })

  it('returns ifFalse when condition is false', () => {
    const yes = text('yes')
    const no = text('no')
    const result = choose(false, yes, no)
    expect(result).toBe(no)
  })
})

describe('map', () => {
  it('maps items to view nodes', () => {
    const items = ['a', 'b', 'c']
    const result = map(items, (item) => text(item))

    expect(result).toHaveLength(3)
    // Check content property instead of object equality
    expect((result[0] as ReturnType<typeof text>).content).toBe('a')
    expect((result[1] as ReturnType<typeof text>).content).toBe('b')
    expect((result[2] as ReturnType<typeof text>).content).toBe('c')
  })

  it('provides index to render function', () => {
    const items = ['a', 'b']
    const result = map(items, (item, index) => text(`${index}: ${item}`))

    expect((result[0] as ReturnType<typeof text>).content).toBe('0: a')
    expect((result[1] as ReturnType<typeof text>).content).toBe('1: b')
  })

  it('returns empty array for empty input', () => {
    const result = map([], (item) => text(String(item)))
    expect(result).toHaveLength(0)
  })
})

describe('componentView', () => {
  it('creates a component view wrapper', () => {
    const view = componentView('spinner-output')
    expect(view._type).toBe('component')
    expect(view.view).toBe('spinner-output')
  })
})

describe('render', () => {
  describe('string nodes', () => {
    it('renders plain strings', () => {
      expect(render('hello')).toBe('hello')
    })

    it('renders empty strings', () => {
      expect(render('')).toBe('')
    })
  })

  describe('text nodes', () => {
    it('renders unstyled text', () => {
      const result = render(text('hello'))
      expect(result).toContain('hello')
    })

    it('renders bold text', () => {
      const node = text('bold').bold()
      expect(node._bold).toBe(true)
      const result = render(node)
      expect(result).toContain('bold')
      // Note: ANSI codes may not be present in test environment (no TTY)
    })

    it('renders dim text', () => {
      const node = text('dim').dim()
      expect(node._dim).toBe(true)
      const result = render(node)
      expect(result).toContain('dim')
    })

    it('renders italic text', () => {
      const node = text('italic').italic()
      expect(node._italic).toBe(true)
      const result = render(node)
      expect(result).toContain('italic')
    })

    it('renders text with foreground color', () => {
      const node = text('colored').foreground('#ff0000')
      expect(node._foreground).toBe('#ff0000')
      const result = render(node)
      expect(result).toContain('colored')
    })

    it('renders text with background color', () => {
      const node = text('bg').background('#00ff00')
      expect(node._background).toBe('#00ff00')
      const result = render(node)
      expect(result).toContain('bg')
    })

    it('renders text with multiple styles', () => {
      const node = text('styled').bold().italic().foreground('#ff0000')
      expect(node._bold).toBe(true)
      expect(node._italic).toBe(true)
      expect(node._foreground).toBe('#ff0000')
      const result = render(node)
      expect(result).toContain('styled')
    })
  })

  describe('layout nodes', () => {
    it('renders vstack with newline separator', () => {
      const result = render(vstack('line1', 'line2', 'line3'))
      expect(result).toBe('line1\nline2\nline3')
    })

    it('renders hstack with no separator by default', () => {
      const result = render(hstack('a', 'b', 'c'))
      expect(result).toBe('abc')
    })

    it('filters empty children in vstack', () => {
      const result = render(vstack('a', '', 'b'))
      expect(result).toBe('a\nb')
    })

    it('filters empty children in hstack', () => {
      const result = render(hstack('a', '', 'b'))
      expect(result).toBe('ab')
    })

    it('renders nested layouts', () => {
      const result = render(
        vstack(hstack('a', 'b'), hstack('c', 'd')),
      )
      expect(result).toBe('ab\ncd')
    })

    it('renders empty vstack', () => {
      const result = render(vstack())
      expect(result).toBe('')
    })

    it('renders empty hstack', () => {
      const result = render(hstack())
      expect(result).toBe('')
    })
  })

  describe('component views', () => {
    it('renders component view content', () => {
      const result = render(componentView('spinner-frame'))
      expect(result).toBe('spinner-frame')
    })
  })

  describe('mixed content', () => {
    it('renders vstack with mixed node types', () => {
      const result = render(
        vstack(
          'plain string',
          text('styled').bold(),
          componentView('component'),
        ),
      )
      expect(result).toContain('plain string')
      expect(result).toContain('styled')
      expect(result).toContain('component')
    })

    it('renders complex nested structure', () => {
      const result = render(
        vstack(
          text('Header').bold(),
          hstack(
            componentView('icon'),
            text(' Loading...'),
          ),
          text('Footer').dim(),
        ),
      )
      expect(result).toContain('Header')
      expect(result).toContain('icon')
      expect(result).toContain('Loading...')
      expect(result).toContain('Footer')
    })
  })

  describe('edge cases', () => {
    it('handles deeply nested structures', () => {
      const nested = vstack(
        vstack(
          vstack(
            text('deep'),
          ),
        ),
      )
      expect(render(nested)).toContain('deep')
    })

    it('handles conditional rendering with when', () => {
      const result = render(
        vstack(
          when(true, text('visible')),
          when(false, text('hidden')),
        ),
      )
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('handles mapped items in layouts', () => {
      const items = ['one', 'two', 'three']
      const result = render(
        vstack(...map(items, (item) => text(item))),
      )
      expect(result).toContain('one')
      expect(result).toContain('two')
      expect(result).toContain('three')
    })
  })
})

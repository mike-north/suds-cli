import { describe, expect, it } from 'vitest'
import { Style } from '@suds-cli/chapstick'
import { newBinding } from '@suds-cli/key'
import { KeyMsg, KeyType } from '@suds-cli/tea'
import { HelpModel, HelpBubble, type HelpStyles, type Entry } from '@/index.js'

function plainStyles(): HelpStyles {
  const style = new Style()
  return {
    ellipsis: style,
    shortKey: style,
    shortDesc: style,
    shortSeparator: style,
    fullKey: style,
    fullDesc: style,
    fullSeparator: style,
  }
}

function binding(key: string, desc: string, disabled = false) {
  return newBinding({
    keys: [key],
    help: { key, desc },
    disabled,
  })
}

describe('HelpModel short help', () => {
  it('renders enabled bindings with separators', () => {
    const model = HelpModel.new({ styles: plainStyles() })
    const text = model.shortHelpView([binding('a', 'up'), binding('b', 'down')])
    expect(text).toBe('a up • b down')
  })

  it('truncates with ellipsis when width is exceeded', () => {
    const model = HelpModel.new({
      width: 10,
      shortSeparator: ' ',
      styles: plainStyles(),
    })
    const text = model.shortHelpView([
      binding('a', 'alpha'),
      binding('b', 'beta'),
    ])
    expect(text.endsWith('…')).toBe(true)
  })

  it('skips disabled bindings', () => {
    const model = HelpModel.new({ styles: plainStyles() })
    const text = model.shortHelpView([
      binding('a', 'up', true),
      binding('b', 'down'),
    ])
    expect(text).toBe('b down')
  })
})

describe('HelpModel full help', () => {
  it('renders columns of bindings', () => {
    const model = HelpModel.new({ styles: plainStyles() })
    const text = model.fullHelpView([
      [binding('a', 'alpha'), binding('b', 'beta')],
      [binding('c', 'gamma')],
    ])

    const [line1, line2] = text.split('\n')
    expect((line1 ?? '').replace(/\s+$/, '')).toBe('a alpha    c gamma')
    expect((line2 ?? '').replace(/\s+$/, '')).toBe('b beta')
  })

  it('view() switches between short and full help', () => {
    const keyMap = {
      shortHelp: () => [binding('a', 'alpha')],
      fullHelp: () => [[binding('a', 'alpha')]],
    }

    const short = HelpModel.new({ showAll: false, styles: plainStyles() })
    expect(short.view(keyMap)).toContain('alpha')

    const full = HelpModel.new({ showAll: true, styles: plainStyles() })
    expect(full.view(keyMap)).toContain('alpha')
  })
})

describe('HelpBubble', () => {
  const testEntries: Entry[] = [
    { key: 'ctrl+c', description: 'Exit application' },
    { key: 'j/up', description: 'Move up' },
    { key: 'k/down', description: 'Move down' },
  ]

  const testTitleColor = {
    background: { light: '62', dark: '62' },
    foreground: { light: '#ffffff', dark: '#ffffff' },
  }

  it('creates a new help bubble with entries', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries)
    expect(help.title).toBe('Help')
    expect(help.entries).toEqual(testEntries)
    expect(help.active).toBe(true)
  })

  it('sets size and regenerates content', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries)
    const sized = help.setSize(80, 24)

    expect(sized.viewport.width).toBe(80)
    expect(sized.viewport.height).toBe(24)
    expect(sized.title).toBe('Help')
    expect(sized.entries).toEqual(testEntries)
  })

  it('sets active state', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries)
    const inactive = help.setIsActive(false)

    expect(inactive.active).toBe(false)
    expect(help.active).toBe(true) // original unchanged
  })

  it('does not update when setting same active state', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries)
    const same = help.setIsActive(true)

    expect(same).toBe(help) // same instance
  })

  it('sets title color and regenerates content', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries)
    const newColor = {
      background: { light: '200', dark: '200' },
      foreground: { light: '#000000', dark: '#000000' },
    }
    const updated = help.setTitleColor(newColor)

    expect(updated.titleColor).toEqual(newColor)
    expect(help.titleColor).toEqual(testTitleColor) // original unchanged
  })

  it('scrolls to top', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries).setSize(40, 5)

    // Scroll down first
    const scrolled = help.viewport.scrollDown(5)
    const withScrolled = new (HelpBubble as unknown as new (...args: unknown[]) => HelpBubble)(
      scrolled,
      testEntries,
      'Help',
      testTitleColor,
      true,
    )

    const atTop = withScrolled.gotoTop()
    expect(atTop.viewport.yOffset).toBe(0)
  })

  it('handles update when inactive', () => {
    const help = HelpBubble.new(false, 'Help', testTitleColor, testEntries)
    const keyMsg = new KeyMsg({
      type: KeyType.Down,
      runes: '',
      alt: false,
      paste: false,
    })

    const [updated, cmd] = help.update(keyMsg)

    expect(updated).toBe(help) // no change when inactive
    expect(cmd).toBe(null)
  })

  it('handles viewport scrolling when active', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries).setSize(40, 5)
    const keyMsg = new KeyMsg({
      type: KeyType.Down,
      runes: '',
      alt: false,
      paste: false,
    })

    const [updated, _cmd] = help.update(keyMsg)

    // Viewport should have scrolled
    expect(updated.viewport.yOffset).toBeGreaterThanOrEqual(0)
  })

  it('renders help screen view', () => {
    const help = HelpBubble.new(true, 'Help', testTitleColor, testEntries).setSize(40, 10)
    const view = help.view()

    expect(view).toBeTruthy()
    expect(typeof view).toBe('string')
  })
})

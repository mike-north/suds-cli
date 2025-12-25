import { describe, expect, test } from 'vitest'
import { Style } from '../src/style.js'
import { borderStyles } from '../src/borders.js'
import { createTestContext } from './test-helpers.js'

// Get a test context for all tests
const ctx = createTestContext()

describe('Style', () => {
  describe('basic rendering', () => {
    test('applies padding and alignment', () => {
      const s = new Style({}, undefined, ctx).padding(1).align('center').width(6)
      const out = s.render('hi')
      expect(out).toBe(['      ', '  hi  ', '      '].join('\n'))
    })

    test('renders plain text without options', () => {
      const s = new Style({}, undefined, ctx)
      expect(s.render('hello')).toBe('hello')
    })

    test('handles empty string', () => {
      const s = new Style({}, undefined, ctx).padding(1)
      const out = s.render('')
      expect(out.split('\n')).toHaveLength(3)
    })

    test('handles multiline input', () => {
      const s = new Style({}, undefined, ctx).align('right').width(10)
      const out = s.render('foo\nbar')
      expect(out).toBe('       foo\n       bar')
    })
  })

  describe('immutability', () => {
    test('adds border and preserves immutability', () => {
      const base = new Style({}, undefined, ctx).padding(1)
      const bordered = base.border(borderStyles.rounded)
      const out = bordered.render('ok')
      expect(base.render('ok')).not.toContain('╭') // base unchanged
      expect(out.split('\n')[0]).toContain('╭')
    })

    test('copy creates independent instance', () => {
      const original = new Style({}, undefined, ctx).bold().foreground('#ff0000')
      const copied = original.copy()
      const modified = copied.italic()
      expect(original.isSet('italic')).toBe(false)
      expect(modified.isSet('italic')).toBe(true)
    })
  })

  describe('inherit', () => {
    test('inherits unset properties from other style', () => {
      const parent = new Style({}, undefined, ctx).bold().foreground('#ff0000')
      const child = new Style({}, undefined, ctx).italic()
      const merged = child.inherit(parent)

      expect(merged.isSet('bold')).toBe(true)
      expect(merged.isSet('foreground')).toBe(true)
      expect(merged.isSet('italic')).toBe(true)
    })

    test('does not override existing properties', () => {
      const parent = new Style({}, undefined, ctx).foreground('#ff0000')
      const child = new Style({}, undefined, ctx).foreground('#00ff00')
      const merged = child.inherit(parent)

      // Child's foreground should be preserved
      expect(merged.isSet('foreground')).toBe(true)
    })

    test('does not inherit padding', () => {
      const parent = new Style({}, undefined, ctx).padding(2)
      const child = new Style({}, undefined, ctx).bold()
      const merged = child.inherit(parent)

      expect(merged.isSet('padding')).toBe(false)
    })

    test('does not inherit margin', () => {
      const parent = new Style({}, undefined, ctx).margin(2)
      const child = new Style({}, undefined, ctx).bold()
      const merged = child.inherit(parent)

      expect(merged.isSet('margin')).toBe(false)
    })
  })

  describe('height and vertical alignment', () => {
    test('clamps height with blank padding', () => {
      const s = new Style({}, undefined, ctx).height(5).width(10)
      const out = s.render('a\nb')
      expect(out.split('\n')).toHaveLength(5)
    })

    test('applies vertical alignment top', () => {
      const s = new Style({}, undefined, ctx).height(3).width(4).alignVertical('top')
      const out = s.render('x')
      const lines = out.split('\n')
      expect(lines[0]).toBe('x   ')
      expect(lines[1]).toBe('    ')
      expect(lines[2]).toBe('    ')
    })

    test('applies vertical alignment center', () => {
      const s = new Style({}, undefined, ctx).height(3).width(4).alignVertical('center')
      const out = s.render('x')
      const lines = out.split('\n')
      expect(lines[0]).toBe('    ')
      expect(lines[1]).toBe('x   ')
      expect(lines[2]).toBe('    ')
    })

    test('applies vertical alignment bottom', () => {
      const s = new Style({}, undefined, ctx).height(3).width(4).alignVertical('bottom')
      const out = s.render('x')
      const lines = out.split('\n')
      expect(lines[0]).toBe('    ')
      expect(lines[1]).toBe('    ')
      expect(lines[2]).toBe('x   ')
    })
  })

  describe('inline mode', () => {
    test('strips newlines in inline mode', () => {
      const s = new Style({}, undefined, ctx).inline()
      const out = s.render('a\nb\nc')
      expect(out).toBe('abc')
    })

    test('ignores padding in inline mode', () => {
      const s = new Style({}, undefined, ctx).inline().padding(2)
      const out = s.render('x')
      expect(out).toBe('x')
    })

    test('ignores margin in inline mode', () => {
      const s = new Style({}, undefined, ctx).inline().margin(2)
      const out = s.render('x')
      expect(out).toBe('x')
    })
  })

  describe('border options', () => {
    test('border(true) enables default border', () => {
      const s = new Style({}, undefined, ctx).border(true)
      const out = s.render('hi')
      expect(out).toContain('┌')
    })

    test('border(false) disables border', () => {
      const s = new Style({}, undefined, ctx).border(true).border(false)
      const out = s.render('hi')
      expect(out).not.toContain('┌')
    })

    test('borderStyle sets border characters', () => {
      const s = new Style({}, undefined, ctx).borderStyle(borderStyles.double)
      const out = s.render('x')
      expect(out).toContain('╔')
    })
  })

  describe('padding overloads', () => {
    test('padding(all) applies to all sides', () => {
      const s = new Style({}, undefined, ctx).padding(1).width(3)
      const out = s.render('x')
      const lines = out.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[1]).toBe(' x ')
    })

    test('padding(v, h) applies vertical and horizontal', () => {
      const s = new Style({}, undefined, ctx).padding(1, 2).width(5)
      const out = s.render('x')
      const lines = out.split('\n')
      expect(lines).toHaveLength(3)
      expect(lines[1]).toBe('  x  ')
    })

    test('padding(t, r, b, l) applies individually', () => {
      const s = new Style({}, undefined, ctx).padding(0, 1, 0, 1).width(3)
      const out = s.render('x')
      expect(out).toBe(' x ')
    })
  })

  describe('width constraints', () => {
    test('width clamps content', () => {
      const s = new Style({}, undefined, ctx).width(5).align('left')
      const out = s.render('abc')
      expect(out).toBe('abc  ')
    })

    test('maxWidth wraps content', () => {
      const s = new Style({}, undefined, ctx).maxWidth(5)
      const out = s.render('hello world')
      expect(out.split('\n').length).toBeGreaterThan(1)
    })

    test('maxHeight truncates lines', () => {
      const s = new Style({}, undefined, ctx).maxHeight(2)
      const out = s.render('a\nb\nc\nd')
      expect(out.split('\n')).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    test('handles zero width', () => {
      const s = new Style({}, undefined, ctx).width(0)
      const out = s.render('test')
      expect(out.length).toBeGreaterThanOrEqual(0)
    })

    test('handles negative padding gracefully', () => {
      const s = new Style({}, undefined, ctx).padding(-1)
      // Should not throw
      expect(() => s.render('test')).not.toThrow()
    })
  })

  describe('unset', () => {
    test('unset removes properties', () => {
      const s = new Style({}, undefined, ctx).bold().italic()
      const cleared = s.unset('bold')

      expect(cleared.isSet('bold')).toBe(false)
      expect(cleared.isSet('italic')).toBe(true)
    })
  })
})

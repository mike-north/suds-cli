import { describe, expect, it } from 'vitest'
import { Sanitizer, newSanitizer } from '../src/sanitizer.js'

describe('Sanitizer', () => {
  // Test with custom replacements matching Go tests
  const sanitizer = newSanitizer({
    replaceNewLine: 'XX',
    replaceTab: '',
  })

  it('handles empty string', () => {
    expect(sanitizer.sanitize('')).toBe('')
  })

  it('passes through plain text', () => {
    expect(sanitizer.sanitize('x')).toBe('x')
    expect(sanitizer.sanitize('hello')).toBe('hello')
  })

  it('replaces newlines with configured string', () => {
    expect(sanitizer.sanitize('\n')).toBe('XX')
    expect(sanitizer.sanitize('\na\n')).toBe('XXaXX')
    expect(sanitizer.sanitize('\n\n')).toBe('XXXX')
    expect(sanitizer.sanitize('hel\nlo')).toBe('helXXlo')
  })

  it('replaces carriage returns with configured string', () => {
    expect(sanitizer.sanitize('\r')).toBe('XX')
    expect(sanitizer.sanitize('hel\rlo')).toBe('helXXlo')
  })

  it('replaces tabs with configured string (empty)', () => {
    expect(sanitizer.sanitize('\t')).toBe('')
    expect(sanitizer.sanitize('hel\tlo')).toBe('hello')
  })

  it('handles mixed newlines and tabs', () => {
    expect(sanitizer.sanitize('he\n\nl\tlo')).toBe('heXXXXllo')
    expect(sanitizer.sanitize('he\tl\n\nlo')).toBe('helXXXXlo')
  })

  it('removes standalone ESC control character', () => {
    // Note: strip-ansi may consume characters after ESC that look like
    // partial ANSI sequences. A bare ESC followed by space is safe.
    expect(sanitizer.sanitize('hel\x1b lo')).toBe('hel lo')
  })

  it('strips ANSI escape sequences cleanly', () => {
    // Color codes should be fully removed, not leave remnants
    expect(sanitizer.sanitize('\x1b[31mred\x1b[0m')).toBe('red')
    expect(sanitizer.sanitize('hello \x1b[1;32mgreen\x1b[0m world')).toBe(
      'hello green world',
    )
  })

  it('handles complex ANSI sequences', () => {
    // Cursor movement, clearing, etc.
    expect(sanitizer.sanitize('\x1b[2J\x1b[Htext')).toBe('text')
    expect(sanitizer.sanitize('a\x1b[5Ab')).toBe('ab')
  })
})

describe('Sanitizer with default options', () => {
  const sanitizer = newSanitizer()

  it('replaces newlines with newline by default', () => {
    expect(sanitizer.sanitize('a\nb')).toBe('a\nb')
  })

  it('replaces tabs with 4 spaces by default', () => {
    expect(sanitizer.sanitize('a\tb')).toBe('a    b')
  })
})

describe('Sanitizer with custom options', () => {
  it('can replace newlines with space', () => {
    const s = newSanitizer({ replaceNewLine: ' ' })
    expect(s.sanitize('hello\nworld')).toBe('hello world')
  })

  it('can remove newlines entirely', () => {
    const s = newSanitizer({ replaceNewLine: '' })
    expect(s.sanitize('hello\nworld')).toBe('helloworld')
  })

  it('can use custom tab replacement', () => {
    const s = newSanitizer({ replaceTab: '  ' })
    expect(s.sanitize('a\tb')).toBe('a  b')
  })
})

describe('Sanitizer class direct instantiation', () => {
  it('can be instantiated directly', () => {
    const s = new Sanitizer({ replaceNewLine: '|' })
    expect(s.sanitize('a\nb')).toBe('a|b')
  })
})

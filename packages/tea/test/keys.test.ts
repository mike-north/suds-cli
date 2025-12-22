import { describe, expect, test } from 'vitest'
import { KeyType, parseKey } from '../src/keys.js'

const toBuf = (s: string) => Buffer.from(s, 'utf8')

describe('parseKey', () => {
  test('parses arrow up escape sequence', () => {
    const result = parseKey(toBuf('\u001b[A'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      expect(result.key.type).toBe(KeyType.Up)
      expect(result.length).toBe(3)
    }
  })

  test('parses rune', () => {
    const result = parseKey(toBuf('a'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      expect(result.key.type).toBe(KeyType.Runes)
      expect(result.key.runes).toBe('a')
      expect(result.key.alt).toBe(false)
      expect(result.length).toBe(1)
    }
  })

  test('parses alt+rune', () => {
    const result = parseKey(toBuf('\u001ba'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      expect(result.key.type).toBe(KeyType.Runes)
      expect(result.key.runes).toBe('a')
      expect(result.key.alt).toBe(true)
      expect(result.length).toBe(2)
    }
  })

  test('parses space as KeySpace', () => {
    const result = parseKey(toBuf(' '), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      expect(result.key.type).toBe(KeyType.Space)
      expect(result.key.runes).toBe(' ')
    }
  })

  test('parses ctrl+c as break', () => {
    const result = parseKey(Buffer.from([3]), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      expect(result.key.type).toBe(KeyType.Break)
    }
  })
})

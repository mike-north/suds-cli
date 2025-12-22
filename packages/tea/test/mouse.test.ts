import { describe, expect, test } from 'vitest'
import { MouseAction, MouseButton, parseMouse } from '../src/mouse.js'

const toBuf = (s: string) => Buffer.from(s, 'utf8')

describe('parseMouse (SGR)', () => {
  test('parses left press', () => {
    const result = parseMouse(toBuf('\u001b[<0;5;10M'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      const { event } = result.msg
      expect(event.button).toBe(MouseButton.Left)
      expect(event.action).toBe(MouseAction.Press)
      expect(event.x).toBe(4)
      expect(event.y).toBe(9)
      expect(result.length).toBe(10)
    }
  })

  test('parses left release', () => {
    const result = parseMouse(toBuf('\u001b[<0;5;10m'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      const { event } = result.msg
      expect(event.button).toBe(MouseButton.Left)
      expect(event.action).toBe(MouseAction.Release)
    }
  })

  test('parses wheel up', () => {
    const result = parseMouse(toBuf('\u001b[<64;2;3M'), false)
    expect(result && !('needMore' in result)).toBe(true)
    if (result && !('needMore' in result)) {
      const { event } = result.msg
      expect(event.button).toBe(MouseButton.WheelUp)
      expect(event.action).toBe(MouseAction.Press)
    }
  })
})

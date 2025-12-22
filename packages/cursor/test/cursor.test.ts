import { describe, expect, it, vi } from 'vitest'
import { Style } from '@suds-cli/chapstick'
import { BlurMsg, FocusMsg } from '@suds-cli/tea'
import { CursorModel, CursorMode } from '@/model.js'
import { BlinkMsg, InitialBlinkMsg } from '@/messages.js'

describe('CursorModel basics', () => {
  it('defaults to blink mode with focus=false', () => {
    const cursor = new CursorModel()
    expect(cursor.mode()).toBe(CursorMode.Blink)
    expect(cursor.isFocused()).toBe(false)
  })

  it('allows custom style/textStyle/char', () => {
    const style = new Style().bold()
    const textStyle = new Style().italic()
    const cursor = new CursorModel({ style, textStyle, char: '_' })
    expect(cursor.style).toBe(style)
    expect(cursor.textStyle).toBe(textStyle)
    expect(cursor.view()).toContain('_')
  })

  it('id is stable and unique', () => {
    const a = new CursorModel()
    const b = new CursorModel()
    expect(a.id()).not.toBe(b.id())
    expect(a.id()).toBe(a.id())
  })
})

describe('CursorModel update flow', () => {
  it('initial blink message starts blinking when focused', () => {
    const cursor = new CursorModel()
    const [focused] = cursor.update(new FocusMsg())
    const [next, cmd] = focused.update(new InitialBlinkMsg())
    expect(cmd).not.toBeNull()
    expect(next).toBeInstanceOf(CursorModel)
  })

  it('ignores initial blink when not focused', () => {
    const cursor = new CursorModel()
    const [next, cmd] = cursor.update(new InitialBlinkMsg())
    expect(next).toBe(cursor)
    expect(cmd).toBeNull()
  })

  it('toggles blink on matching BlinkMsg and reschedules', async () => {
    const cursor = new CursorModel({ mode: CursorMode.Blink })
    const [focused] = cursor.update(new FocusMsg())
    const [scheduled, firstCmd] = focused.tickBlink()

    const blinkMsg = await firstCmd?.()
    if (!(blinkMsg instanceof BlinkMsg)) {
      throw new Error('expected BlinkMsg')
    }

    const [toggled, cmd] = scheduled.update(blinkMsg)
    expect(toggled.isBlinkHidden()).toBe(!scheduled.isBlinkHidden())
    expect(cmd).not.toBeNull()
  })

  it('ignores BlinkMsg with wrong id', () => {
    const cursor = new CursorModel({ mode: CursorMode.Blink })
    const [focused] = cursor.update(new FocusMsg())
    const wrong = new BlinkMsg(focused.id() + 1, 0, new Date())
    const [next, cmd] = focused.update(wrong)
    expect(next).toBe(focused)
    expect(cmd).toBeNull()
  })

  it('ignores BlinkMsg with wrong tag', () => {
    const cursor = new CursorModel({ mode: CursorMode.Blink })
    const [focused] = cursor.update(new FocusMsg())
    const wrong = new BlinkMsg(focused.id(), 999, new Date())
    const [next, cmd] = focused.update(wrong)
    expect(next).toBe(focused)
    expect(cmd).toBeNull()
  })

  it('focus/blur toggles focus state', () => {
    const cursor = new CursorModel()
    const [focused] = cursor.update(new FocusMsg())
    expect(focused.isFocused()).toBe(true)
    const [blurred] = focused.update(new BlurMsg())
    expect(blurred.isFocused()).toBe(false)
  })
})

describe('CursorModel modes', () => {
  it('switches to static mode', () => {
    const cursor = new CursorModel()
    const [next, cmd] = cursor.withMode(CursorMode.Static)
    expect(next.mode()).toBe(CursorMode.Static)
    expect(cmd).toBeNull()
  })

  it('hidden mode keeps cursor hidden', () => {
    const cursor = new CursorModel({ mode: CursorMode.Hidden })
    expect(cursor.isBlinkHidden()).toBe(true)
    const [focused] = cursor.update(new FocusMsg())
    expect(focused.isBlinkHidden()).toBe(true)
  })
})

describe('view()', () => {
  it('renders textStyle when blink hidden', () => {
    const cursor = new CursorModel({ char: 'x' })
    const out = cursor.view()
    expect(out).toContain('x')
  })

  it('renders style when blink visible', () => {
    const cursor = new CursorModel(
      {},
      { id: 1, tag: 0, blink: false, focus: false, mode: CursorMode.Static },
    )
    const out = cursor.view()
    expect(out).toContain(' ')
  })
})

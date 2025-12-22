import { describe, expect, test } from 'vitest'
import {
  ClearScreenMsg,
  EnterAltScreenMsg,
  QuitMsg,
  SetWindowTitleMsg,
} from '../src/messages.js'

describe('messages', () => {
  test('QuitMsg brand', () => {
    const msg = new QuitMsg()
    expect(msg._tag).toBe('quit')
  })

  test('SetWindowTitle carries title', () => {
    const msg = new SetWindowTitleMsg('hello')
    expect(msg.title).toBe('hello')
  })

  test('screen control tags', () => {
    expect(new ClearScreenMsg()._tag).toBe('clear-screen')
    expect(new EnterAltScreenMsg()._tag).toBe('enter-alt-screen')
  })
})

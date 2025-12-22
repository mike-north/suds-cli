import { describe, expect, it } from 'vitest'
import { KeyMsg, KeyType } from '@suds-cli/tea'
import { Style } from '@suds-cli/chapstick'
import { TextInputModel, EchoMode, PasteMsg } from '../src/index.js'

function key(type: KeyType, runes = '', alt = false): KeyMsg {
  return new KeyMsg({ type, runes, alt, paste: false })
}

describe('TextInputModel', () => {
  it('moves the cursor and edits grapheme-aware', () => {
    let input = TextInputModel.new({ value: '👍a', width: 10 })
    const [focused] = input.focus()
    input = focused.cursorLeft() // move before "a"
    input = input.insertRunes('é')
    expect(input.valueOf()).toBe('👍éa')
    expect(input.cursorPosition()).toBe(2)
  })

  it('enforces character limits', () => {
    let input = TextInputModel.new({ charLimit: 3 })
    input = input.insertRunes('hello')
    expect(input.valueOf()).toBe('hel')
    expect(input.cursorPosition()).toBe(3)
  })

  it('supports word navigation and deletion', () => {
    let input = TextInputModel.new({ value: 'hello world' })
    input = input.cursorEnd()
    input = input.wordLeft()
    expect(input.cursorPosition()).toBe(6) // before "world"
    input = input.deleteWordLeft()
    expect(input.valueOf()).toBe('world')
    expect(input.cursorPosition()).toBe(0)
  })

  it('masks text in password/none echo modes', () => {
    const password = TextInputModel.new({
      value: 'secret',
      echoMode: EchoMode.Password,
      width: 20,
      prompt: '',
      textStyle: new Style(),
    })
    const none = TextInputModel.new({
      value: 'hidden',
      echoMode: EchoMode.None,
      width: 20,
      prompt: '',
      textStyle: new Style(),
    })
    expect(password.view()).not.toContain('secret')
    expect(none.view()).not.toContain('hidden')
  })

  it('renders placeholder when empty', () => {
    const input = TextInputModel.new({
      placeholder: 'Enter name',
      width: 20,
      prompt: '',
    })
    expect(input.view()).toContain('Enter name')
  })

  it('scrolls horizontally when width is limited', () => {
    let input = TextInputModel.new({ width: 6, prompt: '', value: 'abcdef' })
    input = input.cursorEnd()
    const view = input.view()
    expect(view).not.toContain('abc')
    expect(view).toContain('def')
  })

  it('runs validation callbacks', () => {
    const validate = (v: string) =>
      v.length < 3 ? new Error('too short') : null
    let input = TextInputModel.new({ validate })
    input = input.insertRunes('hi')
    expect(input.error).toBeInstanceOf(Error)
    input = input.insertRunes('there')
    expect(input.error).toBeNull()
  })

  it('handles paste messages through update', () => {
    let input = TextInputModel.new({ prompt: '' })
    const [focused] = input.focus()
    input = focused
    const [next] = input.update(new PasteMsg('clip'))
    expect(next.valueOf()).toBe('clip')
  })

  it('honors key bindings via update loop', async () => {
    let input = TextInputModel.new({ prompt: '' })
    const [focused] = input.focus()
    input = focused

    // Insert rune through key event
    const [afterInsert] = input.update(key(KeyType.Runes, 'a'))
    expect(afterInsert.valueOf()).toBe('a')

    // Backspace via binding
    const [afterDelete] = afterInsert.update(key(KeyType.Backspace, '', false))
    expect(afterDelete.valueOf()).toBe('')
  })
})

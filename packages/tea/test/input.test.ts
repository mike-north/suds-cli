import { PassThrough } from 'node:stream'
import { describe, expect, test } from 'vitest'
import { createNodePlatform } from '@suds-cli/machine/node'
import { startInput } from '../src/input.js'
import { FocusMsg } from '../src/messages.js'
import { KeyMsg, KeyType } from '../src/keys.js'

describe('input', () => {
  test('focus sequences are distinguished from F-keys', async () => {
    const input = new PassThrough()
    const output = new PassThrough()
    const platform = createNodePlatform({ input, output })
    const messages: Array<unknown> = []
    const stop = startInput({
      platform,
      onMessage: (msg) => messages.push(msg),
    })

    input.write('\u001bOP') // F1
    input.write('\u001b[I') // focus in

    await Promise.resolve()
    stop()
    platform.dispose()

    expect(messages[0]).toBeInstanceOf(KeyMsg)
    expect((messages[0] as KeyMsg).key.type).toBe(KeyType.F1)
    expect(messages[1]).toBeInstanceOf(FocusMsg)
  })

  test('bracketed paste across chunks is parsed once', async () => {
    const input = new PassThrough()
    const output = new PassThrough()
    const platform = createNodePlatform({ input, output })
    const messages: Array<unknown> = []
    const stop = startInput({
      platform,
      onMessage: (msg) => messages.push(msg),
    })

    input.write('\u001b[200~hello ')
    input.write('world\u001b[201~')

    await Promise.resolve()
    stop()
    platform.dispose()

    const [paste] = messages as Array<KeyMsg>
    expect(paste).toBeInstanceOf(KeyMsg)
    expect(paste.key.type).toBe(KeyType.Runes)
    expect(paste.key.paste).toBe(true)
    expect(paste.key.runes).toBe('hello world')
  })
})

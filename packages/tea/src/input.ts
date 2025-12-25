import type { Disposable, PlatformAdapter } from '@suds-cli/machine'
import { allocBytes, concatBytes, encodeString } from '@suds-cli/machine'
import { BlurMsg, FocusMsg } from './messages.js'
import { KeyMsg, KeyType, parseKey } from './keys.js'
import { parseMouse } from './mouse.js'
import type { Msg } from './types.js'

/** @public Options for the input reader. */
export interface InputOptions {
  platform?: PlatformAdapter
  onMessage: (msg: Msg) => void
}

const BRACKET_PASTE_START = '\u001b[200~'
const BRACKET_PASTE_END = '\u001b[201~'

export function startInput(options: InputOptions): () => void {
  if (!options.platform) {
    // No platform adapter available, return no-op cleanup
    return () => {}
  }

  let buffer: Uint8Array = allocBytes(0)
  let disposable: Disposable | null = null

  const onData = (data: Uint8Array) => {
    buffer = concatBytes(buffer, data)
    buffer = consumeBuffer(buffer, options.onMessage)
  }

  disposable = options.platform.terminal.onInput(onData)

  return () => {
    if (disposable) {
      disposable.dispose()
    }
  }
}

function consumeBuffer(buffer: Uint8Array, push: (msg: Msg) => void): Uint8Array {
  let offset = 0

  while (offset < buffer.length) {
    const slice = buffer.subarray(offset)
    const result = detectOne(slice, offset + slice.length === buffer.length)

    if (!result || 'needMore' in result) {
      break
    }

    offset += result.length
    if (result.msg) {
      push(result.msg)
    }
  }

  return buffer.subarray(offset)
}

type DetectResult =
  | { msg: Msg; length: number }
  | { msg?: Msg; length: number }
  | { needMore: true }

function detectOne(
  buffer: Uint8Array,
  allowMoreData: boolean,
): DetectResult | undefined {
  if (buffer.length === 0) {
    return allowMoreData ? { needMore: true } : undefined
  }
  const mouse = parseMouse(buffer, allowMoreData)
  if (mouse) {
    if ('needMore' in mouse) {
      return mouse
    }
    return { msg: mouse.msg, length: mouse.length }
  }

  const focus = detectFocus(buffer)
  if (focus) {
    return focus
  }

  const paste = detectBracketedPaste(buffer, allowMoreData)
  if (paste) {
    return paste
  }

  const key = parseKey(buffer, allowMoreData)
  if (!key) {
    return undefined
  }
  if ('needMore' in key) {
    return key
  }

  return { msg: new KeyMsg(key.key), length: key.length }
}

function detectFocus(buffer: Uint8Array): DetectResult | undefined {
  // Focus in: ESC [ I, Focus out: ESC [ O (exactly three bytes)
  if (buffer.length === 3 && buffer[0] === 0x1b && buffer[1] === 0x5b) {
    if (buffer[2] === 0x49) {
      return { msg: new FocusMsg(), length: 3 }
    }
    if (buffer[2] === 0x4f) {
      return { msg: new BlurMsg(), length: 3 }
    }
  }
  return undefined
}

function detectBracketedPaste(
  buffer: Uint8Array,
  allowMoreData: boolean,
): DetectResult | undefined {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const asString = decoder.decode(buffer)
  if (!asString.startsWith(BRACKET_PASTE_START)) {
    return undefined
  }
  const endIndex = asString.indexOf(
    BRACKET_PASTE_END,
    BRACKET_PASTE_START.length,
  )
  if (endIndex === -1) {
    return allowMoreData ? { needMore: true } : undefined
  }
  const content = asString.slice(BRACKET_PASTE_START.length, endIndex)
  const fullString = BRACKET_PASTE_START + content + BRACKET_PASTE_END
  const length = encodeString(fullString).length
  const key: Msg = new KeyMsg({
    type: KeyType.Runes,
    runes: content,
    alt: false,
    paste: true,
  })
  return { msg: key, length }
}

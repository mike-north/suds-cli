import { decodeFirstRune, decodeString, byteLength } from '@boba-cli/machine'

/** @public Known key types parsed from terminal input. */
export enum KeyType {
  Null = 'null',
  Break = 'break',
  Enter = 'enter',
  Backspace = 'backspace',
  Tab = 'tab',
  Esc = 'esc',
  Space = 'space',
  Runes = 'runes',
  Up = 'up',
  Down = 'down',
  Right = 'right',
  Left = 'left',
  ShiftTab = 'shift+tab',
  Home = 'home',
  End = 'end',
  PgUp = 'pgup',
  PgDown = 'pgdown',
  CtrlPgUp = 'ctrl+pgup',
  CtrlPgDown = 'ctrl+pgdown',
  Delete = 'delete',
  Insert = 'insert',
  CtrlUp = 'ctrl+up',
  CtrlDown = 'ctrl+down',
  CtrlRight = 'ctrl+right',
  CtrlLeft = 'ctrl+left',
  CtrlHome = 'ctrl+home',
  CtrlEnd = 'ctrl+end',
  ShiftUp = 'shift+up',
  ShiftDown = 'shift+down',
  ShiftRight = 'shift+right',
  ShiftLeft = 'shift+left',
  ShiftHome = 'shift+home',
  ShiftEnd = 'shift+end',
  CtrlShiftUp = 'ctrl+shift+up',
  CtrlShiftDown = 'ctrl+shift+down',
  CtrlShiftLeft = 'ctrl+shift+left',
  CtrlShiftRight = 'ctrl+shift+right',
  CtrlShiftHome = 'ctrl+shift+home',
  CtrlShiftEnd = 'ctrl+shift+end',
  F1 = 'f1',
  F2 = 'f2',
  F3 = 'f3',
  F4 = 'f4',
  F5 = 'f5',
  F6 = 'f6',
  F7 = 'f7',
  F8 = 'f8',
  F9 = 'f9',
  F10 = 'f10',
  F11 = 'f11',
  F12 = 'f12',
  F13 = 'f13',
  F14 = 'f14',
  F15 = 'f15',
  F16 = 'f16',
  F17 = 'f17',
  F18 = 'f18',
  F19 = 'f19',
  F20 = 'f20',
}

/** @public Parsed key metadata. */
export interface Key {
  type: KeyType
  runes: string
  alt: boolean
  paste: boolean
}

const keyNames: Record<KeyType, string> = {
  [KeyType.Null]: 'ctrl+@',
  [KeyType.Break]: 'ctrl+c',
  [KeyType.Enter]: 'enter',
  [KeyType.Backspace]: 'backspace',
  [KeyType.Tab]: 'tab',
  [KeyType.Esc]: 'esc',
  [KeyType.Space]: ' ',
  [KeyType.Runes]: 'runes',
  [KeyType.Up]: 'up',
  [KeyType.Down]: 'down',
  [KeyType.Right]: 'right',
  [KeyType.Left]: 'left',
  [KeyType.ShiftTab]: 'shift+tab',
  [KeyType.Home]: 'home',
  [KeyType.End]: 'end',
  [KeyType.PgUp]: 'pgup',
  [KeyType.PgDown]: 'pgdown',
  [KeyType.CtrlPgUp]: 'ctrl+pgup',
  [KeyType.CtrlPgDown]: 'ctrl+pgdown',
  [KeyType.Delete]: 'delete',
  [KeyType.Insert]: 'insert',
  [KeyType.CtrlUp]: 'ctrl+up',
  [KeyType.CtrlDown]: 'ctrl+down',
  [KeyType.CtrlRight]: 'ctrl+right',
  [KeyType.CtrlLeft]: 'ctrl+left',
  [KeyType.CtrlHome]: 'ctrl+home',
  [KeyType.CtrlEnd]: 'ctrl+end',
  [KeyType.ShiftUp]: 'shift+up',
  [KeyType.ShiftDown]: 'shift+down',
  [KeyType.ShiftRight]: 'shift+right',
  [KeyType.ShiftLeft]: 'shift+left',
  [KeyType.ShiftHome]: 'shift+home',
  [KeyType.ShiftEnd]: 'shift+end',
  [KeyType.CtrlShiftUp]: 'ctrl+shift+up',
  [KeyType.CtrlShiftDown]: 'ctrl+shift+down',
  [KeyType.CtrlShiftLeft]: 'ctrl+shift+left',
  [KeyType.CtrlShiftRight]: 'ctrl+shift+right',
  [KeyType.CtrlShiftHome]: 'ctrl+shift+home',
  [KeyType.CtrlShiftEnd]: 'ctrl+shift+end',
  [KeyType.F1]: 'f1',
  [KeyType.F2]: 'f2',
  [KeyType.F3]: 'f3',
  [KeyType.F4]: 'f4',
  [KeyType.F5]: 'f5',
  [KeyType.F6]: 'f6',
  [KeyType.F7]: 'f7',
  [KeyType.F8]: 'f8',
  [KeyType.F9]: 'f9',
  [KeyType.F10]: 'f10',
  [KeyType.F11]: 'f11',
  [KeyType.F12]: 'f12',
  [KeyType.F13]: 'f13',
  [KeyType.F14]: 'f14',
  [KeyType.F15]: 'f15',
  [KeyType.F16]: 'f16',
  [KeyType.F17]: 'f17',
  [KeyType.F18]: 'f18',
  [KeyType.F19]: 'f19',
  [KeyType.F20]: 'f20',
}

const controlKeyMap: Record<number, KeyType | undefined> = {
  0: KeyType.Null,
  3: KeyType.Break,
  9: KeyType.Tab,
  10: KeyType.Enter,
  13: KeyType.Enter,
  27: KeyType.Esc,
  127: KeyType.Backspace,
}

type Sequence = [string, Key]

const sequences: Sequence[] = [
  ['\u001b[A', { type: KeyType.Up, runes: '', alt: false, paste: false }],
  ['\u001b[B', { type: KeyType.Down, runes: '', alt: false, paste: false }],
  ['\u001b[C', { type: KeyType.Right, runes: '', alt: false, paste: false }],
  ['\u001b[D', { type: KeyType.Left, runes: '', alt: false, paste: false }],
  ['\u001b[Z', { type: KeyType.ShiftTab, runes: '', alt: false, paste: false }],
  ['\u001b[2~', { type: KeyType.Insert, runes: '', alt: false, paste: false }],
  ['\u001b[3~', { type: KeyType.Delete, runes: '', alt: false, paste: false }],
  ['\u001b[5~', { type: KeyType.PgUp, runes: '', alt: false, paste: false }],
  ['\u001b[6~', { type: KeyType.PgDown, runes: '', alt: false, paste: false }],
  ['\u001b[1~', { type: KeyType.Home, runes: '', alt: false, paste: false }],
  ['\u001b[4~', { type: KeyType.End, runes: '', alt: false, paste: false }],
  ['\u001b[H', { type: KeyType.Home, runes: '', alt: false, paste: false }],
  ['\u001b[F', { type: KeyType.End, runes: '', alt: false, paste: false }],
  ['\u001bOP', { type: KeyType.F1, runes: '', alt: false, paste: false }],
  ['\u001bOQ', { type: KeyType.F2, runes: '', alt: false, paste: false }],
  ['\u001bOR', { type: KeyType.F3, runes: '', alt: false, paste: false }],
  ['\u001bOS', { type: KeyType.F4, runes: '', alt: false, paste: false }],
  ['\u001b[15~', { type: KeyType.F5, runes: '', alt: false, paste: false }],
  ['\u001b[17~', { type: KeyType.F6, runes: '', alt: false, paste: false }],
  ['\u001b[18~', { type: KeyType.F7, runes: '', alt: false, paste: false }],
  ['\u001b[19~', { type: KeyType.F8, runes: '', alt: false, paste: false }],
  ['\u001b[20~', { type: KeyType.F9, runes: '', alt: false, paste: false }],
  ['\u001b[21~', { type: KeyType.F10, runes: '', alt: false, paste: false }],
  ['\u001b[23~', { type: KeyType.F11, runes: '', alt: false, paste: false }],
  ['\u001b[24~', { type: KeyType.F12, runes: '', alt: false, paste: false }],
  [
    '\u001b[1;2A',
    { type: KeyType.ShiftUp, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;2B',
    { type: KeyType.ShiftDown, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;2C',
    { type: KeyType.ShiftRight, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;2D',
    { type: KeyType.ShiftLeft, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;5A',
    { type: KeyType.CtrlUp, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;5B',
    { type: KeyType.CtrlDown, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;5C',
    { type: KeyType.CtrlRight, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;5D',
    { type: KeyType.CtrlLeft, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;6A',
    { type: KeyType.CtrlShiftUp, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;6B',
    { type: KeyType.CtrlShiftDown, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;6C',
    { type: KeyType.CtrlShiftRight, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[1;6D',
    { type: KeyType.CtrlShiftLeft, runes: '', alt: false, paste: false },
  ],
  ['\u001b[1;3A', { type: KeyType.Up, runes: '', alt: true, paste: false }],
  ['\u001b[1;3B', { type: KeyType.Down, runes: '', alt: true, paste: false }],
  ['\u001b[1;3C', { type: KeyType.Right, runes: '', alt: true, paste: false }],
  ['\u001b[1;3D', { type: KeyType.Left, runes: '', alt: true, paste: false }],
  [
    '\u001b[5;5~',
    { type: KeyType.CtrlPgUp, runes: '', alt: false, paste: false },
  ],
  [
    '\u001b[6;5~',
    { type: KeyType.CtrlPgDown, runes: '', alt: false, paste: false },
  ],
  ['\u001b[5;3~', { type: KeyType.PgUp, runes: '', alt: true, paste: false }],
  ['\u001b[6;3~', { type: KeyType.PgDown, runes: '', alt: true, paste: false }],
  ['\u001b[3;2~', { type: KeyType.Insert, runes: '', alt: true, paste: false }],
  ['\u001b[3;3~', { type: KeyType.Delete, runes: '', alt: true, paste: false }],
  ['\u001b[[A', { type: KeyType.F1, runes: '', alt: false, paste: false }],
  ['\u001b[[B', { type: KeyType.F2, runes: '', alt: false, paste: false }],
  ['\u001b[[C', { type: KeyType.F3, runes: '', alt: false, paste: false }],
  ['\u001b[[D', { type: KeyType.F4, runes: '', alt: false, paste: false }],
  ['\u001b[[E', { type: KeyType.F5, runes: '', alt: false, paste: false }],
]

/** @public Message representing a parsed key event. */
export class KeyMsg {
  readonly _tag = 'key'
  constructor(public readonly key: Key) {}

  toString(): string {
    return keyToString(this.key)
  }
}

/** @public Convert a parsed key to a human-readable string. */
export function keyToString(key: Key): string {
  if (key.type === KeyType.Runes) {
    const value = key.paste ? `[${key.runes}]` : key.runes
    return key.alt ? `alt+${value}` : value
  }
  const base = keyNames[key.type] ?? ''
  return key.alt ? `alt+${base}` : base
}

/** @internal */
export function parseKey(
  buffer: Uint8Array,
  allowMoreData: boolean,
): { key: Key; length: number } | { needMore: true } | undefined {
  if (buffer.length === 0) {
    return allowMoreData ? { needMore: true } : undefined
  }
  const input = decodeString(buffer)

  for (const [seq, key] of sequences) {
    if (input.startsWith(seq)) {
      return { key, length: byteLength(seq) }
    }
    if (allowMoreData && seq.startsWith(input)) {
      return { needMore: true }
    }
  }

  if (buffer[0] === 0x1b && buffer.length > 1) {
    const [rune, altLength] = decodeFirstRune(buffer, 1)
    if (altLength > 0 && rune !== null) {
      return {
        key: { type: KeyType.Runes, runes: rune, alt: true, paste: false },
        length: 1 + altLength,
      }
    }
  }

  const code: number = buffer[0] ?? 0
  const mapped: KeyType | undefined = Object.prototype.hasOwnProperty.call(
    controlKeyMap,
    code,
  )
    ? controlKeyMap[code]
    : undefined
  if (mapped !== undefined) {
    return {
      key: { type: mapped, runes: '', alt: false, paste: false },
      length: 1,
    }
  }

  const [rune, runeLength] = decodeFirstRune(buffer)
  if (runeLength === 0 || rune === null) {
    return allowMoreData ? { needMore: true } : undefined
  }

  if (rune === ' ') {
    return {
      key: { type: KeyType.Space, runes: rune, alt: false, paste: false },
      length: runeLength,
    }
  }

  return {
    key: { type: KeyType.Runes, runes: rune, alt: false, paste: false },
    length: runeLength,
  }
}

import { decodeString } from '@boba-cli/machine'

/** @public Mouse action type. */
export enum MouseAction {
  Press = 'press',
  Release = 'release',
  Motion = 'motion',
}

/** @public Mouse button identifiers, including wheels. */
export enum MouseButton {
  None = 'none',
  Left = 'left',
  Middle = 'middle',
  Right = 'right',
  WheelUp = 'wheel-up',
  WheelDown = 'wheel-down',
  WheelLeft = 'wheel-left',
  WheelRight = 'wheel-right',
  Backward = 'backward',
  Forward = 'forward',
  Button10 = 'button-10',
  Button11 = 'button-11',
}

/** @public Parsed mouse event payload. */
export interface MouseEvent {
  x: number
  y: number
  shift: boolean
  alt: boolean
  ctrl: boolean
  action: MouseAction
  button: MouseButton
}

/** @public Message representing a parsed mouse event. */
export class MouseMsg {
  readonly _tag = 'mouse'
  constructor(public readonly event: MouseEvent) {}

  toString(): string {
    const parts = [
      this.event.ctrl ? 'ctrl' : '',
      this.event.alt ? 'alt' : '',
      this.event.shift ? 'shift' : '',
    ].filter(Boolean)
    const mods = parts.length > 0 ? `${parts.join('+')}+` : ''
    return `${mods}${this.event.button} ${this.event.action} @${this.event.x},${this.event.y}`
  }
}

const mouseSGRRegex = /(\d+);(\d+);(\d+)([Mm])/
const mouseEventX10Len = 6
const x10MouseByteOffset = 32

/** @internal */
export function parseMouse(
  buffer: Uint8Array,
  allowMoreData: boolean,
): { msg: MouseMsg; length: number } | { needMore: true } | undefined {
  if (buffer.length < 3 || buffer[0] !== 0x1b || buffer[1] !== 0x5b) {
    return undefined
  }

  if (buffer[2] === 0x4d) {
    if (buffer.length < mouseEventX10Len) {
      return allowMoreData ? { needMore: true } : undefined
    }
    const event = parseX10MouseEvent(buffer.subarray(0, mouseEventX10Len))
    return { msg: new MouseMsg(event), length: mouseEventX10Len }
  }

  if (buffer[2] === 0x3c) {
    const slice = decodeString(buffer)
    const match = mouseSGRRegex.exec(slice.slice(3))
    if (!match) {
      return allowMoreData ? { needMore: true } : undefined
    }
    const event = parseSGRMouseEvent(slice)
    const matchedLength = match[0]?.length ?? 0
    return { msg: new MouseMsg(event), length: matchedLength + 3 }
  }

  return undefined
}

function parseSGRMouseEvent(seq: string): MouseEvent {
  const match = mouseSGRRegex.exec(seq.slice(3))
  if (!match) {
    return defaultMouseEvent()
  }

  const buttonCode = Number.parseInt(match[1] ?? '0', 10)
  const px = Number.parseInt(match[2] ?? '0', 10)
  const py = Number.parseInt(match[3] ?? '0', 10)
  const release = match[4] === 'm'

  const event = parseMouseButton(buttonCode, true)

  if (event.action !== MouseAction.Motion && !eventIsWheel(event) && release) {
    event.action = MouseAction.Release
  }

  event.x = px - 1
  event.y = py - 1

  return event
}

function parseX10MouseEvent(buf: Uint8Array): MouseEvent {
  const buttonByte = buf[3] ?? 0
  const c1 = buf[4] ?? 0
  const c2 = buf[5] ?? 0
  const event = parseMouseButton(buttonByte, false)
  event.x = c1 - x10MouseByteOffset - 1
  event.y = c2 - x10MouseByteOffset - 1
  return event
}

function parseMouseButton(code: number, isSGR: boolean): MouseEvent {
  let e = code
  if (!isSGR) {
    e -= x10MouseByteOffset
  }

  const bitShift = 0b0000_0100
  const bitAlt = 0b0000_1000
  const bitCtrl = 0b0001_0000
  const bitMotion = 0b0010_0000
  const bitWheel = 0b0100_0000
  const bitAdd = 0b1000_0000
  const bitsMask = 0b0000_0011

  const event = defaultMouseEvent()

  if ((e & bitAdd) !== 0) {
    const extraButtons: Record<number, MouseButton> = {
      0: MouseButton.Backward,
      1: MouseButton.Forward,
      2: MouseButton.Button10,
      3: MouseButton.Button11,
    }
    event.button = extraButtons[e & bitsMask] ?? MouseButton.None
  } else if ((e & bitWheel) !== 0) {
    const wheelButtons: Record<number, MouseButton> = {
      0: MouseButton.WheelUp,
      1: MouseButton.WheelDown,
      2: MouseButton.WheelLeft,
      3: MouseButton.WheelRight,
    }
    event.button = wheelButtons[e & bitsMask] ?? MouseButton.None
  } else {
    const baseButtons: Record<number, MouseButton> = {
      0: MouseButton.Left,
      1: MouseButton.Middle,
      2: MouseButton.Right,
      3: MouseButton.None,
    }
    event.button = baseButtons[e & bitsMask] ?? MouseButton.None
    if ((e & bitsMask) === bitsMask) {
      event.action = MouseAction.Release
      event.button = MouseButton.None
    }
  }

  if ((e & bitMotion) !== 0 && !eventIsWheel(event)) {
    event.action = MouseAction.Motion
  }

  event.alt = (e & bitAlt) !== 0
  event.ctrl = (e & bitCtrl) !== 0
  event.shift = (e & bitShift) !== 0

  return event
}

function eventIsWheel(event: MouseEvent): boolean {
  return (
    event.button === MouseButton.WheelUp ||
    event.button === MouseButton.WheelDown ||
    event.button === MouseButton.WheelLeft ||
    event.button === MouseButton.WheelRight
  )
}

function defaultMouseEvent(): MouseEvent {
  return {
    x: 0,
    y: 0,
    shift: false,
    alt: false,
    ctrl: false,
    action: MouseAction.Press,
    button: MouseButton.None,
  }
}

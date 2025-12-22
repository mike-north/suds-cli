import { describe, expect, it } from 'vitest'
import { Style } from '@suds-cli/chapstick'
import {
  KeyMsg,
  KeyType,
  MouseAction,
  MouseButton,
  MouseMsg,
} from '@suds-cli/tea'
import { ScrollMsg, SyncMsg, ViewportModel } from '@/index.js'

function key(type: KeyType): KeyMsg {
  return new KeyMsg({ type, runes: '', alt: false, paste: false })
}

function mouse(button: MouseButton): MouseMsg {
  return new MouseMsg({
    x: 0,
    y: 0,
    shift: false,
    alt: false,
    ctrl: false,
    action: MouseAction.Press,
    button,
  })
}

describe('ViewportModel basics', () => {
  it('clamps scrolling to bounds', () => {
    const model = ViewportModel.new({ height: 3 }).setContentLines([
      'a',
      'b',
      'c',
      'd',
      'e',
    ])

    expect(model.scrollDown(10).yOffset).toBe(2) // max offset = 2
    expect(model.scrollDown(1).scrollUp(10).yOffset).toBe(0)
  })

  it('clamps offset when content shrinks', () => {
    let model = ViewportModel.new({ height: 2 }).setContentLines([
      'a',
      'b',
      'c',
    ])
    model = model.scrollDown(2)
    expect(model.yOffset).toBe(1)

    model = model.setContentLines(['only'])
    expect(model.yOffset).toBe(0)
  })

  it('pads view to height', () => {
    const model = ViewportModel.new({ height: 3 }).setContent('x\ny')
    expect(model.view()).toBe('x\ny\n')
  })

  it('calculates and applies scroll percent', () => {
    const model = ViewportModel.new({ height: 2 }).setContentLines([
      '1',
      '2',
      '3',
      '4',
    ])
    expect(model.scrollPercent()).toBeCloseTo(0)

    const halfway = model.scrollPercent(0.5)
    expect(halfway.yOffset).toBe(1)
    expect(halfway.scrollPercent()).toBeCloseTo(0.5)
  })

  it('centers gotoLine when requested', () => {
    const model = ViewportModel.new({ height: 4 }).setContentLines([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ])
    const centered = model.gotoLine(5, true)
    expect(centered.yOffset).toBe(4)
  })
})

describe('ViewportModel update', () => {
  it('handles key scroll and emits ScrollMsg', async () => {
    const model = ViewportModel.new({ height: 2 }).setContent('a\nb\nc')
    const [next, cmd] = model.update(key(KeyType.Down))

    expect(next.yOffset).toBe(1)
    const msg = (await cmd?.()) as ScrollMsg
    expect(msg).toBeInstanceOf(ScrollMsg)
    expect(msg.topLine).toBe(1)
  })

  it('handles mouse wheel when enabled', async () => {
    const model = ViewportModel.new({ height: 2 }).setContent('a\nb\nc')
    const [next, cmd] = model.update(mouse(MouseButton.WheelDown))

    expect(next.yOffset).toBe(1)
    const msg = (await cmd?.()) as ScrollMsg
    expect(msg).toBeInstanceOf(ScrollMsg)
  })

  it('ignores mouse wheel when disabled', () => {
    const model = ViewportModel.new({
      height: 2,
      mouseWheelEnabled: false,
    }).setContent('a\nb\nc')
    const [next, cmd] = model.update(mouse(MouseButton.WheelDown))

    expect(next).toBe(model)
    expect(cmd).toBeNull()
  })
})

describe('SyncMsg', () => {
  it('includes visible lines and bounds', async () => {
    const style = new Style() // Ensure style is usable
    const model = ViewportModel.new({ height: 2, style }).setContent(
      'top\nbottom\nextra',
    )

    const syncMsg = (await model.sync()?.()) as SyncMsg
    expect(syncMsg).toBeInstanceOf(SyncMsg)
    expect(syncMsg.lines).toEqual(['top', 'bottom'])
    expect(syncMsg.topLine).toBe(0)
    expect(syncMsg.bottomLine).toBe(1)
  })
})

import { describe, expect, it } from 'vitest'
import { Style } from '@suds-cli/chapstick'
import { SpinnerModel } from '@/model.js'
import { TickMsg } from '@/messages.js'
import {
  line,
  dot,
  miniDot,
  jump,
  pulse,
  points,
  globe,
  moon,
  monkey,
  meter,
  hamburger,
  ellipsis,
} from '@/spinner.js'

describe('SpinnerModel', () => {
  it('defaults to line spinner', () => {
    const model = new SpinnerModel()
    expect(model.spinner).toBe(line)
  })

  it('can set custom spinner via options', () => {
    const model = new SpinnerModel({ spinner: dot })
    expect(model.spinner).toBe(dot)
  })

  it('can set style via options', () => {
    const style = new Style().foreground('#ff0000')
    const model = new SpinnerModel({ style })
    expect(model.style).toBe(style)
  })

  it('has unique ID', () => {
    const model1 = new SpinnerModel()
    const model2 = new SpinnerModel()
    expect(model1.id()).not.toBe(model2.id())
  })

  it('tick() returns a command', () => {
    const model = new SpinnerModel()
    const cmd = model.tick()
    expect(cmd).not.toBeNull()
    expect(typeof cmd).toBe('function')
  })

  it('view() renders first frame initially', () => {
    const model = new SpinnerModel({ spinner: line })
    expect(model.view()).toBe('|')
  })

  it('view() applies style', () => {
    const style = new Style().bold()
    const model = new SpinnerModel({ spinner: line, style })
    // Bold ANSI escape codes around the frame
    expect(model.view()).toContain('|')
  })
})

describe('SpinnerModel.update', () => {
  it('advances frame on matching TickMsg', () => {
    const model = new SpinnerModel({ spinner: line })
    const tickMsg = new TickMsg(new Date(), model.id(), 0)

    const [next] = model.update(tickMsg)

    expect(next.view()).toBe('/') // Second frame of line spinner
  })

  it('wraps frame at end of frames array', () => {
    let model = new SpinnerModel({ spinner: line })

    // Advance through all 4 frames
    for (let i = 0; i < 4; i++) {
      const tickMsg = new TickMsg(new Date(), model.id(), i)
      const [next] = model.update(tickMsg)
      model = next
    }

    // Should wrap back to first frame
    expect(model.view()).toBe('|')
  })

  it('ignores TickMsg with wrong ID', () => {
    const model = new SpinnerModel({ spinner: line })
    const wrongIdMsg = new TickMsg(new Date(), model.id() + 999, 0)

    const [next, cmd] = model.update(wrongIdMsg)

    expect(next).toBe(model) // Same instance, no change
    expect(cmd).toBeNull()
  })

  it('ignores TickMsg with wrong tag', () => {
    const model = new SpinnerModel({ spinner: line })
    // Tag 999 doesn't match the model's tag of 0
    const wrongTagMsg = new TickMsg(new Date(), model.id(), 999)

    const [next, cmd] = model.update(wrongTagMsg)

    expect(next).toBe(model)
    expect(cmd).toBeNull()
  })

  it('ignores non-TickMsg messages', () => {
    const model = new SpinnerModel()
    const otherMsg = { _tag: 'other' }

    const [next, cmd] = model.update(otherMsg)

    expect(next).toBe(model)
    expect(cmd).toBeNull()
  })

  it('returns tick command after advancing', () => {
    const model = new SpinnerModel({ spinner: line })
    const tickMsg = new TickMsg(new Date(), model.id(), 0)

    const [, cmd] = model.update(tickMsg)

    expect(cmd).not.toBeNull()
  })
})

describe('SpinnerModel.withSpinner', () => {
  it('returns new model with different spinner', () => {
    const model = new SpinnerModel({ spinner: line })
    const next = model.withSpinner(dot)

    expect(next.spinner).toBe(dot)
    expect(model.spinner).toBe(line) // Original unchanged
  })

  it('preserves ID', () => {
    const model = new SpinnerModel()
    const next = model.withSpinner(dot)

    expect(next.id()).toBe(model.id())
  })

  it('resets frame to 0', () => {
    let model = new SpinnerModel({ spinner: line })
    // Advance a frame
    const tickMsg = new TickMsg(new Date(), model.id(), 0)
    ;[model] = model.update(tickMsg)

    const next = model.withSpinner(dot)
    expect(next.view()).toBe('⣾ ') // First frame of dot
  })
})

describe('SpinnerModel.withStyle', () => {
  it('returns new model with different style', () => {
    const style1 = new Style().foreground('#ff0000')
    const style2 = new Style().foreground('#00ff00')
    const model = new SpinnerModel({ style: style1 })
    const next = model.withStyle(style2)

    expect(next.style).toBe(style2)
    expect(model.style).toBe(style1) // Original unchanged
  })

  it('preserves frame position', () => {
    let model = new SpinnerModel({ spinner: line })
    // Advance a frame
    const tickMsg = new TickMsg(new Date(), model.id(), 0)
    ;[model] = model.update(tickMsg)

    const next = model.withStyle(new Style().bold())
    expect(next.view()).toContain('/') // Still on second frame
  })
})

describe('Built-in spinners', () => {
  const spinners = [
    { name: 'line', spinner: line },
    { name: 'dot', spinner: dot },
    { name: 'miniDot', spinner: miniDot },
    { name: 'jump', spinner: jump },
    { name: 'pulse', spinner: pulse },
    { name: 'points', spinner: points },
    { name: 'globe', spinner: globe },
    { name: 'moon', spinner: moon },
    { name: 'monkey', spinner: monkey },
    { name: 'meter', spinner: meter },
    { name: 'hamburger', spinner: hamburger },
    { name: 'ellipsis', spinner: ellipsis },
  ]

  for (const { name, spinner } of spinners) {
    it(`${name} has frames and fps`, () => {
      expect(spinner.frames.length).toBeGreaterThan(0)
      expect(spinner.fps).toBeGreaterThan(0)
    })
  }
})

describe('TickMsg', () => {
  it('has correct _tag', () => {
    const msg = new TickMsg(new Date(), 1, 0)
    expect(msg._tag).toBe('spinner:tick')
  })

  it('stores time, id, and tag', () => {
    const time = new Date()
    const msg = new TickMsg(time, 42, 7)

    expect(msg.time).toBe(time)
    expect(msg.id).toBe(42)
    expect(msg.tag).toBe(7)
  })
})

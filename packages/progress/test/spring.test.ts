import { describe, expect, it } from 'vitest'
import { Spring } from '../src/spring.js'

describe('Spring', () => {
  it('converges toward target', () => {
    let spring = new Spring({
      position: 0,
      velocity: 0,
      frequency: 18,
      damping: 1,
    })
    for (let i = 0; i < 180; i++) {
      spring = spring.update(1, 16)
    }

    expect(spring.position()).toBeGreaterThan(0.95)
    expect(Math.abs(spring.velocity())).toBeLessThan(0.5)
  })

  it('keeps state when changing options', () => {
    const base = new Spring({ position: 0.25, velocity: 0.1 })
    const tuned = base.withOptions(10, 2)

    expect(tuned.position()).toBeCloseTo(0.25)
    expect(tuned.velocity()).toBeCloseTo(0.1)
    expect(tuned.frequency).toBe(10)
    expect(tuned.damping).toBe(2)
  })
})

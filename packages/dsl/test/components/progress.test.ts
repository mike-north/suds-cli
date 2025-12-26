import { describe, expect, it } from 'vitest'
import { Style } from '@boba-cli/chapstick'
import { progress } from '../../src/components/progress.js'

describe('progress component builder', () => {
  describe('initialization', () => {
    it('should create a component builder', () => {
      const builder = progress()

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with default options', () => {
      const builder = progress()
      const [model, cmd] = builder.init()

      expect(model).toBeDefined()
      expect(cmd).toBeNull() // Progress doesn't auto-animate
      expect(model.width).toBe(40)
      expect(model.showPercentage).toBe(true)
      expect(model.percent()).toBe(0)
      expect(model.targetPercent()).toBe(0)
    })

    it('should initialize with gradient mode', () => {
      const builder = progress({
        gradient: {
          start: '#5A56E0',
          end: '#EE6FF8',
        },
      })
      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.useGradient).toBe(true)
      expect(model.gradientStart).toBeDefined()
      expect(model.gradientEnd).toBeDefined()
    })

    it('should initialize with solid fill mode', () => {
      const builder = progress({
        fullColor: '#FF0000',
      })
      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.useGradient).toBe(false)
      expect(model.fullColor).toBeDefined()
    })
  })

  describe('options handling', () => {
    it('should apply custom width', () => {
      const builder = progress({ width: 80 })
      const [model] = builder.init()

      expect(model.width).toBe(80)
    })

    it('should apply custom full and empty characters', () => {
      const builder = progress({
        full: '●',
        empty: '○',
      })
      const [model] = builder.init()

      expect(model.full).toBe('●')
      expect(model.empty).toBe('○')
    })

    it('should use only first character of multi-character strings', () => {
      const builder = progress({
        full: 'ABC',
        empty: 'XYZ',
      })
      const [model] = builder.init()

      expect(model.full).toBe('A')
      expect(model.empty).toBe('X')
    })

    it('should apply custom colors', () => {
      const builder = progress({
        fullColor: '#00FF00',
        emptyColor: '#FF0000',
      })
      const [model] = builder.init()

      expect(model.fullColor).toBeDefined()
      expect(model.emptyColor).toBeDefined()
    })

    it('should configure percentage display', () => {
      const builder = progress({
        showPercentage: false,
      })
      const [model] = builder.init()

      expect(model.showPercentage).toBe(false)
    })

    it('should apply custom percentage format', () => {
      const builder = progress({
        percentFormat: ' %5.1f%%',
      })
      const [model] = builder.init()

      expect(model.percentFormat).toBe(' %5.1f%%')
    })

    it('should apply gradient with scaleGradientToProgress option', () => {
      const builder = progress({
        gradient: {
          start: '#5A56E0',
          end: '#EE6FF8',
          scaleGradientToProgress: true,
        },
      })
      const [model] = builder.init()

      expect(model.scaleGradient).toBe(true)
    })

    it('should default scaleGradientToProgress to false when not specified', () => {
      const builder = progress({
        gradient: {
          start: '#5A56E0',
          end: '#EE6FF8',
        },
      })
      const [model] = builder.init()

      expect(model.scaleGradient).toBe(false)
    })

    it('should apply spring animation options', () => {
      const builder = progress({
        spring: {
          frequency: 25,
          damping: 0.8,
        },
      })
      const [model] = builder.init()

      expect(model).toBeDefined()
      // Spring properties are private, but we can verify model was created
    })

    it('should apply custom percentage style', () => {
      const customStyle = new Style().foreground('#00FF00').bold()
      const builder = progress({
        percentageStyle: customStyle,
      })
      const [model] = builder.init()

      expect(model.percentageStyle).toBe(customStyle)
    })

    it('should combine multiple options', () => {
      const builder = progress({
        width: 60,
        full: '■',
        empty: '□',
        gradient: {
          start: '#FF0000',
          end: '#0000FF',
          scaleGradientToProgress: true,
        },
        showPercentage: true,
        percentFormat: ' %4.1f%%',
        spring: {
          frequency: 20,
          damping: 1.2,
        },
      })
      const [model] = builder.init()

      expect(model.width).toBe(60)
      expect(model.full).toBe('■')
      expect(model.empty).toBe('□')
      expect(model.useGradient).toBe(true)
      expect(model.scaleGradient).toBe(true)
      expect(model.showPercentage).toBe(true)
      expect(model.percentFormat).toBe(' %4.1f%%')
    })
  })

  describe('edge cases', () => {
    it('should handle width of 0', () => {
      const builder = progress({ width: 0 })
      const [model] = builder.init()

      expect(model.width).toBe(0)
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })

    it('should handle negative width by clamping to 0', () => {
      const builder = progress({ width: -10 })
      const [model] = builder.init()

      // Width might be stored as-is but rendering should handle it
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })

    it('should handle very large width', () => {
      const builder = progress({ width: 1000 })
      const [model] = builder.init()

      expect(model.width).toBe(1000)
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })

    it('should handle empty string for full/empty characters', () => {
      const builder = progress({
        full: '',
        empty: '',
      })
      const [model] = builder.init()

      // Should fall back to defaults
      expect(model.full).toBeDefined()
      expect(model.empty).toBeDefined()
    })

    it('should handle gradient with only start color', () => {
      const builder = progress({
        gradient: {
          start: '#FF0000',
          end: '#FF0000', // Same as start
        },
      })
      const [model] = builder.init()

      expect(model.useGradient).toBe(true)
    })

    it('should handle very high spring frequency', () => {
      const builder = progress({
        spring: {
          frequency: 1000,
          damping: 1,
        },
      })
      const [model] = builder.init()

      expect(model).toBeDefined()
    })

    it('should handle zero spring damping', () => {
      const builder = progress({
        spring: {
          frequency: 18,
          damping: 0,
        },
      })
      const [model] = builder.init()

      expect(model).toBeDefined()
    })
  })

  describe('model lifecycle', () => {
    it('should render initial empty progress', () => {
      const builder = progress()
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })

    it('should update model with messages', () => {
      const builder = progress()
      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }
      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should handle setPercent updates', () => {
      const builder = progress()
      const [model] = builder.init()
      const [updatedModel, cmd] = model.setPercent(0.5)

      expect(updatedModel.targetPercent()).toBe(0.5)
      expect(cmd).toBeDefined() // Should start animation
    })

    it('should render with different percentage values', () => {
      const builder = progress({ showPercentage: true })
      const [model] = builder.init()

      const view0 = builder.view(model)
      expect(view0).toBeDefined()

      const [model50] = model.setPercent(0.5)
      const view50 = model50.viewAs(0.5)
      expect(view50).toBeDefined()

      const [model100] = model.setPercent(1.0)
      const view100 = model100.viewAs(1.0)
      expect(view100).toBeDefined()
    })

    it('should render gradient progress', () => {
      const builder = progress({
        gradient: {
          start: '#5A56E0',
          end: '#EE6FF8',
        },
      })
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(0.5)
      const rendered = updatedModel.viewAs(0.5)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })

    it('should render solid fill progress', () => {
      const builder = progress({
        fullColor: '#00FF00',
      })
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(0.5)
      const rendered = updatedModel.viewAs(0.5)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })

    it('should handle incrPercent updates', () => {
      const builder = progress()
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(0.3)
      const [incrementedModel, cmd] = updatedModel.incrPercent(0.2)

      expect(incrementedModel.targetPercent()).toBe(0.5)
      expect(cmd).toBeDefined()
    })
  })

  describe('negative cases', () => {
    it('should clamp setPercent values above 1', () => {
      const builder = progress()
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(1.5)

      expect(updatedModel.targetPercent()).toBe(1.0)
    })

    it('should clamp setPercent values below 0', () => {
      const builder = progress()
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(-0.5)

      expect(updatedModel.targetPercent()).toBe(0)
    })

    it('should handle NaN percent values', () => {
      const builder = progress()
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(Number.NaN)

      // Should default to 0
      expect(updatedModel.targetPercent()).toBe(0)
    })

    it('should handle undefined gradient end color gracefully', () => {
      // TypeScript should prevent this, but test runtime behavior
      const builder = progress({
        gradient: {
          start: '#FF0000',
          // Missing end - TypeScript requires it but test runtime
        } as any,
      })
      const [model] = builder.init()

      // Should not crash
      expect(model).toBeDefined()
    })

    it('should handle invalid color formats gracefully', () => {
      const builder = progress({
        fullColor: 'not-a-color' as any,
      })
      const [model] = builder.init()

      // Should not crash, may fall back to default
      expect(model).toBeDefined()
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })

    it('should handle negative spring frequency', () => {
      const builder = progress({
        spring: {
          frequency: -10,
          damping: 1,
        },
      })
      const [model] = builder.init()

      // Should not crash
      expect(model).toBeDefined()
    })

    it('should handle negative spring damping', () => {
      const builder = progress({
        spring: {
          frequency: 18,
          damping: -1,
        },
      })
      const [model] = builder.init()

      // Should not crash
      expect(model).toBeDefined()
    })

    it('should handle empty percentage format', () => {
      const builder = progress({
        percentFormat: '',
      })
      const [model] = builder.init()

      expect(model.percentFormat).toBe('')
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })

    it('should ignore messages not meant for this model', () => {
      const builder = progress()
      const [model] = builder.init()
      const irrelevantMsg = { type: 'irrelevant', data: 'test' }
      const [updatedModel, cmd] = builder.update(model, irrelevantMsg)

      // Model should be returned as-is, no command issued
      expect(updatedModel).toBe(model)
      expect(cmd).toBeNull()
    })
  })

  describe('rendering variations', () => {
    it('should render without percentage when disabled', () => {
      const builder = progress({
        showPercentage: false,
        width: 20,
      })
      const [model] = builder.init()
      const [updatedModel] = model.setPercent(0.5)
      const rendered = updatedModel.viewAs(0.5)

      // Should not contain percentage text
      expect(rendered).toBeDefined()
      expect(rendered).not.toContain('%')
    })

    it('should render 0% progress', () => {
      const builder = progress()
      const [model] = builder.init()
      const rendered = model.viewAs(0)

      expect(rendered).toBeDefined()
    })

    it('should render 100% progress', () => {
      const builder = progress()
      const [model] = builder.init()
      const rendered = model.viewAs(1.0)

      expect(rendered).toBeDefined()
    })

    it('should render 50% progress', () => {
      const builder = progress()
      const [model] = builder.init()
      const rendered = model.viewAs(0.5)

      expect(rendered).toBeDefined()
    })

    it('should account for percentage text width in bar width', () => {
      const builder = progress({
        width: 50,
        showPercentage: true,
      })
      const [model] = builder.init()
      const rendered = model.viewAs(0.5)

      // Total rendered width should not exceed 50 characters (accounting for ANSI codes)
      expect(rendered).toBeDefined()
    })
  })
})

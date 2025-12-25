import { describe, expect, it } from 'vitest'
import { CodeModel } from '@/index.js'
import { NodeFileSystemAdapter, NodePathAdapter } from '@suds-cli/machine/node'

describe('CodeModel', () => {
  const filesystem = new NodeFileSystemAdapter()
  const path = new NodePathAdapter()

  it('creates a new model with defaults', () => {
    const model = CodeModel.new({ filesystem, path })
    expect(model.active).toBe(false)
    expect(model.syntaxTheme).toBe('dracula')
    expect(model.filename).toBe('')
    expect(model.highlightedContent).toBe('')
  })

  it('creates a model with active=true', () => {
    const model = CodeModel.new({ filesystem, path, active: true })
    expect(model.active).toBe(true)
  })

  it('creates a model with custom theme', () => {
    const model = CodeModel.new({ filesystem, path, syntaxTheme: 'monokai' })
    expect(model.syntaxTheme).toBe('monokai')
  })

  it('sets active state', () => {
    const model = CodeModel.new({ filesystem, path })
    const updated = model.setIsActive(true)
    expect(updated.active).toBe(true)
  })

  it('sets syntax theme', () => {
    const model = CodeModel.new({ filesystem, path })
    const updated = model.setSyntaxTheme('github-dark')
    expect(updated.syntaxTheme).toBe('github-dark')
  })

  it('sets size', () => {
    const model = CodeModel.new({ filesystem, path })
    const updated = model.setSize(80, 24)
    expect(updated.viewport.width).toBe(80)
    expect(updated.viewport.height).toBe(24)
  })

  it('scrolls to top', () => {
    const model = CodeModel.new({ filesystem, path, width: 80, height: 10 })
    const updated = model.gotoTop()
    expect(updated.viewport.yOffset).toBe(0)
  })

  it('returns padded view for empty content', () => {
    const model = CodeModel.new({ filesystem, path, width: 10, height: 5 })
    const view = model.view()
    // Viewport pads to height with newlines
    expect(view).toBe('\n\n\n\n')
  })
})

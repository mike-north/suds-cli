import { describe, expect, it } from 'vitest'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import { code } from '../../src/components/code.js'

// Mock filesystem adapter for testing
const mockFileSystem: FileSystemAdapter = {
  readFile: async (_path: string) => {
    return Buffer.from('console.log("Hello World")')
  },
  writeFile: async (_path: string, _data: string | Buffer) => {},
  exists: async (_path: string) => true,
  stat: async (_path: string) => ({
    isFile: () => true,
    isDirectory: () => false,
    size: 100,
    mtime: new Date(),
  }),
  readdir: async (_path: string) => [],
  mkdir: async (_path: string) => {},
  rmdir: async (_path: string) => {},
  unlink: async (_path: string) => {},
}

// Mock path adapter for testing
const mockPath: PathAdapter = {
  join: (...segments: string[]) => segments.join('/'),
  resolve: (...segments: string[]) => segments.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
  basename: (p: string) => p.split('/').pop() ?? '',
  extname: (p: string) => {
    const base = p.split('/').pop() ?? ''
    const dotIndex = base.lastIndexOf('.')
    return dotIndex > 0 ? base.slice(dotIndex) : ''
  },
  relative: (_from: string, to: string) => to,
  isAbsolute: (p: string) => p.startsWith('/'),
  normalize: (p: string) => p,
  sep: '/',
}

describe('code component builder', () => {
  it('should create a component builder with required filesystem and path adapters', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined() // CodeModel.init() returns viewport init cmd
  })

  it('should initialize with custom options', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
      active: true,
      theme: 'monokai',
      width: 100,
      height: 30,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(model.active).toBe(true)
    expect(model.syntaxTheme).toBe('monokai')
    expect(model.viewport.width).toBe(100)
    expect(model.viewport.height).toBe(30)
  })

  it('should use default theme when not specified', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()

    expect(model.syntaxTheme).toBe('dracula')
  })

  it('should set active to false by default', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()

    expect(model.active).toBe(false)
  })

  it('should set default width and height to 0', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()

    expect(model.viewport.width).toBe(0)
    expect(model.viewport.height).toBe(0)
  })

  it('should render empty content initially', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()
    const rendered = builder.view(model)

    // Initially no file is loaded, so view should be empty
    expect(rendered).toBe('')
  })

  it('should handle update messages', () => {
    const builder = code({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })
})

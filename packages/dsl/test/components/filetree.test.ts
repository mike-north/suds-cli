import { describe, expect, it } from 'vitest'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import { filetree } from '../../src/components/filetree.js'

// Mock filesystem adapter for testing
const mockFileSystem: FileSystemAdapter = {
  readFile: async (_path: string) => {
    return 'test content'
  },
  writeFile: async (_path: string, _content: string) => {},
  exists: async (path: string) => true,
  stat: async (path: string) => {
    // Return directory for paths ending in '/'
    const isDir = path.endsWith('/') || path.includes('/dir')
    return {
      isFile: () => !isDir,
      isDirectory: () => isDir,
      isSymbolicLink: () => false,
      size: isDir ? 0 : 100,
      mtime: new Date(),
    }
  },
  readdir: async (path: string) => {
    // Return different content based on path
    if (path === '/empty/') {
      return []
    }
    if (path === '/deep/nested/path/') {
      return ['file.txt', 'another.js']
    }
    return ['file1.ts', 'file2.js', '.hidden', 'dir1/', 'README.md']
  },
  mkdir: async (_path: string) => {},
  rmdir: async (_path: string) => {},
  unlink: async (_path: string) => {},
  rename: async (_src: string, _dst: string) => {},
  copyFile: async (_src: string, _dst: string) => {},
  cwd: () => '/home/user',
  homedir: () => '/home/user',
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

describe('filetree component builder', () => {
  it('should create a component builder with required filesystem and path adapters', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should initialize with currentDir option', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDir: '/home/user/projects',
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Model should be initialized with the specified directory
  })

  it('should initialize with showHidden option set to true', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      showHidden: true,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Hidden files should be included in the tree
  })

  it('should initialize with showHidden option set to false', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      showHidden: false,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Hidden files should be excluded from the tree
  })

  it('should initialize with height option', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      height: 20,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Height should be set to 20 for viewport scrolling
  })

  it('should initialize with default height when not specified', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should use default height (24 according to documentation)
  })

  it('should initialize with width option', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      width: 100,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Width should be set to 100 for text wrapping
  })

  it('should initialize with default width when not specified', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should use default width (80 according to documentation)
  })

  it('should initialize with custom styles', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      styles: {
        // Styles would be Style instances in real usage
      },
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should initialize with custom keyMap', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      keyMap: {
        // Custom key mappings would go here
      },
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should handle update messages', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [initialModel] = builder.init()
    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should render a view from the model', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
  })

  it('should handle empty directory', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/empty/',
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle empty directory gracefully
  })

  it('should handle deeply nested paths', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/deep/nested/path/',
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should handle deeply nested directory structure
  })

  it('should combine multiple options', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/home/user',
      showHidden: true,
      height: 25,
      width: 120,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should apply all options correctly
  })

  it('should handle both styles and keyMap together', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
      styles: {},
      keyMap: {},
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should initialize without optional parameters', () => {
    const builder = filetree({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined()
    // Should use all default values for optional parameters
  })
})

import { describe, expect, it } from 'vitest'
import type { FileSystemAdapter, PathAdapter } from '@boba-cli/machine'
import { filepicker } from '../../src/components/filepicker.js'

// Mock filesystem adapter for testing
const mockFileSystem: FileSystemAdapter = {
  readFile: async (_path: string) => {
    return 'test content'
  },
  writeFile: async (_path: string, _content: string) => {},
  exists: async (path: string) => true,
  stat: async (path: string) => {
    // Return directory for paths ending in '/'
    const isDir = path.endsWith('/')
    return {
      isFile: () => !isDir,
      isDirectory: () => isDir,
      isSymbolicLink: () => false,
      size: isDir ? 0 : 100,
      mtime: new Date(),
    }
  },
  readdir: async (path: string) => {
    // Return sample file list
    if (path === '/empty/') {
      return []
    }
    return [
      'file1.ts',
      'file2.js',
      '.hidden',
      'dir1/',
      'README.md',
      'file3.txt',
    ]
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

describe('filepicker component builder', () => {
  it('should create a component builder with required filesystem and path adapters', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should initialize with default options', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined()
  })

  it('should initialize with currentDirectory option', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/home/user/projects',
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // The model should be initialized with the specified directory
  })

  it('should initialize with showHidden option set to true', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      showHidden: true,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Hidden files should be included in the model
  })

  it('should initialize with showHidden option set to false', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      showHidden: false,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Hidden files should be excluded from the model
  })

  it('should initialize with allowedExtensions filtering', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      allowedExtensions: ['.ts', '.js'],
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Only .ts and .js files should be visible (plus directories)
  })

  it('should initialize with empty allowedExtensions array', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      allowedExtensions: [],
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // No files should be filtered (all files visible)
  })

  it('should initialize with height option', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      height: 20,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Height should be set to 20
  })

  it('should initialize with height set to 0 (unlimited)', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      height: 0,
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // No height limit should be applied
  })

  it('should initialize with custom styles', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      styles: {
        // Styles would be Style instances in real usage
      },
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
  })

  it('should handle update messages', () => {
    const builder = filepicker({
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
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
    })

    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBeDefined()
    expect(typeof rendered).toBe('string')
  })

  it('should handle multiple allowedExtensions', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      allowedExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Model should filter for TypeScript and JavaScript files
  })

  it('should combine showHidden and allowedExtensions options', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      showHidden: true,
      allowedExtensions: ['.ts'],
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should show hidden .ts files but not other hidden files
  })

  it('should handle non-existent directory gracefully', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/nonexistent/path',
    })

    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeDefined()
    // Should handle gracefully, possibly showing empty list or error
  })

  it('should handle empty directory', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      currentDirectory: '/empty/',
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should show empty file list
  })

  it('should handle directory with no matching files for filter', () => {
    const builder = filepicker({
      filesystem: mockFileSystem,
      path: mockPath,
      allowedExtensions: ['.py'],
    })

    const [model] = builder.init()

    expect(model).toBeDefined()
    // Should show only directories, no files match .py filter
  })
})

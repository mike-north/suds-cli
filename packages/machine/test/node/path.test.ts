import * as nodePath from 'node:path'
import { describe, expect, it } from 'vitest'
import { NodePathAdapter } from '../../src/node/path.js'

describe('NodePathAdapter', () => {
  const adapter = new NodePathAdapter()

  describe('sep', () => {
    it('returns platform-specific path separator', () => {
      expect(adapter.sep).toBe(nodePath.sep)
    })
  })

  describe('join', () => {
    it('joins path segments', () => {
      const result = adapter.join('a', 'b', 'c')
      expect(result).toBe(nodePath.join('a', 'b', 'c'))
    })

    it('handles empty segments', () => {
      const result = adapter.join('a', '', 'b')
      expect(result).toBe(nodePath.join('a', '', 'b'))
    })

    it('handles single segment', () => {
      const result = adapter.join('a')
      expect(result).toBe(nodePath.join('a'))
    })

    it('handles no segments', () => {
      const result = adapter.join()
      expect(result).toBe(nodePath.join())
    })

    it('normalizes path separators', () => {
      const result = adapter.join('a/b', 'c/d')
      expect(result).toBe(nodePath.join('a/b', 'c/d'))
    })
  })

  describe('dirname', () => {
    it('returns directory name from path', () => {
      const result = adapter.dirname('/a/b/c.txt')
      expect(result).toBe(nodePath.dirname('/a/b/c.txt'))
    })

    it('handles root path', () => {
      const result = adapter.dirname('/')
      expect(result).toBe(nodePath.dirname('/'))
    })

    it('handles relative path', () => {
      const result = adapter.dirname('a/b/c.txt')
      expect(result).toBe(nodePath.dirname('a/b/c.txt'))
    })

    it('handles path with no directory', () => {
      const result = adapter.dirname('file.txt')
      expect(result).toBe(nodePath.dirname('file.txt'))
    })
  })

  describe('basename', () => {
    it('returns base name from path', () => {
      const result = adapter.basename('/a/b/c.txt')
      expect(result).toBe(nodePath.basename('/a/b/c.txt'))
    })

    it('removes extension when provided', () => {
      const result = adapter.basename('/a/b/c.txt', '.txt')
      expect(result).toBe(nodePath.basename('/a/b/c.txt', '.txt'))
    })

    it('handles path without extension', () => {
      const result = adapter.basename('/a/b/c')
      expect(result).toBe(nodePath.basename('/a/b/c'))
    })

    it('handles file name only', () => {
      const result = adapter.basename('file.txt')
      expect(result).toBe(nodePath.basename('file.txt'))
    })
  })

  describe('extname', () => {
    it('returns file extension', () => {
      const result = adapter.extname('file.txt')
      expect(result).toBe(nodePath.extname('file.txt'))
    })

    it('returns empty string for no extension', () => {
      const result = adapter.extname('file')
      expect(result).toBe(nodePath.extname('file'))
    })

    it('handles multiple dots', () => {
      const result = adapter.extname('file.tar.gz')
      expect(result).toBe(nodePath.extname('file.tar.gz'))
    })

    it('handles hidden files', () => {
      const result = adapter.extname('.gitignore')
      expect(result).toBe(nodePath.extname('.gitignore'))
    })

    it('handles path with directory', () => {
      const result = adapter.extname('/a/b/file.txt')
      expect(result).toBe(nodePath.extname('/a/b/file.txt'))
    })
  })

  describe('resolve', () => {
    it('resolves path segments to absolute path', () => {
      const result = adapter.resolve('a', 'b', 'c')
      expect(result).toBe(nodePath.resolve('a', 'b', 'c'))
    })

    it('handles absolute path in middle', () => {
      const result = adapter.resolve('a', '/b', 'c')
      expect(result).toBe(nodePath.resolve('a', '/b', 'c'))
    })

    it('handles no arguments', () => {
      const result = adapter.resolve()
      expect(result).toBe(nodePath.resolve())
    })

    it('handles single segment', () => {
      const result = adapter.resolve('a')
      expect(result).toBe(nodePath.resolve('a'))
    })
  })

  describe('isAbsolute', () => {
    it('returns true for absolute path', () => {
      const absolutePath = nodePath.resolve('/')
      const result = adapter.isAbsolute(absolutePath)
      expect(result).toBe(nodePath.isAbsolute(absolutePath))
    })

    it('returns false for relative path', () => {
      const result = adapter.isAbsolute('a/b/c')
      expect(result).toBe(nodePath.isAbsolute('a/b/c'))
    })

    it('handles empty string', () => {
      const result = adapter.isAbsolute('')
      expect(result).toBe(nodePath.isAbsolute(''))
    })

    it('handles dot path', () => {
      const result = adapter.isAbsolute('.')
      expect(result).toBe(nodePath.isAbsolute('.'))
    })
  })

  describe('normalize', () => {
    it('normalizes path', () => {
      const result = adapter.normalize('a//b/../c')
      expect(result).toBe(nodePath.normalize('a//b/../c'))
    })

    it('handles multiple slashes', () => {
      const result = adapter.normalize('a///b/c')
      expect(result).toBe(nodePath.normalize('a///b/c'))
    })

    it('handles dot segments', () => {
      const result = adapter.normalize('a/./b')
      expect(result).toBe(nodePath.normalize('a/./b'))
    })

    it('handles empty path', () => {
      const result = adapter.normalize('')
      expect(result).toBe(nodePath.normalize(''))
    })

    it('handles absolute path', () => {
      const result = adapter.normalize('/a/b/../c')
      expect(result).toBe(nodePath.normalize('/a/b/../c'))
    })
  })
})

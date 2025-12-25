import { describe, expect, it } from 'vitest'
import { BrowserPathAdapter } from '../../src/browser/path.js'

describe('BrowserPathAdapter', () => {
  const adapter = new BrowserPathAdapter()

  describe('sep', () => {
    it('uses forward slash as separator', () => {
      expect(adapter.sep).toBe('/')
    })
  })

  describe('join', () => {
    it('joins path segments', () => {
      expect(adapter.join('a', 'b', 'c')).toBe('a/b/c')
    })

    it('handles empty segments', () => {
      expect(adapter.join('a', '', 'b')).toBe('a/b')
    })

    it('handles single segment', () => {
      expect(adapter.join('a')).toBe('a')
    })

    it('handles no segments', () => {
      expect(adapter.join()).toBe('.')
    })

    it('normalizes result', () => {
      expect(adapter.join('a', 'b', '..', 'c')).toBe('a/c')
    })

    it('handles absolute paths', () => {
      expect(adapter.join('/a', 'b', 'c')).toBe('/a/b/c')
    })

    it('handles all empty segments', () => {
      expect(adapter.join('', '', '')).toBe('.')
    })

    it('handles trailing slashes', () => {
      expect(adapter.join('a/', 'b/', 'c/')).toBe('a/b/c')
    })
  })

  describe('dirname', () => {
    it('returns directory name from path', () => {
      expect(adapter.dirname('/a/b/c.txt')).toBe('/a/b')
    })

    it('handles root path', () => {
      expect(adapter.dirname('/')).toBe('/')
    })

    it('handles relative path', () => {
      expect(adapter.dirname('a/b/c.txt')).toBe('a/b')
    })

    it('handles path with no directory', () => {
      expect(adapter.dirname('file.txt')).toBe('.')
    })

    it('handles empty string', () => {
      expect(adapter.dirname('')).toBe('.')
    })

    it('handles trailing slashes', () => {
      expect(adapter.dirname('/a/b/')).toBe('/a')
    })

    it('handles single-level path from root', () => {
      expect(adapter.dirname('/a')).toBe('/')
    })
  })

  describe('basename', () => {
    it('returns base name from path', () => {
      expect(adapter.basename('/a/b/c.txt')).toBe('c.txt')
    })

    it('removes extension when provided', () => {
      expect(adapter.basename('/a/b/c.txt', '.txt')).toBe('c')
    })

    it('handles path without extension', () => {
      expect(adapter.basename('/a/b/c')).toBe('c')
    })

    it('handles file name only', () => {
      expect(adapter.basename('file.txt')).toBe('file.txt')
    })

    it('handles empty string', () => {
      expect(adapter.basename('')).toBe('')
    })

    it('handles trailing slashes', () => {
      expect(adapter.basename('/a/b/')).toBe('b')
    })

    it('handles root path', () => {
      expect(adapter.basename('/')).toBe('')
    })

    it('does not remove non-matching extension', () => {
      expect(adapter.basename('file.txt', '.md')).toBe('file.txt')
    })
  })

  describe('extname', () => {
    it('returns file extension', () => {
      expect(adapter.extname('file.txt')).toBe('.txt')
    })

    it('returns empty string for no extension', () => {
      expect(adapter.extname('file')).toBe('')
    })

    it('handles multiple dots', () => {
      expect(adapter.extname('file.tar.gz')).toBe('.gz')
    })

    it('handles hidden files', () => {
      expect(adapter.extname('.gitignore')).toBe('')
    })

    it('handles path with directory', () => {
      expect(adapter.extname('/a/b/file.txt')).toBe('.txt')
    })

    it('handles empty string', () => {
      expect(adapter.extname('')).toBe('')
    })

    it('handles file ending with dot', () => {
      expect(adapter.extname('file.')).toBe('')
    })
  })

  describe('resolve', () => {
    it('resolves path segments to absolute path', () => {
      const result = adapter.resolve('a', 'b', 'c')
      expect(result).toBe('/a/b/c')
    })

    it('handles absolute path in middle', () => {
      const result = adapter.resolve('a', '/b', 'c')
      expect(result).toBe('/b/c')
    })

    it('handles no arguments', () => {
      const result = adapter.resolve()
      expect(result).toBe('/')
    })

    it('handles single segment', () => {
      const result = adapter.resolve('a')
      expect(result).toBe('/a')
    })

    it('handles .. segments', () => {
      const result = adapter.resolve('/a/b', '..', 'c')
      expect(result).toBe('/a/c')
    })

    it('handles . segments', () => {
      const result = adapter.resolve('/a', '.', 'b')
      expect(result).toBe('/a/b')
    })

    it('stops at first absolute path when reading right-to-left', () => {
      const result = adapter.resolve('a', '/b', 'c', '/d', 'e')
      expect(result).toBe('/d/e')
    })
  })

  describe('isAbsolute', () => {
    it('returns true for absolute path', () => {
      expect(adapter.isAbsolute('/a/b/c')).toBe(true)
    })

    it('returns false for relative path', () => {
      expect(adapter.isAbsolute('a/b/c')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(adapter.isAbsolute('')).toBe(false)
    })

    it('returns false for dot path', () => {
      expect(adapter.isAbsolute('.')).toBe(false)
    })

    it('returns true for root', () => {
      expect(adapter.isAbsolute('/')).toBe(true)
    })
  })

  describe('normalize', () => {
    it('normalizes path', () => {
      expect(adapter.normalize('a//b/../c')).toBe('a/c')
    })

    it('handles multiple slashes', () => {
      expect(adapter.normalize('a///b/c')).toBe('a/b/c')
    })

    it('handles dot segments', () => {
      expect(adapter.normalize('a/./b')).toBe('a/b')
    })

    it('handles empty path', () => {
      expect(adapter.normalize('')).toBe('.')
    })

    it('handles absolute path', () => {
      expect(adapter.normalize('/a/b/../c')).toBe('/a/c')
    })

    it('handles .. at start of relative path', () => {
      expect(adapter.normalize('../a/b')).toBe('../a/b')
    })

    it('handles .. beyond root in absolute path', () => {
      expect(adapter.normalize('/a/../../b')).toBe('/b')
    })

    it('handles trailing slash for directories', () => {
      expect(adapter.normalize('a/b/')).toBe('a/b/')
    })

    it('does not add trailing slash to root', () => {
      expect(adapter.normalize('/')).toBe('/')
    })

    it('handles consecutive .. segments', () => {
      expect(adapter.normalize('a/b/c/../../d')).toBe('a/d')
    })

    it('handles . segments mixed with ..', () => {
      expect(adapter.normalize('a/./b/../c')).toBe('a/c')
    })
  })

  describe('edge cases', () => {
    it('join handles mixed absolute and relative segments', () => {
      expect(adapter.join('/a', 'b', '/c')).toBe('/a/b/c')
    })

    it('basename handles multiple trailing slashes', () => {
      expect(adapter.basename('/a/b///')).toBe('b')
    })

    it('dirname handles only slashes', () => {
      expect(adapter.dirname('///')).toBe('/')
    })

    it('normalize handles only dots', () => {
      expect(adapter.normalize('./././')).toBe('./')
    })

    it('resolve handles empty strings in segments', () => {
      expect(adapter.resolve('a', '', 'b')).toBe('/a/b')
    })
  })
})

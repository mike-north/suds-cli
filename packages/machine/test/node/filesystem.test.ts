import { mkdir, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { NodeFileSystemAdapter } from '../../src/node/filesystem.js'

describe('NodeFileSystemAdapter', () => {
  let adapter: NodeFileSystemAdapter
  let testDir: string

  beforeEach(async () => {
    adapter = new NodeFileSystemAdapter()
    // Create unique test directory
    testDir = join(tmpdir(), `machine-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('writeFile and readFile', () => {
    it('writes and reads text files', async () => {
      const filePath = join(testDir, 'test.txt')
      const content = 'Hello, World!'

      await adapter.writeFile(filePath, content)
      const result = await adapter.readFile(filePath)

      expect(result).toBe(content)
    })

    it('reads file with custom encoding', async () => {
      const filePath = join(testDir, 'test-utf8.txt')
      const content = 'Hello, UTF-8! 👋'

      await adapter.writeFile(filePath, content)
      const result = await adapter.readFile(filePath, 'utf-8')

      expect(result).toBe(content)
    })

    it('overwrites existing files', async () => {
      const filePath = join(testDir, 'overwrite.txt')

      await adapter.writeFile(filePath, 'first')
      await adapter.writeFile(filePath, 'second')
      const result = await adapter.readFile(filePath)

      expect(result).toBe('second')
    })
  })

  describe('exists', () => {
    it('returns true for existing file', async () => {
      const filePath = join(testDir, 'exists.txt')
      await adapter.writeFile(filePath, 'content')

      const result = await adapter.exists(filePath)

      expect(result).toBe(true)
    })

    it('returns true for existing directory', async () => {
      const result = await adapter.exists(testDir)

      expect(result).toBe(true)
    })

    it('returns false for non-existent path', async () => {
      const result = await adapter.exists(join(testDir, 'does-not-exist.txt'))

      expect(result).toBe(false)
    })
  })

  describe('stat', () => {
    it('returns stats for file', async () => {
      const filePath = join(testDir, 'stat-test.txt')
      const content = 'test content'
      await adapter.writeFile(filePath, content)

      const stats = await adapter.stat(filePath)

      expect(stats.size).toBeGreaterThan(0)
      expect(stats.isFile).toBe(true)
      expect(stats.isDirectory).toBe(false)
      expect(stats.isSymbolicLink).toBe(false)
      expect(stats.mtime).toBeInstanceOf(Date)
      expect(typeof stats.mode).toBe('number')
    })

    it('returns stats for directory', async () => {
      const stats = await adapter.stat(testDir)

      expect(stats.isDirectory).toBe(true)
      expect(stats.isFile).toBe(false)
      expect(stats.isSymbolicLink).toBe(false)
    })

    it('throws for non-existent path', async () => {
      await expect(adapter.stat(join(testDir, 'does-not-exist.txt'))).rejects.toThrow()
    })
  })

  describe('mkdir', () => {
    it('creates directory', async () => {
      const dirPath = join(testDir, 'new-dir')

      await adapter.mkdir(dirPath)
      const exists = await adapter.exists(dirPath)

      expect(exists).toBe(true)
    })

    it('creates nested directories with recursive option', async () => {
      const dirPath = join(testDir, 'a', 'b', 'c')

      await adapter.mkdir(dirPath, { recursive: true })
      const exists = await adapter.exists(dirPath)

      expect(exists).toBe(true)
    })

    it('throws when creating nested directories without recursive option', async () => {
      const dirPath = join(testDir, 'x', 'y', 'z')

      await expect(adapter.mkdir(dirPath)).rejects.toThrow()
    })
  })

  describe('readdir', () => {
    beforeEach(async () => {
      // Create test files and directories
      await adapter.writeFile(join(testDir, 'file1.txt'), 'content1')
      await adapter.writeFile(join(testDir, 'file2.txt'), 'content2')
      await adapter.mkdir(join(testDir, 'subdir'))
    })

    it('returns file names by default', async () => {
      const entries = await adapter.readdir(testDir)

      expect(Array.isArray(entries)).toBe(true)
      expect(entries).toContain('file1.txt')
      expect(entries).toContain('file2.txt')
      expect(entries).toContain('subdir')
      expect(entries.every((e) => typeof e === 'string')).toBe(true)
    })

    it('returns directory entries with withFileTypes option', async () => {
      const entries = await adapter.readdir(testDir, { withFileTypes: true })

      expect(Array.isArray(entries)).toBe(true)
      expect(entries.length).toBe(3)

      const file1 = entries.find((e) => e.name === 'file1.txt')
      expect(file1?.isFile()).toBe(true)
      expect(file1?.isDirectory()).toBe(false)

      const subdir = entries.find((e) => e.name === 'subdir')
      expect(subdir?.isDirectory()).toBe(true)
      expect(subdir?.isFile()).toBe(false)
    })

    it('returns empty array for empty directory', async () => {
      const emptyDir = join(testDir, 'empty')
      await adapter.mkdir(emptyDir)

      const entries = await adapter.readdir(emptyDir)

      expect(entries).toEqual([])
    })
  })

  describe('unlink', () => {
    it('deletes file', async () => {
      const filePath = join(testDir, 'to-delete.txt')
      await adapter.writeFile(filePath, 'content')

      await adapter.unlink(filePath)
      const exists = await adapter.exists(filePath)

      expect(exists).toBe(false)
    })

    it('throws for non-existent file', async () => {
      await expect(adapter.unlink(join(testDir, 'does-not-exist.txt'))).rejects.toThrow()
    })

    it('throws when trying to delete directory', async () => {
      const dirPath = join(testDir, 'some-dir')
      await adapter.mkdir(dirPath)

      await expect(adapter.unlink(dirPath)).rejects.toThrow()
    })
  })

  describe('rmdir', () => {
    it('removes empty directory', async () => {
      const dirPath = join(testDir, 'empty-dir')
      await adapter.mkdir(dirPath)

      await adapter.rmdir(dirPath)
      const exists = await adapter.exists(dirPath)

      expect(exists).toBe(false)
    })

    it('removes directory with contents when recursive option is set', async () => {
      const dirPath = join(testDir, 'non-empty-dir')
      await adapter.mkdir(dirPath)
      await adapter.writeFile(join(dirPath, 'file.txt'), 'content')

      await adapter.rmdir(dirPath, { recursive: true })
      const exists = await adapter.exists(dirPath)

      expect(exists).toBe(false)
    })

    it('throws when removing non-empty directory without recursive option', async () => {
      const dirPath = join(testDir, 'non-empty-dir-2')
      await adapter.mkdir(dirPath)
      await adapter.writeFile(join(dirPath, 'file.txt'), 'content')

      await expect(adapter.rmdir(dirPath)).rejects.toThrow()
    })
  })

  describe('rename', () => {
    it('renames file', async () => {
      const oldPath = join(testDir, 'old-name.txt')
      const newPath = join(testDir, 'new-name.txt')
      await adapter.writeFile(oldPath, 'content')

      await adapter.rename(oldPath, newPath)

      expect(await adapter.exists(oldPath)).toBe(false)
      expect(await adapter.exists(newPath)).toBe(true)
      expect(await adapter.readFile(newPath)).toBe('content')
    })

    it('moves file to different directory', async () => {
      const subdir = join(testDir, 'subdir')
      await adapter.mkdir(subdir)
      const oldPath = join(testDir, 'file.txt')
      const newPath = join(subdir, 'file.txt')
      await adapter.writeFile(oldPath, 'content')

      await adapter.rename(oldPath, newPath)

      expect(await adapter.exists(oldPath)).toBe(false)
      expect(await adapter.exists(newPath)).toBe(true)
    })
  })

  describe('copyFile', () => {
    it('copies file', async () => {
      const srcPath = join(testDir, 'source.txt')
      const dstPath = join(testDir, 'destination.txt')
      const content = 'file content'
      await adapter.writeFile(srcPath, content)

      await adapter.copyFile(srcPath, dstPath)

      expect(await adapter.exists(srcPath)).toBe(true)
      expect(await adapter.exists(dstPath)).toBe(true)
      expect(await adapter.readFile(dstPath)).toBe(content)
    })

    it('throws when source does not exist', async () => {
      const srcPath = join(testDir, 'does-not-exist.txt')
      const dstPath = join(testDir, 'destination.txt')

      await expect(adapter.copyFile(srcPath, dstPath)).rejects.toThrow()
    })
  })

  describe('cwd', () => {
    it('returns current working directory', () => {
      const result = adapter.cwd()

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBe(process.cwd())
    })
  })

  describe('homedir', () => {
    it('returns home directory', () => {
      const result = adapter.homedir()

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toBe(homedir())
    })
  })
})

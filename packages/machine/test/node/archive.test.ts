import { describe, expect, it, vi } from 'vitest'
import { NodeArchiveAdapter } from '../../src/node/archive.js'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('NodeArchiveAdapter', () => {
  describe('constructor', () => {
    it('creates adapter and checks for archiver/unzipper availability', () => {
      const adapter = new NodeArchiveAdapter()
      expect(adapter).toBeInstanceOf(NodeArchiveAdapter)
    })
  })

  describe('isAvailable', () => {
    it('returns boolean indicating archiver and unzipper availability', () => {
      const adapter = new NodeArchiveAdapter()
      const available = adapter.isAvailable()
      expect(typeof available).toBe('boolean')
    })
  })

  describe('zip', () => {
    it('throws error when archiver is not available', async () => {
      // Create a mock adapter that thinks archiver is not available
      const adapter = new NodeArchiveAdapter()

      // Use reflection to override the private hasArchiver property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(adapter as any).hasArchiver = false

      await expect(
        adapter.zip('/some/source', '/some/dest.zip'),
      ).rejects.toThrow('Archive operations not available: archiver package not found')
    })

    it('creates zip archive from directory [graceful-degradation]', async () => {
      // This test validates actual zip functionality if archiver is available
      // It should gracefully skip if archiver is not installed
      const adapter = new NodeArchiveAdapter()

      if (!adapter.isAvailable()) {
        // Skip test if archiver/unzipper not available
        return
      }

      // Create a temporary directory with a test file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'))
      const sourceDir = path.join(tempDir, 'source')
      const zipPath = path.join(tempDir, 'output.zip')

      try {
        await fs.mkdir(sourceDir)
        await fs.writeFile(path.join(sourceDir, 'test.txt'), 'Hello, World!')

        await adapter.zip(sourceDir, zipPath)

        // Verify zip file was created
        const stats = await fs.stat(zipPath)
        expect(stats.isFile()).toBe(true)
        expect(stats.size).toBeGreaterThan(0)
      } finally {
        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true })
      }
    })

    it('creates zip archive from file [graceful-degradation]', async () => {
      // This test validates actual zip functionality if archiver is available
      const adapter = new NodeArchiveAdapter()

      if (!adapter.isAvailable()) {
        // Skip test if archiver/unzipper not available
        return
      }

      // Create a temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'))
      const sourceFile = path.join(tempDir, 'test.txt')
      const zipPath = path.join(tempDir, 'output.zip')

      try {
        await fs.writeFile(sourceFile, 'Test content')

        await adapter.zip(sourceFile, zipPath)

        // Verify zip file was created
        const stats = await fs.stat(zipPath)
        expect(stats.isFile()).toBe(true)
        expect(stats.size).toBeGreaterThan(0)
      } finally {
        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true })
      }
    })
  })

  describe('unzip', () => {
    it('throws error when unzipper is not available', async () => {
      // Create a mock adapter that thinks unzipper is not available
      const adapter = new NodeArchiveAdapter()

      // Use reflection to override the private hasUnzipper property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(adapter as any).hasUnzipper = false

      await expect(
        adapter.unzip('/some/archive.zip', '/some/dest'),
      ).rejects.toThrow('Archive operations not available: unzipper package not found')
    })

    it('extracts zip archive [graceful-degradation]', async () => {
      // This test validates actual unzip functionality if archiver/unzipper are available
      const adapter = new NodeArchiveAdapter()

      if (!adapter.isAvailable()) {
        // Skip test if archiver/unzipper not available
        return
      }

      // Create a temporary directory and zip file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'archive-test-'))
      const sourceDir = path.join(tempDir, 'source')
      const zipPath = path.join(tempDir, 'test.zip')
      const extractDir = path.join(tempDir, 'extracted')

      try {
        // Create source directory with test file
        await fs.mkdir(sourceDir)
        await fs.writeFile(
          path.join(sourceDir, 'test.txt'),
          'Extract me!',
        )

        // Create zip
        await adapter.zip(sourceDir, zipPath)

        // Extract zip
        await adapter.unzip(zipPath, extractDir)

        // Verify extraction
        const extractedFile = path.join(extractDir, 'test.txt')
        const content = await fs.readFile(extractedFile, 'utf-8')
        expect(content).toBe('Extract me!')
      } finally {
        // Clean up
        await fs.rm(tempDir, { recursive: true, force: true })
      }
    })
  })
})

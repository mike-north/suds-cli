import { describe, expect, it } from 'vitest'
import { BrowserFileSystemAdapter } from '../../src/browser/filesystem.js'

describe('BrowserFileSystemAdapter', () => {
  const adapter = new BrowserFileSystemAdapter()
  const errorMessage = 'FileSystem operations are not available in browser environments'

  describe('all methods throw errors', () => {
    it('readdir throws error', async () => {
      await expect(adapter.readdir('/test')).rejects.toThrow(errorMessage)
    })

    it('readdir with options throws error', async () => {
      await expect(adapter.readdir('/test', { withFileTypes: true })).rejects.toThrow(errorMessage)
    })

    it('stat throws error', async () => {
      await expect(adapter.stat('/test')).rejects.toThrow(errorMessage)
    })

    it('readFile throws error', async () => {
      await expect(adapter.readFile('/test')).rejects.toThrow(errorMessage)
    })

    it('writeFile throws error', async () => {
      await expect(adapter.writeFile('/test', 'content')).rejects.toThrow(errorMessage)
    })

    it('exists throws error', async () => {
      await expect(adapter.exists('/test')).rejects.toThrow(errorMessage)
    })

    it('mkdir throws error', async () => {
      await expect(adapter.mkdir('/test')).rejects.toThrow(errorMessage)
    })

    it('unlink throws error', async () => {
      await expect(adapter.unlink('/test')).rejects.toThrow(errorMessage)
    })

    it('rmdir throws error', async () => {
      await expect(adapter.rmdir('/test')).rejects.toThrow(errorMessage)
    })

    it('rename throws error', async () => {
      await expect(adapter.rename('/old', '/new')).rejects.toThrow(errorMessage)
    })

    it('copyFile throws error', async () => {
      await expect(adapter.copyFile('/src', '/dst')).rejects.toThrow(errorMessage)
    })

    it('cwd throws error', () => {
      expect(() => adapter.cwd()).toThrow(errorMessage)
    })

    it('homedir throws error', () => {
      expect(() => adapter.homedir()).toThrow(errorMessage)
    })
  })
})

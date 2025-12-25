import { describe, expect, it } from 'vitest'
import { BrowserArchiveAdapter } from '../../src/browser/archive.js'

describe('BrowserArchiveAdapter', () => {
  describe('constructor', () => {
    it('creates adapter', () => {
      const adapter = new BrowserArchiveAdapter()
      expect(adapter).toBeInstanceOf(BrowserArchiveAdapter)
    })
  })

  describe('isAvailable', () => {
    it('returns false in browser environment', () => {
      const adapter = new BrowserArchiveAdapter()
      expect(adapter.isAvailable()).toBe(false)
    })
  })

  describe('zip', () => {
    it('throws error indicating archive not available', async () => {
      const adapter = new BrowserArchiveAdapter()
      await expect(
        adapter.zip('/some/source', '/some/dest.zip'),
      ).rejects.toThrow('Archive operations not available in browser environment')
    })
  })

  describe('unzip', () => {
    it('throws error indicating archive not available', async () => {
      const adapter = new BrowserArchiveAdapter()
      await expect(
        adapter.unzip('/some/archive.zip', '/some/dest'),
      ).rejects.toThrow('Archive operations not available in browser environment')
    })
  })
})

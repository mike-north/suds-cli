import { describe, it, expect } from 'vitest'
import { FiletreeModel } from '../src/model.js'
import { GetDirectoryListingMsg } from '../src/messages.js'
import { convertBytesToSizeString } from '../src/fs.js'
import { KeyMsg, KeyType } from '@suds-cli/tea'
import { NodeFileSystemAdapter, NodePathAdapter } from '@suds-cli/machine/node'

describe('FiletreeModel', () => {
  const filesystem = new NodeFileSystemAdapter()
  const path = new NodePathAdapter()

  it('should create a new model with defaults', () => {
    const model = FiletreeModel.new({ filesystem, path })
    expect(model.cursor).toBe(0)
    expect(model.files).toEqual([])
    expect(model.active).toBe(true)
  })

  it('should create a model with custom options', () => {
    const model = FiletreeModel.new({
      filesystem,
      path,
      currentDir: '/tmp',
      showHidden: true,
      width: 100,
      height: 30,
    })

    expect(model.currentDir).toBe('/tmp')
    expect(model.showHidden).toBe(true)
    expect(model.width).toBe(100)
    expect(model.height).toBe(30)
  })

  it('should set active state', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const inactive = model.setIsActive(false)

    expect(model.active).toBe(true)
    expect(inactive.active).toBe(false)
  })

  it('should handle directory listing message', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const items = [
      {
        name: 'file1.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
        path: '/tmp/file1.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
      {
        name: 'dir1',
        details: '2024-01-15 10:30:00 drwxr-xr-x 0B',
        path: '/tmp/dir1',
        extension: '',
        isDirectory: true,
        currentDirectory: '/tmp',
        mode: 0o40755,
      },
    ]

    const [nextModel] = model.update(new GetDirectoryListingMsg(items))

    expect(nextModel.files).toEqual(items)
    expect(nextModel.cursor).toBe(0)
  })

  it('should navigate down', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const items = [
      {
        name: 'file1.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
        path: '/tmp/file1.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
      {
        name: 'file2.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 2.4K',
        path: '/tmp/file2.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
    ]

    const [withItems] = model.update(new GetDirectoryListingMsg(items))
    const [nextModel] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )

    expect(nextModel.cursor).toBe(1)
  })

  it('should navigate up', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const items = [
      {
        name: 'file1.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
        path: '/tmp/file1.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
      {
        name: 'file2.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 2.4K',
        path: '/tmp/file2.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
    ]

    const [withItems] = model.update(new GetDirectoryListingMsg(items))
    const [atSecond] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    const [nextModel] = atSecond.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'k', alt: false, paste: false }),
    )

    expect(nextModel.cursor).toBe(0)
  })

  it('should get selected file', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const items = [
      {
        name: 'file1.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
        path: '/tmp/file1.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
    ]

    const [withItems] = model.update(new GetDirectoryListingMsg(items))

    expect(withItems.selectedFile).toEqual(items[0])
  })
})

describe('convertBytesToSizeString', () => {
  it('should format bytes correctly', () => {
    expect(convertBytesToSizeString(0)).toBe('0B')
    expect(convertBytesToSizeString(500)).toBe('500B')
    expect(convertBytesToSizeString(1024)).toBe('1.0K')
    expect(convertBytesToSizeString(1536)).toBe('1.5K')
    expect(convertBytesToSizeString(1048576)).toBe('1.0M')
    expect(convertBytesToSizeString(1073741824)).toBe('1.0G')
  })
})

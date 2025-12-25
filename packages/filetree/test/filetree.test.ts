import { describe, it, expect } from 'vitest'
import { FiletreeModel } from '../src/model.js'
import { GetDirectoryListingMsg, ErrorMsg } from '../src/messages.js'
import { convertBytesToSizeString } from '../src/fs.js'
import { KeyMsg, KeyType, WindowSizeMsg } from '@suds-cli/tea'
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

  // Edge case tests for navigation
  it('should not navigate when file list is empty', () => {
    const model = FiletreeModel.new({ filesystem, path })

    // Try to navigate down with empty list
    const [afterDown] = model.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(afterDown.cursor).toBe(0)

    // Try to navigate up with empty list
    const [afterUp] = model.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'k', alt: false, paste: false }),
    )
    expect(afterUp.cursor).toBe(0)
  })

  it('should not navigate past first item', () => {
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
    expect(withItems.cursor).toBe(0)

    // Try to navigate up when already at first item
    const [afterUp] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'k', alt: false, paste: false }),
    )
    expect(afterUp.cursor).toBe(0)
  })

  it('should not navigate past last item', () => {
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

    // Navigate to last item
    const [atLast] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(atLast.cursor).toBe(1)

    // Try to navigate past last item
    const [afterDown] = atLast.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(afterDown.cursor).toBe(1)
  })

  // ErrorMsg handling test
  it('should handle error message', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const error = new Error('Permission denied')

    const [nextModel] = model.update(new ErrorMsg(error))

    expect(nextModel.error).toBe(error)
    expect(nextModel.error?.message).toBe('Permission denied')
  })

  // view() rendering tests
  it('should render error state', () => {
    const model = FiletreeModel.new({ filesystem, path })
    const error = new Error('Permission denied')
    const [withError] = model.update(new ErrorMsg(error))

    const view = withError.view()

    expect(view).toBe('Error: Permission denied')
  })

  it('should render empty directory state', () => {
    const model = FiletreeModel.new({ filesystem, path })

    const view = model.view()

    expect(view).toContain('(empty directory)')
  })

  it('should render file list with selected item', () => {
    const model = FiletreeModel.new({ filesystem, path, height: 10 })
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
    const view = withItems.view()

    expect(view).toContain('file1.txt')
    expect(view).toContain('file2.txt')
  })

  // setIsActive behavior test
  it('should ignore keyboard input when inactive', () => {
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
    const inactive = withItems.setIsActive(false)

    // Try to navigate - should be ignored
    const [afterDown] = inactive.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(afterDown.cursor).toBe(0)
    expect(afterDown.active).toBe(false)
  })

  // WindowSizeMsg handling tests
  it('should handle window resize message', () => {
    const model = FiletreeModel.new({ filesystem, path, height: 24, width: 80 })

    const [resized] = model.update(new WindowSizeMsg(100, 30))

    expect(resized.width).toBe(100)
    expect(resized.height).toBe(30)
  })

  it('should clamp cursor when window shrinks', () => {
    const model = FiletreeModel.new({ filesystem, path, height: 10 })
    const items = Array.from({ length: 20 }, (_, i) => ({
      name: `file${i}.txt`,
      details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
      path: `/tmp/file${i}.txt`,
      extension: '.txt',
      isDirectory: false,
      currentDirectory: '/tmp',
      mode: 0o100644,
    }))

    const [withItems] = model.update(new GetDirectoryListingMsg(items))

    // Navigate to item 15 (beyond what would be visible in a height=5 viewport)
    let current = withItems
    for (let i = 0; i < 15; i++) {
      const [next] = current.update(
        new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
      )
      current = next
    }
    expect(current.cursor).toBe(15)

    // Shrink window - cursor should remain at 15 but viewport should adjust
    const [shrunk] = current.update(new WindowSizeMsg(80, 5))

    expect(shrunk.cursor).toBe(15)
    expect(shrunk.height).toBe(5)
    // Cursor should be visible within viewport (min <= cursor <= max)
    expect(shrunk.cursor).toBeGreaterThanOrEqual(shrunk.min)
    expect(shrunk.cursor).toBeLessThanOrEqual(shrunk.max)
  })

  it('should adjust viewport to keep cursor visible after resize', () => {
    const model = FiletreeModel.new({ filesystem, path, height: 20 })
    const items = Array.from({ length: 30 }, (_, i) => ({
      name: `file${i}.txt`,
      details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
      path: `/tmp/file${i}.txt`,
      extension: '.txt',
      isDirectory: false,
      currentDirectory: '/tmp',
      mode: 0o100644,
    }))

    const [withItems] = model.update(new GetDirectoryListingMsg(items))

    // Navigate to item 25
    let current = withItems
    for (let i = 0; i < 25; i++) {
      const [next] = current.update(
        new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
      )
      current = next
    }
    expect(current.cursor).toBe(25)

    // Resize to smaller height
    const [resized] = current.update(new WindowSizeMsg(80, 10))

    // Cursor should still be at 25 and visible
    expect(resized.cursor).toBe(25)
    expect(resized.min).toBeLessThanOrEqual(25)
    expect(resized.max).toBeGreaterThanOrEqual(25)
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

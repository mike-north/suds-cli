import { describe, it, expect } from 'vitest'
import { FiletreeModel } from '../src/model.js'
import { GetDirectoryListingMsg, ErrorMsg } from '../src/messages.js'
import { convertBytesToSizeString } from '../src/fs.js'
import { KeyMsg, KeyType, WindowSizeMsg } from '@suds-cli/tea'

describe('FiletreeModel', () => {
  it('should create a new model with defaults', () => {
    const model = FiletreeModel.new()
    expect(model.cursor).toBe(0)
    expect(model.files).toEqual([])
    expect(model.active).toBe(true)
  })

  it('should create a model with custom options', () => {
    const model = FiletreeModel.new({
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
    const model = FiletreeModel.new()
    const inactive = model.setIsActive(false)

    expect(model.active).toBe(true)
    expect(inactive.active).toBe(false)
  })

  it('should handle directory listing message', () => {
    const model = FiletreeModel.new()
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
    const model = FiletreeModel.new()
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
    const model = FiletreeModel.new()
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
    const model = FiletreeModel.new()
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

  it('should not navigate when file list is empty', () => {
    const model = FiletreeModel.new()
    const emptyItems: typeof model.files = []

    const [withEmptyItems] = model.update(
      new GetDirectoryListingMsg(emptyItems),
    )

    // Try to navigate down
    const [afterDown] = withEmptyItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(afterDown.cursor).toBe(0)

    // Try to navigate up
    const [afterUp] = withEmptyItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'k', alt: false, paste: false }),
    )
    expect(afterUp.cursor).toBe(0)
  })

  it('should not navigate beyond first item', () => {
    const model = FiletreeModel.new()
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

    // Try to navigate up from first item
    const [afterUp] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'k', alt: false, paste: false }),
    )

    expect(afterUp.cursor).toBe(0)
  })

  it('should not navigate beyond last item', () => {
    const model = FiletreeModel.new()
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
    const [atLast] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )

    // Try to navigate down from last item
    const [afterDown] = atLast.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )

    expect(afterDown.cursor).toBe(items.length - 1)
  })

  it('should handle error message', () => {
    const model = FiletreeModel.new()
    const error = new Error('Permission denied')
    const [nextModel] = model.update(new ErrorMsg(error))

    expect(nextModel.error).toEqual(error)
    expect(nextModel.files).toEqual([])
    expect(nextModel.cursor).toBe(0)
  })

  it('should display error in view', () => {
    const model = FiletreeModel.new()
    const error = new Error('Permission denied')
    const [withError] = model.update(new ErrorMsg(error))

    const view = withError.view()
    expect(view).toContain('Error: Permission denied')
  })

  it('should display empty directory message in view', () => {
    const model = FiletreeModel.new()
    const emptyItems: typeof model.files = []
    const [withEmptyItems] = model.update(
      new GetDirectoryListingMsg(emptyItems),
    )

    const view = withEmptyItems.view()
    expect(view).toContain('(empty directory)')
  })

  it('should render viewport with selected item styling', () => {
    const model = FiletreeModel.new({ height: 3, width: 80 })
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
      {
        name: 'file3.txt',
        details: '2024-01-15 10:30:00 -rw-r--r-- 3.6K',
        path: '/tmp/file3.txt',
        extension: '.txt',
        isDirectory: false,
        currentDirectory: '/tmp',
        mode: 0o100644,
      },
    ]

    const [withItems] = model.update(new GetDirectoryListingMsg(items))
    const view = withItems.view()

    // Should contain file names
    expect(view).toContain('file1.txt')
    expect(view).toContain('file2.txt')
    // Should have 3 lines (height) - may include empty lines
    const lines = view.split('\n')
    expect(lines.length).toBe(3)
  })

  it('should ignore keyboard input when inactive', () => {
    const model = FiletreeModel.new()
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
    const [inactive] = withItems.setIsActive(false)

    // Try to navigate when inactive
    const [afterKey] = inactive.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )

    expect(afterKey.cursor).toBe(inactive.cursor)
    expect(afterKey.cursor).toBe(0)
  })

  it('should handle window resize message', () => {
    const model = FiletreeModel.new({ height: 24, width: 80 })
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
    const [resized] = withItems.update(new WindowSizeMsg(100, 10))

    expect(resized.width).toBe(100)
    expect(resized.height).toBe(10)
    expect(resized.max).toBe(Math.min(9, items.length - 1))
  })

  it('should clamp cursor when window resizes smaller', () => {
    const model = FiletreeModel.new({ height: 24, width: 80 })
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
    // Move cursor to position 1
    const [atSecond] = withItems.update(
      new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
    )
    expect(atSecond.cursor).toBe(1)

    // Resize to height 1 (smaller than cursor position)
    const [resized] = atSecond.update(new WindowSizeMsg(80, 1))

    // Cursor should be clamped to valid range (0 to items.length - 1)
    expect(resized.cursor).toBeLessThanOrEqual(items.length - 1)
    expect(resized.cursor).toBeGreaterThanOrEqual(0)
  })

  it('should adjust viewport min to keep cursor visible after resize', () => {
    const model = FiletreeModel.new({ height: 24, width: 80 })
    const items = Array.from({ length: 10 }, (_, i) => ({
      name: `file${i + 1}.txt`,
      details: '2024-01-15 10:30:00 -rw-r--r-- 1.2K',
      path: `/tmp/file${i + 1}.txt`,
      extension: '.txt',
      isDirectory: false,
      currentDirectory: '/tmp',
      mode: 0o100644,
    }))

    const [withItems] = model.update(new GetDirectoryListingMsg(items))
    // Move cursor to position 5
    let current = withItems
    for (let i = 0; i < 5; i++) {
      const [next] = current.update(
        new KeyMsg({ type: KeyType.Runes, runes: 'j', alt: false, paste: false }),
      )
      current = next
    }
    expect(current.cursor).toBe(5)

    // Resize to height 3 (smaller viewport)
    const [resized] = current.update(new WindowSizeMsg(80, 3))

    // Cursor should still be visible (within viewport range)
    expect(resized.cursor).toBeGreaterThanOrEqual(resized.min)
    expect(resized.cursor).toBeLessThanOrEqual(resized.max)
    // Min should be adjusted to keep cursor visible
    expect(resized.min).toBeLessThanOrEqual(resized.cursor)
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

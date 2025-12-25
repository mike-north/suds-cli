import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { NodeFileSystemAdapter, NodePathAdapter } from '@suds-cli/machine/node'
import {
  CurrentDirectory,
  PreviousDirectory,
  HomeDirectory,
  RootDirectory,
  DirectoriesListingType,
  FilesListingType,
  getDirectoryListing,
  getDirectoryListingByType,
  getHomeDirectory,
  getWorkingDirectory,
  readFileContent,
  getDirectoryItemSize,
  findFilesByName,
  createFile,
  createDirectory,
  deleteFile,
  deleteDirectory,
  renameDirectoryItem,
  moveDirectoryItem,
  copyFile,
  copyDirectory,
  writeToFile,
} from '../src/index.js'
import type { DirectoryEntry } from '@suds-cli/machine'

// Create adapter instances for testing
const fs = new NodeFileSystemAdapter()
const path = new NodePathAdapter()

// Helper to check if path exists
async function exists(pathToCheck: string): Promise<boolean> {
  return fs.exists(pathToCheck)
}

// Helper to create temp directory
async function mkdtemp(prefix: string): Promise<string> {
  const tmpDir = path.join(fs.homedir(), '.tmp')
  await fs.mkdir(tmpDir, { recursive: true })
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100000)
  const tempDir = path.join(tmpDir, `${prefix}${timestamp}-${random}`)
  await fs.mkdir(tempDir, { recursive: true })
  return tempDir
}

describe('Constants', () => {
  it('exports directory constants', () => {
    expect(CurrentDirectory).toBe('.')
    expect(PreviousDirectory).toBe('..')
    expect(HomeDirectory).toBe('~')
    expect(RootDirectory).toBe('/')
  })

  it('exports listing types', () => {
    expect(DirectoriesListingType).toBe('directories')
    expect(FilesListingType).toBe('files')
  })
})

describe('Directory Navigation', () => {
  it('getHomeDirectory returns user home directory', () => {
    const home = getHomeDirectory(fs)
    expect(home).toBe(fs.homedir())
  })

  it('getWorkingDirectory returns current working directory', () => {
    const cwd = getWorkingDirectory(fs)
    expect(cwd).toBe(fs.cwd())
  })
})

describe('Directory Listing', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
    // Create test files and directories
    await fs.writeFile(path.join(testDir, 'file1.txt'), 'content1')
    await fs.writeFile(path.join(testDir, 'file2.md'), 'content2')
    await fs.writeFile(path.join(testDir, '.hidden'), 'hidden content')
    await fs.mkdir(path.join(testDir, 'dir1'))
    await fs.mkdir(path.join(testDir, '.hiddendir'))
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('getDirectoryListing returns all non-hidden entries', async () => {
    const entries = await getDirectoryListing(fs, testDir, false)
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(['dir1', 'file1.txt', 'file2.md'])
  })

  it('getDirectoryListing includes hidden files when showHidden is true', async () => {
    const entries = await getDirectoryListing(fs, testDir, true)
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual([
      '.hidden',
      '.hiddendir',
      'dir1',
      'file1.txt',
      'file2.md',
    ])
  })

  it('getDirectoryListingByType returns only directories', async () => {
    const entries = await getDirectoryListingByType(
      fs,
      testDir,
      DirectoriesListingType,
      false,
    )
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(['dir1'])
  })

  it('getDirectoryListingByType returns only files', async () => {
    const entries = await getDirectoryListingByType(
      fs,
      testDir,
      FilesListingType,
      false,
    )
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(['file1.txt', 'file2.md'])
  })

  it('getDirectoryListingByType includes hidden directories when showHidden is true', async () => {
    const entries = await getDirectoryListingByType(
      fs,
      testDir,
      DirectoriesListingType,
      true,
    )
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(['.hiddendir', 'dir1'])
  })

  it('getDirectoryListingByType includes hidden files when showHidden is true', async () => {
    const entries = await getDirectoryListingByType(
      fs,
      testDir,
      FilesListingType,
      true,
    )
    const names = entries.map((e) => e.name).sort()
    expect(names).toEqual(['.hidden', 'file1.txt', 'file2.md'])
  })
})

describe('File Operations', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('createFile creates a new file', async () => {
    const filePath = path.join(testDir, 'newfile.txt')
    await createFile(fs, filePath)
    const fileExists = await exists(filePath)
    expect(fileExists).toBe(true)
  })

  it('deleteFile removes a file', async () => {
    const filePath = path.join(testDir, 'toDelete.txt')
    await fs.writeFile(filePath, 'content')
    await deleteFile(fs, filePath)
    const fileExists = await exists(filePath)
    expect(fileExists).toBe(false)
  })

  it('readFileContent returns file contents', async () => {
    const filePath = path.join(testDir, 'content.txt')
    await fs.writeFile(filePath, 'test content')
    const content = await readFileContent(fs, filePath)
    expect(content).toBe('test content')
  })

  it('writeToFile writes content to a file', async () => {
    const filePath = path.join(testDir, 'write.txt')
    await writeToFile(fs, filePath, 'hello world')
    const content = await fs.readFile(filePath, 'utf-8')
    expect(content).toBe('hello world')
  })

  it('writeToFile overwrites existing content', async () => {
    const filePath = path.join(testDir, 'overwrite.txt')
    await fs.writeFile(filePath, 'old content')
    await writeToFile(fs, filePath, 'new content')
    const content = await fs.readFile(filePath, 'utf-8')
    expect(content).toBe('new content')
  })

  it('copyFile copies a file with timestamp suffix', async () => {
    const filePath = path.join(testDir, 'original.txt')
    await fs.writeFile(filePath, 'original content')
    const copiedPath = await copyFile(fs, path, filePath)

    expect(copiedPath).toMatch(/original_\d+\.txt$/)
    const fileExists = await exists(copiedPath)
    expect(fileExists).toBe(true)

    const content = await fs.readFile(copiedPath, 'utf-8')
    expect(content).toBe('original content')
  })

  it('copyFile handles files without extensions', async () => {
    const filePath = path.join(testDir, 'noext')
    await fs.writeFile(filePath, 'content')
    const copiedPath = await copyFile(fs, path, filePath)

    expect(copiedPath).toMatch(/noext_\d+$/)
    const fileExists = await exists(copiedPath)
    expect(fileExists).toBe(true)
  })

  it('copyFile handles hidden files', async () => {
    const filePath = path.join(testDir, '.hidden')
    await fs.writeFile(filePath, 'hidden content')
    const copiedPath = await copyFile(fs, path, filePath)

    expect(copiedPath).toMatch(/\.hidden_\d+$/)
    const fileExists = await exists(copiedPath)
    expect(fileExists).toBe(true)
  })
})

describe('Directory Operations', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('createDirectory creates a new directory', async () => {
    const dirPath = path.join(testDir, 'newdir')
    await createDirectory(fs, dirPath)
    const stats = await fs.stat(dirPath)
    expect(stats.isDirectory).toBe(true)
  })

  it('createDirectory does not throw if directory exists', async () => {
    const dirPath = path.join(testDir, 'existingdir')
    await fs.mkdir(dirPath)
    await expect(createDirectory(fs, dirPath)).resolves.not.toThrow()
  })

  it('deleteDirectory removes a directory recursively', async () => {
    const dirPath = path.join(testDir, 'toDeleteDir')
    await fs.mkdir(dirPath)
    await fs.writeFile(path.join(dirPath, 'file.txt'), 'content')
    await deleteDirectory(fs, dirPath)
    const dirExists = await exists(dirPath)
    expect(dirExists).toBe(false)
  })

  it('copyDirectory copies a directory with timestamp suffix', async () => {
    const dirPath = path.join(testDir, 'original')
    await fs.mkdir(dirPath)
    await fs.writeFile(path.join(dirPath, 'file1.txt'), 'content1')
    await fs.mkdir(path.join(dirPath, 'subdir'))
    await fs.writeFile(path.join(dirPath, 'subdir', 'file2.txt'), 'content2')

    const copiedPath = await copyDirectory(fs, path, dirPath)

    expect(copiedPath).toMatch(/original_\d+$/)
    const dirExists = await exists(copiedPath)
    expect(dirExists).toBe(true)

    const file1Content = await fs.readFile(
      path.join(copiedPath, 'file1.txt'),
      'utf-8',
    )
    expect(file1Content).toBe('content1')

    const file2Content = await fs.readFile(
      path.join(copiedPath, 'subdir', 'file2.txt'),
      'utf-8',
    )
    expect(file2Content).toBe('content2')
  })
})

describe('Rename and Move Operations', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('renameDirectoryItem renames a file', async () => {
    const oldPath = path.join(testDir, 'old.txt')
    const newPath = path.join(testDir, 'new.txt')
    await fs.writeFile(oldPath, 'content')

    await renameDirectoryItem(fs, oldPath, newPath)

    expect(await exists(oldPath)).toBe(false)
    expect(await exists(newPath)).toBe(true)
  })

  it('renameDirectoryItem renames a directory', async () => {
    const oldPath = path.join(testDir, 'olddir')
    const newPath = path.join(testDir, 'newdir')
    await fs.mkdir(oldPath)

    await renameDirectoryItem(fs, oldPath, newPath)

    expect(await exists(oldPath)).toBe(false)
    expect(await exists(newPath)).toBe(true)
  })

  it('moveDirectoryItem moves a file', async () => {
    const srcPath = path.join(testDir, 'file.txt')
    const destDir = path.join(testDir, 'destination')
    await fs.mkdir(destDir)
    await fs.writeFile(srcPath, 'content')

    const destPath = path.join(destDir, 'file.txt')
    await moveDirectoryItem(fs, srcPath, destPath)

    expect(await exists(srcPath)).toBe(false)
    expect(await exists(destPath)).toBe(true)
  })
})

describe('Size Calculation', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('getDirectoryItemSize returns file size', async () => {
    const filePath = path.join(testDir, 'file.txt')
    const content = 'hello world'
    await fs.writeFile(filePath, content)

    const size = await getDirectoryItemSize(fs, path, filePath)
    // Use TextEncoder to get byte length properly
    const expectedSize = new TextEncoder().encode(content).length
    expect(size).toBe(expectedSize)
  })

  it('getDirectoryItemSize returns directory size', async () => {
    const dirPath = path.join(testDir, 'dir')
    await fs.mkdir(dirPath)
    await fs.writeFile(path.join(dirPath, 'file1.txt'), 'content1')
    await fs.writeFile(path.join(dirPath, 'file2.txt'), 'content2')

    const size = await getDirectoryItemSize(fs, path, dirPath)
    const expectedSize =
      new TextEncoder().encode('content1').length +
      new TextEncoder().encode('content2').length
    expect(size).toBe(expectedSize)
  })

  it('getDirectoryItemSize includes nested directories', async () => {
    const dirPath = path.join(testDir, 'dir')
    await fs.mkdir(dirPath)
    await fs.mkdir(path.join(dirPath, 'subdir'))
    await fs.writeFile(path.join(dirPath, 'file1.txt'), 'abc')
    await fs.writeFile(path.join(dirPath, 'subdir', 'file2.txt'), 'def')

    const size = await getDirectoryItemSize(fs, path, dirPath)
    expect(size).toBe(6) // "abc" + "def"
  })
})

describe('File Search', () => {
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp('filesystem-test-')
    await fs.writeFile(path.join(testDir, 'test.txt'), 'content')
    await fs.writeFile(path.join(testDir, 'other.md'), 'content')
    await fs.mkdir(path.join(testDir, 'subdir'))
    await fs.writeFile(path.join(testDir, 'subdir', 'test.js'), 'content')
    await fs.writeFile(path.join(testDir, 'subdir', 'data.json'), 'content')
  })

  afterEach(async () => {
    await fs.rmdir(testDir, { recursive: true, force: true })
  })

  it('findFilesByName finds files by exact name', async () => {
    const result = await findFilesByName(fs, path, 'test.txt', testDir)
    expect(result.paths.length).toBe(1)
    expect(result.entries.length).toBe(1)
    expect(result.paths[0]).toBe(path.join(testDir, 'test.txt'))
  })

  it('findFilesByName finds files by partial name', async () => {
    const result = await findFilesByName(fs, path, 'test', testDir)
    expect(result.paths.length).toBe(2)
    expect(result.entries.length).toBe(2)

    const names = result.entries.map((e) => e.name).sort()
    expect(names).toEqual(['test.js', 'test.txt'])
  })

  it('findFilesByName searches recursively', async () => {
    const result = await findFilesByName(fs, path, 'test.js', testDir)
    expect(result.paths.length).toBe(1)
    expect(result.paths[0]).toBe(path.join(testDir, 'subdir', 'test.js'))
  })

  it('findFilesByName returns empty arrays when no matches', async () => {
    const result = await findFilesByName(fs, path, 'nonexistent', testDir)
    expect(result.paths).toEqual([])
    expect(result.entries).toEqual([])
  })
})

import type {
  DirectoryEntry,
  FileSystemAdapter,
  PathAdapter,
} from '@suds-cli/machine'

/**
 * Directory shortcuts.
 * @public
 */
export const CurrentDirectory = '.'

/**
 * Previous directory shortcut.
 * @public
 */
export const PreviousDirectory = '..'

/**
 * Home directory shortcut.
 * @public
 */
export const HomeDirectory = '~'

/**
 * Root directory shortcut.
 * @public
 */
export const RootDirectory = '/'

/**
 * Listing type for directories only.
 * @public
 */
export const DirectoriesListingType = 'directories'

/**
 * Listing type for files only.
 * @public
 */
export const FilesListingType = 'files'

/**
 * Generates a timestamped filename for a copy operation.
 * @param filePath - The original file path
 * @param extension - The extension to use (e.g., "" for copy)
 * @param path - Path adapter for path operations
 * @returns The new filename with timestamp
 */
function generateTimestampedFilename(
  filePath: string,
  extension: string,
  path: PathAdapter,
): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const ext = path.extname(filePath)
  const basename = path.basename(filePath, ext)
  const dirname = path.dirname(filePath)
  const filename = path.basename(filePath)

  let output: string

  if (filename.startsWith('.') && ext === '') {
    // Hidden file with no extension (e.g., ".gitignore")
    output = path.join(dirname, `${filename}_${timestamp}${extension}`)
  } else if (filename.startsWith('.') && ext !== '') {
    // Hidden file with extension (e.g., ".config.json")
    output = path.join(dirname, `${basename}_${timestamp}${ext}${extension}`)
  } else if (ext !== '' && extension === '') {
    // Regular file with extension, copying (preserve original extension)
    output = path.join(dirname, `${basename}_${timestamp}${ext}`)
  } else if (ext !== '' && extension !== '') {
    // Regular file with extension, with new extension (replace with new extension)
    output = path.join(dirname, `${basename}_${timestamp}${extension}`)
  } else {
    // File without extension
    output = path.join(dirname, `${filename}_${timestamp}${extension}`)
  }

  return output
}

/**
 * Returns a list of files and directories within a given directory.
 * @param fs - FileSystem adapter
 * @param dir - The directory path to list
 * @param showHidden - Whether to include hidden files (starting with .)
 * @returns Array of directory entries
 * @public
 */
export async function getDirectoryListing(
  fs: FileSystemAdapter,
  dir: string,
  showHidden: boolean = false,
): Promise<DirectoryEntry[]> {
  const entries = (await fs.readdir(dir, {
    withFileTypes: true,
  })) as DirectoryEntry[]

  if (!showHidden) {
    return entries.filter((entry) => !entry.name.startsWith('.'))
  }

  return entries
}

/**
 * Returns a directory listing based on type (directories | files).
 * @param fs - FileSystem adapter
 * @param dir - The directory path to list
 * @param listingType - Type of listing: "directories" or "files"
 * @param showHidden - Whether to include hidden files (starting with .)
 * @returns Array of directory entries matching the type
 * @public
 */
export async function getDirectoryListingByType(
  fs: FileSystemAdapter,
  dir: string,
  listingType: typeof DirectoriesListingType | typeof FilesListingType,
  showHidden: boolean = false,
): Promise<DirectoryEntry[]> {
  const entries = (await fs.readdir(dir, {
    withFileTypes: true,
  })) as DirectoryEntry[]

  return entries.filter((entry) => {
    const isHidden = entry.name.startsWith('.')

    if (!showHidden && isHidden) {
      return false
    }

    if (listingType === DirectoriesListingType) {
      return entry.isDirectory()
    } else if (listingType === FilesListingType) {
      return entry.isFile()
    }

    return false
  })
}

/**
 * Returns the user's home directory.
 * @param fs - FileSystem adapter
 * @returns The home directory path
 * @public
 */
export function getHomeDirectory(fs: FileSystemAdapter): string {
  return fs.homedir()
}

/**
 * Returns the current working directory.
 * @param fs - FileSystem adapter
 * @returns The current working directory path
 * @public
 */
export function getWorkingDirectory(fs: FileSystemAdapter): string {
  return fs.cwd()
}

/**
 * Returns the contents of a file.
 * @param fs - FileSystem adapter
 * @param name - The file path to read
 * @returns The file contents as a string
 * @public
 */
export async function readFileContent(
  fs: FileSystemAdapter,
  name: string,
): Promise<string> {
  const content = await fs.readFile(name, 'utf-8')
  return content
}

/**
 * Calculates size of a directory or file.
 * @param fs - FileSystem adapter
 * @param path - Path adapter
 * @param itemPath - The path to calculate size for
 * @returns The size in bytes
 * @public
 */
export async function getDirectoryItemSize(
  fs: FileSystemAdapter,
  path: PathAdapter,
  itemPath: string,
): Promise<number> {
  const stats = await fs.stat(itemPath)

  if (!stats.isDirectory) {
    return stats.size
  }

  let totalSize = 0
  const entries = (await fs.readdir(itemPath, {
    withFileTypes: true,
  })) as DirectoryEntry[]

  for (const entry of entries) {
    const fullPath = path.join(itemPath, entry.name)
    if (entry.isDirectory()) {
      totalSize += await getDirectoryItemSize(fs, path, fullPath)
    } else {
      const fileStats = await fs.stat(fullPath)
      totalSize += fileStats.size
    }
  }

  return totalSize
}

/**
 * Search for files by name.
 * @param fs - FileSystem adapter
 * @param path - Path adapter
 * @param name - The name or partial name to search for
 * @param dir - The directory to search in
 * @returns Object containing arrays of paths and entries
 * @public
 */
export async function findFilesByName(
  fs: FileSystemAdapter,
  path: PathAdapter,
  name: string,
  dir: string,
): Promise<{ paths: string[]; entries: DirectoryEntry[] }> {
  const paths: string[] = []
  const entries: DirectoryEntry[] = []

  async function search(searchDir: string): Promise<void> {
    try {
      const items = (await fs.readdir(searchDir, {
        withFileTypes: true,
      })) as DirectoryEntry[]

      for (const item of items) {
        const fullPath = path.join(searchDir, item.name)

        if (item.name.includes(name)) {
          paths.push(fullPath)
          entries.push(item)
        }

        if (item.isDirectory()) {
          await search(fullPath)
        }
      }
    } catch {
      // Skip directories we can't access (e.g., permission denied)
      // This allows the search to continue even when some directories are inaccessible
    }
  }

  await search(dir)

  return { paths, entries }
}

/**
 * Creates a new file.
 * @param fs - FileSystem adapter
 * @param name - The file path to create
 * @public
 */
export async function createFile(
  fs: FileSystemAdapter,
  name: string,
): Promise<void> {
  // Create an empty file by writing an empty string
  await fs.writeFile(name, '')
}

/**
 * Creates a new directory.
 * Note: Parent directories must exist. Use recursive operations if you need to create nested directories.
 * @param fs - FileSystem adapter
 * @param name - The directory path to create
 * @public
 */
export async function createDirectory(
  fs: FileSystemAdapter,
  name: string,
): Promise<void> {
  const exists = await fs.exists(name)
  if (!exists) {
    await fs.mkdir(name, { recursive: false })
  }
}

/**
 * Deletes a file.
 * @param fs - FileSystem adapter
 * @param name - The file path to delete
 * @public
 */
export async function deleteFile(
  fs: FileSystemAdapter,
  name: string,
): Promise<void> {
  await fs.unlink(name)
}

/**
 * Deletes a directory recursively.
 * @param fs - FileSystem adapter
 * @param name - The directory path to delete
 * @public
 */
export async function deleteDirectory(
  fs: FileSystemAdapter,
  name: string,
): Promise<void> {
  await fs.rmdir(name, { recursive: true, force: true })
}

/**
 * Renames a file or directory.
 * @param fs - FileSystem adapter
 * @param src - The source path
 * @param dst - The destination path
 * @public
 */
export async function renameDirectoryItem(
  fs: FileSystemAdapter,
  src: string,
  dst: string,
): Promise<void> {
  await fs.rename(src, dst)
}

/**
 * Moves a file or directory.
 * @param fs - FileSystem adapter
 * @param src - The source path
 * @param dst - The destination path
 * @public
 */
export async function moveDirectoryItem(
  fs: FileSystemAdapter,
  src: string,
  dst: string,
): Promise<void> {
  await fs.rename(src, dst)
}

/**
 * Copies a file with timestamp suffix.
 * @param fs - FileSystem adapter
 * @param path - Path adapter
 * @param name - The file path to copy
 * @returns The new file path
 * @public
 */
export async function copyFile(
  fs: FileSystemAdapter,
  path: PathAdapter,
  name: string,
): Promise<string> {
  const output = generateTimestampedFilename(name, '', path)

  await fs.copyFile(name, output)
  return output
}

/**
 * Copies a directory recursively with timestamp suffix.
 * @param fs - FileSystem adapter
 * @param path - Path adapter
 * @param name - The directory path to copy
 * @returns The new directory path
 * @public
 */
export async function copyDirectory(
  fs: FileSystemAdapter,
  path: PathAdapter,
  name: string,
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000)
  const output = `${name}_${timestamp}`

  async function copyRecursive(src: string, dest: string): Promise<void> {
    const stats = await fs.stat(src)

    if (stats.isDirectory) {
      await fs.mkdir(dest, { recursive: true })
      const entries = (await fs.readdir(src, {
        withFileTypes: true,
      })) as DirectoryEntry[]

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name)
        const destPath = path.join(dest, entry.name)

        if (entry.isDirectory()) {
          await copyRecursive(srcPath, destPath)
        } else {
          await fs.copyFile(srcPath, destPath)
        }
      }
    } else {
      await fs.copyFile(src, dest)
    }
  }

  await copyRecursive(name, output)
  return output
}

/**
 * Writes content to a file.
 * @param fs - FileSystem adapter
 * @param filePath - The file path to write to
 * @param content - The content to write
 * @public
 */
export async function writeToFile(
  fs: FileSystemAdapter,
  filePath: string,
  content: string,
): Promise<void> {
  await fs.writeFile(filePath, content)
}

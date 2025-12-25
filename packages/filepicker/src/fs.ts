import type { FileSystemAdapter, PathAdapter } from '@suds-cli/machine'
import type { FileInfo } from './types.js'

/**
 * Read a directory and return file info entries.
 * @public
 */
export async function readDirectory(
  filesystem: FileSystemAdapter,
  pathAdapter: PathAdapter,
  path: string,
  showHidden: boolean,
  dirFirst = true,
): Promise<FileInfo[]> {
  const result = await filesystem.readdir(path, { withFileTypes: true })

  // Type guard to ensure we got DirectoryEntry[]
  if (typeof result[0] === 'string') {
    throw new Error('Expected DirectoryEntry array but got string array')
  }

  const entries = result as Array<{
    readonly name: string
    isDirectory(): boolean
    isFile(): boolean
    isSymbolicLink(): boolean
  }>

  const files: FileInfo[] = []

  for (const entry of entries) {
    const isHidden = isHiddenUnix(entry.name)
    if (!showHidden && isHidden) continue

    const fullPath = pathAdapter.join(path, entry.name)
    const stats = await filesystem.stat(fullPath)

    files.push({
      name: entry.name,
      path: fullPath,
      isDir: entry.isDirectory(),
      isHidden,
      size: stats.size,
      mode: stats.mode,
    })
  }

  return files.sort((a, b) => sortFiles(a, b, dirFirst))
}

/**
 * Sort directories first then alphabetical.
 * @public
 */
export function sortFiles(a: FileInfo, b: FileInfo, dirFirst = true): number {
  if (dirFirst) {
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
  }
  return a.name.localeCompare(b.name)
}

/**
 * Hidden file detection (Unix-style).
 * @public
 */
export function isHiddenUnix(name: string): boolean {
  return name.startsWith('.')
}

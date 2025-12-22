import { readdir, stat } from 'fs/promises'
import { join } from 'node:path'
import type { FileInfo } from './types.js'

/**
 * Read a directory and return file info entries.
 * @public
 */
export async function readDirectory(
  path: string,
  showHidden: boolean,
  dirFirst = true,
): Promise<FileInfo[]> {
  const entries = await readdir(path, { withFileTypes: true })
  const files: FileInfo[] = []

  for (const entry of entries) {
    const isHidden = isHiddenUnix(entry.name)
    if (!showHidden && isHidden) continue

    const fullPath = join(path, entry.name)
    const stats = await stat(fullPath)

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

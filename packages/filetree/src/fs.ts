import type { Cmd } from '@suds-cli/tea'
import type { FileSystemAdapter, PathAdapter } from '@suds-cli/machine'
import type { DirectoryItem } from './types.js'
import { GetDirectoryListingMsg, ErrorMsg } from './messages.js'

/**
 * Converts bytes to a human-readable size string.
 * @param size - Size in bytes
 * @returns Formatted string (e.g., "1.2K", "5.4M", "2.3G")
 * @public
 */
export function convertBytesToSizeString(size: number): string {
  if (size < 1024) {
    return `${size}B`
  }

  const units = ['K', 'M', 'G', 'T']
  let unitIndex = -1
  let adjustedSize = size

  while (adjustedSize >= 1024 && unitIndex < units.length - 1) {
    adjustedSize /= 1024
    unitIndex++
  }

  const unit = units[unitIndex]

  if (!unit) {
    return `${size}B`
  }

  // Format to 1 decimal place
  return `${adjustedSize.toFixed(1)}${unit}`
}

/**
 * Formats file permissions in Unix-style notation.
 * @param mode - File mode bits
 * @returns Permission string (e.g., "-rw-r--r--", "drwxr-xr-x")
 */
function formatPermissions(mode: number, isDirectory: boolean): string {
  const type = isDirectory ? 'd' : '-'
  const owner = [
    mode & 0o400 ? 'r' : '-',
    mode & 0o200 ? 'w' : '-',
    mode & 0o100 ? 'x' : '-',
  ].join('')
  const group = [
    mode & 0o040 ? 'r' : '-',
    mode & 0o020 ? 'w' : '-',
    mode & 0o010 ? 'x' : '-',
  ].join('')
  const others = [
    mode & 0o004 ? 'r' : '-',
    mode & 0o002 ? 'w' : '-',
    mode & 0o001 ? 'x' : '-',
  ].join('')

  return `${type}${owner}${group}${others}`
}

/**
 * Formats a date for display.
 * @param date - Date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Type guard to check if an error is a Node.js filesystem permission error.
 * @param error - The error to check
 * @returns True if the error is a permission-related filesystem error
 */
function isPermissionError(
  error: unknown,
): error is { code: 'EACCES' | 'EPERM' } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    ((error as { code: unknown }).code === 'EACCES' ||
      (error as { code: unknown }).code === 'EPERM')
  )
}

/**
 * Creates a command to asynchronously fetch directory contents.
 * @param filesystem - FileSystem adapter for file operations
 * @param path - Path adapter for path operations
 * @param dir - Directory path to list
 * @param showHidden - Whether to show hidden files
 * @returns Command that will emit GetDirectoryListingMsg or ErrorMsg
 * @public
 */
export function getDirectoryListingCmd(
  filesystem: FileSystemAdapter,
  path: PathAdapter,
  dir: string,
  showHidden: boolean,
): Cmd<GetDirectoryListingMsg | ErrorMsg> {
  return async () => {
    try {
      const result = await filesystem.readdir(dir, { withFileTypes: true })

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

      const items: DirectoryItem[] = []

      for (const entry of entries) {
        // Skip hidden files if showHidden is false
        if (!showHidden && entry.name.startsWith('.')) {
          continue
        }

        const itemPath = path.join(dir, entry.name)

        try {
          const stats = await filesystem.stat(itemPath)
          const extension = entry.isDirectory() ? '' : path.extname(entry.name)

          // Format details: "2024-01-15 10:30:00 -rw-r--r-- 1.2K"
          const dateStr = formatDate(stats.mtime)
          const perms = formatPermissions(stats.mode, entry.isDirectory())
          const size = convertBytesToSizeString(stats.size)
          const details = `${dateStr} ${perms} ${size}`

          items.push({
            name: entry.name,
            details,
            path: itemPath,
            extension,
            isDirectory: entry.isDirectory(),
            currentDirectory: dir,
            mode: stats.mode,
          })
        } catch (error: unknown) {
          // Only skip permission-related errors; re-throw unexpected errors
          if (isPermissionError(error)) {
            // Skip files we can't stat due to permission issues
            // EACCES: Permission denied, EPERM: Operation not permitted
            continue
          }
          // Re-throw unexpected errors to surface real bugs
          throw error
        }
      }

      // Sort: directories first, then by name
      items.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })

      return new GetDirectoryListingMsg(items)
    } catch (error) {
      return new ErrorMsg(
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }
}

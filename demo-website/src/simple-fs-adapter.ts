/**
 * Simple in-memory filesystem adapter for browser demos.
 * Uses Map and native browser APIs instead of Node.js dependencies.
 */

import type { DirectoryEntry, FileStat, FileSystemAdapter } from '@boba-cli/machine'

interface FileEntry {
  content: string
  mtime: Date
}

interface DirEntry {
  type: 'directory'
  mtime: Date
}

type Entry = FileEntry | DirEntry

function isDirectory(entry: Entry): entry is DirEntry {
  return (entry as DirEntry).type === 'directory'
}

/**
 * DirectoryEntry implementation for SimpleFS.
 */
class SimpleFSDirectoryEntry implements DirectoryEntry {
  constructor(
    readonly name: string,
    private readonly isDir: boolean,
    private readonly isFile_: boolean,
  ) {}

  isDirectory(): boolean {
    return this.isDir
  }

  isFile(): boolean {
    return this.isFile_
  }

  isSymbolicLink(): boolean {
    return false
  }
}

/**
 * Simple in-memory filesystem adapter for browser.
 * Uses Map for storage - no Node.js dependencies required.
 */
export class SimpleFSAdapter implements FileSystemAdapter {
  private files = new Map<string, Entry>()
  private currentDir = '/'

  constructor() {
    // Initialize with basic directory structure
    this.files.set('/', { type: 'directory', mtime: new Date() })
    this.files.set('/home', { type: 'directory', mtime: new Date() })
    this.files.set('/tmp', { type: 'directory', mtime: new Date() })
    this.currentDir = '/home'
  }

  private normalizePath(path: string): string {
    // Handle relative paths
    if (!path.startsWith('/')) {
      path = `${this.currentDir}/${path}`
    }

    // Remove trailing slash except for root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1)
    }

    // Normalize path segments (handle . and ..)
    const segments = path.split('/').filter(s => s && s !== '.')
    const normalized: string[] = []

    for (const segment of segments) {
      if (segment === '..') {
        // Only pop if there's something to pop (don't go above root)
        if (normalized.length > 0) {
          normalized.pop()
        }
      } else {
        normalized.push(segment)
      }
    }

    // Return root if normalized is empty, otherwise return the path
    return normalized.length === 0 ? '/' : '/' + normalized.join('/')
  }

  async readdir(
    path: string,
    options?: { withFileTypes?: boolean },
  ): Promise<DirectoryEntry[] | string[]> {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, scandir '${path}'`)
    }

    if (!isDirectory(entry)) {
      throw new Error(`ENOTDIR: not a directory, scandir '${path}'`)
    }

    const prefix = normalizedPath === '/' ? '/' : `${normalizedPath}/`
    const entries: Array<{ name: string; isDir: boolean; isFile: boolean }> = []

    for (const [filePath, fileEntry] of this.files.entries()) {
      if (filePath === normalizedPath) continue
      if (!filePath.startsWith(prefix)) continue

      const relativePath = filePath.slice(prefix.length)
      if (relativePath.includes('/')) continue // Skip nested entries

      entries.push({
        name: relativePath,
        isDir: isDirectory(fileEntry),
        isFile: !isDirectory(fileEntry),
      })
    }

    if (options?.withFileTypes) {
      return entries.map(e => new SimpleFSDirectoryEntry(e.name, e.isDir, e.isFile))
    }

    return entries.map(e => e.name)
  }

  async stat(path: string): Promise<FileStat> {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, stat '${path}'`)
    }

    if (isDirectory(entry)) {
      return {
        size: 0,
        mode: 0o755,
        mtime: entry.mtime,
        isDirectory: true,
        isFile: false,
        isSymbolicLink: false,
      }
    }

    return {
      size: entry.content.length,
      mode: 0o644,
      mtime: entry.mtime,
      isDirectory: false,
      isFile: true,
      isSymbolicLink: false,
    }
  }

  async readFile(path: string, _encoding = 'utf-8'): Promise<string> {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`)
    }

    if (isDirectory(entry)) {
      throw new Error(`EISDIR: illegal operation on a directory, read '${path}'`)
    }

    return entry.content
  }

  async writeFile(path: string, content: string): Promise<void> {
    const normalizedPath = this.normalizePath(path)

    // Ensure parent directory exists
    const parentDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/'
    const parentEntry = this.files.get(parentDir)

    if (!parentEntry) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`)
    }

    if (!isDirectory(parentEntry)) {
      throw new Error(`ENOTDIR: not a directory, open '${path}'`)
    }

    this.files.set(normalizedPath, {
      content,
      mtime: new Date(),
    })
  }

  async exists(path: string): Promise<boolean> {
    const normalizedPath = this.normalizePath(path)
    return this.files.has(normalizedPath)
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    const normalizedPath = this.normalizePath(path)

    if (this.files.has(normalizedPath)) {
      throw new Error(`EEXIST: file already exists, mkdir '${path}'`)
    }

    const parentDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/'

    if (options?.recursive) {
      // Create all parent directories
      const segments = normalizedPath.split('/').filter(Boolean)
      let current = ''

      for (const segment of segments) {
        current += `/${segment}`
        if (!this.files.has(current)) {
          this.files.set(current, { type: 'directory', mtime: new Date() })
        }
      }
    } else {
      // Check parent exists
      const parentEntry = this.files.get(parentDir)
      if (!parentEntry) {
        throw new Error(`ENOENT: no such file or directory, mkdir '${path}'`)
      }
      if (!isDirectory(parentEntry)) {
        throw new Error(`ENOTDIR: not a directory, mkdir '${path}'`)
      }

      this.files.set(normalizedPath, { type: 'directory', mtime: new Date() })
    }
  }

  async unlink(path: string): Promise<void> {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, unlink '${path}'`)
    }

    if (isDirectory(entry)) {
      throw new Error(`EISDIR: illegal operation on a directory, unlink '${path}'`)
    }

    this.files.delete(normalizedPath)
  }

  async rmdir(
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<void> {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      if (options?.force) return
      throw new Error(`ENOENT: no such file or directory, rmdir '${path}'`)
    }

    if (!isDirectory(entry)) {
      throw new Error(`ENOTDIR: not a directory, rmdir '${path}'`)
    }

    if (options?.recursive) {
      // Remove directory and all contents
      const prefix = normalizedPath === '/' ? '/' : `${normalizedPath}/`
      const toDelete: string[] = []

      for (const filePath of this.files.keys()) {
        if (filePath === normalizedPath || filePath.startsWith(prefix)) {
          toDelete.push(filePath)
        }
      }

      for (const filePath of toDelete) {
        this.files.delete(filePath)
      }
    } else {
      // Check directory is empty
      const prefix = normalizedPath === '/' ? '/' : `${normalizedPath}/`
      for (const filePath of this.files.keys()) {
        if (filePath !== normalizedPath && filePath.startsWith(prefix)) {
          throw new Error(`ENOTEMPTY: directory not empty, rmdir '${path}'`)
        }
      }

      this.files.delete(normalizedPath)
    }
  }

  async rename(src: string, dst: string): Promise<void> {
    const normalizedSrc = this.normalizePath(src)
    const normalizedDst = this.normalizePath(dst)

    // No-op if source and destination are the same path
    if (normalizedSrc === normalizedDst) {
      return
    }

    const srcEntry = this.files.get(normalizedSrc)

    if (!srcEntry) {
      throw new Error(`ENOENT: no such file or directory, rename '${src}'`)
    }

    const dstEntry = this.files.get(normalizedDst)

    if (dstEntry) {
      const srcIsDir = isDirectory(srcEntry)
      const dstIsDir = isDirectory(dstEntry)

      // Disallow replacing a directory with a file or a file with a directory
      if (srcIsDir && !dstIsDir) {
        throw new Error(`ENOTDIR: not a directory, rename '${src}' -> '${dst}'`)
      }

      if (!srcIsDir && dstIsDir) {
        throw new Error(`EISDIR: illegal operation on a directory, rename '${src}' -> '${dst}'`)
      }

      // Both are files: do not overwrite existing file
      if (!srcIsDir && !dstIsDir) {
        throw new Error(`EEXIST: file already exists, rename '${src}' -> '${dst}'`)
      }

      // Both are directories: ensure destination directory is empty
      const prefix = normalizedDst === '/' ? '/' : `${normalizedDst}/`
      for (const filePath of this.files.keys()) {
        if (filePath !== normalizedDst && filePath.startsWith(prefix)) {
          throw new Error(`ENOTEMPTY: directory not empty, rename '${src}' -> '${dst}'`)
        }
      }
    }

    // Move the entry itself
    this.files.set(normalizedDst, srcEntry)
    this.files.delete(normalizedSrc)

    // If this is a directory, update all children to reflect the new parent path
    if (isDirectory(srcEntry)) {
      const prefix = normalizedSrc === '/' ? '/' : `${normalizedSrc}/`
      const entries = Array.from(this.files.entries())

      for (const [filePath, childEntry] of entries) {
        if (filePath !== normalizedSrc && filePath.startsWith(prefix)) {
          const suffix = filePath.substring(normalizedSrc.length)
          const newChildPath = normalizedDst + suffix

          this.files.set(newChildPath, childEntry)
          this.files.delete(filePath)
        }
      }
    }
  }

  async copyFile(src: string, dst: string): Promise<void> {
    const normalizedSrc = this.normalizePath(src)
    const normalizedDst = this.normalizePath(dst)
    const entry = this.files.get(normalizedSrc)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, copyfile '${src}'`)
    }

    if (isDirectory(entry)) {
      throw new Error(`EISDIR: illegal operation on a directory, copyfile '${src}'`)
    }

    // Ensure parent directory exists
    const parentDir = normalizedDst.substring(0, normalizedDst.lastIndexOf('/')) || '/'
    const parentEntry = this.files.get(parentDir)

    if (!parentEntry) {
      throw new Error(`ENOENT: no such file or directory, copyfile '${dst}'`)
    }

    if (!isDirectory(parentEntry)) {
      throw new Error(`ENOTDIR: not a directory, copyfile '${dst}'`)
    }

    this.files.set(normalizedDst, {
      content: entry.content,
      mtime: new Date(),
    })
  }

  cwd(): string {
    return this.currentDir
  }

  homedir(): string {
    return '/home'
  }

  /**
   * Change the current working directory.
   */
  chdir(path: string): void {
    const normalizedPath = this.normalizePath(path)
    const entry = this.files.get(normalizedPath)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, chdir '${path}'`)
    }

    if (!isDirectory(entry)) {
      throw new Error(`ENOTDIR: not a directory, chdir '${path}'`)
    }

    this.currentDir = normalizedPath
  }

  /**
   * Seed the filesystem with initial files and directories.
   */
  seed(files: Record<string, string>): void {
    for (const [path, content] of Object.entries(files)) {
      const normalizedPath = this.normalizePath(path)
      const dir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/'

      // Ensure parent directory exists
      if (dir !== '/' && !this.files.has(dir)) {
        const segments = dir.split('/').filter(Boolean)
        let current = ''

        for (const segment of segments) {
          current += `/${segment}`
          if (!this.files.has(current)) {
            this.files.set(current, { type: 'directory', mtime: new Date() })
          }
        }
      }

      this.files.set(normalizedPath, {
        content,
        mtime: new Date(),
      })
    }
  }
}

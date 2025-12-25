import { copyFile, mkdir, readdir, readFile, rename, rm, rmdir, stat, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import process from 'node:process'
import type { DirectoryEntry, FileStat, FileSystemAdapter } from '../types.js'

/**
 * Node.js directory entry implementation.
 * Wraps fs.Dirent from Node.js.
 * @internal
 */
class NodeDirectoryEntry implements DirectoryEntry {
  readonly name: string
  private readonly _isDirectory: boolean
  private readonly _isFile: boolean
  private readonly _isSymbolicLink: boolean

  constructor(name: string, isDirectory: boolean, isFile: boolean, isSymbolicLink: boolean) {
    this.name = name
    this._isDirectory = isDirectory
    this._isFile = isFile
    this._isSymbolicLink = isSymbolicLink
  }

  isDirectory(): boolean {
    return this._isDirectory
  }

  isFile(): boolean {
    return this._isFile
  }

  isSymbolicLink(): boolean {
    return this._isSymbolicLink
  }
}

/**
 * Node.js filesystem adapter.
 * Wraps Node.js fs/promises API for platform-agnostic file operations.
 * @public
 */
export class NodeFileSystemAdapter implements FileSystemAdapter {
  async readdir(path: string, options?: { withFileTypes?: boolean }): Promise<DirectoryEntry[] | string[]> {
    if (options?.withFileTypes) {
      const entries = await readdir(path, { withFileTypes: true })
      return entries.map(
        (entry) =>
          new NodeDirectoryEntry(
            entry.name,
            entry.isDirectory(),
            entry.isFile(),
            entry.isSymbolicLink(),
          ),
      )
    }

    return readdir(path)
  }

  async stat(path: string): Promise<FileStat> {
    const stats = await stat(path)
    return {
      size: stats.size,
      mode: stats.mode,
      mtime: stats.mtime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      isSymbolicLink: stats.isSymbolicLink(),
    }
  }

  async readFile(path: string, encoding?: string): Promise<string> {
    return readFile(path, { encoding: (encoding ?? 'utf-8') as BufferEncoding })
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, 'utf-8')
  }

  async exists(path: string): Promise<boolean> {
    try {
      await stat(path)
      return true
    } catch {
      return false
    }
  }

  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    await mkdir(path, { recursive: options?.recursive })
  }

  async unlink(path: string): Promise<void> {
    await unlink(path)
  }

  async rmdir(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    if (options?.recursive || options?.force) {
      // Use rm for recursive deletion or force option
      await rm(path, { recursive: options.recursive ?? false, force: options.force ?? false })
    } else {
      // Use rmdir for non-recursive deletion (throws for non-empty directories)
      await rmdir(path)
    }
  }

  async rename(src: string, dst: string): Promise<void> {
    await rename(src, dst)
  }

  async copyFile(src: string, dst: string): Promise<void> {
    await copyFile(src, dst)
  }

  cwd(): string {
    return process.cwd()
  }

  homedir(): string {
    return homedir()
  }
}

import type { DirectoryEntry, FileStat, FileSystemAdapter } from '../types.js'

/**
 * Browser filesystem adapter.
 * Throws errors for all filesystem operations as browsers do not have filesystem access.
 * This adapter exists for API compatibility but should not be used in browser environments.
 * @public
 */
export class BrowserFileSystemAdapter implements FileSystemAdapter {
  async readdir(_path: string, _options?: { withFileTypes?: boolean }): Promise<DirectoryEntry[] | string[]> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async stat(_path: string): Promise<FileStat> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async readFile(_path: string, _encoding?: string): Promise<string> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async writeFile(_path: string, _content: string): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async exists(_path: string): Promise<boolean> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async mkdir(_path: string, _options?: { recursive?: boolean }): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async unlink(_path: string): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async rmdir(_path: string, _options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async rename(_src: string, _dst: string): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  async copyFile(_src: string, _dst: string): Promise<void> {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  cwd(): string {
    throw new Error('FileSystem operations are not available in browser environments')
  }

  homedir(): string {
    throw new Error('FileSystem operations are not available in browser environments')
  }
}

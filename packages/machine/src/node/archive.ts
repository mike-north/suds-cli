/**
 * Node.js archive adapter using archiver and unzipper.
 * @packageDocumentation
 */

import type { ArchiveAdapter } from '../types.js'

/**
 * Node.js implementation of ArchiveAdapter.
 * Uses archiver for compression and unzipper for extraction.
 * @public
 */
export class NodeArchiveAdapter implements ArchiveAdapter {
  private readonly hasArchiver: boolean
  private readonly hasUnzipper: boolean

  /**
   * Create a new Node.js archive adapter.
   * Checks for availability of archiver and unzipper packages.
   */
  constructor() {
    this.hasArchiver = this.checkPackageAvailability('archiver')
    this.hasUnzipper = this.checkPackageAvailability('unzipper')
  }

  /**
   * Check if a package is available.
   * @param packageName - Package to check
   * @returns True if package can be imported
   */
  private checkPackageAvailability(packageName: string): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require.resolve(packageName)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if archive operations are available.
   * @returns True if both archiver and unzipper are available
   */
  isAvailable(): boolean {
    return this.hasArchiver && this.hasUnzipper
  }

  /**
   * Create a zip archive from a directory.
   * @param sourceDir - Source directory to archive
   * @param destPath - Destination path for the zip file
   * @throws Error if archiver is not available or archiving fails
   */
  async zip(sourceDir: string, destPath: string): Promise<void> {
    if (!this.hasArchiver) {
      throw new Error(
        'Archive operations not available: archiver package not found. Install with: pnpm add archiver',
      )
    }

    // Dynamic import to avoid bundling dependencies that may not be installed
    const archiver = await import('archiver')
    const { createWriteStream } = await import('node:fs')
    const { stat } = await import('node:fs/promises')
    const path = await import('node:path')

    return new Promise((resolve, reject) => {
      const outputStream = createWriteStream(destPath)
      const archive = archiver.default('zip', { zlib: { level: 9 } })

      outputStream.on('close', () => {
        resolve()
      })

      archive.on('error', (err: Error) => {
        reject(err)
      })

      archive.pipe(outputStream)

      // Check if source is a directory or file
      stat(sourceDir)
        .then((stats) => {
          if (stats.isDirectory()) {
            archive.directory(sourceDir, false)
          } else {
            archive.file(sourceDir, { name: path.basename(sourceDir) })
          }

          void archive.finalize()
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Extract a zip archive to a directory.
   * @param archivePath - Path to the zip file
   * @param destDir - Destination directory for extraction
   * @throws Error if unzipper is not available or extraction fails
   */
  async unzip(archivePath: string, destDir: string): Promise<void> {
    if (!this.hasUnzipper) {
      throw new Error(
        'Archive operations not available: unzipper package not found. Install with: pnpm add unzipper',
      )
    }

    // Dynamic import to avoid bundling dependencies that may not be installed
    const unzipper = await import('unzipper')
    const { createReadStream } = await import('node:fs')

    return new Promise((resolve, reject) => {
      createReadStream(archivePath)
        .pipe(unzipper.Extract({ path: destDir }))
        .on('close', () => {
          resolve()
        })
        .on('error', (err: Error) => {
          reject(err)
        })
    })
  }
}

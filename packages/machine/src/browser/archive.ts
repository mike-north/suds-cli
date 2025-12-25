/**
 * Browser archive adapter (not available).
 * @packageDocumentation
 */

import type { ArchiveAdapter } from '../types.js'

/**
 * Browser implementation of ArchiveAdapter.
 * Archive operations are not available in browser environments.
 * @public
 */
export class BrowserArchiveAdapter implements ArchiveAdapter {
  /**
   * Check if archive operations are available.
   * @returns Always false in browser environments
   */
  isAvailable(): boolean {
    return false
  }

  /**
   * Create a zip archive from a directory.
   * @param _sourceDir - Source directory to archive
   * @param _destPath - Destination path for the zip file
   * @throws Error - Always throws as archiving is not available in browser
   */
  async zip(_sourceDir: string, _destPath: string): Promise<void> {
    throw new Error('Archive operations not available in browser environment')
  }

  /**
   * Extract a zip archive to a directory.
   * @param _archivePath - Path to the zip file
   * @param _destDir - Destination directory for extraction
   * @throws Error - Always throws as archiving is not available in browser
   */
  async unzip(_archivePath: string, _destDir: string): Promise<void> {
    throw new Error('Archive operations not available in browser environment')
  }
}

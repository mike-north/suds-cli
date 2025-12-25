import * as nodePath from 'node:path'
import type { PathAdapter } from '../types.js'

/**
 * Node.js path adapter.
 * Wraps Node.js path module for platform-agnostic path operations.
 * @public
 */
export class NodePathAdapter implements PathAdapter {
  readonly sep = nodePath.sep

  join(...segments: string[]): string {
    return nodePath.join(...segments)
  }

  dirname(path: string): string {
    return nodePath.dirname(path)
  }

  basename(path: string, ext?: string): string {
    return nodePath.basename(path, ext)
  }

  extname(path: string): string {
    return nodePath.extname(path)
  }

  resolve(...segments: string[]): string {
    return nodePath.resolve(...segments)
  }

  isAbsolute(path: string): boolean {
    return nodePath.isAbsolute(path)
  }

  normalize(path: string): string {
    return nodePath.normalize(path)
  }
}

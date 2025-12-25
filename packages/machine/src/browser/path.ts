import type { PathAdapter } from '../types.js'

/**
 * Browser path adapter.
 * Pure JavaScript implementation of POSIX-style path operations for browsers.
 * Always uses forward slashes (/) as path separator.
 * @public
 */
export class BrowserPathAdapter implements PathAdapter {
  readonly sep = '/'

  join(...segments: string[]): string {
    if (segments.length === 0) {
      return '.'
    }

    // Filter out empty segments and join with separator
    const filtered = segments.filter((seg) => seg.length > 0)
    if (filtered.length === 0) {
      return '.'
    }

    const joined = filtered.join('/')
    // Use normalizeForResolve to strip trailing slashes (join should not preserve them)
    return this.normalizeForResolve(joined)
  }

  dirname(path: string): string {
    if (path.length === 0) {
      return '.'
    }

    // Remove trailing slashes
    const trimmed = path.replace(/\/+$/, '')
    if (trimmed.length === 0) {
      return '/'
    }

    // Find last slash
    const lastSlash = trimmed.lastIndexOf('/')
    if (lastSlash === -1) {
      return '.'
    }

    if (lastSlash === 0) {
      return '/'
    }

    return trimmed.slice(0, lastSlash)
  }

  basename(path: string, ext?: string): string {
    if (path.length === 0) {
      return ''
    }

    // Remove trailing slashes
    const trimmed = path.replace(/\/+$/, '')
    if (trimmed.length === 0) {
      return ''
    }

    // Find last slash
    const lastSlash = trimmed.lastIndexOf('/')
    let base = lastSlash === -1 ? trimmed : trimmed.slice(lastSlash + 1)

    // Remove extension if provided and matches
    if (ext && base.endsWith(ext)) {
      base = base.slice(0, -ext.length)
    }

    return base
  }

  extname(path: string): string {
    if (path.length === 0) {
      return ''
    }

    const base = this.basename(path)
    const lastDot = base.lastIndexOf('.')

    // No extension if:
    // - No dot found
    // - Dot is first character (hidden file like .gitignore)
    // - Dot is last character (file ending in dot)
    if (lastDot === -1 || lastDot === 0 || lastDot === base.length - 1) {
      return ''
    }

    return base.slice(lastDot)
  }

  resolve(...segments: string[]): string {
    let resolvedPath = ''
    let resolvedAbsolute = false

    // Process segments from right to left
    for (let i = segments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
      const segment = segments[i]
      if (!segment || segment.length === 0) {
        continue
      }

      resolvedPath = resolvedPath.length > 0 ? `${segment}/${resolvedPath}` : segment
      resolvedAbsolute = segment[0] === '/'
    }

    // If still not absolute, prepend current working directory (/)
    if (!resolvedAbsolute) {
      resolvedPath = resolvedPath.length > 0 ? `/${resolvedPath}` : '/'
    }

    // Normalize the path
    const normalized = this.normalizeForResolve(resolvedPath)
    return normalized === '' ? '/' : normalized
  }

  /**
   * Normalize path specifically for resolve (never preserves trailing slash).
   * @param path - Path to normalize
   * @returns Normalized path without trailing slash
   */
  private normalizeForResolve(path: string): string {
    if (path.length === 0) {
      return '/'
    }

    const isAbsolute = path[0] === '/'

    // Split into segments and process
    const segments = path.split('/').filter((seg) => seg.length > 0 && seg !== '.')
    const normalized: string[] = []

    for (const segment of segments) {
      if (segment === '..') {
        // Go up one level if possible
        if (normalized.length > 0 && normalized[normalized.length - 1] !== '..') {
          normalized.pop()
        } else if (!isAbsolute) {
          // Can only add .. if not absolute path
          normalized.push('..')
        }
      } else {
        normalized.push(segment)
      }
    }

    let result = normalized.join('/')

    // Add prefix
    if (isAbsolute) {
      result = `/${result}`
    } else if (result.length === 0) {
      result = '.'
    }

    return result
  }

  isAbsolute(path: string): boolean {
    return path.length > 0 && path[0] === '/'
  }

  normalize(path: string): string {
    if (path.length === 0) {
      return '.'
    }

    const isAbsolute = path[0] === '/'
    const trailingSlash = path[path.length - 1] === '/'

    // Split into segments and process
    const segments = path.split('/').filter((seg) => seg.length > 0 && seg !== '.')
    const normalized: string[] = []

    for (const segment of segments) {
      if (segment === '..') {
        // Go up one level if possible
        if (normalized.length > 0 && normalized[normalized.length - 1] !== '..') {
          normalized.pop()
        } else if (!isAbsolute) {
          // Can only add .. if not absolute path
          normalized.push('..')
        }
      } else {
        normalized.push(segment)
      }
    }

    let result = normalized.join('/')

    // Add prefix
    if (isAbsolute) {
      result = `/${result}`
    } else if (result.length === 0) {
      result = '.'
    }

    // Preserve trailing slash for directories (except for root)
    if (trailingSlash && result !== '/' && result.length > 0) {
      result += '/'
    }

    return result
  }
}

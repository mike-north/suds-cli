/**
 * Color support levels for terminal output.
 * @public
 */
export interface ColorSupport {
  /** The maximum color level supported (0-3). */
  readonly level: number
  /** Whether basic 16-color support is available. */
  readonly hasBasic: boolean
  /** Whether 256-color support is available. */
  readonly has256: boolean
  /** Whether 16 million (true color) support is available. */
  readonly has16m: boolean
}

/**
 * Terminal background mode.
 * @public
 */
export type TerminalBackground = 'dark' | 'light' | 'unknown'

/**
 * Terminal dimensions.
 * @public
 */
export interface TerminalSize {
  /** Width in columns. */
  readonly columns: number
  /** Height in rows. */
  readonly rows: number
}

/**
 * Disposable resource that can be cleaned up.
 * @public
 */
export interface Disposable {
  /** Dispose of the resource. */
  dispose(): void
}

/**
 * Handler for terminal input data.
 * @public
 */
export type InputHandler = (data: Uint8Array) => void

/**
 * Handler for terminal resize events.
 * @public
 */
export type ResizeHandler = (size: TerminalSize) => void

/**
 * Handler for signals (SIGINT, SIGTERM, etc.).
 * @public
 */
export type SignalHandler = () => void

/**
 * Terminal adapter interface for platform-agnostic terminal operations.
 * @public
 */
export interface TerminalAdapter extends Disposable {
  /**
   * Subscribe to input data.
   * @param handler - Callback to receive input as Uint8Array
   * @returns Disposable to unsubscribe
   */
  onInput(handler: InputHandler): Disposable

  /**
   * Subscribe to resize events.
   * @param handler - Callback to receive new terminal size
   * @returns Disposable to unsubscribe
   */
  onResize(handler: ResizeHandler): Disposable

  /**
   * Write data to the terminal output.
   * @param data - String data to write
   */
  write(data: string): void

  /**
   * Get the current terminal size.
   * @returns Current terminal dimensions
   */
  getSize(): TerminalSize

  /**
   * Enable raw mode (no line buffering, no echo).
   */
  enableRawMode(): void

  /**
   * Disable raw mode.
   */
  disableRawMode(): void

  /**
   * Check if the terminal is a TTY.
   * @returns True if the terminal is a TTY
   */
  isTTY(): boolean
}

/**
 * Signal adapter interface for handling OS signals.
 * @public
 */
export interface SignalAdapter extends Disposable {
  /**
   * Subscribe to interrupt signals (SIGINT in Node, beforeunload in browser).
   * @param handler - Callback to invoke on interrupt
   * @returns Disposable to unsubscribe
   */
  onInterrupt(handler: SignalHandler): Disposable

  /**
   * Subscribe to termination signals (SIGTERM in Node).
   * @param handler - Callback to invoke on termination
   * @returns Disposable to unsubscribe
   */
  onTerminate(handler: SignalHandler): Disposable
}

/**
 * Clipboard adapter interface for platform-agnostic clipboard operations.
 * @public
 */
export interface ClipboardAdapter {
  /**
   * Read text from the clipboard.
   * @returns Promise resolving to clipboard text
   */
  read(): Promise<string>

  /**
   * Write text to the clipboard.
   * @param text - Text to write
   * @returns Promise resolving when complete
   */
  write(text: string): Promise<void>

  /**
   * Check if clipboard operations are available.
   * @returns True if clipboard is available
   */
  isAvailable(): boolean
}

/**
 * Environment adapter interface for platform-agnostic environment access.
 * @public
 */
export interface EnvironmentAdapter {
  /**
   * Get an environment variable value.
   * @param name - Variable name
   * @returns Variable value or undefined
   */
  get(name: string): string | undefined

  /**
   * Get color support level.
   * @returns Color support information
   */
  getColorSupport(): ColorSupport

  /**
   * Detect terminal background mode.
   * @returns Background mode (dark, light, or unknown)
   */
  getTerminalBackground(): TerminalBackground
}

/**
 * File stat information returned by filesystem operations.
 * @public
 */
export interface FileStat {
  /** File size in bytes. */
  readonly size: number
  /** Unix file mode (permissions). */
  readonly mode: number
  /** Last modification time. */
  readonly mtime: Date
  /** Whether this is a directory. */
  readonly isDirectory: boolean
  /** Whether this is a regular file. */
  readonly isFile: boolean
  /** Whether this is a symbolic link. */
  readonly isSymbolicLink: boolean
}

/**
 * Directory entry returned by readdir with withFileTypes option.
 * @public
 */
export interface DirectoryEntry {
  /** Name of the file or directory. */
  readonly name: string
  /** Check if this entry is a directory. */
  isDirectory(): boolean
  /** Check if this entry is a regular file. */
  isFile(): boolean
  /** Check if this entry is a symbolic link. */
  isSymbolicLink(): boolean
}

/**
 * FileSystem adapter interface for platform-agnostic file operations.
 * @public
 */
export interface FileSystemAdapter {
  /**
   * Read directory contents.
   * @param path - Directory path
   * @param options - Options for reading directory
   * @returns Array of directory entries or file names
   */
  readdir(
    path: string,
    options?: { withFileTypes?: boolean },
  ): Promise<DirectoryEntry[] | string[]>

  /**
   * Get file/directory stats.
   * @param path - File or directory path
   * @returns File stat information
   */
  stat(path: string): Promise<FileStat>

  /**
   * Read file contents as text.
   * @param path - File path
   * @param encoding - Text encoding (default: 'utf-8')
   * @returns File contents as string
   */
  readFile(path: string, encoding?: string): Promise<string>

  /**
   * Write text to a file.
   * @param path - File path
   * @param content - Text content to write
   * @returns Promise resolving when complete
   */
  writeFile(path: string, content: string): Promise<void>

  /**
   * Check if a file or directory exists.
   * @param path - File or directory path
   * @returns True if the path exists
   */
  exists(path: string): Promise<boolean>

  /**
   * Create a directory.
   * @param path - Directory path
   * @param options - Options for directory creation
   * @returns Promise resolving when complete
   */
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>

  /**
   * Delete a file.
   * @param path - File path
   * @returns Promise resolving when complete
   */
  unlink(path: string): Promise<void>

  /**
   * Remove a directory.
   * @param path - Directory path
   * @param options - Options for directory removal
   * @returns Promise resolving when complete
   */
  rmdir(
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<void>

  /**
   * Rename or move a file or directory.
   * @param src - Source path
   * @param dst - Destination path
   * @returns Promise resolving when complete
   */
  rename(src: string, dst: string): Promise<void>

  /**
   * Copy a file.
   * @param src - Source file path
   * @param dst - Destination file path
   * @returns Promise resolving when complete
   */
  copyFile(src: string, dst: string): Promise<void>

  /**
   * Get current working directory.
   * @returns Current working directory path
   */
  cwd(): string

  /**
   * Get user's home directory.
   * @returns Home directory path
   */
  homedir(): string
}

/**
 * Path adapter interface for platform-agnostic path operations.
 * @public
 */
export interface PathAdapter {
  /**
   * Join path segments.
   * @param segments - Path segments to join
   * @returns Joined path
   */
  join(...segments: string[]): string

  /**
   * Get directory name from path.
   * @param path - File or directory path
   * @returns Directory name
   */
  dirname(path: string): string

  /**
   * Get base name from path.
   * @param path - File or directory path
   * @param ext - Optional extension to remove
   * @returns Base name
   */
  basename(path: string, ext?: string): string

  /**
   * Get file extension.
   * @param path - File path
   * @returns Extension (including dot)
   */
  extname(path: string): string

  /**
   * Resolve path segments to absolute path.
   * @param segments - Path segments to resolve
   * @returns Absolute path
   */
  resolve(...segments: string[]): string

  /**
   * Check if path is absolute.
   * @param path - Path to check
   * @returns True if path is absolute
   */
  isAbsolute(path: string): boolean

  /**
   * Normalize a path.
   * @param path - Path to normalize
   * @returns Normalized path
   */
  normalize(path: string): string

  /**
   * Platform-specific path separator.
   */
  readonly sep: string
}

/**
 * Archive adapter interface for zip/unzip operations.
 * @public
 */
export interface ArchiveAdapter {
  /**
   * Create a zip archive from a directory.
   * @param sourceDir - Source directory to archive
   * @param destPath - Destination path for the zip file
   */
  zip(sourceDir: string, destPath: string): Promise<void>

  /**
   * Extract a zip archive to a directory.
   * @param archivePath - Path to the zip file
   * @param destDir - Destination directory for extraction
   */
  unzip(archivePath: string, destDir: string): Promise<void>

  /**
   * Check if archive operations are available.
   * @returns True if archiving is supported on this platform
   */
  isAvailable(): boolean
}

/**
 * Chainable style function for terminal text styling.
 * @public
 */
export interface StyleFn {
  (text: string): string

  // Modifiers
  readonly bold: StyleFn
  readonly dim: StyleFn
  readonly italic: StyleFn
  readonly underline: StyleFn
  readonly strikethrough: StyleFn
  readonly inverse: StyleFn
  readonly hidden: StyleFn

  // Basic colors (foreground)
  readonly black: StyleFn
  readonly red: StyleFn
  readonly green: StyleFn
  readonly yellow: StyleFn
  readonly blue: StyleFn
  readonly magenta: StyleFn
  readonly cyan: StyleFn
  readonly white: StyleFn
  readonly gray: StyleFn
  readonly grey: StyleFn

  // Bright colors
  readonly blackBright: StyleFn
  readonly redBright: StyleFn
  readonly greenBright: StyleFn
  readonly yellowBright: StyleFn
  readonly blueBright: StyleFn
  readonly magentaBright: StyleFn
  readonly cyanBright: StyleFn
  readonly whiteBright: StyleFn

  // Background colors
  readonly bgBlack: StyleFn
  readonly bgRed: StyleFn
  readonly bgGreen: StyleFn
  readonly bgYellow: StyleFn
  readonly bgBlue: StyleFn
  readonly bgMagenta: StyleFn
  readonly bgCyan: StyleFn
  readonly bgWhite: StyleFn
  readonly bgBlackBright: StyleFn
  readonly bgRedBright: StyleFn
  readonly bgGreenBright: StyleFn
  readonly bgYellowBright: StyleFn
  readonly bgBlueBright: StyleFn
  readonly bgMagentaBright: StyleFn
  readonly bgCyanBright: StyleFn
  readonly bgWhiteBright: StyleFn

  // Extended colors
  hex(color: string): StyleFn
  rgb(r: number, g: number, b: number): StyleFn
  bgHex(color: string): StyleFn
  bgRgb(r: number, g: number, b: number): StyleFn

  // 256 colors
  ansi256(code: number): StyleFn
  bgAnsi256(code: number): StyleFn
}

/**
 * Style adapter for platform-agnostic terminal styling.
 * @public
 */
export interface StyleAdapter {
  /** The chainable style function. */
  readonly style: StyleFn
  /** Whether styling is enabled. */
  readonly enabled: boolean
  /** Color support level (0-3). */
  readonly level: number
}

/**
 * Complete platform adapter combining all platform-specific functionality.
 * @public
 */
export interface PlatformAdapter extends Disposable {
  /** Terminal I/O adapter. */
  readonly terminal: TerminalAdapter

  /** Signal handling adapter. */
  readonly signals: SignalAdapter

  /** Clipboard operations adapter. */
  readonly clipboard: ClipboardAdapter

  /** Environment access adapter. */
  readonly environment: EnvironmentAdapter

  /** FileSystem operations adapter. */
  readonly filesystem: FileSystemAdapter

  /** Path operations adapter. */
  readonly path: PathAdapter

  /** Archive operations adapter. */
  readonly archive: ArchiveAdapter

  /** Style adapter for terminal text styling. */
  readonly style: StyleAdapter
}

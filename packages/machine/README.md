# @boba-cli/machine

Platform abstraction layer for Boba terminal UIs. This package enables Boba applications to run in both Node.js and browser environments (with xterm.js) by providing platform-agnostic interfaces for terminal I/O, clipboard access, environment detection, and signal handling.

## Installation

```bash
npm install @boba-cli/machine
```

### Optional Peer Dependencies

For Node.js usage:

```bash
npm install clipboardy supports-color archiver unzipper
```

For browser usage:

```bash
npm install @xterm/xterm
```

## Usage

### Node.js

```typescript
import { createNodePlatform } from '@boba-cli/machine/node'

const platform = createNodePlatform()

// Subscribe to terminal input
const inputDisposable = platform.terminal.onInput((data) => {
  console.log('Received:', data)
})

// Write to terminal
platform.terminal.write('Hello, World!\n')

// Get terminal size
const { columns, rows } = platform.terminal.getSize()

// Enable raw mode for key-by-key input
platform.terminal.enableRawMode()

// Handle signals
platform.signals.onInterrupt(() => {
  console.log('Interrupted!')
  platform.dispose()
})

// Read from clipboard
const text = await platform.clipboard.read()

// Detect color support
const colorSupport = platform.environment.getColorSupport()
if (colorSupport.has16m) {
  // Use true color
}

// Create zip archive (requires archiver package)
if (platform.archive.isAvailable()) {
  await platform.archive.zip('/path/to/source', '/path/to/output.zip')
}

// Extract zip archive (requires unzipper package)
if (platform.archive.isAvailable()) {
  await platform.archive.unzip('/path/to/archive.zip', '/path/to/output')
}

// File system operations
const content = await platform.filesystem.readFile('/path/to/file.txt')
await platform.filesystem.writeFile('/path/to/output.txt', 'Hello!')
const exists = await platform.filesystem.exists('/path/to/file.txt')

// Path operations
const fullPath = platform.path.join('dir', 'subdir', 'file.txt')
const baseName = platform.path.basename('/path/to/file.txt') // 'file.txt'
const dirName = platform.path.dirname('/path/to/file.txt') // '/path/to'

// Terminal styling
const { style } = platform.style
console.log(style.red.bold('Error!'))
console.log(style.green('Success'))
console.log(style.blue.underline('Link'))

// Clean up when done
platform.dispose()
```

### Browser (with xterm.js)

```typescript
import { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@boba-cli/machine/browser'

// Create xterm.js terminal
const terminal = new Terminal()
terminal.open(document.getElementById('terminal')!)

// Create platform adapter
const platform = createBrowserPlatform({ terminal })

// Use the same API as Node.js
platform.terminal.onInput((data) => {
  // Handle input
})

platform.terminal.write('Hello from the browser!')

// Clean up
platform.dispose()
```

### Platform-Agnostic Code

Write code that works on both platforms:

```typescript
import type { PlatformAdapter } from '@boba-cli/machine'

function runApp(platform: PlatformAdapter) {
  const { columns, rows } = platform.terminal.getSize()

  platform.terminal.onInput((data) => {
    // Handle input bytes
  })

  platform.terminal.onResize((size) => {
    // Handle resize
  })

  platform.terminal.write(`Terminal size: ${columns}x${rows}\n`)
}
```

## Byte Utilities

The package provides cross-platform byte utilities as a replacement for Node.js `Buffer`:

```typescript
import {
  encodeString,
  decodeString,
  byteLength,
  concatBytes,
  decodeFirstRune,
} from '@boba-cli/machine'

// Encode string to UTF-8 bytes
const bytes = encodeString('Hello, 世界!')

// Decode bytes to string
const text = decodeString(bytes)

// Get byte length of a string
const len = byteLength('Hello') // 5

// Concatenate byte arrays
const combined = concatBytes(bytes1, bytes2, bytes3)

// Decode first UTF-8 character
const [char, byteLen] = decodeFirstRune(bytes)
```

## ANSI Escape Sequences

Platform-agnostic ANSI escape sequence constants and utilities:

```typescript
import {
  CURSOR_SHOW,
  CURSOR_HIDE,
  CLEAR_SCREEN,
  ALT_SCREEN_ON,
  ALT_SCREEN_OFF,
  cursorTo,
  fgRGB,
  bgRGB,
  setWindowTitle,
} from '@boba-cli/machine'

// Use constants directly
terminal.write(CURSOR_HIDE)
terminal.write(CLEAR_SCREEN)
terminal.write(ALT_SCREEN_ON)

// Use utility functions
terminal.write(cursorTo(10, 5))
terminal.write(fgRGB(255, 128, 64))
terminal.write(setWindowTitle('My App'))
```

## API Reference

### Interfaces

#### `PlatformAdapter`

Complete platform adapter combining all platform-specific functionality:

- `terminal: TerminalAdapter` - Terminal I/O adapter
- `signals: SignalAdapter` - Signal handling adapter
- `clipboard: ClipboardAdapter` - Clipboard operations adapter
- `environment: EnvironmentAdapter` - Environment access adapter
- `filesystem: FileSystemAdapter` - File system operations adapter
- `path: PathAdapter` - Path operations adapter
- `archive: ArchiveAdapter` - Archive (zip/unzip) operations adapter
- `style: StyleAdapter` - Terminal text styling adapter
- `dispose(): void` - Clean up all resources

#### `TerminalAdapter`

Terminal I/O interface:

- `onInput(handler): Disposable` - Subscribe to input data
- `onResize(handler): Disposable` - Subscribe to resize events
- `write(data: string): void` - Write to terminal output
- `getSize(): TerminalSize` - Get current terminal dimensions
- `enableRawMode(): void` - Enable raw input mode
- `disableRawMode(): void` - Disable raw input mode
- `isTTY(): boolean` - Check if terminal is a TTY

#### `SignalAdapter`

Signal handling interface:

- `onInterrupt(handler): Disposable` - Handle SIGINT/beforeunload
- `onTerminate(handler): Disposable` - Handle SIGTERM/pagehide

#### `ClipboardAdapter`

Clipboard operations interface:

- `read(): Promise<string>` - Read text from clipboard
- `write(text: string): Promise<void>` - Write text to clipboard
- `isAvailable(): boolean` - Check if clipboard is available

#### `EnvironmentAdapter`

Environment access interface:

- `get(name: string): string | undefined` - Get environment variable
- `getColorSupport(): ColorSupport` - Detect color support level
- `getTerminalBackground(): TerminalBackground` - Detect dark/light mode

#### `FileSystemAdapter`

File system operations interface:

- `readdir(path, options?): Promise<DirectoryEntry[] | string[]>` - Read directory contents
- `stat(path): Promise<FileStat>` - Get file/directory stats
- `readFile(path, encoding?): Promise<string>` - Read file contents as text
- `writeFile(path, content): Promise<void>` - Write text to a file
- `exists(path): Promise<boolean>` - Check if path exists
- `mkdir(path, options?): Promise<void>` - Create directory
- `unlink(path): Promise<void>` - Delete file
- `rmdir(path, options?): Promise<void>` - Remove directory
- `rename(src, dst): Promise<void>` - Rename/move file or directory
- `copyFile(src, dst): Promise<void>` - Copy file
- `cwd(): string` - Get current working directory
- `homedir(): string` - Get user's home directory

#### `PathAdapter`

Path operations interface:

- `join(...segments): string` - Join path segments
- `dirname(path): string` - Get directory name
- `basename(path, ext?): string` - Get base name
- `extname(path): string` - Get file extension
- `resolve(...segments): string` - Resolve to absolute path
- `isAbsolute(path): boolean` - Check if path is absolute
- `normalize(path): string` - Normalize path
- `sep: string` - Platform-specific path separator

#### `ArchiveAdapter`

Archive operations interface:

- `zip(sourceDir, destPath): Promise<void>` - Create zip archive from directory
- `unzip(archivePath, destDir): Promise<void>` - Extract zip archive
- `isAvailable(): boolean` - Check if archiving is supported

**Note:** Archive operations require the `archiver` and `unzipper` packages to be installed in Node.js environments. Browser environments do not support archive operations.

#### `StyleAdapter`

Terminal text styling interface:

- `style: StyleFn` - Chainable style function
- `enabled: boolean` - Whether styling is enabled
- `level: number` - Color support level (0-3)

### Types

#### `TerminalSize`

```typescript
interface TerminalSize {
  readonly columns: number
  readonly rows: number
}
```

#### `ColorSupport`

```typescript
interface ColorSupport {
  readonly level: number // 0-3
  readonly hasBasic: boolean // 16 colors
  readonly has256: boolean // 256 colors
  readonly has16m: boolean // True color (16 million)
}
```

#### `TerminalBackground`

```typescript
type TerminalBackground = 'dark' | 'light' | 'unknown'
```

## Exports

The package has three entry points:

- `@boba-cli/machine` - Core interfaces, byte utilities, and ANSI sequences
- `@boba-cli/machine/node` - Node.js adapter implementations
- `@boba-cli/machine/browser` - Browser/xterm.js adapter implementations

## License

MIT

/**
 * \@boba-cli/machine - Platform abstraction layer for Boba terminal UIs.
 *
 * This package provides platform-agnostic interfaces and utilities for building
 * terminal applications that can run in both Node.js and browser environments.
 *
 * @example
 * ```typescript
 * // Node.js usage
 * import { createNodePlatform } from '@boba-cli/machine/node'
 * const platform = createNodePlatform()
 *
 * // Browser usage (with xterm.js)
 * import { createBrowserPlatform } from '@boba-cli/machine/browser'
 * import { Terminal } from '@xterm/xterm'
 * const terminal = new Terminal()
 * const platform = createBrowserPlatform({ terminal })
 *
 * // Platform-agnostic code
 * import type { PlatformAdapter } from '@boba-cli/machine'
 *
 * function run(platform: PlatformAdapter) {
 *   platform.terminal.onInput((data) => {
 *     // Handle input bytes
 *   })
 *   platform.terminal.write('Hello, World!')
 * }
 * ```
 *
 * @packageDocumentation
 */

// Core types
export type {
  ArchiveAdapter,
  ClipboardAdapter,
  ColorSupport,
  DirectoryEntry,
  Disposable,
  EnvironmentAdapter,
  FileStat,
  FileSystemAdapter,
  InputHandler,
  PathAdapter,
  PlatformAdapter,
  ResizeHandler,
  SignalAdapter,
  SignalHandler,
  StyleAdapter,
  StyleFn,
  TerminalAdapter,
  TerminalBackground,
  TerminalSize,
} from './types.js'

// Byte utilities (Buffer replacement)
export {
  allocBytes,
  byteLength,
  bytesEqual,
  concatBytes,
  copyBytes,
  decodeFirstRune,
  decodeString,
  encodeString,
  fromBytes,
  indexOfString,
  sliceBytes,
  startsWith,
  startsWithString,
} from './bytes.js'

// ANSI escape sequences
export {
  ALT_SCREEN_OFF,
  ALT_SCREEN_ON,
  BEL,
  BLINK,
  BOLD,
  BRACKETED_PASTE_END,
  BRACKETED_PASTE_OFF,
  BRACKETED_PASTE_ON,
  BRACKETED_PASTE_START,
  CLEAR_LINE,
  CLEAR_LINE_END,
  CLEAR_LINE_START,
  CLEAR_SCREEN,
  CLEAR_SCREEN_DOWN,
  CLEAR_SCREEN_UP,
  CSI,
  CURSOR_HIDE,
  CURSOR_HOME,
  CURSOR_RESTORE,
  CURSOR_SAVE,
  CURSOR_SHOW,
  DIM,
  ESC,
  FOCUS_IN,
  FOCUS_OUT,
  HIDDEN,
  ITALIC,
  MOUSE_ALL_OFF,
  MOUSE_ALL_ON,
  MOUSE_CELL_OFF,
  MOUSE_CELL_ON,
  MOUSE_SGR_OFF,
  MOUSE_SGR_ON,
  OSC,
  REPORT_FOCUS_OFF,
  REPORT_FOCUS_ON,
  RESET,
  RESET_SCROLL_REGION,
  REVERSE,
  ST,
  STRIKETHROUGH,
  UNDERLINE,
  bg256,
  bgRGB,
  cursorBackward,
  cursorDown,
  cursorForward,
  cursorTo,
  cursorUp,
  fg256,
  fgRGB,
  scrollDown,
  scrollUp,
  setScrollRegion,
  setWindowTitle,
} from './sequences.js'

// Style utilities
export { createAlwaysEnabledStyle, createStyle } from './style/index.js'

// Platform detection
export { isBrowserEnvironment, isNodeEnvironment } from './detect.js'

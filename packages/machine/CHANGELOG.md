# @suds-cli/machine

## 0.1.0-alpha.0

### Minor Changes

- [#33](https://github.com/mike-north/suds-cli/pull/33) [`e8a6068`](https://github.com/mike-north/suds-cli/commit/e8a6068e74ddccec7d57308e48a5c37d9d430030) Thanks [@mike-north](https://github.com/mike-north)! - Add new machine package for platform abstraction layer

  This change introduces a new `@suds-cli/machine` package that provides a platform abstraction layer for Suds terminal UIs, enabling applications to run in both Node.js and browser environments.

  Features:
  - Platform-agnostic interfaces for terminal I/O, clipboard access, environment detection, and signal handling
  - Node.js adapters using native Node.js APIs (process.stdin/stdout, clipboardy, supports-color)
  - Browser adapters using xterm.js and browser APIs (navigator.clipboard, window.matchMedia)
  - Graceful degradation when optional dependencies are unavailable
  - Comprehensive test coverage for both Node.js and browser environments
  - Support for raw mode, TTY detection, terminal size, and color support detection

  The package includes:
  - `NodePlatformAdapter` and `BrowserPlatformAdapter` for platform-specific implementations
  - `ClipboardAdapter`, `EnvironmentAdapter`, `SignalAdapter`, and `TerminalAdapter` interfaces
  - Utility functions for byte manipulation and ANSI escape sequences
  - Working examples for both Node.js and browser usage
  - Full test suite with 241 tests covering all adapters and edge cases

- [#38](https://github.com/mike-north/suds-cli/pull/38) [`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d) Thanks [@mike-north](https://github.com/mike-north)! - Add dual CJS/ESM builds using tsup bundler

  All packages now provide both CommonJS and ESM output with proper TypeScript type declarations for each module system. Package exports are configured with conditional exports for seamless consumption in both CJS and ESM environments.

- [#35](https://github.com/mike-north/suds-cli/pull/35) [`2fd3d20`](https://github.com/mike-north/suds-cli/commit/2fd3d20da5fd2c57e219f94b8c13d7fc68e1daca) Thanks [@mike-north](https://github.com/mike-north)! - Isolate Node.js dependencies to @suds-cli/machine for browser compatibility

  This change introduces platform abstraction adapters that allow all public packages
  (except @suds-cli/machine) to run in browser environments:

  **New adapters in @suds-cli/machine:**
  - `FileSystemAdapter` - File operations abstraction
  - `PathAdapter` - Path manipulation abstraction
  - `EnvironmentAdapter` - Environment variable and terminal capability detection
  - `StyleFn` - Chalk-like terminal styling (replaces direct chalk usage)
  - `ArchiveAdapter` - Archive creation/extraction

  **Platform implementations:**
  - Node.js: `@suds-cli/machine/node` subpath exports
  - Browser: `@suds-cli/machine/browser` subpath exports (stubs/polyfills)

  **Breaking changes:**
  - `CodeModel.new()` now requires `filesystem` and `path` options
  - `MarkdownModel.new()` now requires `filesystem` option
  - Packages using file operations must inject adapters
  - Direct chalk imports are now blocked by ESLint

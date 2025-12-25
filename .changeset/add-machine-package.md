---
'@suds-cli/machine': minor
---

Add new machine package for platform abstraction layer

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


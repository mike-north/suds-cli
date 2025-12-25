---
'@suds-cli/machine': minor
'@suds-cli/chapstick': patch
'@suds-cli/code': patch
'@suds-cli/markdown': patch
'@suds-cli/tea': patch
'@suds-cli/filesystem': patch
'@suds-cli/filetree': patch
'@suds-cli/filepicker': patch
---

Isolate Node.js dependencies to @suds-cli/machine for browser compatibility

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

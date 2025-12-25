# @suds-cli/tea

## 0.1.0-alpha.0

### Minor Changes

- [#38](https://github.com/mike-north/suds-cli/pull/38) [`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d) Thanks [@mike-north](https://github.com/mike-north)! - Add dual CJS/ESM builds using tsup bundler

  All packages now provide both CommonJS and ESM output with proper TypeScript type declarations for each module system. Package exports are configured with conditional exports for seamless consumption in both CJS and ESM environments.

### Patch Changes

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

- Updated dependencies [[`e8a6068`](https://github.com/mike-north/suds-cli/commit/e8a6068e74ddccec7d57308e48a5c37d9d430030), [`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d), [`2fd3d20`](https://github.com/mike-north/suds-cli/commit/2fd3d20da5fd2c57e219f94b8c13d7fc68e1daca)]:
  - @suds-cli/machine@0.1.0-alpha.0

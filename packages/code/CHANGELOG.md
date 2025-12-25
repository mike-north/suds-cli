# @suds-cli/code

## 0.1.0-alpha.1

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
  - @suds-cli/chapstick@0.1.0-alpha.1
  - @suds-cli/filesystem@0.1.0-alpha.0
  - @suds-cli/tea@0.1.0-alpha.0
  - @suds-cli/viewport@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#22](https://github.com/mike-north/suds-cli/pull/22) [`f8b25ba`](https://github.com/mike-north/suds-cli/commit/f8b25ba4be1652a7472b3d80adf6fdf634cb272c) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add new code component for syntax-highlighted code viewing

  This change introduces a new `@suds-cli/code` package that provides a syntax-highlighted code viewer component with scrollable viewport support.

  Features:
  - Syntax highlighting using Shiki with configurable themes
  - Scrollable viewport for long code files
  - Support for multiple programming languages via file extension detection
  - Async file loading with error handling
  - Keyboard navigation when active
  - Full Tea/Elm architecture integration

  The component includes:
  - `CodeModel` class with methods like `setFileName()`, `setSize()`, `gotoTop()`, etc.
  - `highlight()` standalone function for syntax highlighting
  - `SyntaxMsg` and `ErrorMsg` message types
  - Working example in `examples/code-demo.ts`
  - Unit tests

### Patch Changes

- [#31](https://github.com/mike-north/suds-cli/pull/31) [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1) Thanks [@mike-north](https://github.com/mike-north)! - Fix viewport scrolling and layout issues in code, markdown, and help components.
  - **code**: Fix scrolling not working due to `Style.height()` truncating content before viewport receives it
  - **markdown**: Fix scrolling and viewport width jitter by removing `Style.height()` and adding `alignHorizontal('left')` for consistent line padding
  - **help**: Fix column alignment in HelpBubble by using `padEnd()` for consistent key column width

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1)]:
  - @suds-cli/chapstick@0.1.0-alpha.0
  - @suds-cli/viewport@0.0.1-alpha.0

# @suds-cli/code

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

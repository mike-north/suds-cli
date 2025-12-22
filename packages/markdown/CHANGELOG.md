# @suds-cli/markdown

## 0.1.0-alpha.0

### Minor Changes

- [#24](https://github.com/mike-north/suds-cli/pull/24) [`4a4969a`](https://github.com/mike-north/suds-cli/commit/4a4969a2a14c77a0e3076bcd7d455f2d314e4cc1) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add markdown viewer component with terminal styling

  Port the markdown bubble component from teacup to TypeScript. This component renders markdown content with beautiful terminal styling using marked-terminal, displayed in a scrollable viewport.

  Features:
  - Renders markdown with terminal styling (headers, code blocks, lists, links, emphasis)
  - Automatic light/dark terminal background detection
  - Scrollable viewport for long documents
  - Word wrapping at viewport width
  - Keyboard and mouse scrolling support
  - Complete TypeScript API matching the Go implementation

  The package includes:
  - `MarkdownModel` class for managing markdown viewer state
  - `renderMarkdown` function for standalone markdown rendering
  - Working example application displaying README.md
  - Unit tests for core functionality

### Patch Changes

- [#31](https://github.com/mike-north/suds-cli/pull/31) [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1) Thanks [@mike-north](https://github.com/mike-north)! - Fix viewport scrolling and layout issues in code, markdown, and help components.
  - **code**: Fix scrolling not working due to `Style.height()` truncating content before viewport receives it
  - **markdown**: Fix scrolling and viewport width jitter by removing `Style.height()` and adding `alignHorizontal('left')` for consistent line padding
  - **help**: Fix column alignment in HelpBubble by using `padEnd()` for consistent key column width

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1)]:
  - @suds-cli/chapstick@0.1.0-alpha.0
  - @suds-cli/viewport@0.0.1-alpha.0

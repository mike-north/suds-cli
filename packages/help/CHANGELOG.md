# @suds-cli/help

## 0.1.0-alpha.1

### Minor Changes

- [#38](https://github.com/mike-north/suds-cli/pull/38) [`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d) Thanks [@mike-north](https://github.com/mike-north)! - Add dual CJS/ESM builds using tsup bundler

  All packages now provide both CommonJS and ESM output with proper TypeScript type declarations for each module system. Package exports are configured with conditional exports for seamless consumption in both CJS and ESM environments.

### Patch Changes

- Updated dependencies [[`0756ee8`](https://github.com/mike-north/suds-cli/commit/0756ee87bd7470589cdd0181fab0573a90fe3c2d), [`2fd3d20`](https://github.com/mike-north/suds-cli/commit/2fd3d20da5fd2c57e219f94b8c13d7fc68e1daca)]:
  - @suds-cli/chapstick@0.1.0-alpha.1
  - @suds-cli/key@0.1.0-alpha.0
  - @suds-cli/tea@0.1.0-alpha.0
  - @suds-cli/viewport@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#23](https://github.com/mike-north/suds-cli/pull/23) [`efe85ab`](https://github.com/mike-north/suds-cli/commit/efe85ab594594a348db08c32d73afddcc52bc175) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add HelpBubble component for scrollable help screens
  - New `HelpBubble` class provides a viewport-based scrollable help component
  - Displays a styled title and list of key binding entries
  - Supports adaptive colors for light/dark terminals
  - Two-column layout with fixed-width key column and description
  - Integrates with `ViewportModel` for scrolling functionality
  - Includes working example matching teacup's help.go example
  - Fully tested with comprehensive unit tests
  - Preserves existing HelpModel for key binding rendering

### Patch Changes

- [#31](https://github.com/mike-north/suds-cli/pull/31) [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1) Thanks [@mike-north](https://github.com/mike-north)! - Add dependency injection for Style providers to enable testability

  Introduces a `StyleProvider` abstraction layer for style creation, addressing ES module mocking limitations that prevent reliable unit testing.

  **Core changes to @suds-cli/chapstick:**
  - New `StyleProvider` interface with `createStyle()` and `semanticStyles` accessors
  - `ChapstickStyleProvider` as the default implementation
  - `SemanticStyles` interface for success/error/warning/info/muted/highlight/header styles
  - Exports `defaultStyleProvider` singleton

  **Updates to help, table, and list packages:**
  - Accept optional `styleProvider` parameter in options and `defaultStyles()` functions
  - Allows tests to inject mock providers without ES module mocking

  All existing APIs remain backward compatible with default parameters.

- [#31](https://github.com/mike-north/suds-cli/pull/31) [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1) Thanks [@mike-north](https://github.com/mike-north)! - Fix viewport scrolling and layout issues in code, markdown, and help components.
  - **code**: Fix scrolling not working due to `Style.height()` truncating content before viewport receives it
  - **markdown**: Fix scrolling and viewport width jitter by removing `Style.height()` and adding `alignHorizontal('left')` for consistent line padding
  - **help**: Fix column alignment in HelpBubble by using `padEnd()` for consistent key column width

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1)]:
  - @suds-cli/chapstick@0.1.0-alpha.0
  - @suds-cli/viewport@0.0.1-alpha.0

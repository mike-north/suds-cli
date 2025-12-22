# @suds-cli/list

## 0.0.1-alpha.0

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

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1), [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1), [`efe85ab`](https://github.com/mike-north/suds-cli/commit/efe85ab594594a348db08c32d73afddcc52bc175)]:
  - @suds-cli/chapstick@0.1.0-alpha.0
  - @suds-cli/help@0.1.0-alpha.0
  - @suds-cli/spinner@0.0.1-alpha.0

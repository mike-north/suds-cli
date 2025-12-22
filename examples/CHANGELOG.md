# @suds-cli/examples

## 0.0.1-alpha.0

### Patch Changes

- [#22](https://github.com/mike-north/suds-cli/pull/22) [`f8b25ba`](https://github.com/mike-north/suds-cli/commit/f8b25ba4be1652a7472b3d80adf6fdf634cb272c) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add code-demo.ts example for the new code component

  This change adds a new example demonstrating the `@suds-cli/code` package for syntax-highlighted code viewing with scrollable viewport.

- [#25](https://github.com/mike-north/suds-cli/pull/25) [`0a27b00`](https://github.com/mike-north/suds-cli/commit/0a27b00655106e46d1a19c647510db202b2b351d) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add statusbar component - a 4-column status bar for terminal UIs ported from teacup.

  This component renders a configurable 4-column status bar at a fixed height, commonly used at the bottom of terminal applications to display contextual information. Features include:
  - Fixed 1-row height status bar
  - 4 configurable columns with individual colors
  - Automatic text truncation with ellipsis for long content
  - Responsive width handling
  - Adaptive colors (light/dark mode support)
  - Window resize support via WindowSizeMsg

  Includes working example matching the Go teacup implementation.

- Updated dependencies [[`f8b25ba`](https://github.com/mike-north/suds-cli/commit/f8b25ba4be1652a7472b3d80adf6fdf634cb272c), [`4a4969a`](https://github.com/mike-north/suds-cli/commit/4a4969a2a14c77a0e3076bcd7d455f2d314e4cc1), [`0a27b00`](https://github.com/mike-north/suds-cli/commit/0a27b00655106e46d1a19c647510db202b2b351d), [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1), [`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1), [`efe85ab`](https://github.com/mike-north/suds-cli/commit/efe85ab594594a348db08c32d73afddcc52bc175)]:
  - @suds-cli/code@0.1.0-alpha.0
  - @suds-cli/markdown@0.1.0-alpha.0
  - @suds-cli/statusbar@0.1.0-alpha.0
  - @suds-cli/chapstick@0.1.0-alpha.0
  - @suds-cli/help@0.1.0-alpha.0
  - @suds-cli/table@0.0.1-alpha.0
  - @suds-cli/list@0.0.1-alpha.0
  - @suds-cli/filepicker@0.0.1-alpha.0
  - @suds-cli/progress@0.0.1-alpha.0
  - @suds-cli/spinner@0.0.1-alpha.0
  - @suds-cli/textarea@0.0.1-alpha.0
  - @suds-cli/textinput@0.0.1-alpha.0
  - @suds-cli/viewport@0.0.1-alpha.0

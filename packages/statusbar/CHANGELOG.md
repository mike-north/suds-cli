# @suds-cli/statusbar

## 0.1.0-alpha.0

### Minor Changes

- [#25](https://github.com/mike-north/suds-cli/pull/25) [`0a27b00`](https://github.com/mike-north/suds-cli/commit/0a27b00655106e46d1a19c647510db202b2b351d) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add statusbar component - a 4-column status bar for terminal UIs ported from teacup.

  This component renders a configurable 4-column status bar at a fixed height, commonly used at the bottom of terminal applications to display contextual information. Features include:
  - Fixed 1-row height status bar
  - 4 configurable columns with individual colors
  - Automatic text truncation with ellipsis for long content
  - Responsive width handling
  - Adaptive colors (light/dark mode support)
  - Window resize support via WindowSizeMsg

  Includes working example matching the Go teacup implementation.

### Patch Changes

- Updated dependencies [[`a7fe6ab`](https://github.com/mike-north/suds-cli/commit/a7fe6aba10a7074b90a9f9febdd04432d26888c1)]:
  - @suds-cli/chapstick@0.1.0-alpha.0

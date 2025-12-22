---
"@suds-cli/statusbar": minor
"@suds-cli/examples": patch
---

Add statusbar component - a 4-column status bar for terminal UIs ported from teacup.

This component renders a configurable 4-column status bar at a fixed height, commonly used at the bottom of terminal applications to display contextual information. Features include:

- Fixed 1-row height status bar
- 4 configurable columns with individual colors
- Automatic text truncation with ellipsis for long content
- Responsive width handling
- Adaptive colors (light/dark mode support)
- Window resize support via WindowSizeMsg

Includes working example matching the Go teacup implementation.

---
"@suds-cli/help": minor
---

Add HelpBubble component for scrollable help screens

- New `HelpBubble` class provides a viewport-based scrollable help component
- Displays a styled title and list of key binding entries
- Supports adaptive colors for light/dark terminals
- Two-column layout with fixed-width key column and description
- Integrates with `ViewportModel` for scrolling functionality
- Includes working example matching teacup's help.go example
- Fully tested with comprehensive unit tests
- Preserves existing HelpModel for key binding rendering

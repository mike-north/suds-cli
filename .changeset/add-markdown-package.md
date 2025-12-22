---
"@suds-cli/markdown": minor
---

Add markdown viewer component with terminal styling

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

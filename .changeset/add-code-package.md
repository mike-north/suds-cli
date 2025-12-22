---
"@suds-cli/code": minor
---

Add new code component for syntax-highlighted code viewing

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

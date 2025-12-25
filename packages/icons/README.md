# @boba-cli/icons

Unicode/nerd font icons based on file type, extension, and directory names.

![Icons Demo](../../examples/icons-demo.gif)

Ported from [teacup icons](https://github.com/mistakenelf/teacup/tree/main/icons).

## Features

- File type indicators (`/` for directory, `*` for executable, etc.)
- Icon glyphs for common file extensions
- Special icons for well-known filenames (e.g., `Dockerfile`, `.gitignore`)
- Directory-specific icons (e.g., `node_modules`, `.git`)
- Color information for icons (RGB values)
- Support for compound extensions (e.g., `.test.ts`, `.d.ts`)

## Usage

```typescript
import { getIndicator, getIcon } from '@boba-cli/icons'

// Get indicator for a file type
const indicator = getIndicator(0o040000) // "/" for directory

// Get icon and color for a file
const { glyph, color } = getIcon('example', '.ts', '')
// Returns: { glyph: '\ue628', color: '\x1b[38;2;3;136;209m' }
```

## API

### `getIndicator(mode: number): string`

Returns the indicator character based on file mode bits:

- `/` - Directory
- `|` - Named pipe
- `@` - Symbolic link
- `=` - Socket
- `*` - Executable file
- ` ` - Regular file (empty string)

### `getIcon(name: string, ext: string, indicator: string): { glyph: string; color: string }`

Returns the icon glyph and ANSI color code based on:

1. Filename and extension
2. File indicator (directory, executable, etc.)
3. Extension lookup
4. Sub-extension patterns (e.g., `.test.ts`)

## Icon Types

The package includes icons for:

- **Directories**: `.git`, `node_modules`, `.config`, etc.
- **Filenames**: `Makefile`, `Dockerfile`, `package.json`, etc.
- **Extensions**: `.js`, `.ts`, `.go`, `.py`, `.md`, etc.
- **Sub-extensions**: `.test.ts`, `.spec.js`, `.d.ts`, etc.

## License

MIT

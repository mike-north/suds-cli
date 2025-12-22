# @suds-cli/filetree

Navigable file tree browser component for Suds terminal UIs.

## Features

- Keyboard navigation (up/down)
- Scrollable viewport
- File metadata display (date, permissions, size)
- Hidden file support
- Customizable key bindings and styles

## Installation

```bash
pnpm add @suds-cli/filetree
```

## Usage

```typescript
import { FiletreeModel } from '@suds-cli/filetree';
import { Program } from '@suds-cli/tea';

const filetree = FiletreeModel.new({
  currentDir: process.cwd(),
  showHidden: false,
});

const program = new Program(filetree);
await program.run();
```

## API

See the [API documentation](../../docs/api/filetree.md) for detailed information.

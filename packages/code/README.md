# @suds-cli/code

Syntax-highlighted code viewer component for Suds terminal UIs.

## Features

- Syntax highlighting with configurable themes
- Scrollable viewport for long code files
- Supports multiple programming languages via file extension detection
- Async file loading
- Keyboard navigation when active

## Installation

```bash
pnpm add @suds-cli/code
```

## Usage

```typescript
import { CodeModel } from '@suds-cli/code';
import { Program } from '@suds-cli/tea';

const codeModel = CodeModel.new({ active: true });

// In init
const cmd = codeModel.setFileName('example.ts');

// In update - handle window resize
if (msg instanceof WindowSizeMsg) {
  codeModel = codeModel.setSize(msg.width, msg.height);
}

// In view
return codeModel.view();
```

## API

See [API documentation](../../docs/code.codemodel.md) for details.

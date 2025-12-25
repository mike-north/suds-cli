> **Deprecation Notice:** This package is being renamed from `@suds-cli/markdown` to `@boba-cli/markdown`. Please update your dependencies accordingly.

# @suds-cli/markdown

Markdown viewer component for Suds terminal UIs.

<img src="../../examples/markdown-demo.gif" width="950" alt="Markdown component demo" />

## Features

- Renders markdown with beautiful terminal styling
- Scrollable viewport for long documents
- Automatic light/dark theme detection
- Support for headers, code blocks, lists, links, and more
- Word wrapping at viewport width

## Installation

```bash
pnpm add @suds-cli/markdown
```

## Usage

```typescript
import { MarkdownModel } from '@suds-cli/markdown'
import { Program } from '@suds-cli/tea'

let model = MarkdownModel.new({ active: true })
const [updatedModel, cmd] = model.setFileName('README.md')
model = updatedModel

// Handle resize
const [resizedModel] = model.setSize(width, height)
model = resizedModel

// Render
const view = model.view()
```

## API

See the [API documentation](../../docs/markdown.md) for complete details.

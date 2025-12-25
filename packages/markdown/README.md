# @boba-cli/markdown

Markdown viewer component for Boba terminal UIs.

<img src="../../examples/markdown-demo.gif" width="950" alt="Markdown component demo" />

## Features

- Renders markdown with beautiful terminal styling
- Scrollable viewport for long documents
- Automatic light/dark theme detection
- Support for headers, code blocks, lists, links, and more
- Word wrapping at viewport width

## Installation

```bash
pnpm add @boba-cli/markdown
```

## Usage

```typescript
import { MarkdownModel } from '@boba-cli/markdown'
import { Program } from '@boba-cli/tea'

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

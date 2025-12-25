# @boba-cli/statusbar

A 4-column status bar component for terminal UIs, ported from [teacup](https://github.com/mistakenelf/teacup).

## Features

- Fixed 1-row height status bar
- 4 configurable columns with individual colors
- Automatic text truncation with ellipsis
- Responsive width handling
- Adaptive colors (light/dark mode support)

## Installation

```bash
pnpm add @boba-cli/statusbar
```

## Usage

```typescript
import { StatusbarModel } from '@boba-cli/statusbar'
import type { ColorConfig } from '@boba-cli/statusbar'

const sb = StatusbarModel.new(
  { foreground: '#ffffff', background: '#F25D94' }, // Pink - first column
  { foreground: '#ffffff', background: '#3c3836' }, // Gray - second column
  { foreground: '#ffffff', background: '#A550DF' }, // Purple - third column
  { foreground: '#ffffff', background: '#6124DF' }, // Indigo - fourth column
)

// Set size and content
const updated = sb
  .setSize(80)
  .setContent('file.txt', '~/.config/nvim', '1/23', 'OK')

// Render
console.log(updated.view())
```

## Column Layout

| Column | Alignment | Width                  | Truncation      |
| ------ | --------- | ---------------------- | --------------- |
| First  | Left      | Auto (max 30 chars)    | Yes, with "..." |
| Second | Left      | Flexible (fills space) | Yes, with "..." |
| Third  | Right     | Auto                   | No              |
| Fourth | Left      | Auto                   | No              |

## API

### `StatusbarModel.new(first, second, third, fourth)`

Create a new statusbar with color configuration for each column.

### `setSize(width: number)`

Set the total width of the statusbar.

### `setContent(first, second, third, fourth)`

Update the text content for all columns.

### `setColors(first, second, third, fourth)`

Update the color configuration for all columns.

### `update(msg: Msg)`

Handle messages (primarily `WindowSizeMsg` for window resizing).

### `view()`

Render the statusbar to a string.

## License

MIT

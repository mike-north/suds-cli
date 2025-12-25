# @boba-cli/chapstick

TypeScript port of Charmbracelet Lip Gloss for styling terminal strings. Implements a fluent `Style` API with colors, padding/margin, borders, alignment, joins/placement, and ANSI-aware rendering.

## Install

```bash
pnpm add @boba-cli/chapstick
```

## Quickstart

```ts
import { Style, borderStyles } from '@boba-cli/chapstick'

const card = new Style()
  .padding(1)
  .border(borderStyles.rounded)
  .borderForeground('#7c3aed')
  .alignHorizontal('center')
  .render('Hello Boba')

console.log(card)
```

## Features

### Style Builder

The `Style` class provides a fluent, immutable API for building terminal styles:

```ts
import { Style } from '@boba-cli/chapstick'

const style = new Style()
  .foreground('#ff0000') // Text color (hex, named, or rgb())
  .background('#000000') // Background color
  .bold() // Bold text
  .italic() // Italic text
  .underline() // Underlined text
  .strikethrough() // Strikethrough text
  .padding(1) // Padding on all sides
  .padding(1, 2) // Vertical, horizontal padding
  .padding(1, 2, 1, 2) // Top, right, bottom, left
  .margin(1) // Margin (same overloads as padding)
  .width(40) // Fixed width (truncates)
  .maxWidth(80) // Max width (wraps)
  .height(10) // Fixed height
  .maxHeight(20) // Max height
  .alignHorizontal('center') // left | center | right
  .alignVertical('center') // top | center | bottom
  .border(true) // Enable default border
  .border(borderStyles.rounded) // Use specific border style
  .borderForeground('#7c3aed') // Border color
  .inline() // Strip newlines, skip padding/margin
  .render('Your text here')
```

### Style Inheritance

Styles can inherit properties from other styles (excluding padding and margin):

```ts
const base = new Style().bold().foreground('#00ff00')
const derived = new Style().italic().inherit(base)
// derived has: bold, italic, foreground
```

### Adaptive Colors

Support for light/dark terminal backgrounds:

```ts
const style = new Style().foreground({
  light: '#000000', // Used on light backgrounds
  dark: '#ffffff', // Used on dark backgrounds
})
```

### Composition

```ts
import { Style, joinHorizontal, joinVertical, place } from '@boba-cli/chapstick'

const label = new Style().foreground('#10b981').bold()
const left = label.render('Left')
const right = label.render('Right')

// Join blocks side-by-side with spacing
console.log(joinHorizontal(2, left, right))

// Join blocks vertically with blank line spacing
console.log(joinVertical(1, 'Top', 'Middle', 'Bottom'))

// Place content inside a 20x5 area, centered
console.log(place(20, 5, 'center', 'center', label.render('Centered')))
```

### Measurement Utilities

```ts
import { width, clampWidth, wrapWidth, padLines } from '@boba-cli/chapstick'

// Get display width (ANSI-aware)
width('\x1b[31mred\x1b[0m') // => 3

// Truncate to max width
clampWidth('hello world', 5) // => "hello"

// Word-wrap to max width
wrapWidth('hello world', 5) // => "hello\nworld"

// Pad lines with spaces
padLines('text', 2, 2) // => "  text  "
```

### Terminal Detection

```ts
import { getColorSupport, getTerminalBackground } from '@boba-cli/chapstick'

const support = getColorSupport()
// { level: 3, hasBasic: true, has256: true, has16m: true }

const bg = getTerminalBackground()
// "dark" | "light" | "unknown"
```

### Border Styles

Built-in border styles:

```ts
import { borderStyles } from '@boba-cli/chapstick'

borderStyles.normal // ┌─┐│ │└─┘
borderStyles.rounded // ╭─╮│ │╰─╯
borderStyles.bold // ┏━┓┃ ┃┗━┛
borderStyles.double // ╔═╗║ ║╚═╝
```

## API

### Types

- `HAlign` - `"left" | "center" | "right"`
- `VAlign` - `"top" | "center" | "bottom"`
- `Align` - Alias for `HAlign` (backwards compatibility)
- `ColorInput` - `string | { light?: string; dark?: string }`
- `BorderStyle` - Border character definitions
- `Spacing` - `{ top, right, bottom, left }`
- `StyleOptions` - All style configuration options
- `StyleKey` - Keys of `StyleOptions`
- `ColorSupport` - Color capability detection result
- `TerminalBackground` - `"dark" | "light" | "unknown"`

## Scripts

- `pnpm -C packages/chapstick build`
- `pnpm -C packages/chapstick test`
- `pnpm -C packages/chapstick lint`
- `pnpm -C packages/chapstick generate:api-report`

## License

MIT

# @boba-cli/runeutil

Input sanitization utilities for Boba terminal UIs. Strips ANSI escape sequences and control characters, with configurable replacement for newlines and tabs.

## Install

```bash
pnpm add @boba-cli/runeutil
```

## Quickstart

```ts
import { newSanitizer } from '@boba-cli/runeutil'

// Default: keep newlines, expand tabs to 4 spaces
const sanitizer = newSanitizer()
sanitizer.sanitize('hello\tworld') // "hello    world"
sanitizer.sanitize('line1\nline2') // "line1\nline2"

// Strip ANSI colors
sanitizer.sanitize('\x1b[31mred\x1b[0m') // "red"
```

### Single-line Input

```ts
const sanitizer = newSanitizer({
  replaceNewLine: ' ', // Convert newlines to space
  replaceTab: '', // Remove tabs
})

sanitizer.sanitize('hello\nworld') // "hello world"
sanitizer.sanitize('col1\tcol2') // "col1col2"
```

### Custom Tab Width

```ts
const sanitizer = newSanitizer({
  replaceTab: '  ', // 2 spaces instead of 4
})

sanitizer.sanitize('a\tb') // "a  b"
```

## What Gets Sanitized

| Input                                  | Action                         |
| -------------------------------------- | ------------------------------ |
| ANSI escape sequences (`\x1b[31m`)     | Stripped cleanly               |
| Newlines (`\n`, `\r`)                  | Replaced with `replaceNewLine` |
| Tabs (`\t`)                            | Replaced with `replaceTab`     |
| Other control characters (C0, C1, DEL) | Removed                        |
| Unicode replacement char (`\uFFFD`)    | Removed                        |
| Regular text                           | Passed through                 |

## API

| Export                | Description                        |
| --------------------- | ---------------------------------- |
| `Sanitizer`           | Class for sanitizing input strings |
| `newSanitizer(opts?)` | Factory function                   |
| `SanitizerOptions`    | Options interface                  |

### SanitizerOptions

| Option           | Type     | Default  | Description                   |
| ---------------- | -------- | -------- | ----------------------------- |
| `replaceNewLine` | `string` | `"\n"`   | Replacement for `\n` and `\r` |
| `replaceTab`     | `string` | `"    "` | Replacement for `\t`          |

## Scripts

- `pnpm -C packages/runeutil build`
- `pnpm -C packages/runeutil test`
- `pnpm -C packages/runeutil lint`
- `pnpm -C packages/runeutil generate:api-report`

## License

MIT

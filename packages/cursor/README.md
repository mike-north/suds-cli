> **Deprecation Notice:** This package is being renamed from `@suds-cli/cursor` to `@boba-cli/cursor`. Please update your dependencies accordingly.

# @suds-cli/cursor

Cursor component for Suds terminal UIs. Handles blinking, focus, and hidden/static modes.

## Install

```bash
pnpm add @suds-cli/cursor
```

## Quickstart

```ts
import {
  CursorModel,
  CursorMode,
  BlinkMsg,
  InitialBlinkMsg,
} from '@suds-cli/cursor'
import type { Cmd, Msg } from '@suds-cli/tea'

// Create a cursor (defaults to blink mode)
let cursor = new CursorModel()

// In init, start blinking
function init(): Cmd<Msg> {
  return cursor.initBlink()
}

// In update, handle focus/blur and blink messages
function update(msg: Msg): [MyModel, Cmd<Msg>] {
  const [nextCursor, cmd] = cursor.update(msg)
  cursor = nextCursor
  return [model, cmd]
}

// In view, render the cursor at your desired position/character
function view(): string {
  return cursor.view()
}
```

## Modes

| Mode                | Behavior                                        |
| ------------------- | ----------------------------------------------- |
| `CursorMode.Blink`  | Toggles between block and text state on a timer |
| `CursorMode.Static` | Always shows the block                          |
| `CursorMode.Hidden` | Always shows text (cursor hidden)               |

## API

| Export            | Description                         |
| ----------------- | ----------------------------------- |
| `CursorModel`     | Main component model                |
| `CursorMode`      | Enum of `Blink`, `Static`, `Hidden` |
| `BlinkMsg`        | Blink toggle message                |
| `InitialBlinkMsg` | Kickoff message for blinking        |

### CursorModel helpers

| Method               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `id()`               | Unique ID for routing                          |
| `mode()`             | Current mode                                   |
| `initBlink()`        | Command to send an initial blink message       |
| `tickBlink()`        | Command to schedule the next blink             |
| `withMode(mode)`     | Change mode (returns new model + optional cmd) |
| `withChar(char)`     | Change the underlying character                |
| `focus()` / `blur()` | Focus management (returns new model)           |
| `update(msg)`        | Handle messages; returns `[model, cmd]`        |
| `view()`             | Render the cursor                              |

## Scripts

- `pnpm -C packages/cursor build`
- `pnpm -C packages/cursor test`
- `pnpm -C packages/cursor lint`
- `pnpm -C packages/cursor generate:api-report`

## License

MIT

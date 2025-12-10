# @suds-cli/key

TypeScript port of Charmbracelet Bubbles key package for user-definable keybindings. Provides immutable `Binding` objects with help text and a `matches()` function for matching key events.

## Install

```bash
pnpm add @suds-cli/key
```

## Quickstart

```ts
import { newBinding, matches } from "@suds-cli/key";

// Define keybindings with help text
const keymap = {
  up: newBinding({
    keys: ["k", "up"],
    help: { key: "↑/k", desc: "move up" },
  }),
  down: newBinding({
    keys: ["j", "down"],
    help: { key: "↓/j", desc: "move down" },
  }),
  quit: newBinding({
    keys: ["q", "esc"],
    help: { key: "q", desc: "quit" },
  }),
};

// Match incoming key events
function update(msg: Msg) {
  if (msg._tag === "key") {
    if (matches(msg, keymap.up)) {
      // handle up
    } else if (matches(msg, keymap.down)) {
      // handle down
    } else if (matches(msg, keymap.quit)) {
      // handle quit
    }
  }
}
```

### Fluent Builder

```ts
const binding = newBinding()
  .withKeys("j", "down")
  .withHelp("↓/j", "move down");
```

### Dynamic Enable/Disable

```ts
// Disable a binding based on state
const up = keymap.up.withEnabled(cursor > 0);

// Disabled bindings won't match
matches(key("k"), up); // false when disabled
```

### Unbinding

```ts
// Clear keys and help entirely
const unbound = keymap.up.unbound();
```

## API

| Export | Description |
|--------|-------------|
| `Binding` | Immutable class holding keys, help text, and disabled state |
| `newBinding(opts?)` | Factory function to create bindings |
| `matches(key, ...bindings)` | Check if a key matches any enabled binding |
| `Help` | Interface `{ key: string, desc: string }` |
| `Matchable` | Interface for objects with `toString()` |

## Scripts

- `pnpm -C packages/key build`
- `pnpm -C packages/key test`
- `pnpm -C packages/key lint`
- `pnpm -C packages/key generate:api-report`

## License

MIT







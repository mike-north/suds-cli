# @suds-cli/tea

TypeScript port of [Bubble Tea](https://github.com/charmbracelet/bubbletea), the Elm-inspired terminal UI framework from Charm. Build interactive CLIs using a simple, functional architecture: Model-Update-View.

## Install

```bash
pnpm add @suds-cli/tea
```

## Quickstart

```ts
import {
  Program,
  quit,
  KeyMsg,
  KeyType,
  type Model,
  type Cmd,
  type Msg,
} from "@suds-cli/tea";

// Define your message types
type AppMsg = Msg | { _tag: "increment" } | { _tag: "decrement" };

// Create a model implementing the Model interface
class Counter implements Model<AppMsg, Counter> {
  constructor(public readonly count: number = 0) {}

  init(): Cmd<AppMsg> {
    return null;
  }

  update(msg: AppMsg): [Counter, Cmd<AppMsg>] {
    if (msg instanceof KeyMsg) {
      switch (msg.key.type) {
        case KeyType.Up:
          return [new Counter(this.count + 1), null];
        case KeyType.Down:
          return [new Counter(this.count - 1), null];
        case KeyType.Esc:
          return [this, quit()];
      }
    }
    return [this, null];
  }

  view(): string {
    return `Count: ${this.count}\n\nPress ↑/↓ to change, Esc to quit`;
  }
}

// Run the program
const program = new Program(new Counter(), { altScreen: true });
await program.run();
```

## Architecture

Tea follows the [Elm Architecture](https://guide.elm-lang.org/architecture/):

- **Model** — Your application state, implementing `init()`, `update()`, and `view()`
- **Msg** — Discriminated union of messages that trigger state changes
- **Cmd** — Async side effects that produce messages
- **Program** — Runtime that orchestrates the event loop

### Messages

All messages must include a `_tag` discriminant for type-safe matching:

```ts
type MyMsg =
  | { _tag: "tick"; time: Date }
  | { _tag: "data-loaded"; items: string[] };
```

### Commands

Commands are async functions that return messages. Use the built-in helpers:

```ts
import { batch, sequence, tick, every, msg, quit } from "@suds-cli/tea";

// Lift a value into a command
const notify = msg({ _tag: "notify", text: "Hello" });

// Emit after delay
const delayed = tick(1000, (time) => ({ _tag: "tick", time }));

// Emit aligned to interval boundary (for clocks, animations)
const interval = every(1000, (time) => ({ _tag: "tick", time }));

// Run commands concurrently
const parallel = batch(cmd1, cmd2, cmd3);

// Run commands sequentially
const sequential = sequence(cmd1, cmd2, cmd3);

// Graceful exit
const exit = quit();
```

## Input Handling

### Keyboard

```ts
import { KeyMsg, KeyType, keyToString } from "@suds-cli/tea";

update(msg: Msg): [Model, Cmd<Msg>] {
  if (msg instanceof KeyMsg) {
    const { key } = msg;

    // Check key type
    if (key.type === KeyType.Enter) { /* ... */ }
    if (key.type === KeyType.Tab) { /* ... */ }
    if (key.type === KeyType.Up) { /* ... */ }

    // Check for character input
    if (key.type === KeyType.Runes) {
      console.log(key.runes); // The typed character(s)
    }

    // Check modifiers
    if (key.alt) { /* Alt+key pressed */ }
    if (key.paste) { /* Pasted text */ }

    // Get human-readable representation
    console.log(keyToString(key)); // "ctrl+c", "alt+enter", "a"
  }
  return [this, null];
}
```

### Mouse

```ts
import { MouseMsg, MouseAction, MouseButton } from "@suds-cli/tea";

update(msg: Msg): [Model, Cmd<Msg>] {
  if (msg instanceof MouseMsg) {
    const { event } = msg;

    if (event.action === MouseAction.Press && event.button === MouseButton.Left) {
      // Left click at event.x, event.y
    }

    if (event.button === MouseButton.WheelUp) {
      // Scroll up
    }

    // Modifier keys
    if (event.ctrl || event.alt || event.shift) { /* ... */ }
  }
  return [this, null];
}
```

Enable mouse with program options:

```ts
const program = new Program(model, {
  mouseMode: "cell",  // Track clicks and drags
  // mouseMode: "all", // Track all motion
});
```

## Terminal Control

Commands for terminal manipulation:

```ts
import {
  clearScreen,
  hideCursor,
  showCursor,
  setWindowTitle,
  enableMouseCellMotion,
  enableMouseAllMotion,
  disableMouse,
  windowSize,
} from "@suds-cli/tea";

// In your update function
return [newModel, clearScreen()];
return [newModel, setWindowTitle("My App")];
return [newModel, batch(hideCursor(), clearScreen())];
```

## System Messages

The program emits these messages automatically:

```ts
import {
  WindowSizeMsg,    // Terminal resized: { width, height }
  FocusMsg,         // Terminal gained focus
  BlurMsg,          // Terminal lost focus
  InterruptMsg,     // Ctrl+C pressed
  QuitMsg,          // Graceful shutdown requested
} from "@suds-cli/tea";

update(msg: Msg): [Model, Cmd<Msg>] {
  if (msg instanceof WindowSizeMsg) {
    return [this.withSize(msg.width, msg.height), null];
  }
  return [this, null];
}
```

## Program Options

```ts
const program = new Program(model, {
  altScreen: true,        // Use alternate screen buffer
  mouseMode: "cell",      // "cell" | "all" | false
  fps: 60,                // Render frame rate
  reportFocus: true,      // Receive focus/blur events
  bracketedPaste: true,   // Distinguish pasted text
  input: process.stdin,   // Custom input stream
  output: process.stdout, // Custom output stream
});
```

## Scripts

- `pnpm -C packages/tea build`
- `pnpm -C packages/tea test`
- `pnpm -C packages/tea lint`
- `pnpm -C packages/tea generate:api-report`

## License

MIT







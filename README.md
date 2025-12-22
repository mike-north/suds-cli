# 🧼 Suds

**Build beautiful terminal UIs in TypeScript.**

Suds is a **best-effort TypeScript port** of the wonderful [Bubble Tea](https://github.com/charmbracelet/bubbletea) framework and [Bubbles](https://github.com/charmbracelet/bubbles) component library from [Charm](https://charm.sh), with additional utilities inspired by [Teacup](https://github.com/mistakenelf/teacup).

<img src="./examples/textarea-demo.gif" width="800" alt="Textarea component demo" />

## Why Suds?

- **Elm Architecture** — Simple, functional model-update-view pattern
- **Type Safe** — Full TypeScript with strict types throughout
- **Batteries Included** — Spinners, inputs, tables, lists, and more
- **Composable** — Mix and match components to build complex UIs
- **ANSI-aware** — Proper handling of colors, wide characters, and escape sequences

## Quick Start

```bash
pnpm add @suds-cli/tea @suds-cli/spinner @suds-cli/chapstick
```

```ts
import {
  Program,
  KeyMsg,
  KeyType,
  quit,
  type Model,
  type Cmd,
  type Msg,
} from '@suds-cli/tea'
import { SpinnerModel, TickMsg, dot } from '@suds-cli/spinner'
import { Style } from '@suds-cli/chapstick'

class LoadingScreen implements Model<Msg, LoadingScreen> {
  readonly spinner: SpinnerModel

  constructor(spinner?: SpinnerModel) {
    this.spinner =
      spinner ??
      new SpinnerModel({
        spinner: dot,
        style: new Style().foreground('#50fa7b'),
      })
  }

  init(): Cmd<Msg> {
    return this.spinner.tick() as Cmd<Msg>
  }

  update(msg: Msg): [LoadingScreen, Cmd<Msg>] {
    if (msg instanceof KeyMsg && msg.key.type === KeyType.Esc) {
      return [this, quit()]
    }

    const [next, cmd] = this.spinner.update(msg)
    return [new LoadingScreen(next), cmd as Cmd<Msg>]
  }

  view(): string {
    return `\n  ${this.spinner.view()}  Loading...\n`
  }
}

const program = new Program(new LoadingScreen())
await program.run()
```

## Packages

### Core

| Package                                     | Description                                             |
| ------------------------------------------- | ------------------------------------------------------- |
| [@suds-cli/tea](./packages/tea)             | The runtime — keyboard/mouse input, rendering, commands |
| [@suds-cli/chapstick](./packages/chapstick) | Terminal styling — colors, borders, padding, alignment  |
| [@suds-cli/key](./packages/key)             | Keybinding definitions and matching                     |

### Components

| Package                                       | Description                               |
| --------------------------------------------- | ----------------------------------------- |
| [@suds-cli/spinner](./packages/spinner)       | Animated loading spinners                 |
| [@suds-cli/progress](./packages/progress)     | Animated progress bars with gradients     |
| [@suds-cli/textinput](./packages/textinput)   | Single-line text input with cursor        |
| [@suds-cli/textarea](./packages/textarea)     | Multi-line text editor                    |
| [@suds-cli/table](./packages/table)           | Tabular data with scrolling and selection |
| [@suds-cli/list](./packages/list)             | Filterable, paginated item lists          |
| [@suds-cli/viewport](./packages/viewport)     | Scrollable content window                 |
| [@suds-cli/paginator](./packages/paginator)   | Pagination logic and UI                   |
| [@suds-cli/timer](./packages/timer)           | Countdown timer                           |
| [@suds-cli/stopwatch](./packages/stopwatch)   | Elapsed time counter                      |
| [@suds-cli/help](./packages/help)             | Auto-generated keybinding help            |
| [@suds-cli/filepicker](./packages/filepicker) | File system browser                       |
| [@suds-cli/cursor](./packages/cursor)         | Blinking cursor component                 |

### Utilities

| Package                                   | Description                             |
| ----------------------------------------- | --------------------------------------- |
| [@suds-cli/runeutil](./packages/runeutil) | Text sanitization and grapheme handling |

## Examples

### Styled Progress Bar

```ts
import { ProgressModel } from '@suds-cli/progress'
import { Style, borderStyles } from '@suds-cli/chapstick'

const progress = ProgressModel.withDefaultGradient({ width: 40 })
const [updated] = progress.setPercent(0.65)

const box = new Style()
  .padding(1, 2)
  .border(borderStyles.rounded)
  .borderForeground('#7c3aed')

console.log(box.render(updated.view()))
```

```text
╭──────────────────────────────────────────────╮
│                                              │
│  ████████████████████████░░░░░░░░░░░░ 65%    │
│                                              │
╰──────────────────────────────────────────────╯
```

### Interactive List

```ts
import { ListModel, DefaultItem } from '@suds-cli/list'
import {
  Program,
  KeyMsg,
  quit,
  type Model,
  type Cmd,
  type Msg,
} from '@suds-cli/tea'
import { matches, newBinding } from '@suds-cli/key'

const items = [
  new DefaultItem('Build UI', 'Create the interface'),
  new DefaultItem('Add tests', 'Write comprehensive tests'),
  new DefaultItem('Deploy', 'Ship to production'),
]

class TaskList implements Model<Msg, TaskList> {
  readonly list: ListModel<DefaultItem>

  constructor(list?: ListModel<DefaultItem>) {
    this.list =
      list ??
      ListModel.new({
        items,
        title: 'Tasks',
        height: 10,
        showFilter: true,
        showHelp: true,
      })
  }

  init(): Cmd<Msg> {
    return this.list.init()
  }

  update(msg: Msg): [TaskList, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, newBinding({ keys: ['q'] }))) {
      return [this, quit()]
    }
    const [next, cmd] = this.list.update(msg)
    return [new TaskList(next), cmd]
  }

  view(): string {
    return this.list.view()
  }
}
```

### Text Input Form

```ts
import { TextInputModel, EchoMode } from '@suds-cli/textinput'
import { Style } from '@suds-cli/chapstick'

const label = new Style().bold().foreground('#f8f8f2')
const input = TextInputModel.new({
  placeholder: 'Enter your name...',
  width: 30,
})

// In your view:
;`${label.render('Name:')} ${input.view()}`
```

### Scrollable Content

```ts
import { ViewportModel } from '@suds-cli/viewport'

const viewport = ViewportModel.new({ width: 60, height: 20 }).setContent(
  longMarkdownText,
)

// Handle j/k, pgup/pgdn, arrows automatically
const [next] = viewport.update(keyMsg)
console.log(next.view())
```

## The Elm Architecture

Suds follows the [Elm Architecture](https://guide.elm-lang.org/architecture/), a simple pattern for building UIs:

```text
┌─────────────────────────────────────────────┐
│                                             │
│   ┌─────────┐                               │
│   │  Model  │ ← Your application state      │
│   └────┬────┘                               │
│        │                                    │
│        ▼                                    │
│   ┌─────────┐                               │
│   │  View   │ → Renders state to string     │
│   └────┬────┘                               │
│        │                                    │
│        ▼                                    │
│   ┌─────────┐                               │
│   │ Update  │ ← Handles messages,           │
│   └─────────┘   returns new state           │
│                                             │
└─────────────────────────────────────────────┘
```

**Model** — Your application state (any class implementing the `Model` interface)

**View** — A pure function that renders your model to a string

**Update** — Handles incoming messages (key presses, mouse events, timers) and returns updated state

**Commands** — Async side effects that produce messages (API calls, timers, file I/O)

## API Documentation

Full API documentation is available in the [docs](./docs) folder, auto-generated from TypeScript definitions.

## Running the Examples

```bash
# Clone the repo
git clone https://github.com/your-org/suds
cd suds

# Install dependencies
pnpm install

# Run a demo
pnpm demo spinner-demo
pnpm demo list-demo
pnpm demo progress-demo
pnpm demo textinput-demo
```

## Credits

Suds is a TypeScript port of excellent Go libraries from the [Charm](https://charm.sh) ecosystem:

- [**Bubble Tea**](https://github.com/charmbracelet/bubbletea) — The TUI framework
- [**Bubbles**](https://github.com/charmbracelet/bubbles) — TUI components
- [**Lip Gloss**](https://github.com/charmbracelet/lipgloss) — Terminal styling
- [**Teacup**](https://github.com/mistakenelf/teacup) — Additional components by [@mistakenelf](https://github.com/mistakenelf)
- [**Reflow**](https://github.com/muesli/reflow) — ANSI-aware text wrapping by [@muesli](https://github.com/muesli)

All credit for the original architecture, design, and algorithms goes to those projects.

## License

MIT

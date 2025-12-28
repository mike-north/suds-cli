# 🧋 Boba

**Build beautiful terminal UIs in TypeScript.**

Boba is a **best-effort TypeScript port** of the wonderful [Bubble Tea](https://github.com/charmbracelet/bubbletea) framework and [Bubbles](https://github.com/charmbracelet/bubbles) component library from [Charm](https://charm.sh), with additional utilities inspired by [Teacup](https://github.com/mistakenelf/teacup).

<img src="./examples/animations/textarea.gif" width="800" alt="Textarea component demo" />

## Why Boba?

- **Declarative DSL** — Build TUIs with a simple, chainable builder API
- **Type Safe** — Full TypeScript with strict types throughout
- **Batteries Included** — Spinners, inputs, tables, lists, and more
- **Composable** — Mix and match components to build complex UIs
- **ANSI-aware** — Proper handling of colors, wide characters, and escape sequences

## Quick Start

```bash
pnpm add @boba-cli/dsl
```

```ts
import { createApp, spinner, text, vstack } from '@boba-cli/dsl'

const app = createApp()
  .state({ message: 'Loading...' })
  .component('spin', spinner({ style: { foreground: '#50fa7b' } }))
  .onKey('esc', ({ quit }) => quit())
  .onKey('q', ({ quit }) => quit())
  .view(({ state, components }) =>
    vstack(components.spin, text(state.message))
  )
  .build()

await app.run()
```

## Packages

### Framework

| Package                                     | Description                                             |
| ------------------------------------------- | ------------------------------------------------------- |
| [@boba-cli/dsl](./packages/dsl)             | **Main API** — Declarative builder for TUI applications |
| [@boba-cli/tea](./packages/tea)             | Low-level runtime — keyboard/mouse input, rendering     |
| [@boba-cli/chapstick](./packages/chapstick) | Terminal styling — colors, borders, padding, alignment  |
| [@boba-cli/key](./packages/key)             | Keybinding definitions and matching                     |

### Components

| Package                                       | Description                               |
| --------------------------------------------- | ----------------------------------------- |
| [@boba-cli/spinner](./packages/spinner)       | Animated loading spinners                 |
| [@boba-cli/progress](./packages/progress)     | Animated progress bars with gradients     |
| [@boba-cli/textinput](./packages/textinput)   | Single-line text input with cursor        |
| [@boba-cli/textarea](./packages/textarea)     | Multi-line text editor                    |
| [@boba-cli/table](./packages/table)           | Tabular data with scrolling and selection |
| [@boba-cli/list](./packages/list)             | Filterable, paginated item lists          |
| [@boba-cli/viewport](./packages/viewport)     | Scrollable content window                 |
| [@boba-cli/paginator](./packages/paginator)   | Pagination logic and UI                   |
| [@boba-cli/timer](./packages/timer)           | Countdown timer                           |
| [@boba-cli/stopwatch](./packages/stopwatch)   | Elapsed time counter                      |
| [@boba-cli/help](./packages/help)             | Auto-generated keybinding help            |
| [@boba-cli/filepicker](./packages/filepicker) | File system browser                       |
| [@boba-cli/cursor](./packages/cursor)         | Blinking cursor component                 |

### Utilities

| Package                                   | Description                             |
| ----------------------------------------- | --------------------------------------- |
| [@boba-cli/runeutil](./packages/runeutil) | Text sanitization and grapheme handling |

## Examples

### Interactive List

```ts
import { createApp, list, DefaultItem } from '@boba-cli/dsl'

const items = [
  new DefaultItem('Build UI', 'Create the interface'),
  new DefaultItem('Add tests', 'Write comprehensive tests'),
  new DefaultItem('Deploy', 'Ship to production'),
]

const app = createApp()
  .component('tasks', list({ items, title: 'Tasks', showFilter: true }))
  .onKey('q', ({ quit }) => quit())
  .view(({ components }) => components.tasks)
  .build()

await app.run()
```

### Text Input Form

```ts
import { createApp, textInput, text, vstack } from '@boba-cli/dsl'

const app = createApp()
  .state({ name: '' })
  .component('input', textInput({ placeholder: 'Enter your name...', width: 30 }))
  .onKey('enter', ({ quit }) => quit())
  .view(({ components }) =>
    vstack(text('Name:'), components.input)
  )
  .build()

await app.run()
```

### Progress Bar with Styling

```ts
import { createApp, progress, text, vstack, box } from '@boba-cli/dsl'

const app = createApp()
  .state({ percent: 0.65 })
  .component('bar', progress({ width: 40, gradient: true }))
  .onInit(({ sendToComponent }) => {
    sendToComponent('bar', (m) => m.setPercent(0.65))
  })
  .view(({ components }) =>
    box({ border: 'rounded', borderForeground: '#7c3aed', padding: [1, 2] },
      vstack(components.bar, text('65% complete'))
    )
  )
  .build()

await app.run()
```

## Low-Level API

For advanced use cases requiring fine-grained control, you can use `@boba-cli/tea` directly with the [Elm Architecture](https://guide.elm-lang.org/architecture/):

```ts
import { Program, KeyMsg, KeyType, quit, type Model, type Cmd, type Msg } from '@boba-cli/tea'
import { SpinnerModel, dot } from '@boba-cli/spinner'

class LoadingScreen implements Model<Msg, LoadingScreen> {
  readonly spinner: SpinnerModel

  constructor(spinner?: SpinnerModel) {
    this.spinner = spinner ?? new SpinnerModel({ spinner: dot })
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

await new Program(new LoadingScreen()).run()
```

The pattern: **Model** (state) → **View** (render to string) → **Update** (handle messages, return new state)

## API Documentation

Full API documentation is available in the [docs](./docs) folder, auto-generated from TypeScript definitions.

## Running the Examples

```bash
# Clone the repo
git clone https://github.com/mike-north/boba-cli
cd boba-cli

# Install dependencies
pnpm install

# Run demos
pnpm demo                              # Default (progress)
pnpm -C examples ex:spinner            # Animated spinner (DSL)
pnpm -C examples ex:list               # Interactive list
pnpm -C examples ex:textarea           # Multi-line editor
pnpm -C examples ex:spinner-low-level  # Spinner (low-level TEA API)
```

## Credits

Boba is a TypeScript port of excellent Go libraries from the [Charm](https://charm.sh) ecosystem:

- [**Bubble Tea**](https://github.com/charmbracelet/bubbletea) — The TUI framework
- [**Bubbles**](https://github.com/charmbracelet/bubbles) — TUI components
- [**Lip Gloss**](https://github.com/charmbracelet/lipgloss) — Terminal styling
- [**Teacup**](https://github.com/mistakenelf/teacup) — Additional components by [@mistakenelf](https://github.com/mistakenelf)
- [**Reflow**](https://github.com/muesli/reflow) — ANSI-aware text wrapping by [@muesli](https://github.com/muesli)

All credit for the original architecture, design, and algorithms goes to those projects.

## License

MIT

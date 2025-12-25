# @suds-cli/dsl

Declarative DSL for building CLI applications with minimal ceremony. Build terminal UIs using a fluent builder API and view primitives inspired by SwiftUI.

## Install

```bash
pnpm add @suds-cli/dsl
```

## Quick Start

```typescript
import { createApp, spinner, vstack, hstack, text, Style } from '@suds-cli/dsl'

const app = createApp()
  .state({ message: 'Loading something amazing...' })
  .component('loading', spinner({ style: new Style().foreground('#50fa7b') }))
  .onKey(['q', 'ctrl+c'], ({ quit }) => quit())
  .view(({ state, components }) =>
    vstack(
      text('🧼 My App').bold().foreground('#ff79c6'),
      spacer(),
      hstack(components.loading, text('  ' + state.message)),
      spacer(),
      text('Press [q] to quit').dim()
    )
  )
  .build()

await app.run()
```

## Why DSL?

Compare the DSL approach to raw TEA (The Elm Architecture):

| Aspect | Raw TEA | DSL |
|--------|---------|-----|
| Lines of code | ~147 lines | ~35 lines |
| Boilerplate | Manual class, state management, `instanceof` checks | Declarative builder, automatic state handling |
| Type safety | Manual type guards, verbose generics | Phantom types provide compile-time safety |
| View composition | String concatenation | Composable view primitives |
| Component integration | Manual model wrapping and message routing | Automatic component lifecycle management |

See [examples/spinner-demo.ts](../../examples/spinner-demo.ts) (raw TEA) vs [examples/spinner-demo-dsl.ts](../../examples/spinner-demo-dsl.ts) (DSL) for a real comparison.

## API Reference

### App Builder

#### `createApp()`

Creates a new application builder. Start here to build your CLI app.

```typescript
const app = createApp()
  .state({ count: 0 })
  .view(({ state }) => text(`Count: ${state.count}`))
  .build()
```

#### `AppBuilder.state<S>(initial: S)`

Sets the initial application state. The state type is inferred from the provided object.

```typescript
.state({ count: 0, name: 'World' })
```

#### `AppBuilder.component<K, M>(key: K, builder: ComponentBuilder<M>)`

Registers a component with a unique key. The component's rendered view is available in the view function via `components[key]`.

```typescript
.component('spinner', spinner())
.component('input', textInput())
```

#### `AppBuilder.onKey(keys: string | string[], handler: KeyHandler)`

Registers a key handler. Supports single keys, key arrays, and modifiers.

```typescript
.onKey('q', ({ quit }) => quit())
.onKey(['up', 'k'], ({ state, update }) => update({ index: state.index - 1 }))
.onKey('ctrl+c', ({ quit }) => quit())
```

**Key handler context:**
- `state` - Current application state
- `components` - Current component views
- `update(patch)` - Merge partial state (shallow merge)
- `setState(newState)` - Replace entire state
- `quit()` - Gracefully quit the application

#### `AppBuilder.view(fn: ViewFunction)`

Sets the view function. Called on every render cycle. Returns a view node tree describing the UI.

```typescript
.view(({ state, components }) =>
  vstack(
    text('Hello ' + state.name),
    components.spinner
  )
)
```

#### `AppBuilder.build()`

Finalizes the builder chain and creates an `App` ready to run.

```typescript
const app = builder.build()
await app.run()
```

### View Primitives

#### `text(content: string): TextNode`

Creates a text node with chainable style methods.

```typescript
text('Hello').bold().foreground('#ff79c6')
text('Warning').dim().italic()
text('Success').background('#282a36')
```

**Style methods:**
- `bold()` - Apply bold styling
- `dim()` - Apply dim styling
- `italic()` - Apply italic styling
- `foreground(color)` - Set foreground color (hex or named)
- `background(color)` - Set background color (hex or named)

#### `vstack(...children: ViewNode[]): LayoutNode`

Arranges child views vertically with newlines between them.

```typescript
vstack(
  text('Line 1'),
  text('Line 2'),
  text('Line 3')
)
```

#### `hstack(...children: ViewNode[]): LayoutNode`

Arranges child views horizontally on the same line.

```typescript
hstack(
  text('Left'),
  text(' | '),
  text('Right')
)
```

#### `spacer(height?: number): string`

Creates empty vertical space. Default height is 1 line.

```typescript
vstack(
  text('Header'),
  spacer(2),
  text('Content')
)
```

#### `divider(char?: string, width?: number): string`

Creates a horizontal divider line. Default is 40 '─' characters.

```typescript
vstack(
  text('Section 1'),
  divider(),
  text('Section 2'),
  divider('=', 50)
)
```

### Conditional Helpers

#### `when(condition: boolean, node: ViewNode): ViewNode`

Conditionally renders a node. Returns empty string if condition is false.

```typescript
vstack(
  text('Always visible'),
  when(state.showHelp, text('Help text'))
)
```

#### `choose(condition: boolean, ifTrue: ViewNode, ifFalse: ViewNode): ViewNode`

Chooses between two nodes based on a condition.

```typescript
choose(
  state.isLoading,
  text('Loading...').dim(),
  text('Ready!').bold()
)
```

#### `map<T>(items: T[], render: (item: T, index: number) => ViewNode): ViewNode[]`

Maps an array of items to view nodes. Spread the result into a layout.

```typescript
vstack(
  ...map(state.items, (item, index) =>
    text(`${index + 1}. ${item.name}`)
  )
)
```

### Component Builders

#### `spinner(options?: SpinnerBuilderOptions): ComponentBuilder<SpinnerModel>`

Creates an animated spinner component.

```typescript
.component('loading', spinner())
.component('loading', spinner({
  spinner: dot,
  style: new Style().foreground('#50fa7b')
}))
```

**Options:**
- `spinner` - Animation to use (default: `line`). Available: `line`, `dot`, `miniDot`, `pulse`, `points`, `moon`, `meter`, `ellipsis`
- `style` - Style for rendering (default: unstyled)

**Re-exported spinners:**
```typescript
import { line, dot, miniDot, pulse, points, moon, meter, ellipsis } from '@suds-cli/dsl'
```

### Re-exported Types

For convenience, the DSL re-exports commonly used types:

```typescript
// From @suds-cli/chapstick
import { Style } from '@suds-cli/dsl'

// From @suds-cli/spinner
import { type Spinner, line, dot, miniDot, pulse, points, moon, meter, ellipsis } from '@suds-cli/dsl'
```

## Type Safety

The DSL uses phantom types to provide compile-time guarantees about application structure:

### State Type Safety

```typescript
const app = createApp()
  .state({ count: 0 })
  .view(({ state }) => text(`Count: ${state.count}`))
  //                                    ^^^^^ TypeScript knows this is number
```

### Component Type Safety

```typescript
const app = createApp()
  .component('spinner', spinner())
  .view(({ components }) => components.spinner)
  //                        ^^^^^^^^^^^^^^^^^^ ComponentView
```

If you try to access a component that doesn't exist, TypeScript will error:

```typescript
.view(({ components }) => components.doesNotExist)
//                                   ^^^^^^^^^^^^ Error: Property 'doesNotExist' does not exist
```

### Builder Chain Validation

The builder enforces that `view()` is called before `build()`:

```typescript
createApp()
  .state({ count: 0 })
  .build()
// Error: AppBuilder: view() must be called before build()
```

## Advanced Usage

### Accessing the Underlying TEA Model

For advanced use cases, you can access the generated TEA model:

```typescript
const app = createApp()
  .state({ count: 0 })
  .view(({ state }) => text(`Count: ${state.count}`))
  .build()

const model = app.getModel()
// model is a TEA Model<Msg> instance
```

### Custom Component Builders

You can create custom component builders by implementing the `ComponentBuilder` interface:

```typescript
import type { ComponentBuilder } from '@suds-cli/dsl'
import type { Cmd, Msg } from '@suds-cli/tea'

interface MyComponentModel {
  value: number
}

const myComponent = (): ComponentBuilder<MyComponentModel> => ({
  init() {
    return [{ value: 0 }, null]
  },
  update(model, msg) {
    // Handle messages
    return [model, null]
  },
  view(model) {
    return `Value: ${model.value}`
  }
})

// Use it
createApp()
  .component('custom', myComponent())
  .view(({ components }) => components.custom)
```

## Examples

### Counter with State Updates

```typescript
import { createApp, vstack, hstack, text } from '@suds-cli/dsl'

const app = createApp()
  .state({ count: 0 })
  .onKey('up', ({ state, update }) => update({ count: state.count + 1 }))
  .onKey('down', ({ state, update }) => update({ count: state.count - 1 }))
  .onKey('q', ({ quit }) => quit())
  .view(({ state }) =>
    vstack(
      text('Counter').bold(),
      spacer(),
      text(`Count: ${state.count}`),
      spacer(),
      text('[↑/↓] adjust • [q] quit').dim()
    )
  )
  .build()

await app.run()
```

### Todo List with Conditional Rendering

```typescript
const app = createApp()
  .state({
    items: ['Buy milk', 'Write docs', 'Build CLI'],
    selected: 0
  })
  .onKey('up', ({ state, update }) =>
    update({ selected: Math.max(0, state.selected - 1) })
  )
  .onKey('down', ({ state, update }) =>
    update({ selected: Math.min(state.items.length - 1, state.selected + 1) })
  )
  .onKey('q', ({ quit }) => quit())
  .view(({ state }) =>
    vstack(
      text('Todo List').bold(),
      divider(),
      ...map(state.items, (item, index) =>
        choose(
          index === state.selected,
          text(`> ${item}`).foreground('#50fa7b'),
          text(`  ${item}`)
        )
      ),
      divider(),
      text('[↑/↓] navigate • [q] quit').dim()
    )
  )
  .build()

await app.run()
```

### Multiple Components

```typescript
import { createApp, spinner, vstack, hstack, text, Style, dot, pulse } from '@suds-cli/dsl'

const app = createApp()
  .state({ status: 'Initializing...' })
  .component('spinner1', spinner({ spinner: dot, style: new Style().foreground('#50fa7b') }))
  .component('spinner2', spinner({ spinner: pulse, style: new Style().foreground('#ff79c6') }))
  .onKey('q', ({ quit }) => quit())
  .view(({ state, components }) =>
    vstack(
      text('Multi-Spinner Demo').bold(),
      spacer(),
      hstack(components.spinner1, text('  Loading data...')),
      hstack(components.spinner2, text('  Processing...')),
      spacer(),
      text(`Status: ${state.status}`).dim(),
      spacer(),
      text('[q] quit').dim()
    )
  )
  .build()

await app.run()
```

## Scripts

- `pnpm -C packages/dsl build`
- `pnpm -C packages/dsl test`
- `pnpm -C packages/dsl lint`
- `pnpm -C packages/dsl generate:api-report`

## License

MIT

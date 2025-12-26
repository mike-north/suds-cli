# @boba-cli/dsl

Declarative DSL for building CLI applications with minimal ceremony. Build terminal UIs using a fluent builder API and view primitives inspired by SwiftUI.

## Install

```bash
pnpm add @boba-cli/dsl
```

## Quick Start

```typescript
import { createApp, spinner, vstack, hstack, text, Style } from '@boba-cli/dsl'

const app = createApp()
  .state({ message: 'Loading something amazing...' })
  .component('loading', spinner({ style: new Style().foreground('#50fa7b') }))
  .onKey(['q', 'ctrl+c'], ({ quit }) => quit())
  .view(({ state, components }) =>
    vstack(
      text('🧋 My App').bold().foreground('#ff79c6'),
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

The DSL provides 17 component builders for common CLI patterns. All components integrate seamlessly with the App builder pattern and provide declarative configuration.

#### `code(options: CodeBuilderOptions): ComponentBuilder<CodeModel>`

Displays syntax-highlighted source code from files with scrolling support.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'

.component('viewer', code({
  filesystem: new NodeFileSystemAdapter(),
  path: new NodePathAdapter(),
  active: true,
  theme: 'dracula',
  width: 80,
  height: 24
}))
```

**Options:**
- `filesystem` - Filesystem adapter (required, use `NodeFileSystemAdapter` for Node.js)
- `path` - Path adapter (required, use `NodePathAdapter` for Node.js)
- `active` - Whether component receives keyboard input (default: `false`)
- `theme` - Syntax theme like `"dracula"`, `"monokai"`, `"github-light"` (default: `"dracula"`)
- `width` - Viewer width in characters (default: `0`)
- `height` - Viewer height in lines (default: `0`)

#### `filepicker(options: FilepickerBuilderOptions): ComponentBuilder<FilepickerModel>`

Interactive file system browser with selection support.

```typescript
import { NodeFileSystemAdapter, NodePathAdapter } from '@boba-cli/machine/node'

.component('picker', filepicker({
  filesystem: new NodeFileSystemAdapter(),
  path: new NodePathAdapter(),
  currentPath: process.cwd(),
  height: 15,
  width: 60
}))
```

**Options:**
- `filesystem` - Filesystem adapter (required)
- `path` - Path adapter (required)
- `currentPath` - Initial directory path
- `height` - Picker height in lines
- `width` - Picker width in characters
- Additional styling and behavior options available

#### `filetree(options: FiletreeBuilderOptions): ComponentBuilder<FiletreeModel>`

Directory tree viewer with expandable folders.

```typescript
.component('tree', filetree({
  root: { name: 'src', isDirectory: true, children: [...] }
}))
```

**Options:**
- `root` - Root directory item (required, must be a `DirectoryItem`)
- `showFiles` - Whether to show files or only directories (default: `true`)
- Custom styling options available

#### `help(options?: HelpBuilderOptions): ComponentBuilder<HelpModel>`

Full-screen key binding help display.

```typescript
.component('help', help({
  keyBindings: [
    { key: 'q', description: 'Quit application' },
    { key: '↑/↓', description: 'Navigate list' }
  ],
  showHelp: true
}))
```

**Options:**
- `keyBindings` - Array of key binding descriptions
- `showHelp` - Whether help is visible (default: `false`)
- Custom styling options available

#### `helpBubble(options?: HelpBubbleBuilderOptions): ComponentBuilder<HelpBubbleModel>`

Compact inline help bubble with keyboard shortcuts.

```typescript
.component('shortcuts', helpBubble({
  entries: [
    { key: 'enter', description: 'Select' },
    { key: 'q', description: 'Quit' }
  ]
}))
```

**Options:**
- `entries` - Array of shortcut entries with `key` and `description`
- Custom styling options available

#### `list<T>(options: ListBuilderOptions<T>): ComponentBuilder<ListModel<T>>`

Filterable, paginated list with keyboard navigation. Items must implement the `Item` interface.

```typescript
import { list, type Item } from '@boba-cli/dsl'

interface TodoItem extends Item {
  filterValue: () => string
  title: () => string
  description: () => string
}

const items: TodoItem[] = [
  { filterValue: () => 'Buy milk', title: () => 'Buy milk', description: () => 'From the store' }
]

.component('todos', list({ items, title: 'Tasks', height: 20 }))
```

**Options:**
- `items` - Array of items implementing `Item` interface (required)
- `title` - List title
- `height` - List height in lines
- `width` - List width in characters
- `showTitle`, `showFilter`, `showPagination`, `showHelp`, `showStatusBar` - Toggle UI elements
- `filteringEnabled` - Enable/disable filtering (default: `true`)
- `styles` - Custom styles for list components
- `keyMap` - Custom key bindings
- `delegate` - Custom item rendering

#### `markdown(options?: MarkdownBuilderOptions): ComponentBuilder<MarkdownModel>`

Renders markdown with syntax highlighting.

```typescript
.component('docs', markdown({
  content: '# Hello\n\nThis is **markdown**.',
  width: 80
}))
```

**Options:**
- `content` - Markdown content to render
- `width` - Rendering width in characters
- Custom styling options available

#### `paginator(options?: PaginatorBuilderOptions): ComponentBuilder<PaginatorModel>`

Dot-style page indicator (e.g., `● ○ ○`).

```typescript
.component('pages', paginator({
  totalPages: 5,
  currentPage: 0
}))
```

**Options:**
- `totalPages` - Total number of pages (default: `3`)
- `currentPage` - Current page index (default: `0`)
- Custom styling options available

#### `progress(options?: ProgressBuilderOptions): ComponentBuilder<ProgressModel>`

Animated progress bar with gradient support and spring physics.

```typescript
.component('progress', progress({
  width: 40,
  gradient: {
    start: '#5A56E0',
    end: '#EE6FF8',
    scaleGradientToProgress: false
  },
  showPercentage: true,
  spring: {
    frequency: 18,
    damping: 1
  }
}))
```

**Options:**
- `width` - Progress bar width in characters (default: `40`)
- `full` - Character for filled portion (default: `'█'`)
- `empty` - Character for empty portion (default: `'░'`)
- `fullColor` - Color for filled portion (default: `'#7571F9'`)
- `emptyColor` - Color for empty portion (default: `'#606060'`)
- `showPercentage` - Display percentage value (default: `true`)
- `percentFormat` - Printf-style format string (default: `' %3.0f%%'`)
- `gradient` - Gradient configuration with `start`, `end`, `scaleGradientToProgress`
- `spring` - Spring physics with `frequency`, `damping`
- `percentageStyle` - Style for percentage text

#### `spinner(options?: SpinnerBuilderOptions): ComponentBuilder<SpinnerModel>`

Animated loading spinner.

```typescript
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
import { line, dot, miniDot, pulse, points, moon, meter, ellipsis } from '@boba-cli/dsl'
```

#### `statusBar(options?: StatusBarBuilderOptions): ComponentBuilder<StatusBarModel>`

Multi-column status bar for displaying key-value pairs.

```typescript
.component('status', statusBar({
  columns: [
    { key: 'mode', value: 'NORMAL' },
    { key: 'line', value: '42' }
  ]
}))
```

**Options:**
- `columns` - Array of column definitions with `key` and `value`
- Custom styling options available

#### `stopwatch(options?: StopwatchBuilderOptions): ComponentBuilder<StopwatchModel>`

Displays elapsed time since start.

```typescript
.component('elapsed', stopwatch({
  format: 'mm:ss.SSS',
  running: true
}))
```

**Options:**
- `format` - Time format string (default: `'mm:ss.SSS'`)
- `running` - Whether stopwatch is running (default: `false`)
- Custom styling options available

#### `table(options?: TableBuilderOptions): ComponentBuilder<TableModel>`

Scrollable data table with headers and rows.

```typescript
.component('data', table({
  headers: ['Name', 'Age', 'City'],
  rows: [
    ['Alice', '30', 'NYC'],
    ['Bob', '25', 'SF']
  ],
  height: 10
}))
```

**Options:**
- `headers` - Column headers
- `rows` - Data rows
- `height` - Table height in lines
- `width` - Table width in characters
- Custom styling and scrolling options available

#### `textArea(options?: TextAreaBuilderOptions): ComponentBuilder<TextAreaModel>`

Multi-line text editor with scrolling and editing.

```typescript
.component('editor', textArea({
  value: 'Initial text',
  width: 80,
  height: 20,
  active: true
}))
```

**Options:**
- `value` - Initial text content
- `width` - Editor width in characters
- `height` - Editor height in lines
- `active` - Whether editor receives keyboard input (default: `false`)
- Custom styling options available

#### `textInput(options?: TextInputBuilderOptions): ComponentBuilder<TextInputModel>`

Single-line text input with validation, placeholders, and echo modes.

```typescript
.component('input', textInput({
  placeholder: 'Enter your name...',
  value: '',
  active: true,
  validate: (value) => value.length > 0 ? null : 'Required'
}))
```

**Options:**
- `value` - Initial input value
- `placeholder` - Placeholder text
- `active` - Whether input receives keyboard input (default: `false`)
- `validate` - Validation function returning error message or `null`
- `echoMode` - Input display mode (normal, password, none)
- `cursorMode` - Cursor style
- Custom styling options available

**Re-exported types:**
```typescript
import { EchoMode, CursorMode, type ValidateFunc } from '@boba-cli/dsl'
```

#### `timer(options?: TimerBuilderOptions): ComponentBuilder<TimerModel>`

Countdown timer display.

```typescript
.component('countdown', timer({
  duration: 60000, // 60 seconds in milliseconds
  format: 'mm:ss',
  running: true
}))
```

**Options:**
- `duration` - Total duration in milliseconds
- `format` - Time format string (default: `'mm:ss'`)
- `running` - Whether timer is running (default: `false`)
- Custom styling options available

#### `viewport(options?: ViewportBuilderOptions): ComponentBuilder<ViewportModel>`

Scrollable content viewport for displaying large content.

```typescript
.component('content', viewport({
  content: longTextContent,
  width: 80,
  height: 20,
  active: true
}))
```

**Options:**
- `content` - Content to display (string or array of strings)
- `width` - Viewport width in characters
- `height` - Viewport height in lines
- `active` - Whether viewport receives keyboard input for scrolling (default: `false`)
- Custom styling options available

### Re-exported Types

For convenience, the DSL re-exports commonly used types from underlying packages:

```typescript
// From @boba-cli/chapstick
import { Style } from '@boba-cli/dsl'

// From @boba-cli/spinner
import { type Spinner, line, dot, miniDot, pulse, points, moon, meter, ellipsis } from '@boba-cli/dsl'

// From @boba-cli/textinput
import { type TextInputModel, EchoMode, CursorMode, type ValidateFunc } from '@boba-cli/dsl'

// From @boba-cli/list
import { type Item } from '@boba-cli/dsl'

// From @boba-cli/filetree
import { type DirectoryItem } from '@boba-cli/dsl'

// From @boba-cli/help-bubble
import { type Entry } from '@boba-cli/dsl'
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
import type { ComponentBuilder } from '@boba-cli/dsl'
import type { Cmd, Msg } from '@boba-cli/tea'

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
import { createApp, vstack, hstack, text } from '@boba-cli/dsl'

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
import { createApp, spinner, vstack, hstack, text, Style, dot, pulse } from '@boba-cli/dsl'

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

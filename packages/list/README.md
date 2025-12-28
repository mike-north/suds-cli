# @boba-cli/list

Filterable, selectable list with integrated help, spinner, and paginator. Ported from the Charm `bubbles/list` component.

<img src="../../examples/animations/list.gif" width="950" alt="List component demo" />

## Using with the DSL (Recommended)

The easiest way to use lists is through [`@boba-cli/dsl`](../dsl/README.md):

```ts
import { createApp, list, DefaultItem } from '@boba-cli/dsl'

const items = [
  new DefaultItem('Build UI', 'Create the interface'),
  new DefaultItem('Add tests', 'Write comprehensive tests'),
]

const app = createApp()
  .component('tasks', list({ items, title: 'Tasks', showFilter: true }))
  .onKey('q', ({ quit }) => quit())
  .view(({ components }) => components.tasks)
  .build()

await app.run()
```

## Low-Level Usage

For direct use with `@boba-cli/tea`:

```ts
import { DefaultItem, ListModel } from '@boba-cli/list'

const list = ListModel.new({
  items: [new DefaultItem('Item 1'), new DefaultItem('Item 2')],
  title: 'Example',
  showFilter: true,
})

const [next, cmd] = [list.startLoading()[0], list.startLoading()[1]]
```

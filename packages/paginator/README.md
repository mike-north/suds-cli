# @boba-cli/paginator

Pagination state management and rendering for Boba terminal UIs. Ported from the Charm `bubbles/paginator` component.

<img src="../../examples/paginator-demo.gif" width="950" alt="Paginator component demo" />

## Usage

```ts
import { PaginatorModel, PaginatorType } from '@boba-cli/paginator'

const paginator = PaginatorModel.new({
  type: PaginatorType.Dots,
  perPage: 10,
})

const next = paginator.setTotalPages(items.length)
const [start, end] = next.getSliceBounds(items.length)
const visibleItems = items.slice(start, end)
```

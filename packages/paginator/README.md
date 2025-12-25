> **Deprecation Notice:** This package is being renamed from `@suds-cli/paginator` to `@boba-cli/paginator`. Please update your dependencies accordingly.

# @suds-cli/paginator

Pagination state management and rendering for Suds terminal UIs. Ported from the Charm `bubbles/paginator` component.

<img src="../../examples/paginator-demo.gif" width="950" alt="Paginator component demo" />

## Usage

```ts
import { PaginatorModel, PaginatorType } from '@suds-cli/paginator'

const paginator = PaginatorModel.new({
  type: PaginatorType.Dots,
  perPage: 10,
})

const next = paginator.setTotalPages(items.length)
const [start, end] = next.getSliceBounds(items.length)
const visibleItems = items.slice(start, end)
```

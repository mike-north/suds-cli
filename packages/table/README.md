# @boba-cli/table

Tabular data display with scrolling and selection for Boba terminal UIs.

<img src="../../examples/table-demo.gif" width="950" alt="Table component demo" />

```ts
import { TableModel } from '@boba-cli/table'
import { borderStyles } from '@boba-cli/chapstick'

const table = TableModel.new({
  columns: [
    { title: 'ID', width: 6 },
    { title: 'Task', width: 20 },
    { title: 'Status', width: 10 },
  ],
  rows: [
    ['001', 'Implement table', 'Doing'],
    ['002', 'Write docs', 'Todo'],
  ],
  height: 5,
  focused: true,
  bordered: true,
  borderStyle: borderStyles.rounded,
})

console.log(table.view())
```

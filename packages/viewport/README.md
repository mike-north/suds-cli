# @boba-cli/viewport

Scrollable content window for Boba terminal UIs. Ported from the Charm `bubbles/viewport` component.

<img src="../../examples/viewport-demo.gif" width="950" alt="Viewport component demo" />

## Usage

```ts
import { ViewportModel } from '@boba-cli/viewport'

const viewport = ViewportModel.new({ width: 80, height: 10 }).setContent(
  longText,
)

const [next] = viewport.update(keyMsg) // responds to j/k, pgup/pgdown, etc.

// Render visible slice
console.log(next.view())
```

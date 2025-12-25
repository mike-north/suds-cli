> **Deprecation Notice:** This package is being renamed from `@suds-cli/help` to `@boba-cli/help`. Please update your dependencies accordingly.

# @suds-cli/help

Render short or full help text from your key bindings. Ported from the Charm `bubbles/help` component.

<img src="../../examples/help-demo.gif" width="950" alt="Help component demo" />

```ts
import { HelpModel } from '@suds-cli/help'

const help = HelpModel.new({ width: 80 })
const text = help.view(keyMap)
```

## HelpBubble

A self-contained help bubble component with a scrollable viewport for displaying keyboard shortcuts.

<img src="../../examples/help-bubble-demo.gif" width="950" alt="HelpBubble component demo" />

```ts
import { HelpBubble } from '@suds-cli/help'

const bubble = HelpBubble.new(
  true,
  'Keyboard Shortcuts',
  { foreground: '#f8f8f2', background: '#6272a4' },
  [
    { key: '↑/↓', description: 'Navigate' },
    { key: 'enter', description: 'Select' },
    { key: 'q', description: 'Quit' },
  ],
)
```

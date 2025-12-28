# @boba-cli/spinner

Animated spinner component for Boba terminal UIs. Port of Charmbracelet Bubbles spinner.

<img src="../../examples/animations/spinner.gif" width="950" alt="Spinner component demo" />

## Install

```bash
pnpm add @boba-cli/spinner
```

## Using with the DSL (Recommended)

The easiest way to use spinners is through [`@boba-cli/dsl`](../dsl/README.md):

```ts
import { createApp, spinner, text, hstack } from '@boba-cli/dsl'

const app = createApp()
  .component('loading', spinner({ style: { foreground: '#7c3aed' } }))
  .onKey('q', ({ quit }) => quit())
  .view(({ components }) => hstack(components.loading, text(' Loading...')))
  .build()

await app.run()
```

## Low-Level Usage

For direct use with `@boba-cli/tea`:

```ts
import { SpinnerModel, TickMsg, dot } from '@boba-cli/spinner'
import { Style } from '@boba-cli/chapstick'
import type { Cmd, Msg, Model } from '@boba-cli/tea'

const spinner = new SpinnerModel({
  spinner: dot,
  style: new Style().foreground('#7c3aed'),
})

// In your model's init, start the spinner
init(): Cmd<Msg> {
  return spinner.tick()
}

// In your update function, handle TickMsg
update(msg: Msg): [MyModel, Cmd<Msg>] {
  if (msg instanceof TickMsg) {
    const [nextSpinner, cmd] = spinner.update(msg)
    return [{ ...model, spinner: nextSpinner }, cmd]
  }
  return [model, null]
}

// In your view, render the spinner
view(): string {
  return `Loading ${spinner.view()}`
}
```

## Built-in Spinners

| Spinner     | Preview                   |
| ----------- | ------------------------- |
| `line`      | `\| / - \`                |
| `dot`       | `⣾ ⣽ ⣻ ⢿ ⡿ ⣟ ⣯ ⣷`         |
| `miniDot`   | `⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏`     |
| `jump`      | `⢄ ⢂ ⢁ ⡁ ⡈ ⡐ ⡠`           |
| `pulse`     | `█ ▓ ▒ ░`                 |
| `points`    | `∙∙∙ ●∙∙ ∙●∙ ∙∙●`         |
| `globe`     | `🌍 🌎 🌏`                |
| `moon`      | `🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘` |
| `monkey`    | `🙈 🙉 🙊`                |
| `meter`     | `▱▱▱ ▰▱▱ ▰▰▱ ▰▰▰`         |
| `hamburger` | `☱ ☲ ☴`                |
| `ellipsis`  | `. .. ...`                |

## Custom Spinners

```ts
import type { Spinner } from '@boba-cli/spinner'

const customSpinner: Spinner = {
  frames: ['◐', '◓', '◑', '◒'],
  fps: 100, // milliseconds per frame
}

const model = new SpinnerModel({ spinner: customSpinner })
```

## API

| Export              | Description                       |
| ------------------- | --------------------------------- |
| `SpinnerModel`      | Main component model              |
| `Spinner`           | Interface for spinner definitions |
| `TickMsg`           | Message for animation ticks       |
| `line`, `dot`, etc. | Built-in spinner animations       |

### SpinnerModel Methods

| Method           | Description                             |
| ---------------- | --------------------------------------- |
| `id()`           | Unique ID for message routing           |
| `tick()`         | Command to start/continue animation     |
| `update(msg)`    | Handle messages, returns `[model, cmd]` |
| `view()`         | Render current frame with style         |
| `withSpinner(s)` | New model with different spinner        |
| `withStyle(s)`   | New model with different style          |

## Scripts

- `pnpm -C packages/spinner build`
- `pnpm -C packages/spinner test`
- `pnpm -C packages/spinner lint`
- `pnpm -C packages/spinner generate:api-report`

## License

MIT

# @boba-cli/progress

Animated progress bar for Boba terminal UIs. Port of Charmbracelet Bubbles progress.

<img src="../../examples/animations/progress.gif" width="950" alt="Progress component demo" />

## Install

```bash
pnpm add @boba-cli/progress
```

## Using with the DSL (Recommended)

The easiest way to use progress bars is through [`@boba-cli/dsl`](../dsl/README.md):

```ts
import { createApp, progress, text, vstack } from '@boba-cli/dsl'

const app = createApp()
  .state({ percent: 0 })
  .component('bar', progress({ width: 40, gradient: true }))
  .onInit(({ sendToComponent }) => {
    sendToComponent('bar', (m) => m.setPercent(0.65))
  })
  .onKey('q', ({ quit }) => quit())
  .view(({ components }) => vstack(components.bar, text('Loading...')))
  .build()

await app.run()
```

## Low-Level Usage

For direct use with `@boba-cli/tea`:

```ts
import { ProgressModel, FrameMsg } from '@boba-cli/progress'
import type { Cmd, Msg } from '@boba-cli/tea'

let progress = ProgressModel.withDefaultGradient({ width: 30 })

init(): Cmd<Msg> {
  const [next, cmd] = progress.setPercent(0.4)
  progress = next
  return cmd
}

update(msg: Msg): [unknown, Cmd<Msg>] {
  const [next, cmd] = progress.update(msg)
  progress = next
  return [{ progress }, cmd]
}

view(): string {
  return progress.view()
}
```

## API

- `ProgressModel.new(options?)` create with defaults
- `ProgressModel.withDefaultGradient()` convenience gradient
- `ProgressModel.withGradient(colorA, colorB, scale?)`
- `ProgressModel.withSolidFill(color)`
- `setPercent(percent)` set target percent (0-1) and start animation
- `incrPercent(delta)` adjust target percent
- `update(msg)` handle `FrameMsg` animation ticks
- `view()` render bar; `percent()` exposes animated percent

## Scripts

- `pnpm -C packages/progress build`
- `pnpm -C packages/progress test`
- `pnpm -C packages/progress lint`
- `pnpm -C packages/progress generate:api-report`

## License

MIT

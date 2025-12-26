import { type Cmd, type Msg } from '@boba-cli/tea'
import { StopwatchModel, type StopwatchOptions } from '@boba-cli/stopwatch'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the stopwatch component builder.
 *
 * @remarks
 * Configure the stopwatch timing and automatic start behavior when creating a stopwatch component.
 *
 * @public
 */
export interface StopwatchBuilderOptions {
  /**
   * Tick interval in milliseconds (default: 1000).
   *
   * @remarks
   * Controls how frequently the stopwatch updates its elapsed time display.
   */
  interval?: number
  /**
   * Whether to automatically start the stopwatch on initialization (default: false).
   *
   * @remarks
   * When `true`, the stopwatch begins counting immediately.
   * When `false`, you must call `model.start()` to begin counting.
   */
  autoStart?: boolean
}

/**
 * Create a stopwatch component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/stopwatch` package.
 * The stopwatch tracks elapsed time and can be controlled via its model methods
 * (`start()`, `stop()`, `toggle()`, `reset()`).
 *
 * @example
 * Basic usage (manual start):
 * ```typescript
 * const app = createApp()
 *   .component('timer', stopwatch())
 *   .view(({ components }) => components.timer)
 *   .build()
 * ```
 *
 * @example
 * Auto-start with custom interval:
 * ```typescript
 * const app = createApp()
 *   .component('timer', stopwatch({
 *     interval: 100,
 *     autoStart: true
 *   }))
 *   .view(({ components }) => hstack(
 *     text('Elapsed: '),
 *     components.timer
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With key bindings to control the stopwatch:
 * ```typescript
 * const app = createApp()
 *   .component('timer', stopwatch({ interval: 1000 }))
 *   .view(({ components }) => components.timer)
 *   .build()
 *
 * // Access the model to control it:
 * // model.start()  - start counting
 * // model.stop()   - pause counting
 * // model.toggle() - toggle running state
 * // model.reset()  - reset to 0
 * ```
 *
 * @param options - Configuration options for the stopwatch
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function stopwatch(
  options: StopwatchBuilderOptions = {},
): ComponentBuilder<StopwatchModel> {
  const { interval, autoStart = false } = options

  const stopwatchOpts: StopwatchOptions = {
    interval,
  }

  return {
    init(): [StopwatchModel, Cmd<Msg>] {
      const model = StopwatchModel.new(stopwatchOpts)
      // Type cast is safe: model.start() returns Cmd<StopwatchMsg>, and StopwatchMsg extends Msg.
      // The cast widens the type to the more general Cmd<Msg> that the component builder requires.
      const cmd = autoStart ? (model.start() as Cmd<Msg>) : null
      return [model, cmd]
    },

    update(model: StopwatchModel, msg: Msg): [StopwatchModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: StopwatchModel): string {
      return model.view()
    },
  }
}

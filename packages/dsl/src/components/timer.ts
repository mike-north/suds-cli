import { type Cmd, type Msg } from '@boba-cli/tea'
import { TimerModel, type TimerOptions } from '@boba-cli/timer'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the timer component builder.
 *
 * @remarks
 * Configure the countdown timer when creating a timer component.
 *
 * @public
 */
export interface TimerBuilderOptions {
  /**
   * Milliseconds until the timer expires (required).
   */
  timeout: number
  /**
   * Tick interval in milliseconds (default: 1000).
   *
   * @remarks
   * Controls how frequently the timer updates. Smaller intervals
   * provide more granular countdown display at the cost of more updates.
   */
  interval?: number
  /**
   * Whether to automatically start the timer on initialization (default: true).
   *
   * @remarks
   * If false, the timer must be manually started using the `start()` method.
   */
  autoStart?: boolean
}

/**
 * Create a timer component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/timer` package.
 * The timer counts down from the specified timeout and can be started, stopped,
 * or toggled programmatically.
 *
 * @example
 * Basic usage with auto-start:
 * ```typescript
 * const app = createApp()
 *   .component('countdown', timer({ timeout: 60000 })) // 1 minute
 *   .view(({ components }) => hstack(
 *     text('Time remaining: '),
 *     components.countdown
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom interval and manual start:
 * ```typescript
 * const app = createApp()
 *   .component('countdown', timer({
 *     timeout: 30000,      // 30 seconds
 *     interval: 100,       // Update every 100ms
 *     autoStart: false     // Don't start immediately
 *   }))
 *   .view(({ components }) => components.countdown)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the timer
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function timer(options: TimerBuilderOptions): ComponentBuilder<TimerModel> {
  const timerOpts: TimerOptions = {
    timeout: options.timeout,
    interval: options.interval,
  }

  const autoStart = options.autoStart ?? true

  return {
    init(): [TimerModel, Cmd<Msg>] {
      const model = TimerModel.new(timerOpts)
      const startCmd = autoStart ? model.start() : null
      // Type cast is safe: model.start() returns Cmd<TimerMsg> | null, and TimerMsg extends Msg.
      // The cast widens the type to the more general Cmd<Msg> that the component builder requires.
      return [model, startCmd as Cmd<Msg>]
    },

    update(model: TimerModel, msg: Msg): [TimerModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: TimerModel): string {
      return model.view()
    },
  }
}

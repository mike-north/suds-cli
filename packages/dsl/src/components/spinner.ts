import { type Cmd, type Msg } from '@boba-cli/tea'
import { Style } from '@boba-cli/chapstick'
import { SpinnerModel, type Spinner, line, type SpinnerOptions } from '@boba-cli/spinner'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the spinner component builder.
 *
 * @remarks
 * Configure the spinner animation and styling when creating a spinner component.
 * Spinners are animated loading indicators that automatically tick and cycle through
 * animation frames.
 *
 * @public
 */
export interface SpinnerBuilderOptions {
  /**
   * Spinner animation to use (default: `line`).
   *
   * @remarks
   * Available spinners include:
   * - `line`: Simple line rotation animation (default)
   * - `dot`: Dots appearing sequentially
   * - `miniDot`: Compact dot animation
   * - `pulse`: Pulsing circle animation
   * - `points`: Loading dots animation
   * - `moon`: Moon phase animation
   * - `meter`: Progress meter style
   * - `ellipsis`: Bouncing ellipsis
   *
   * All spinners are re-exported from `@boba-cli/spinner` for convenience.
   */
  spinner?: Spinner

  /**
   * Style for rendering the spinner.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   * The style is applied to all frames of the spinner animation.
   */
  style?: Style
}

/**
 * Create a spinner component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/spinner` package.
 * The spinner automatically animates by ticking through animation frames. It starts
 * animating immediately when the application initializes.
 *
 * Spinners are useful for indicating loading states, background processes, or
 * that the application is working on a task.
 *
 * @example
 * Basic usage with default spinner:
 * ```typescript
 * const app = createApp()
 *   .component('loading', spinner())
 *   .view(({ components }) => vstack(
 *     text('Loading...'),
 *     components.loading
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom animation and styling:
 * ```typescript
 * import { spinner, moon } from '@boba-cli/dsl'
 * import { Style } from '@boba-cli/chapstick'
 *
 * const app = createApp()
 *   .component('loading', spinner({
 *     spinner: moon,
 *     style: new Style().foreground('#50fa7b')
 *   }))
 *   .view(({ components }) => hstack(
 *     components.loading,
 *     text(' Processing...')
 *   ))
 *   .build()
 * ```
 *
 * @example
 * Multiple spinners with different styles:
 * ```typescript
 * const app = createApp()
 *   .component('spinner1', spinner({
 *     spinner: line,
 *     style: new Style().foreground('#ff79c6')
 *   }))
 *   .component('spinner2', spinner({
 *     spinner: pulse,
 *     style: new Style().foreground('#8be9fd')
 *   }))
 *   .view(({ components }) => vstack(
 *     hstack(components.spinner1, text(' Task 1')),
 *     hstack(components.spinner2, text(' Task 2'))
 *   ))
 *   .build()
 * ```
 *
 * @param options - Configuration options for the spinner
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function spinner(options: SpinnerBuilderOptions = {}): ComponentBuilder<SpinnerModel> {
  const spinnerOpts: SpinnerOptions = {
    spinner: options.spinner ?? line,
    style: options.style ?? new Style(),
  }

  return {
    init(): [SpinnerModel, Cmd<Msg>] {
      const model = new SpinnerModel(spinnerOpts)
      return [model, model.tick() as Cmd<Msg>]
    },

    update(model: SpinnerModel, msg: Msg): [SpinnerModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: SpinnerModel): string {
      return model.view()
    },
  }
}

import { type Cmd, type Msg } from '@suds-cli/tea'
import { Style } from '@suds-cli/chapstick'
import { SpinnerModel, type Spinner, line, type SpinnerOptions } from '@suds-cli/spinner'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the spinner component builder.
 *
 * @remarks
 * Configure the spinner animation and styling when creating a spinner component.
 *
 * @public
 */
export interface SpinnerBuilderOptions {
  /**
   * Spinner animation to use (default: `line`).
   *
   * @remarks
   * Available spinners include `line`, `dot`, `miniDot`,
   * `pulse`, `points`, `moon`, `meter`, and `ellipsis`.
   */
  spinner?: Spinner
  /**
   * Style for rendering the spinner.
   *
   * @remarks
   * Uses `Style` from `@suds-cli/chapstick` to apply terminal colors and formatting.
   */
  style?: Style
}

/**
 * Create a spinner component builder.
 *
 * @remarks
 * Creates a {@link ComponentBuilder} wrapping the `@suds-cli/spinner` package.
 * The spinner automatically animates and can be styled with custom colors.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('loading', spinner())
 *   .view(({ components }) => components.loading)
 *   .build()
 * ```
 *
 * @example
 * With custom styling:
 * ```typescript
 * const app = createApp()
 *   .component('loading', spinner({
 *     style: new Style().foreground('#50fa7b')
 *   }))
 *   .view(({ components }) => hstack(
 *     components.loading,
 *     text('Loading...')
 *   ))
 *   .build()
 * ```
 *
 * @param options - Configuration options for the spinner
 * @returns A {@link ComponentBuilder} ready to use with {@link AppBuilder.component}
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

import { type Cmd, type Msg } from '@boba-cli/tea'
import { Style, type ColorInput } from '@boba-cli/chapstick'
import { ProgressModel } from '@boba-cli/progress'
import type { ComponentBuilder } from '../types.js'

/**
 * Options for the progress bar component builder.
 *
 * @remarks
 * Configure the progress bar appearance, animation, and behavior when creating
 * a progress component.
 *
 * @public
 */
export interface ProgressBuilderOptions {
  /**
   * Width of the progress bar in characters (default: 40).
   *
   * @remarks
   * If `showPercentage` is enabled, the percentage text width is subtracted
   * from this total width.
   *
   * When set to 0, the progress bar itself is not displayed, but the percentage
   * text (if enabled via `showPercentage`) will still be shown. This is rarely
   * useful - prefer setting a positive width to display the actual bar.
   */
  width?: number

  /**
   * Character to use for the filled portion (default: '█').
   *
   * @remarks
   * Only the first character is used if a multi-character string is provided.
   */
  full?: string

  /**
   * Character to use for the empty portion (default: '░').
   *
   * @remarks
   * Only the first character is used if a multi-character string is provided.
   */
  empty?: string

  /**
   * Color for the filled portion (default: '#7571F9').
   *
   * @remarks
   * Ignored if `gradient` is configured. Accepts hex colors or named colors.
   */
  fullColor?: ColorInput

  /**
   * Color for the empty portion (default: '#606060').
   *
   * @remarks
   * Accepts hex colors or named colors.
   */
  emptyColor?: ColorInput

  /**
   * Whether to display the percentage value (default: true).
   */
  showPercentage?: boolean

  /**
   * Format string for the percentage display (default: ' %3.0f%%').
   *
   * @remarks
   * Supports printf-style formatting: `%[width].[precision]f`.
   * Use `%%` to output a literal `%` character.
   *
   * @example
   * ```typescript
   * ' %3.0f%%'  // ' 100%'
   * ' %5.1f%%'  // '  50.5%'
   * ```
   */
  percentFormat?: string

  /**
   * Gradient configuration for the filled portion.
   *
   * @remarks
   * When set, overrides `fullColor` and creates a smooth color gradient
   * from `start` to `end`. The `scaleGradientToProgress` option controls whether the
   * gradient spans the entire bar width or only the filled portion.
   */
  gradient?: {
    /**
     * Starting color of the gradient.
     */
    start: ColorInput
    /**
     * Ending color of the gradient.
     */
    end: ColorInput
    /**
     * Whether to scale gradient to filled portion only (default: false).
     *
     * @remarks
     * - If `false`, gradient spans the entire bar width (progress reveals gradient)
     * - If `true`, gradient spans only the filled portion (gradient shrinks/grows)
     */
    scaleGradientToProgress?: boolean
  }

  /**
   * Spring animation configuration.
   *
   * @remarks
   * Controls the spring physics for smooth easing when the progress bar updates.
   * Higher frequency makes the animation faster, higher damping reduces oscillation.
   */
  spring?: {
    /**
     * Spring frequency (default: 18).
     *
     * @remarks
     * Higher values make the animation respond faster.
     */
    frequency?: number
    /**
     * Spring damping (default: 1).
     *
     * @remarks
     * Higher values reduce oscillation. A value of 1 is critically damped.
     */
    damping?: number
  }

  /**
   * Style for rendering the percentage text.
   *
   * @remarks
   * Uses `Style` from `@boba-cli/chapstick` to apply terminal colors and formatting.
   */
  percentageStyle?: Style
}

/**
 * Create a progress bar component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` wrapping the `@boba-cli/progress` package.
 * The progress bar animates smoothly with spring physics when updated via
 * `ProgressModel.setPercent()`. Animation is triggered by calling `setPercent()`
 * on the model, not automatically on initialization.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('progress', progress())
 *   .view(({ components }) => components.progress)
 *   .build()
 * ```
 *
 * @example
 * With gradient styling:
 * ```typescript
 * const app = createApp()
 *   .component('progress', progress({
 *     gradient: {
 *       start: '#5A56E0',
 *       end: '#EE6FF8',
 *       scaleGradientToProgress: false
 *     },
 *     showPercentage: true
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Loading...'),
 *     components.progress
 *   ))
 *   .build()
 * ```
 *
 * @example
 * With custom spring animation:
 * ```typescript
 * const app = createApp()
 *   .component('progress', progress({
 *     spring: {
 *       frequency: 25,
 *       damping: 0.8
 *     }
 *   }))
 *   .view(({ components }) => components.progress)
 *   .build()
 * ```
 *
 * @param options - Configuration options for the progress bar
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function progress(
  options: ProgressBuilderOptions = {},
): ComponentBuilder<ProgressModel> {
  return {
    init(): [ProgressModel, Cmd<Msg>] {
      // Determine if we should use gradient or solid fill
      const hasGradient = options.gradient !== undefined

      const model = hasGradient
        ? ProgressModel.withGradient(
            options.gradient!.start,
            options.gradient!.end,
            {
              width: options.width,
              full: options.full,
              empty: options.empty,
              emptyColor: options.emptyColor,
              showPercentage: options.showPercentage,
              percentFormat: options.percentFormat,
              scaleGradient: options.gradient!.scaleGradientToProgress,
              springFrequency: options.spring?.frequency,
              springDamping: options.spring?.damping,
              percentageStyle: options.percentageStyle,
            },
          )
        : ProgressModel.new({
            width: options.width,
            full: options.full,
            empty: options.empty,
            fullColor: options.fullColor,
            emptyColor: options.emptyColor,
            showPercentage: options.showPercentage,
            percentFormat: options.percentFormat,
            springFrequency: options.spring?.frequency,
            springDamping: options.spring?.damping,
            percentageStyle: options.percentageStyle,
          })

      // Progress doesn't auto-animate; animation is triggered by setPercent()
      return [model, null]
    },

    update(model: ProgressModel, msg: Msg): [ProgressModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: ProgressModel): string {
      return model.view()
    },
  }
}

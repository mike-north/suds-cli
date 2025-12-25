import type { EnvironmentAdapter, StyleFn } from '@suds-cli/machine'
import { Style, StyleContext } from './style.js'

/**
 * Common semantic styles for terminal output.
 * @public
 */
export interface SemanticStyles {
  success: Style
  error: Style
  warning: Style
  info: Style
  muted: Style
  highlight: Style
  header: Style
}

/**
 * Provider interface for creating styles.
 * Enables dependency injection for better testability.
 * @public
 */
export interface StyleProvider {
  /**
   * Create a new style instance.
   */
  createStyle(): Style

  /**
   * Get semantic styles for common use cases.
   */
  readonly semanticStyles: SemanticStyles

  /**
   * Get the style context used by this provider.
   */
  readonly context: StyleContext
}

/**
 * Implementation using Chapstick's Style class with injected adapters.
 * @public
 */
export class ChapstickStyleProvider implements StyleProvider {
  readonly context: StyleContext

  /**
   * Create a new style provider.
   * @param env - Environment adapter for detecting terminal capabilities
   * @param styleFn - Style function for applying ANSI styling
   */
  constructor(env: EnvironmentAdapter, styleFn: StyleFn) {
    this.context = { env, styleFn }
  }

  createStyle(): Style {
    return new Style({}, undefined, this.context)
  }

  get semanticStyles(): SemanticStyles {
    const ctx = this.context
    return {
      success: new Style({}, undefined, ctx).bold(true).foreground('#50FA7B'),
      error: new Style({}, undefined, ctx).bold(true).foreground('#FF5555'),
      warning: new Style({}, undefined, ctx).bold(true).foreground('#F1FA8C'),
      info: new Style({}, undefined, ctx).foreground('#8BE9FD'),
      muted: new Style({}, undefined, ctx).foreground('#6272A4'),
      highlight: new Style({}, undefined, ctx).background('#44475A').foreground('#F8F8F2'),
      header: new Style({}, undefined, ctx).bold(true).foreground('#00D9FF').padding(0, 1),
    }
  }
}

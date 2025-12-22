import { Style } from './style.js'
import type { ColorInput } from './types.js'

/**
 * Chainable interface for creating and styling text.
 * Matches the public API of the Style class for dependency injection.
 * @public
 */
export interface ChainableStyle {
  bold(enabled?: boolean): ChainableStyle
  italic(enabled?: boolean): ChainableStyle
  underline(enabled?: boolean): ChainableStyle
  strikethrough(enabled?: boolean): ChainableStyle
  foreground(color: ColorInput): ChainableStyle
  background(color: ColorInput): ChainableStyle
  padding(all: number): ChainableStyle
  padding(vertical: number, horizontal: number): ChainableStyle
  padding(
    top: number,
    right: number,
    bottom: number,
    left: number,
  ): ChainableStyle
  render(text: string): string
}

/**
 * Common semantic styles for terminal output.
 * @public
 */
export interface SemanticStyles {
  success: ChainableStyle
  error: ChainableStyle
  warning: ChainableStyle
  info: ChainableStyle
  muted: ChainableStyle
  highlight: ChainableStyle
  header: ChainableStyle
}

/**
 * Provider interface for creating styles.
 * Enables dependency injection for better testability.
 * @public
 */
export interface StyleProvider {
  /**
   * Create a new chainable style instance.
   */
  createStyle(): ChainableStyle
  
  /**
   * Get semantic styles for common use cases.
   */
  readonly semanticStyles: SemanticStyles
}

/**
 * Default implementation using Chapstick's Style class.
 * @public
 */
export class ChapstickStyleProvider implements StyleProvider {
  createStyle(): ChainableStyle {
    return new Style()
  }

  get semanticStyles(): SemanticStyles {
    return {
      success: new Style().bold(true).foreground('#50FA7B'),
      error: new Style().bold(true).foreground('#FF5555'),
      warning: new Style().bold(true).foreground('#F1FA8C'),
      info: new Style().foreground('#8BE9FD'),
      muted: new Style().foreground('#6272A4'),
      highlight: new Style().background('#44475A').foreground('#F8F8F2'),
      header: new Style().bold(true).foreground('#00D9FF').padding(0, 1),
    }
  }
}

/**
 * Default style provider instance.
 * Use this when you need a style provider but don't want to create a new instance.
 * @public
 */
export const defaultStyleProvider = new ChapstickStyleProvider()

/**
 * Markdown rendering utilities.
 */

import { Marked } from 'marked'
import { markedTerminal } from 'marked-terminal'
import type { EnvironmentAdapter, TerminalBackground } from '@suds-cli/machine'
import { createAlwaysEnabledStyle } from '@suds-cli/machine'

/**
 * Options for rendering markdown.
 * @public
 */
export interface RenderMarkdownOptions {
  /**
   * Width for word wrapping. Defaults to 80.
   */
  width?: number
  /**
   * Terminal background mode. Defaults to 'dark'.
   */
  background?: TerminalBackground
  /**
   * Environment adapter for detecting terminal capabilities.
   */
  env?: EnvironmentAdapter
}

/**
 * Renders markdown content with terminal styling.
 * Detects terminal background (light/dark) and applies appropriate styling.
 *
 * @param content - The markdown string to render
 * @param options - Rendering options
 * @returns The styled markdown output
 * @public
 */
export function renderMarkdown(
  content: string,
  options: RenderMarkdownOptions = {},
): string {
  const width = options.width ?? 80
  const background = options.background ?? options.env?.getTerminalBackground() ?? 'dark'

  // Use appropriate colors for terminal background
  const isDark = background !== 'light'

  // Create a style function with full color support for markdown rendering
  const style = createAlwaysEnabledStyle()

  // Create marked instance with terminal renderer
  const marked = new Marked(
    markedTerminal({
      // Wrap text at specified width
      width,
      reflowText: true,
      // Headings - brighter on dark backgrounds
      firstHeading: isDark ? style.cyan.bold : style.blue.bold,
      heading: isDark ? style.cyan.bold : style.blue.bold,
      // Code blocks
      code: isDark ? style.white : style.gray,
      blockquote: isDark ? style.white : style.gray,
      // Emphasis
      strong: style.bold,
      em: style.italic,
      // Lists
      listitem: style,
      // Links
      link: isDark ? style.blueBright : style.blue,
      // Other elements
      hr: style.gray,
      paragraph: style,
    }),
  )

  try {
    const rendered = marked.parse(content) as string
    return rendered.trim()
  } catch (error) {
    throw new Error(
      `Failed to render markdown: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

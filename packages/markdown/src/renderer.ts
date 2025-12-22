/**
 * Markdown rendering utilities.
 */

import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { getTerminalBackground } from "@suds-cli/chapstick";
import chalk from "chalk";

/**
 * Options for rendering markdown.
 * @public
 */
export interface RenderMarkdownOptions {
  /**
   * Width for word wrapping. Defaults to 80.
   */
  width?: number;
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
  const width = options.width ?? 80;
  const background = getTerminalBackground();
  
  // Use appropriate colors for terminal background
  const isDark = background !== 'light';
  
  // Create marked instance with terminal renderer
  const marked = new Marked(
    markedTerminal({
      // Wrap text at specified width
      width,
      reflowText: true,
      // Headings - brighter on dark backgrounds
      firstHeading: isDark ? chalk.cyan.bold : chalk.blue.bold,
      heading: isDark ? chalk.cyan.bold : chalk.blue.bold,
      // Code blocks
      code: isDark ? chalk.white : chalk.gray,
      blockquote: isDark ? chalk.white : chalk.gray,
      // Emphasis
      strong: chalk.bold,
      em: chalk.italic,
      // Lists
      listitem: chalk.reset,
      // Links
      link: isDark ? chalk.blueBright : chalk.blue,
      // Other elements
      hr: chalk.gray,
      paragraph: chalk.reset,
    }),
  );

  try {
    const rendered = marked.parse(content) as string;
    return rendered.trim();
  } catch (error) {
    throw new Error(`Failed to render markdown: ${error instanceof Error ? error.message : String(error)}`);
  }
}

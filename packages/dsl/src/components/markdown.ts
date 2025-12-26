import type { Cmd, Msg } from '@boba-cli/tea'
import { renderMarkdown } from '@boba-cli/markdown'
import type { ComponentBuilder } from '../types.js'

/**
 * Simple model for rendering static markdown content.
 *
 * @remarks
 * This is a minimal TEA model that holds pre-rendered markdown content.
 * It does not handle file I/O or user interaction - it simply displays
 * the rendered markdown string.
 *
 * @internal
 */
class StaticMarkdownModel {
  constructor(private readonly renderedContent: string) {}

  /**
   * Tea init hook (no-op).
   */
  init(): Cmd<Msg> {
    return null
  }

  /**
   * Tea update hook (no-op - static content).
   */
  update(_msg: Msg): [StaticMarkdownModel, Cmd<Msg>] {
    return [this, null]
  }

  /**
   * Render the markdown content.
   */
  view(): string {
    return this.renderedContent
  }
}

/**
 * Options for the markdown component builder.
 *
 * @remarks
 * Configure markdown rendering when creating a markdown component.
 * The markdown is rendered once during initialization using the `marked`
 * library with terminal styling support.
 *
 * @public
 */
export interface MarkdownBuilderOptions {
  /**
   * Markdown content to render.
   *
   * @remarks
   * This should be a string containing valid markdown syntax.
   * The content will be rendered with terminal styling including
   * colors for headings, bold/italic text, code blocks, links, etc.
   */
  content: string

  /**
   * Width for word wrapping (default: 80).
   *
   * @remarks
   * The markdown renderer will wrap text to fit within this width.
   * This is useful for ensuring content fits within your terminal or
   * specific layout constraints.
   */
  width?: number
}

/**
 * Create a markdown component builder.
 *
 * @remarks
 * Creates a `ComponentBuilder` that renders static markdown content
 * with terminal styling. The markdown is rendered once during initialization
 * using the `marked` library with the `marked-terminal` plugin for terminal
 * color support.
 *
 * This component displays static content and does not handle user input or
 * file operations. For file-based markdown viewing with scrolling, use
 * the `MarkdownModel` from `@boba-cli/markdown` directly.
 *
 * @example
 * Basic usage:
 * ```typescript
 * const app = createApp()
 *   .component('help', markdown({
 *     content: '# Welcome\n\nThis is **bold** text.'
 *   }))
 *   .view(({ components }) => components.help)
 *   .build()
 * ```
 *
 * @example
 * With custom width:
 * ```typescript
 * const app = createApp()
 *   .component('readme', markdown({
 *     content: readFileSync('README.md', 'utf-8'),
 *     width: 120
 *   }))
 *   .view(({ components }) => vstack(
 *     text('Documentation:').bold(),
 *     components.readme
 *   ))
 *   .build()
 * ```
 *
 * @param options - Configuration options for the markdown component
 * @returns A `ComponentBuilder` ready to use with `AppBuilder.component`
 *
 * @public
 */
export function markdown(
  options: MarkdownBuilderOptions,
): ComponentBuilder<StaticMarkdownModel> {
  return {
    init(): [StaticMarkdownModel, Cmd<Msg>] {
      const renderedContent = renderMarkdown(options.content, {
        width: options.width ?? 80,
      })
      const model = new StaticMarkdownModel(renderedContent)
      return [model, null]
    },

    update(model: StaticMarkdownModel, msg: Msg): [StaticMarkdownModel, Cmd<Msg>] {
      return model.update(msg)
    },

    view(model: StaticMarkdownModel): string {
      return model.view()
    },
  }
}

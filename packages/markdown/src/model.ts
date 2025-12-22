/**
 * Markdown viewer component.
 */

import { Style } from "@suds-cli/chapstick";
import { readFileContent } from "@suds-cli/filesystem";
import { ViewportModel } from "@suds-cli/viewport";
import type { Cmd, Msg } from "@suds-cli/tea";
import { RenderMarkdownMsg, ErrorMsg } from "./messages.js";
import { renderMarkdown } from "./renderer.js";

/**
 * Options for creating a markdown model.
 * @public
 */
export interface MarkdownOptions {
  /**
   * Whether the component is active and should handle input.
   * Defaults to true.
   */
  active?: boolean;
  /**
   * Initial width for the viewport.
   * Defaults to 0.
   */
  width?: number;
  /**
   * Initial height for the viewport.
   * Defaults to 0.
   */
  height?: number;
  /**
   * Style for the viewport.
   */
  style?: Style;
}

/**
 * Markdown viewer model that renders markdown files with terminal styling
 * in a scrollable viewport.
 * @public
 */
export class MarkdownModel {
  readonly viewport: ViewportModel;
  readonly active: boolean;
  readonly fileName: string;

  private constructor(options: {
    viewport: ViewportModel;
    active: boolean;
    fileName: string;
  }) {
    this.viewport = options.viewport;
    this.active = options.active;
    this.fileName = options.fileName;
  }

  /**
   * Create a new markdown model.
   * @param options - Configuration options
   */
  static new(options: MarkdownOptions = {}): MarkdownModel {
    const viewport = ViewportModel.new({
      width: options.width ?? 0,
      height: options.height ?? 0,
      style: options.style,
    });

    return new MarkdownModel({
      viewport,
      active: options.active ?? true,
      fileName: "",
    });
  }

  /**
   * Tea init hook (no-op).
   */
  init(): Cmd<Msg> {
    return null;
  }

  /**
   * Set the filename to render. Returns a command that will read and render the file.
   * @param fileName - Path to the markdown file
   */
  setFileName(fileName: string): [MarkdownModel, Cmd<Msg>] {
    const updated = this.with({ fileName });
    const cmd = renderMarkdownCmd(this.viewport.width, fileName);
    return [updated, cmd];
  }

  /**
   * Set the size of the viewport and re-render if a file is set.
   * @param width - New width
   * @param height - New height
   */
  setSize(width: number, height: number): [MarkdownModel, Cmd<Msg>] {
    const updatedViewport = this.viewport.setWidth(width).setHeight(height);
    const updated = this.with({ viewport: updatedViewport });

    if (this.fileName !== "") {
      const cmd = renderMarkdownCmd(width, this.fileName);
      return [updated, cmd];
    }

    return [updated, null];
  }

  /**
   * Set whether the component is active and should handle input.
   * @param active - Active state
   */
  setIsActive(active: boolean): MarkdownModel {
    if (active === this.active) return this;
    return this.with({ active });
  }

  /**
   * Scroll to the top of the viewport.
   */
  gotoTop(): MarkdownModel {
    const updatedViewport = this.viewport.scrollToTop();
    if (updatedViewport === this.viewport) return this;
    return this.with({ viewport: updatedViewport });
  }

  /**
   * Handle messages. Processes viewport scrolling and markdown rendering.
   * @param msg - The message to handle
   */
  update(msg: Msg): [MarkdownModel, Cmd<Msg>] {
    // Handle markdown rendering
    if (msg instanceof RenderMarkdownMsg) {
      const styled = new Style()
        .width(this.viewport.width)
        .height(this.viewport.height)
        .render(msg.content);

      const updatedViewport = this.viewport.setContent(styled);
      return [this.with({ viewport: updatedViewport }), null];
    }

    // Handle errors
    if (msg instanceof ErrorMsg) {
      const errorContent = msg.error.message;
      const updatedViewport = this.viewport.setContent(errorContent);
      return [
        this.with({
          fileName: "",
          viewport: updatedViewport,
        }),
        null,
      ];
    }

    // Handle viewport updates if active
    if (this.active) {
      const [updatedViewport, cmd] = this.viewport.update(msg);
      if (updatedViewport !== this.viewport) {
        return [this.with({ viewport: updatedViewport }), cmd];
      }
    }

    return [this, null];
  }

  /**
   * Render the markdown viewport.
   */
  view(): string {
    return this.viewport.view();
  }

  private with(patch: Partial<MarkdownModel>): MarkdownModel {
    return new MarkdownModel({
      viewport: patch.viewport ?? this.viewport,
      active: patch.active ?? this.active,
      fileName: patch.fileName ?? this.fileName,
    });
  }
}

/**
 * Command to read and render a markdown file.
 */
function renderMarkdownCmd(width: number, fileName: string): Cmd<Msg> {
  return async () => {
    try {
      const content = await readFileContent(fileName);
      const rendered = renderMarkdown(content, { width });
      return new RenderMarkdownMsg(rendered);
    } catch (error) {
      return new ErrorMsg(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
}

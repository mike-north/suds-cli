import { Style } from "@suds-cli/chapstick";
import { readFileContent } from "@suds-cli/filesystem";
import { type Cmd, type Msg } from "@suds-cli/tea";
import { ViewportModel } from "@suds-cli/viewport";
import { getHighlighter } from "shiki";
import path from "node:path";
import { ErrorMsg, SyntaxMsg } from "./messages.js";

/**
 * Options for creating a code model.
 * @public
 */
export interface CodeOptions {
  active?: boolean;
  syntaxTheme?: string;
  width?: number;
  height?: number;
}

/**
 * Highlight returns a syntax-highlighted string of text.
 * @param content - The source code content to highlight
 * @param extension - The file extension (e.g., ".ts", ".go")
 * @param theme - The syntax theme to use (default: "dracula")
 * @returns Promise resolving to the highlighted content string
 * @public
 */
export async function highlight(
  content: string,
  extension: string,
  theme: string = "dracula",
): Promise<string> {
  try {
    const highlighter = await getHighlighter({
      themes: [theme],
      langs: [],
    });

    // Map extension to language - use a safer approach
    const ext = extension.startsWith(".") ? extension.slice(1) : extension;
    let lang = ext || "text";

    // Load the language if needed, fallback to text
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      await highlighter.loadLanguage(lang as any);
    } catch {
      // If language loading fails, use 'text' as fallback
      lang = "text";
      try {
        await highlighter.loadLanguage("text");
      } catch {
        // If even text fails, just return plain content
        return content;
      }
    }

    // Convert tokens to ANSI colored text
    const tokens = highlighter.codeToTokens(content, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      lang: lang as any,
      theme: theme,
    });

    // Convert tokens to ANSI colored text
    let result = "";
    for (const line of tokens.tokens) {
      for (const token of line) {
        if (token.color) {
          // Simple ANSI color conversion (this is a basic approach)
          result += `\x1b[38;2;${hexToRgb(token.color)}m${token.content}\x1b[0m`;
        } else {
          result += token.content;
        }
      }
      result += "\n";
    }

    return result.trimEnd();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Syntax highlighting failed: ${errorMessage}`);
  }
}

/**
 * Convert hex color to RGB values for ANSI
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255;255;255";
  return `${parseInt(result[1]!, 16)};${parseInt(result[2]!, 16)};${parseInt(result[3]!, 16)}`;
}

/**
 * Read file content and highlight it asynchronously.
 */
function readFileContentCmd(
  fileName: string,
  syntaxTheme: string,
): Cmd<Msg> {
  return async (): Promise<Msg> => {
    try {
      const content = await readFileContent(fileName);
      const extension = path.extname(fileName);
      const highlightedContent = await highlight(content, extension, syntaxTheme);
      return new SyntaxMsg(highlightedContent);
    } catch (error) {
      return new ErrorMsg(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  };
}

/**
 * Model representing a syntax-highlighted code viewer.
 * @public
 */
export class CodeModel {
  readonly viewport: ViewportModel;
  readonly active: boolean;
  readonly filename: string;
  readonly highlightedContent: string;
  readonly syntaxTheme: string;

  private constructor(options: {
    viewport: ViewportModel;
    active: boolean;
    filename: string;
    highlightedContent: string;
    syntaxTheme: string;
  }) {
    this.viewport = options.viewport;
    this.active = options.active;
    this.filename = options.filename;
    this.highlightedContent = options.highlightedContent;
    this.syntaxTheme = options.syntaxTheme;
  }

  /**
   * Creates a new code model instance.
   * @param options - Configuration options
   * @returns A new CodeModel instance
   */
  static new(options: CodeOptions = {}): CodeModel {
    return new CodeModel({
      viewport: ViewportModel.new({
        width: options.width ?? 0,
        height: options.height ?? 0,
      }),
      active: options.active ?? false,
      filename: "",
      highlightedContent: "",
      syntaxTheme: options.syntaxTheme ?? "dracula",
    });
  }

  /**
   * Create a copy with updated fields.
   */
  private with(partial: Partial<{
    viewport: ViewportModel;
    active: boolean;
    filename: string;
    highlightedContent: string;
    syntaxTheme: string;
  }>): CodeModel {
    return new CodeModel({
      viewport: partial.viewport ?? this.viewport,
      active: partial.active ?? this.active,
      filename: partial.filename ?? this.filename,
      highlightedContent: partial.highlightedContent ?? this.highlightedContent,
      syntaxTheme: partial.syntaxTheme ?? this.syntaxTheme,
    });
  }

  /**
   * Sets the file to display and triggers highlighting.
   * @param filename - Path to the file to display
   * @returns Command to read and highlight the file
   */
  setFileName(filename: string): [CodeModel, Cmd<Msg>] {
    const updated = this.with({ filename });
    return [updated, readFileContentCmd(filename, this.syntaxTheme)];
  }

  /**
   * Sets whether the component is active (receives input).
   * @param active - Whether the component should be active
   * @returns Updated model
   */
  setIsActive(active: boolean): CodeModel {
    if (this.active === active) return this;
    return this.with({ active });
  }

  /**
   * Sets the syntax highlighting theme.
   * @param theme - The theme name (e.g., "dracula", "monokai")
   * @returns Updated model
   */
  setSyntaxTheme(theme: string): CodeModel {
    if (this.syntaxTheme === theme) return this;
    return this.with({ syntaxTheme: theme });
  }

  /**
   * Sets the viewport dimensions.
   * @param width - Width in characters
   * @param height - Height in lines
   * @returns Updated model
   */
  setSize(width: number, height: number): CodeModel {
    const nextViewport = this.viewport.setWidth(width).setHeight(height);
    if (nextViewport === this.viewport) return this;
    return this.with({ viewport: nextViewport });
  }

  /**
   * Scrolls to the top of the viewport.
   * @returns Updated model
   */
  gotoTop(): CodeModel {
    const nextViewport = this.viewport.scrollToTop();
    if (nextViewport === this.viewport) return this;
    return this.with({ viewport: nextViewport });
  }

  /**
   * Tea init hook.
   */
  init(): Cmd<Msg> {
    return this.viewport.init();
  }

  /**
   * Handles messages (keyboard navigation when active).
   * @param msg - The message to handle
   * @returns Tuple of updated model and command
   */
  update(msg: Msg): [CodeModel, Cmd<Msg>] {
    if (msg instanceof SyntaxMsg) {
      const content = msg.content;
      const style = new Style()
        .width(this.viewport.width)
        .height(this.viewport.height);
      const rendered = style.render(content);
      const nextViewport = this.viewport.setContent(rendered);
      return [
        this.with({
          filename: "",
          highlightedContent: rendered,
          viewport: nextViewport,
        }),
        null,
      ];
    }

    if (msg instanceof ErrorMsg) {
      const errorContent = `Error: ${msg.error.message}`;
      const style = new Style()
        .width(this.viewport.width)
        .height(this.viewport.height);
      const rendered = style.render(errorContent);
      const nextViewport = this.viewport.setContent(rendered);
      return [
        this.with({
          filename: "",
          highlightedContent: rendered,
          viewport: nextViewport,
        }),
        null,
      ];
    }

    if (this.active) {
      const [nextViewport, cmd] = this.viewport.update(msg);
      if (nextViewport !== this.viewport) {
        return [this.with({ viewport: nextViewport }), cmd];
      }
    }

    return [this, null];
  }

  /**
   * Returns the rendered string.
   * @returns The viewport view
   */
  view(): string {
    return this.viewport.view();
  }
}

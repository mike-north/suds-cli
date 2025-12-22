import { Style, joinVertical, joinHorizontal } from "@suds-cli/chapstick";
import { ViewportModel } from "@suds-cli/viewport";
import { type Cmd, type Msg } from "@suds-cli/tea";
import type { Entry, TitleColor } from "./bubble-types.js";

const KEY_WIDTH = 12;

/**
 * Generates the help screen content with styled title and entries.
 * @internal
 */
function generateHelpScreen(
  title: string,
  titleColor: TitleColor,
  entries: Entry[],
  width: number,
  height: number,
): string {
  let helpScreen = "";

  // Build each entry row with two-column layout
  for (const content of entries) {
    const keyText = new Style()
      .bold(true)
      .foreground({ dark: "#ffffff", light: "#000000" })
      .width(KEY_WIDTH)
      .render(content.key);

    const descriptionText = new Style()
      .foreground({ dark: "#ffffff", light: "#000000" })
      .render(content.description);

    const row = joinHorizontal(keyText, descriptionText);
    helpScreen += `${row}\n`;
  }

  // Create styled title
  const titleText = new Style()
    .bold(true)
    .background(titleColor.background)
    .foreground(titleColor.foreground)
    .padding(0, 1)
    .italic(true)
    .render(title);

  // Combine title and entries, apply width/height constraints
  return new Style()
    .width(width)
    .height(height)
    .render(joinVertical(titleText, helpScreen));
}

/**
 * Model representing a scrollable help bubble.
 * Displays a styled title and a list of key binding entries in a scrollable viewport.
 * @public
 */
export class HelpBubble {
  /**
   * The viewport model that handles scrolling and content display.
   */
  readonly viewport: ViewportModel;
  /**
   * The array of help entries displayed in the bubble.
   */
  readonly entries: Entry[];
  /**
   * The title text shown at the top of the help screen.
   */
  readonly title: string;
  /**
   * The color configuration for the title bar.
   */
  readonly titleColor: TitleColor;
  /**
   * Whether the help bubble is active and receiving input.
   */
  readonly active: boolean;

  private constructor(
    viewport: ViewportModel,
    entries: Entry[],
    title: string,
    titleColor: TitleColor,
    active: boolean,
  ) {
    this.viewport = viewport;
    this.entries = entries;
    this.title = title;
    this.titleColor = titleColor;
    this.active = active;
  }

  /**
   * Create a new help bubble.
   * @param active - Whether the component receives input
   * @param title - Title text for the help screen
   * @param titleColor - Color configuration for the title
   * @param entries - Array of help entries to display
   */
  static new(
    active: boolean,
    title: string,
    titleColor: TitleColor,
    entries: Entry[],
  ): HelpBubble {
    const viewport = ViewportModel.new({ width: 0, height: 0 });
    const content = generateHelpScreen(title, titleColor, entries, 0, 0);
    const initializedViewport = viewport.setContent(content);

    return new HelpBubble(
      initializedViewport,
      entries,
      title,
      titleColor,
      active,
    );
  }

  /**
   * Set the size of the help bubble and regenerate content.
   * @param width - Width in characters
   * @param height - Height in lines
   */
  setSize(width: number, height: number): HelpBubble {
    const content = generateHelpScreen(
      this.title,
      this.titleColor,
      this.entries,
      width,
      height,
    );
    const updatedViewport = this.viewport
      .setWidth(width)
      .setHeight(height)
      .setContent(content);

    return new HelpBubble(
      updatedViewport,
      this.entries,
      this.title,
      this.titleColor,
      this.active,
    );
  }

  /**
   * Set whether the component is active (receives input).
   * @param active - Active state
   */
  setIsActive(active: boolean): HelpBubble {
    if (this.active === active) return this;
    return new HelpBubble(
      this.viewport,
      this.entries,
      this.title,
      this.titleColor,
      active,
    );
  }

  /**
   * Set the title color and regenerate content.
   * @param color - New title color configuration
   */
  setTitleColor(color: TitleColor): HelpBubble {
    const content = generateHelpScreen(
      this.title,
      color,
      this.entries,
      this.viewport.width,
      this.viewport.height,
    );
    const updatedViewport = this.viewport.setContent(content);

    return new HelpBubble(
      updatedViewport,
      this.entries,
      this.title,
      color,
      this.active,
    );
  }

  /**
   * Scroll to the top of the viewport.
   */
  gotoTop(): HelpBubble {
    const updatedViewport = this.viewport.scrollToTop();
    if (updatedViewport === this.viewport) return this;

    return new HelpBubble(
      updatedViewport,
      this.entries,
      this.title,
      this.titleColor,
      this.active,
    );
  }

  /**
   * Handle Tea update messages (viewport scrolling when active).
   * @param msg - Tea message
   */
  update(msg: Msg): [HelpBubble, Cmd<Msg>] {
    if (!this.active) {
      return [this, null];
    }

    const [updatedViewport, cmd] = this.viewport.update(msg);

    if (updatedViewport === this.viewport) {
      return [this, cmd];
    }

    return [
      new HelpBubble(
        updatedViewport,
        this.entries,
        this.title,
        this.titleColor,
        this.active,
      ),
      cmd,
    ];
  }

  /**
   * Render the help screen.
   */
  view(): string {
    return this.viewport.view();
  }
}

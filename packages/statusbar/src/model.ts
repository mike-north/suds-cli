import { Style, width as textWidth } from "@suds-cli/chapstick";
import { WindowSizeMsg, type Cmd, type Msg } from "@suds-cli/tea";
import type { ColorConfig, StatusbarState } from "./types.js";

/**
 * Height of the status bar (always 1 row).
 * @public
 */
export const Height = 1;

/**
 * Maximum width for the first column before truncation.
 * @internal
 */
const MAX_FIRST_COLUMN_WIDTH = 30;

/**
 * Truncate text with ellipsis if it exceeds maxWidth.
 * @internal
 */
function truncate(text: string, maxWidth: number): string {
  if (textWidth(text) <= maxWidth) {
    return text;
  }

  const ellipsis = "...";
  const availableWidth = maxWidth - textWidth(ellipsis);
  if (availableWidth <= 0) {
    return ellipsis.slice(0, maxWidth);
  }

  let result = "";
  for (const char of text) {
    if (textWidth(result + char) > availableWidth) {
      break;
    }
    result += char;
  }

  return result + ellipsis;
}

/**
 * StatusbarModel represents a 4-column status bar component.
 * @public
 */
export class StatusbarModel {
  private constructor(private readonly state: StatusbarState) {}

  /**
   * Create a new statusbar with column colors.
   * @param first - Color configuration for the first column
   * @param second - Color configuration for the second column
   * @param third - Color configuration for the third column
   * @param fourth - Color configuration for the fourth column
   * @returns A new StatusbarModel instance
   * @public
   */
  static new(
    first: ColorConfig,
    second: ColorConfig,
    third: ColorConfig,
    fourth: ColorConfig,
  ): StatusbarModel {
    return new StatusbarModel({
      width: 0,
      height: Height,
      firstColumn: "",
      secondColumn: "",
      thirdColumn: "",
      fourthColumn: "",
      firstColumnColors: first,
      secondColumnColors: second,
      thirdColumnColors: third,
      fourthColumnColors: fourth,
    });
  }

  /**
   * Set the total width of the statusbar.
   * @param width - The total width in characters
   * @returns A new StatusbarModel with updated width
   * @public
   */
  setSize(width: number): StatusbarModel {
    return new StatusbarModel({
      ...this.state,
      width: Math.max(0, width),
    });
  }

  /**
   * Set text content for all columns.
   * @param first - Text for the first column
   * @param second - Text for the second column
   * @param third - Text for the third column
   * @param fourth - Text for the fourth column
   * @returns A new StatusbarModel with updated content
   * @public
   */
  setContent(
    first: string,
    second: string,
    third: string,
    fourth: string,
  ): StatusbarModel {
    return new StatusbarModel({
      ...this.state,
      firstColumn: first,
      secondColumn: second,
      thirdColumn: third,
      fourthColumn: fourth,
    });
  }

  /**
   * Update colors for all columns.
   * @param first - Color configuration for the first column
   * @param second - Color configuration for the second column
   * @param third - Color configuration for the third column
   * @param fourth - Color configuration for the fourth column
   * @returns A new StatusbarModel with updated colors
   * @public
   */
  setColors(
    first: ColorConfig,
    second: ColorConfig,
    third: ColorConfig,
    fourth: ColorConfig,
  ): StatusbarModel {
    return new StatusbarModel({
      ...this.state,
      firstColumnColors: first,
      secondColumnColors: second,
      thirdColumnColors: third,
      fourthColumnColors: fourth,
    });
  }

  /**
   * Handle messages (primarily window resize).
   * @param msg - The message to handle
   * @returns A tuple of the updated model and command
   * @public
   */
  update(msg: Msg): [StatusbarModel, Cmd<Msg>] {
    if (msg instanceof WindowSizeMsg) {
      return [this.setSize(msg.width), null];
    }
    return [this, null];
  }

  /**
   * Render the statusbar as a string.
   * @returns The rendered statusbar
   * @public
   */
  view(): string {
    const { width: totalWidth } = this.state;

    if (totalWidth === 0) {
      return "";
    }

    // Build styled columns
    const firstStyle = new Style()
      .foreground(this.state.firstColumnColors.foreground)
      .background(this.state.firstColumnColors.background)
      .padding(0, 1)
      .height(Height);

    const secondStyle = new Style()
      .foreground(this.state.secondColumnColors.foreground)
      .background(this.state.secondColumnColors.background)
      .padding(0, 1)
      .height(Height);

    const thirdStyle = new Style()
      .foreground(this.state.thirdColumnColors.foreground)
      .background(this.state.thirdColumnColors.background)
      .padding(0, 1)
      .height(Height)
      .alignHorizontal("right");

    const fourthStyle = new Style()
      .foreground(this.state.fourthColumnColors.foreground)
      .background(this.state.fourthColumnColors.background)
      .padding(0, 1)
      .height(Height);

    // Render third and fourth columns (they don't truncate)
    const thirdRendered = thirdStyle.render(this.state.thirdColumn);
    const fourthRendered = fourthStyle.render(this.state.fourthColumn);
    const thirdWidth = textWidth(thirdRendered);
    const fourthWidth = textWidth(fourthRendered);

    // Calculate max width for first column (limited to 30 chars of content + padding)
    const maxFirstContentWidth = Math.min(
      MAX_FIRST_COLUMN_WIDTH,
      Math.max(0, totalWidth - thirdWidth - fourthWidth - 4), // -4 for second column padding
    );
    const firstTruncated = truncate(this.state.firstColumn, maxFirstContentWidth);
    const firstRendered = firstStyle.render(firstTruncated);
    const firstWidth = textWidth(firstRendered);

    // Calculate remaining width for second column
    const secondContentWidth = Math.max(
      0,
      totalWidth - firstWidth - thirdWidth - fourthWidth - 2, // -2 for padding
    );
    const secondTruncated = truncate(this.state.secondColumn, secondContentWidth);
    
    // Set width for second column to fill remaining space
    const secondRendered = secondStyle.width(secondContentWidth + 2).render(secondTruncated);

    // Join columns horizontally
    return [firstRendered, secondRendered, thirdRendered, fourthRendered]
      .join("");
  }
}

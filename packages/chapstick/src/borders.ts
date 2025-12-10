import type { BorderStyle } from "./types.js";

/**
 * Name of a border style.
 * @public
 */
export type BorderStyleName = "normal" | "rounded" | "bold" | "double";

/**
 * Predefined border styles matching common terminal box characters.
 * @public
 */
export const borderStyles: Record<BorderStyleName, BorderStyle> = {
  normal: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "┌",
    topRight: "┐",
    bottomLeft: "└",
    bottomRight: "┘",
  },
  rounded: {
    top: "─",
    bottom: "─",
    left: "│",
    right: "│",
    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",
  },
  bold: {
    top: "━",
    bottom: "━",
    left: "┃",
    right: "┃",
    topLeft: "┏",
    topRight: "┓",
    bottomLeft: "┗",
    bottomRight: "┛",
  },
  double: {
    top: "═",
    bottom: "═",
    left: "║",
    right: "║",
    topLeft: "╔",
    topRight: "╗",
    bottomLeft: "╚",
    bottomRight: "╝",
  },
};

/**
 * Default border style (single line).
 * @public
 */
export const defaultBorderStyle: BorderStyle = borderStyles.normal;

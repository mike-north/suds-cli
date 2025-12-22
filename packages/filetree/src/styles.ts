import { Style } from "@suds-cli/chapstick";

/**
 * Style configuration for the filetree component.
 * @public
 */
export interface FiletreeStyles {
  /** Style for selected/highlighted item */
  selectedItem: Style;
  /** Style for normal items */
  normalItem: Style;
}

/**
 * Default styles for the filetree component.
 * @public
 */
export function defaultStyles(): FiletreeStyles {
  return {
    selectedItem: new Style().foreground("#00ff00").bold(true),
    normalItem: new Style(),
  };
}

/**
 * Merge user provided style overrides with defaults.
 * @public
 */
export function mergeStyles(overrides?: Partial<FiletreeStyles>): FiletreeStyles {
  if (!overrides) {
    return defaultStyles();
  }
  return { ...defaultStyles(), ...overrides };
}

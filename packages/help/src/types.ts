import { Style } from "@suds-cli/chapstick";
import type { Binding } from "@suds-cli/key";

/**
 * Interface for components that provide help bindings.
 * @public
 */
export interface KeyMap {
  /** Bindings for short (single-line) help. */
  shortHelp(): Binding[];
  /** Bindings grouped into columns for full help. */
  fullHelp(): Binding[][];
}

/**
 * Style configuration for help rendering.
 * @public
 */
export interface HelpStyles {
  ellipsis: Style;
  shortKey: Style;
  shortDesc: Style;
  shortSeparator: Style;
  fullKey: Style;
  fullDesc: Style;
  fullSeparator: Style;
}




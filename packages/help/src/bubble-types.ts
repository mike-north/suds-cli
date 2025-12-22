import type { ColorInput } from "@suds-cli/chapstick";

/**
 * Color configuration for the help bubble title (adaptive for light/dark terminals).
 * @public
 */
export interface TitleColor {
  /** Background color (adaptive) */
  background: ColorInput;
  /** Foreground color (adaptive) */
  foreground: ColorInput;
}

/**
 * A single entry in the help bubble screen.
 * @public
 */
export interface Entry {
  /** Key binding (e.g., "ctrl+c", "j/up") */
  key: string;
  /** Description of what the key does */
  description: string;
}

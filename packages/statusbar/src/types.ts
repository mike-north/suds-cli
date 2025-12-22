import type { ColorInput } from "@suds-cli/chapstick";

/**
 * Color configuration for a statusbar column.
 * @public
 */
export interface ColorConfig {
  foreground: ColorInput;
  background: ColorInput;
}

/**
 * Internal state for the statusbar model.
 * @internal
 */
export interface StatusbarState {
  width: number;
  height: number;
  firstColumn: string;
  secondColumn: string;
  thirdColumn: string;
  fourthColumn: string;
  firstColumnColors: ColorConfig;
  secondColumnColors: ColorConfig;
  thirdColumnColors: ColorConfig;
  fourthColumnColors: ColorConfig;
}

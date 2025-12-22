import { 
  type StyleProvider,
  defaultStyleProvider,
} from "@suds-cli/chapstick";
import type { HelpStyles } from "./types.js";

/** 
 * Default styling for help output.
 * @param styleProvider - Optional style provider for dependency injection
 * @public
 */
export function defaultStyles(
  styleProvider: StyleProvider = defaultStyleProvider,
): HelpStyles {
  const keyStyle = styleProvider.createStyle().foreground("#626262");
  const descStyle = styleProvider.createStyle().foreground("#4A4A4A");
  const sepStyle = styleProvider.createStyle().foreground("#3C3C3C");

  return {
    shortKey: keyStyle,
    shortDesc: descStyle,
    shortSeparator: sepStyle,
    ellipsis: sepStyle,
    fullKey: keyStyle,
    fullDesc: descStyle,
    fullSeparator: sepStyle,
  };
}

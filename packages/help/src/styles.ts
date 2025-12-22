import { Style } from '@suds-cli/chapstick'
import type { HelpStyles } from './types.js'

/**
 * Default styling for help output.
 * @public
 */
export function defaultStyles(): HelpStyles {
  const keyStyle = new Style().foreground('#626262')
  const descStyle = new Style().foreground('#4A4A4A')
  const sepStyle = new Style().foreground('#3C3C3C')

  return {
    shortKey: keyStyle,
    shortDesc: descStyle,
    shortSeparator: sepStyle,
    ellipsis: sepStyle,
    fullKey: keyStyle,
    fullDesc: descStyle,
    fullSeparator: sepStyle,
  }
}

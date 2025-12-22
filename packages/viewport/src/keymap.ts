import { Binding, newBinding } from '@suds-cli/key'

/**
 * Key bindings for viewport navigation.
 * @public
 */
export interface ViewportKeyMap {
  pageDown: Binding
  pageUp: Binding
  halfPageDown: Binding
  halfPageUp: Binding
  down: Binding
  up: Binding
}

/**
 * Pager-like default key bindings.
 * @public
 */
export const defaultKeyMap: ViewportKeyMap = {
  pageDown: newBinding({ keys: ['pgdown', ' ', 'f'] }),
  pageUp: newBinding({ keys: ['pgup', 'b'] }),
  halfPageDown: newBinding({ keys: ['d', 'ctrl+d'] }),
  halfPageUp: newBinding({ keys: ['u', 'ctrl+u'] }),
  down: newBinding({ keys: ['down', 'j'] }),
  up: newBinding({ keys: ['up', 'k'] }),
}

import { Binding, newBinding } from '@suds-cli/key'

/**
 * Pagination display style.
 * @public
 */
export enum PaginatorType {
  Arabic = 'arabic',
  Dots = 'dots',
}

/**
 * Key bindings for paginator navigation.
 * @public
 */
export interface KeyMap {
  prevPage: Binding
  nextPage: Binding
}

/**
 * Default paginator key bindings.
 * @public
 */
export const defaultKeyMap: KeyMap = {
  prevPage: newBinding({ keys: ['pgup', 'left', 'h'] }),
  nextPage: newBinding({ keys: ['pgdown', 'right', 'l'] }),
}

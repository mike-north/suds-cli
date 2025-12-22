import type { Item } from './item.js'
import { defaultStyles, type ListStyles } from './styles.js'

/**
 * Delegate interface for rendering list items.
 * @public
 */
export interface ItemDelegate<T extends Item> {
  /** Height of each item in lines. */
  height(): number
  /** Spacing between items in lines. */
  spacing(): number
  /** Render an item to a string. */
  render(item: T, index: number, selected: boolean): string
}

/**
 * Default delegate renders a title plus optional description.
 * @public
 */
export class DefaultDelegate implements ItemDelegate<Item> {
  #styles: ListStyles

  constructor(styles: ListStyles = defaultStyles()) {
    this.#styles = styles
  }

  height(): number {
    return 2
  }

  spacing(): number {
    return 1
  }

  render(item: Item, _index: number, selected: boolean): string {
    const titleStyle = selected
      ? this.#styles.selectedTitle
      : this.#styles.normalTitle
    const descStyle = selected
      ? this.#styles.selectedDesc
      : this.#styles.normalDesc

    const title = titleStyle.render(item.title())
    const desc = item.description()
      ? '\n' + descStyle.render(item.description())
      : ''
    return `${title}${desc}`
  }

  /** Return a copy using different styles. */
  withStyles(styles: ListStyles): DefaultDelegate {
    return new DefaultDelegate(styles)
  }
}

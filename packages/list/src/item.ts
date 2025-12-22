/**
 * Items displayed in a list must implement this interface.
 * @public
 */
export interface Item {
  /** Text used for filtering. */
  filterValue(): string
  /** Title shown in the list. */
  title(): string
  /** Optional description. */
  description(): string
}

/**
 * Simple default item implementation.
 * @public
 */
export class DefaultItem implements Item {
  constructor(
    private readonly titleText: string,
    private readonly descText: string = '',
  ) {}

  filterValue(): string {
    return this.titleText
  }

  title(): string {
    return this.titleText
  }

  description(): string {
    return this.descText
  }
}

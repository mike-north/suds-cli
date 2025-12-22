import { Style } from '@suds-cli/chapstick'

/**
 * Style configuration for the list component.
 * @public
 */
export interface ListStyles {
  title: Style
  titleBar: Style
  spinner: Style
  filterPrompt: Style
  filterCursor: Style
  noItems: Style
  statusBar: Style
  statusEmpty: Style
  pagination: Style
  help: Style
  normalTitle: Style
  normalDesc: Style
  selectedTitle: Style
  selectedDesc: Style
  dimmedTitle: Style
  dimmedDesc: Style
}

/** Default styles used by the list component. @public */
export function defaultStyles(): ListStyles {
  return {
    title: new Style().bold(true),
    titleBar: new Style().underline(true),
    spinner: new Style(),
    filterPrompt: new Style(),
    filterCursor: new Style().background('#303030').foreground('#ffffff'),
    noItems: new Style().italic(true),
    statusBar: new Style().italic(true),
    statusEmpty: new Style().italic(true),
    pagination: new Style(),
    help: new Style().italic(true),
    normalTitle: new Style(),
    normalDesc: new Style().italic(true),
    selectedTitle: new Style().bold(true),
    selectedDesc: new Style(),
    dimmedTitle: new Style().italic(true),
    dimmedDesc: new Style().italic(true),
  }
}

/**
 * Merge user provided overrides with defaults.
 * @public
 */
export function mergeStyles(overrides?: Partial<ListStyles>): ListStyles {
  if (!overrides) {
    return defaultStyles()
  }
  return { ...defaultStyles(), ...overrides }
}

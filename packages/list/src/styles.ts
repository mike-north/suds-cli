import { 
  Style,
  type StyleProvider,
  defaultStyleProvider,
} from "@suds-cli/chapstick";

/**
 * Style configuration for the list component.
 * @public
 */
export interface ListStyles {
  title: Style;
  titleBar: Style;
  spinner: Style;
  filterPrompt: Style;
  filterCursor: Style;
  noItems: Style;
  statusBar: Style;
  statusEmpty: Style;
  pagination: Style;
  help: Style;
  normalTitle: Style;
  normalDesc: Style;
  selectedTitle: Style;
  selectedDesc: Style;
  dimmedTitle: Style;
  dimmedDesc: Style;
}

/** 
 * Default styles used by the list component.
 * @param styleProvider - Optional style provider for dependency injection
 * @public 
 */
export function defaultStyles(
  styleProvider: StyleProvider = defaultStyleProvider,
): ListStyles {
  return {
    title: styleProvider.createStyle().bold(true),
    titleBar: styleProvider.createStyle().underline(true),
    spinner: styleProvider.createStyle(),
    filterPrompt: styleProvider.createStyle(),
    filterCursor: styleProvider.createStyle().background("#303030").foreground("#ffffff"),
    noItems: styleProvider.createStyle().italic(true),
    statusBar: styleProvider.createStyle().italic(true),
    statusEmpty: styleProvider.createStyle().italic(true),
    pagination: styleProvider.createStyle(),
    help: styleProvider.createStyle().italic(true),
    normalTitle: styleProvider.createStyle(),
    normalDesc: styleProvider.createStyle().italic(true),
    selectedTitle: styleProvider.createStyle().bold(true),
    selectedDesc: styleProvider.createStyle(),
    dimmedTitle: styleProvider.createStyle().italic(true),
    dimmedDesc: styleProvider.createStyle().italic(true),
  };
}

/**
 * Merge user provided overrides with defaults.
 * @param overrides - Optional partial style overrides
 * @param styleProvider - Optional style provider for dependency injection
 * @public
 */
export function mergeStyles(
  overrides?: Partial<ListStyles>,
  styleProvider?: StyleProvider,
): ListStyles {
  if (!overrides) {
    return defaultStyles(styleProvider);
  }
  return { ...defaultStyles(styleProvider), ...overrides };
}



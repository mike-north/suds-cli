import { 
  Style,
  borderStyles,
  type BorderStyle,
  type StyleProvider,
  defaultStyleProvider,
} from "@suds-cli/chapstick";

/** Styles applied to parts of the table. @public */
export interface TableStyles {
  header: Style;
  cell: Style;
  selected: Style;
  border: Style;
  borderStyle: BorderStyle;
}

/** 
 * Default table styles.
 * @param styleProvider - Optional style provider for dependency injection
 * @public 
 */
export function defaultStyles(
  styleProvider: StyleProvider = defaultStyleProvider,
): TableStyles {
  return {
    header: styleProvider.createStyle().bold(true).padding(0, 1),
    cell: styleProvider.createStyle().padding(0, 1),
    selected: styleProvider.createStyle().background("#7D56F4").foreground("#FFFFFF"),
    border: styleProvider.createStyle().foreground("#383838"),
    borderStyle: borderStyles.normal,
  };
}




import { Style, borderStyles, type BorderStyle } from '@suds-cli/chapstick'

/** Styles applied to parts of the table. @public */
export interface TableStyles {
  header: Style
  cell: Style
  selected: Style
  border: Style
  borderStyle: BorderStyle
}

/** Default table styles. @public */
export function defaultStyles(): TableStyles {
  return {
    header: new Style().bold(true).padding(0, 1),
    cell: new Style().padding(0, 1),
    selected: new Style().background('#7D56F4').foreground('#FFFFFF'),
    border: new Style().foreground('#383838'),
    borderStyle: borderStyles.normal,
  }
}

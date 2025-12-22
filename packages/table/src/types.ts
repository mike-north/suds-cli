import type { BorderStyle, StyleProvider } from "@suds-cli/chapstick";
import type { TableKeyMap } from "./keymap.js";
import type { TableStyles } from "./styles.js";

/** Column definition for a table. @public */
export interface Column {
  title: string;
  width: number;
}

/** Row data. Each entry corresponds to a column. @public */
export type Row = string[];

/** Options for creating a table. @public */
export interface TableOptions {
  columns: Column[];
  rows?: Row[];
  height?: number;
  width?: number;
  focused?: boolean;
  styles?: Partial<TableStyles>;
  keyMap?: Partial<TableKeyMap>;
  bordered?: boolean;
  borderStyle?: BorderStyle;
  /** Optional style provider for dependency injection */
  styleProvider?: StyleProvider;
}




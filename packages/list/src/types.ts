import type { Item } from "./item.js";
import type { ItemDelegate } from "./delegate.js";
import type { ListKeyMap } from "./keymap.js";
import type { ListStyles } from "./styles.js";
import type { StyleProvider } from "@suds-cli/chapstick";

/** Filtering lifecycle for the list. @public */
export type FilterState = "unfiltered" | "filtering" | "applied";

/**
 * Construction options for {@link ListModel}.
 * @public
 */
export interface ListOptions<T extends Item> {
  items: T[];
  delegate?: ItemDelegate<T>;
  width?: number;
  height?: number;
  title?: string;
  showTitle?: boolean;
  showFilter?: boolean;
  showStatusBar?: boolean;
  showPagination?: boolean;
  showHelp?: boolean;
  filteringEnabled?: boolean;
  styles?: Partial<ListStyles>;
  keyMap?: ListKeyMap;
  /** Optional style provider for dependency injection */
  styleProvider?: StyleProvider;
}



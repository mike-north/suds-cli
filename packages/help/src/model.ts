import { joinHorizontal, width as stringWidth } from "@suds-cli/chapstick";
import { type Cmd, type Msg } from "@suds-cli/tea";
import type { Binding } from "@suds-cli/key";
import { defaultStyles } from "./styles.js";
import type { HelpStyles, KeyMap } from "./types.js";

/**
 * Options for configuring the help component.
 * @public
 */
export interface HelpOptions {
  width?: number;
  showAll?: boolean;
  shortSeparator?: string;
  fullSeparator?: string;
  ellipsis?: string;
  styles?: Partial<HelpStyles>;
}

/**
 * Help view renderer.
 * @public
 */
export class HelpModel {
  readonly width: number;
  readonly showAll: boolean;
  readonly shortSeparator: string;
  readonly fullSeparator: string;
  readonly ellipsis: string;
  readonly styles: HelpStyles;

  private constructor(options: HelpOptions = {}) {
    this.width = options.width ?? 0;
    this.showAll = options.showAll ?? false;
    this.shortSeparator = options.shortSeparator ?? " • ";
    this.fullSeparator = options.fullSeparator ?? "    ";
    this.ellipsis = options.ellipsis ?? "…";
    const defaults = defaultStyles();
    this.styles = { ...defaults, ...options.styles };
  }

  /** Create a new help model with defaults applied. */
  static new(options: HelpOptions = {}): HelpModel {
    return new HelpModel(options);
  }

  /** Return a new model with updated width. */
  withWidth(width: number): HelpModel {
    return this.with({ width });
  }

  /** Return a new model with showAll toggled. */
  withShowAll(showAll: boolean): HelpModel {
    return this.with({ showAll });
  }

  /** Tea update: no-op (view-only component). */
  update(_msg: Msg): [HelpModel, Cmd<Msg>] {
    return [this, null];
  }

  /** Render help text from the provided key map. */
  view(keyMap: KeyMap): string {
    if (this.showAll) {
      return this.fullHelpView(keyMap.fullHelp());
    }
    return this.shortHelpView(keyMap.shortHelp());
  }

  /** Render single-line help. */
  shortHelpView(bindings: Binding[]): string {
    if (!bindings || bindings.length === 0) {
      return "";
    }

    let result = "";
    let totalWidth = 0;
    const separator = this.styles.shortSeparator
      .inline(true)
      .render(this.shortSeparator);

    for (const [i, kb] of bindings.entries()) {
      if (!kb.enabled()) continue;

      const sep = totalWidth > 0 && i < bindings.length ? separator : "";
      const help = kb.help();
      const item =
        sep +
        this.styles.shortKey.inline(true).render(help.key) +
        " " +
        this.styles.shortDesc.inline(true).render(help.desc);
      const itemWidth = stringWidth(item);

      const [tail, ok] = this.shouldAddItem(totalWidth, itemWidth);
      if (!ok) {
        if (tail) {
          result += tail;
        }
        break;
      }

      totalWidth += itemWidth;
      result += item;
    }

    return result;
  }

  /** Render multi-column help. */
  fullHelpView(groups: Binding[][]): string {
    if (!groups || groups.length === 0) {
      return "";
    }

    const out: string[] = [];
    let totalWidth = 0;
    const separator = this.styles.fullSeparator
      .inline(true)
      .render(this.fullSeparator);

    for (const [i, group] of groups.entries()) {
      if (!group || !shouldRenderColumn(group)) {
        continue;
      }

      const keys: string[] = [];
      const descriptions: string[] = [];
      for (const kb of group) {
        if (!kb.enabled()) continue;
        const help = kb.help();
        keys.push(this.styles.fullKey.render(help.key));
        descriptions.push(this.styles.fullDesc.render(help.desc));
      }

      const sep = totalWidth > 0 && i < groups.length ? separator : "";
      const parts = sep
        ? [sep, keys.join("\n"), " ", descriptions.join("\n")]
        : [keys.join("\n"), " ", descriptions.join("\n")];
      const column = joinHorizontal(...parts);
      const columnWidth = stringWidth(column);

      const [tail, ok] = this.shouldAddItem(totalWidth, columnWidth);
      if (!ok) {
        if (tail) {
          out.push(tail);
        }
        break;
      }

      totalWidth += columnWidth;
      out.push(column);
    }

    return joinHorizontal(...out);
  }

  private shouldAddItem(totalWidth: number, width: number): [string, boolean] {
    if (this.width > 0 && totalWidth + width > this.width) {
      const tail =
        " " + this.styles.ellipsis.inline(true).render(this.ellipsis);
      if (totalWidth + stringWidth(tail) < this.width) {
        return [tail, false];
      }
    }
    return ["", true];
  }

  private with(patch: Partial<HelpOptions>): HelpModel {
    return new HelpModel({
      width: this.width,
      showAll: this.showAll,
      shortSeparator: this.shortSeparator,
      fullSeparator: this.fullSeparator,
      ellipsis: this.ellipsis,
      styles: this.styles,
      ...patch,
    });
  }
}

function shouldRenderColumn(bindings: Binding[]): boolean {
  return bindings.some((b) => b.enabled());
}




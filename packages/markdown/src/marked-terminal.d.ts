declare module "marked-terminal" {
  import type { MarkedExtension } from "marked";
  import type { Chalk } from "chalk";

  export interface MarkedTerminalOptions {
    code?: Chalk;
    blockquote?: Chalk;
    html?: Chalk;
    heading?: Chalk;
    firstHeading?: Chalk;
    hr?: Chalk;
    listitem?: Chalk;
    list?: Chalk;
    table?: Chalk;
    paragraph?: Chalk;
    strong?: Chalk;
    em?: Chalk;
    codespan?: Chalk;
    del?: Chalk;
    link?: Chalk;
    href?: Chalk;
    text?: Chalk;
    unescape?: boolean;
    emoji?: boolean;
    width?: number;
    showSectionPrefix?: boolean;
    reflowText?: boolean;
    tab?: number;
    tableOptions?: Record<string, unknown>;
  }

  export function markedTerminal(
    options?: MarkedTerminalOptions,
  ): MarkedExtension;
}

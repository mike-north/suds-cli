declare module 'marked-terminal' {
  import type { MarkedExtension } from 'marked'
  import type { StyleFn } from '@suds-cli/machine'

  export interface MarkedTerminalOptions {
    code?: StyleFn
    blockquote?: StyleFn
    html?: StyleFn
    heading?: StyleFn
    firstHeading?: StyleFn
    hr?: StyleFn
    listitem?: StyleFn
    list?: StyleFn
    table?: StyleFn
    paragraph?: StyleFn
    strong?: StyleFn
    em?: StyleFn
    codespan?: StyleFn
    del?: StyleFn
    link?: StyleFn
    href?: StyleFn
    text?: StyleFn
    unescape?: boolean
    emoji?: boolean
    width?: number
    showSectionPrefix?: boolean
    reflowText?: boolean
    tab?: number
    tableOptions?: Record<string, unknown>
  }

  export function markedTerminal(
    options?: MarkedTerminalOptions,
  ): MarkedExtension
}

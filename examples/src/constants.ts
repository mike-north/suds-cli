import { text } from '\@boba-cli/dsl'

export const makeDemoHeader = (title: string) =>
  text(`🧋 Boba Demo - ${title}`).bold().foreground('#ff79c6')

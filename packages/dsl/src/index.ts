// App builder
export { createApp, AppBuilder } from './app-builder.js'

// Types
export type {
  App,
  ComponentBuilder,
  ComponentView,
  EventContext,
  InitContext,
  InitHandler,
  KeyHandler,
  LayoutNode,
  MessageContext,
  MessageHandler,
  RunOptions,
  TextNode,
  ViewFunction,
  ViewNode,
} from './types.js'

// Commands (re-exported from TEA for scheduling)
export { tick, batch, sequence } from '@boba-cli/tea'

// View DSL
export { text, vstack, hstack, spacer, divider, when, choose, map } from './view/nodes.js'
export { render } from './view/renderer.js'

// Component builders
export { code, type CodeBuilderOptions } from './components/code.js'
export { filepicker, type FilepickerBuilderOptions } from './components/filepicker.js'
export {
  filetree,
  type FiletreeBuilderOptions,
  type DirectoryItem,
} from './components/filetree.js'
export { help, type HelpBuilderOptions } from './components/help.js'
export { helpBubble, type HelpBubbleBuilderOptions, type Entry } from './components/help-bubble.js'
export {
  list,
  type ListBuilderOptions,
  type Item,
  type ListStyles,
  DefaultItem,
  ListModel,
} from './components/list.js'
export { markdown, type MarkdownBuilderOptions } from './components/markdown.js'
export { paginator, type PaginatorBuilderOptions } from './components/paginator.js'
export { progress, type ProgressBuilderOptions } from './components/progress.js'
export { spinner, type SpinnerBuilderOptions } from './components/spinner.js'
export { statusBar, type StatusBarBuilderOptions } from './components/statusbar.js'
export { stopwatch, type StopwatchBuilderOptions } from './components/stopwatch.js'
export { table, type TableBuilderOptions } from './components/table.js'
export { textArea, type TextAreaBuilderOptions } from './components/textarea.js'
export { textInput, type TextInputBuilderOptions } from './components/textinput.js'
export { timer, type TimerBuilderOptions } from './components/timer.js'
export { viewport, type ViewportBuilderOptions } from './components/viewport.js'

// Re-export useful types from dependencies
export { Style } from '@boba-cli/chapstick'
export {
  type Spinner,
  line,
  dot,
  miniDot,
  pulse,
  points,
  moon,
  meter,
  ellipsis,
} from '@boba-cli/spinner'
export {
  type TextInputModel,
  EchoMode,
  CursorMode,
  type ValidateFunc,
} from '@boba-cli/textinput'

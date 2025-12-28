/**
 * Demo registry - maps command names to demo factories.
 */

import type { PlatformAdapter } from '@boba-cli/machine'
// import codeDemo from '@boba-cli/examples/code'
// import filepickerDemo from '@boba-cli/examples/filepicker'
// import filetreeDemo from '@boba-cli/examples/filetree'
import helpDemo from '@boba-cli/examples/help'
import helpBubbleDemo from '@boba-cli/examples/help-bubble'
import iconsDemo from '@boba-cli/examples/icons'
import listDemo from '@boba-cli/examples/list'
// import markdownDemo from '@boba-cli/examples/markdown'
import paginatorDemo from '@boba-cli/examples/paginator'
import progressDemo from '@boba-cli/examples/progress'
import spinnerDemo from '@boba-cli/examples/spinner'
import spinnerLowLevelDemo from '@boba-cli/examples/spinner-low-level'
import statusbarDemo from '@boba-cli/examples/statusbar'
import stopwatchDemo from '@boba-cli/examples/stopwatch'
import tableDemo from '@boba-cli/examples/table'
import textareaDemo from '@boba-cli/examples/textarea'
import textinputDemo from '@boba-cli/examples/textinput'
import textinputLowLevelDemo from '@boba-cli/examples/textinput-low-level'
import timerDemo from '@boba-cli/examples/timer'
import viewportDemo from '@boba-cli/examples/viewport'

// Type for demo runner functions from examples
type DemoRunner = (platform: PlatformAdapter) => Promise<void>

export interface DemoInfo {
  name: string
  filename: string
  description: string
  create: DemoRunner
}

/**
 * Registry of all available demos.
 */
export const demos: DemoInfo[] = [
  // {
  //   name: 'code',
  //   filename: 'code.ts',
  //   description: 'Syntax-highlighted code viewer',
  //   create: codeDemo,
  // },
  // {
  //   name: 'filepicker',
  //   filename: 'filepicker.ts',
  //   description: 'Interactive file picker',
  //   create: filepickerDemo,
  // },
  // {
  //   name: 'filetree',
  //   filename: 'filetree.ts',
  //   description: 'Expandable file tree navigator',
  //   create: filetreeDemo,
  // },
  {
    name: 'help',
    filename: 'help.ts',
    description: 'Keyboard shortcuts help viewer',
    create: helpDemo,
  },
  {
    name: 'help-bubble',
    filename: 'help-bubble.ts',
    description: 'Bubble-style help overlay',
    create: helpBubbleDemo,
  },
  {
    name: 'icons',
    filename: 'icons.ts',
    description: 'Icon gallery browser',
    create: iconsDemo,
  },
  {
    name: 'list',
    filename: 'list.ts',
    description: 'Filterable, selectable lists',
    create: listDemo,
  },
  // {
  //   name: 'markdown',
  //   filename: 'markdown.ts',
  //   description: 'Rendered markdown viewer',
  //   create: markdownDemo,
  // },
  {
    name: 'paginator',
    filename: 'paginator.ts',
    description: 'Page navigation controls',
    create: paginatorDemo,
  },
  {
    name: 'progress',
    filename: 'progress.ts',
    description: 'Animated progress bars with gradients',
    create: progressDemo,
  },
  {
    name: 'spinner',
    filename: 'spinner.ts',
    description: 'Animated loading spinner (DSL)',
    create: spinnerDemo,
  },
  {
    name: 'spinner-low-level',
    filename: 'spinner-low-level.ts',
    description: 'Spinner with low-level TEA API',
    create: spinnerLowLevelDemo,
  },
  {
    name: 'statusbar',
    filename: 'statusbar.ts',
    description: 'Bottom status bar component',
    create: statusbarDemo,
  },
  {
    name: 'stopwatch',
    filename: 'stopwatch.ts',
    description: 'Elapsed time tracker',
    create: stopwatchDemo,
  },
  {
    name: 'table',
    filename: 'table.ts',
    description: 'Scrollable data tables',
    create: tableDemo,
  },
  {
    name: 'textarea',
    filename: 'textarea.ts',
    description: 'Multi-line text editor',
    create: textareaDemo,
  },
  {
    name: 'textinput',
    filename: 'textinput.ts',
    description: 'Single-line text input (DSL)',
    create: textinputDemo,
  },
  {
    name: 'textinput-low-level',
    filename: 'textinput-low-level.ts',
    description: 'Text input with low-level TEA API',
    create: textinputLowLevelDemo,
  },
  {
    name: 'timer',
    filename: 'timer.ts',
    description: 'Countdown timer',
    create: timerDemo,
  },
  {
    name: 'viewport',
    filename: 'viewport.ts',
    description: 'Scrollable viewport container',
    create: viewportDemo,
  },
]

/**
 * Find a demo by name or filename.
 */
export function findDemo(query: string): DemoInfo | undefined {
  const q = query.toLowerCase().trim()

  // Try exact name match
  let demo = demos.find(d => d.name === q)
  if (demo) return demo

  // Try filename match (with or without extension)
  demo = demos.find(d =>
    d.filename === q ||
    d.filename === `${q}.ts` ||
    d.filename.replace('.ts', '') === q ||
    d.filename.replace('-demo.ts', '') === q
  )
  if (demo) return demo

  // Try partial name match
  demo = demos.find(d => d.name.includes(q) || d.filename.includes(q))

  return demo
}

/**
 * Parse a command line and extract the demo name.
 * Supports formats like:
 *   - tsx spinner-demo.ts
 *   - node spinner-demo.ts
 *   - pnpm demo spinner
 *   - spinner
 *   - spinner-demo
 */
export function parseCommand(command: string): string | null {
  const trimmed = command.trim()
  if (!trimmed) return null

  const parts = trimmed.split(/\s+/)

  // Handle: tsx/node <filename>
  if (parts[0] === 'tsx' || parts[0] === 'node') {
    return parts[1] ?? null
  }

  // Handle: pnpm demo <name>
  if (parts[0] === 'pnpm' && parts[1] === 'demo') {
    return parts[2] ?? null
  }

  // Handle: just the name
  return parts[0] ?? null
}

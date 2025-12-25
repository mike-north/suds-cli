/**
 * Demo registry - maps command names to demo factories.
 */

import { SpinnerDemoModel } from './spinner-demo'
import { ProgressDemoModel } from './progress-demo'
import { ListDemoModel } from './list-demo'
import { TimerDemoModel } from './timer-demo'
import { StopwatchDemoModel } from './stopwatch-demo'
import { TableDemoModel } from './table-demo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = any

export interface DemoInfo {
  name: string
  filename: string
  description: string
  create: () => AnyModel
}

/**
 * Registry of all available demos.
 */
export const demos: DemoInfo[] = [
  {
    name: 'spinner',
    filename: 'spinner-demo.ts',
    description: 'Animated loading spinners',
    create: () => new SpinnerDemoModel(),
  },
  {
    name: 'progress',
    filename: 'progress-demo.ts',
    description: 'Animated progress bars with gradients',
    create: () => new ProgressDemoModel(),
  },
  {
    name: 'list',
    filename: 'list-demo.ts',
    description: 'Filterable, selectable lists',
    create: () => new ListDemoModel(),
  },
  {
    name: 'timer',
    filename: 'timer-demo.ts',
    description: 'Countdown timer',
    create: () => new TimerDemoModel(),
  },
  {
    name: 'stopwatch',
    filename: 'stopwatch-demo.ts',
    description: 'Elapsed time tracker',
    create: () => new StopwatchDemoModel(),
  },
  {
    name: 'table',
    filename: 'table-demo.ts',
    description: 'Scrollable data tables',
    create: () => new TableDemoModel(),
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

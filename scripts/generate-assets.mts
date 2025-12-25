#!/usr/bin/env npx tsx
/**
 * Generate GIF assets for Boba-CLI examples using VHS
 *
 * This script discovers `.tape` files in the examples directory and runs VHS
 * on them to produce GIFs. The tape files are the source of truth.
 *
 * Requirements:
 *   - VHS: https://github.com/charmbracelet/vhs
 *   - gifsicle: https://github.com/kohler/gifsicle
 *
 * Usage:
 *   npx tsx scripts/generate-assets.mts           # Interactive selection
 *   npx tsx scripts/generate-assets.mts --all     # Generate all demos
 *   npx tsx scripts/generate-assets.mts spinner   # Generate specific demo(s)
 *   npx tsx scripts/generate-assets.mts --list    # List available demos
 */

import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Style, borderStyles } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { DefaultItem, ListModel } from '@boba-cli/list'
import { ProgressModel } from '@boba-cli/progress'
import { SpinnerModel, dot } from '@boba-cli/spinner'
import { StopwatchModel } from '@boba-cli/stopwatch'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const EXAMPLES_DIR = resolve(__dirname, '../examples')

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  title: new Style().bold(true).foreground('#ff79c6'),
  subtitle: new Style().foreground('#bd93f9'),
  success: new Style().foreground('#50fa7b'),
  error: new Style().foreground('#ff5555'),
  warning: new Style().foreground('#f1fa8c'),
  muted: new Style().foreground('#6272a4').italic(true),
  key: new Style().foreground('#8be9fd').bold(true),
  highlight: new Style().foreground('#f8f8f2').bold(true),
  currentPkg: new Style().foreground('#bd93f9'),
  checkMark: new Style().foreground('#50fa7b'),
  crossMark: new Style().foreground('#ff5555'),
  time: new Style().foreground('#6272a4'),
  box: new Style()
    .border(true)
    .borderStyle(borderStyles.rounded)
    .borderForeground('#bd93f9')
    .padding(0, 1),
}

// ─────────────────────────────────────────────────────────────────────────────
// Tape File Discovery & Parsing
// ─────────────────────────────────────────────────────────────────────────────

interface TapeInfo {
  name: string
  path: string
  description: string
}

function parseTapeFile(tapePath: string): TapeInfo {
  const filename = basename(tapePath)
  const name = filename.replace('-demo.tape', '')

  let description = ''
  try {
    const content = readFileSync(tapePath, 'utf-8')
    const firstLine = content.split('\n')[0]?.trim() ?? ''
    if (firstLine.startsWith('#') && !firstLine.includes('@vhs.')) {
      description = firstLine.replace(/^#\s*/, '')
    }
  } catch {
    // Ignore read errors
  }

  return { name, path: tapePath, description }
}

function discoverTapeFiles(): TapeInfo[] {
  const files = readdirSync(EXAMPLES_DIR)
  return files
    .filter((f) => f.endsWith('-demo.tape'))
    .map((f) => parseTapeFile(join(EXAMPLES_DIR, f)))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function commandExists(cmd: string): boolean {
  try {
    const result = spawnSync('which', [cmd], { encoding: 'utf-8' })
    return result.status === 0
  } catch {
    return false
  }
}

interface VhsResult {
  success: boolean
  error?: string
  compressedBytes?: { before: number; after: number }
}

function compressGifAsync(
  gifPath: string,
): Promise<{ before: number; after: number } | null> {
  return new Promise((resolve) => {
    let beforeSize: number
    try {
      beforeSize = statSync(gifPath).size
    } catch {
      resolve(null)
      return
    }

    // Run gifsicle with lossy compression in-place
    const proc = spawn('gifsicle', ['-O3', '--lossy=80', '-b', gifPath], {
      stdio: 'pipe',
    })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const afterSize = statSync(gifPath).size
          resolve({ before: beforeSize, after: afterSize })
        } catch {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })

    proc.on('error', () => {
      resolve(null)
    })
  })
}

function runVhsAsync(tapePath: string): Promise<VhsResult> {
  return new Promise((resolve) => {
    const proc = spawn('vhs', [tapePath], {
      cwd: EXAMPLES_DIR,
      stdio: 'pipe',
    })

    let stderr = ''
    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        // Compress the generated GIF
        const gifName = basename(tapePath).replace('.tape', '.gif')
        const gifPath = join(EXAMPLES_DIR, gifName)
        void compressGifAsync(gifPath).then((compressedBytes) => {
          resolve({
            success: true,
            compressedBytes: compressedBytes ?? undefined,
          })
        })
      } else {
        const errorMatch =
          stderr.match(/error[:\s]+(.+)/i) ||
          stderr.match(/failed[:\s]+(.+)/i) ||
          stderr.match(/(.+failed.+)/i)
        const error =
          errorMatch?.[1]?.trim() ||
          stderr.trim().split('\n').pop() ||
          'Unknown error'
        resolve({ success: false, error })
      }
    })

    proc.on('error', (err) => {
      resolve({ success: false, error: err.message })
    })
  })
}

/** Format milliseconds as human-readable duration with fixed width (0.01s precision) */
function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000

  if (totalSeconds < 60) {
    // Show format: "XX.XXs" for consistent width (6 chars)
    // Round to 2 decimal places
    const rounded = Math.floor(totalSeconds * 100) / 100
    const seconds = Math.floor(rounded)
    const hundredths = Math.floor((rounded % 1) * 100)
    const paddedSeconds = String(seconds).padStart(2, ' ')
    const paddedHundredths = String(hundredths).padStart(2, '0')
    return `${paddedSeconds}.${paddedHundredths}s`
  }

  // For >= 60s, show "XmXXs" format
  const seconds = Math.floor(totalSeconds)
  const minutes = Math.floor(seconds / 60)
  const secs = String(seconds % 60).padStart(2, '0')
  return `${minutes}m${secs}s`
}

/** Format bytes as human-readable size (KB) */
function formatBytes(bytes: number): string {
  const kb = bytes / 1024
  return `${kb.toFixed(0)}KB`
}

/** Format compression savings */
function formatCompression(before: number, after: number): string {
  const saved = before - after
  const percent = ((saved / before) * 100).toFixed(0)
  return `${formatBytes(after)} (-${percent}%)`
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo Item for List
// ─────────────────────────────────────────────────────────────────────────────

class DemoItem extends DefaultItem {
  readonly tape: TapeInfo
  selected: boolean

  constructor(tape: TapeInfo, selected = false) {
    super(tape.name, tape.description)
    this.tape = tape
    this.selected = selected
  }

  override title(): string {
    const checkbox = this.selected ? '◉' : '○'
    return `${checkbox} ${this.tape.name}`
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Application States & Messages
// ─────────────────────────────────────────────────────────────────────────────

type AppState = 'select' | 'generating' | 'done'

class StartGeneratingMsg {
  readonly _tag = 'StartGeneratingMsg' as const
  constructor(readonly tapes: TapeInfo[]) {}
}

class StartVhsMsg {
  readonly _tag = 'StartVhsMsg' as const
  constructor(
    readonly tape: TapeInfo,
    readonly startTime: number,
  ) {}
}

class VhsCompleteMsg {
  readonly _tag = 'VhsCompleteMsg' as const
  constructor(
    readonly name: string,
    readonly success: boolean,
    readonly durationMs: number,
    readonly error?: string,
    readonly compressedBytes?: { before: number; after: number },
  ) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Completed Item with timing
// ─────────────────────────────────────────────────────────────────────────────

interface CompletedItem {
  name: string
  success: boolean
  durationMs: number
  error?: string
  compressedBytes?: { before: number; after: number }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Application Model
// ─────────────────────────────────────────────────────────────────────────────

const keys = {
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }),
  toggle: newBinding({ keys: [' '] }),
  selectAll: newBinding({ keys: ['a', 'A'] }),
  confirm: newBinding({ keys: ['enter'] }),
}

class AppModel implements Model<Msg, AppModel> {
  readonly state: AppState
  readonly list: ListModel<DemoItem>
  readonly spinner: SpinnerModel
  readonly stopwatch: StopwatchModel
  readonly progress: ProgressModel
  readonly currentDemo: string
  readonly completed: CompletedItem[]
  readonly pending: TapeInfo[]
  readonly totalDemos: number
  readonly tapes: TapeInfo[]
  readonly width: number

  constructor(opts: {
    state?: AppState
    list?: ListModel<DemoItem>
    spinner?: SpinnerModel
    stopwatch?: StopwatchModel
    progress?: ProgressModel
    currentDemo?: string
    completed?: CompletedItem[]
    pending?: TapeInfo[]
    totalDemos?: number
    tapes: TapeInfo[]
    width?: number
  }) {
    this.state = opts.state ?? 'select'
    this.tapes = opts.tapes
    this.width = opts.width ?? 80

    const items = this.tapes.map((t) => new DemoItem(t, false))
    this.list =
      opts.list ??
      ListModel.new({
        items,
        title: 'Select demos to generate',
        height: 14,
        showFilter: true,
        showPagination: true,
        showHelp: false,
      })

    this.spinner =
      opts.spinner ??
      new SpinnerModel({
        spinner: dot,
        style: styles.subtitle,
      })

    // Stopwatch with 10ms resolution (0.01s precision)
    this.stopwatch = opts.stopwatch ?? StopwatchModel.new({ interval: 10 })

    this.progress =
      opts.progress ??
      ProgressModel.withDefaultGradient({
        width: 40,
        showPercentage: false,
      })

    this.currentDemo = opts.currentDemo ?? ''
    this.completed = opts.completed ?? []
    this.pending = opts.pending ?? []
    this.totalDemos = opts.totalDemos ?? 0
  }

  private copy(
    opts: Partial<Omit<ConstructorParameters<typeof AppModel>[0], 'tapes'>>,
  ): AppModel {
    return new AppModel({
      state: opts.state ?? this.state,
      list: opts.list ?? this.list,
      spinner: opts.spinner ?? this.spinner,
      stopwatch: opts.stopwatch ?? this.stopwatch,
      progress: opts.progress ?? this.progress,
      currentDemo: opts.currentDemo ?? this.currentDemo,
      completed: opts.completed ?? this.completed,
      pending: opts.pending ?? this.pending,
      totalDemos: opts.totalDemos ?? this.totalDemos,
      tapes: this.tapes,
      width: opts.width ?? this.width,
    })
  }

  init(): Cmd<Msg> {
    return this.list.init()
  }

  update(msg: Msg): [AppModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, keys.quit)) {
      return [this, quit()]
    }

    if (msg instanceof WindowSizeMsg) {
      const nextList = this.list.setHeight(Math.max(8, msg.height - 10))
      return [this.copy({ list: nextList, width: msg.width }), null]
    }

    switch (this.state) {
      case 'select':
        return this.updateSelect(msg)
      case 'generating':
        return this.updateGenerating(msg)
      case 'done':
        return [this, null]
    }
  }

  private updateSelect(msg: Msg): [AppModel, Cmd<Msg>] {
    // Handle start generating (from confirm key)
    if (msg instanceof StartGeneratingMsg) {
      return this.startGenerating(msg.tapes)
    }

    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.toggle)) {
        const items = [...this.list.items]
        const idx = this.list.selectedIndex()
        const item = items[idx]
        if (item) {
          items[idx] = new DemoItem(item.tape, !item.selected)
          const nextList = this.list.setItems(items)
          return [this.copy({ list: nextList }), null]
        }
      }

      if (matches(msg, keys.selectAll)) {
        const anySelected = this.list.items.some((i: DemoItem) => i.selected)
        const items = this.list.items.map(
          (i: DemoItem) => new DemoItem(i.tape, !anySelected),
        )
        const nextList = this.list.setItems(items)
        return [this.copy({ list: nextList }), null]
      }

      if (matches(msg, keys.confirm)) {
        const selected = this.list.items
          .filter((i: DemoItem) => i.selected)
          .map((i: DemoItem) => i.tape)

        if (selected.length === 0) {
          return [this, null]
        }

        return this.startGenerating(selected)
      }
    }

    const [nextList, cmd] = this.list.update(msg)
    if (nextList !== this.list) {
      return [this.copy({ list: nextList }), cmd]
    }

    return [this, cmd]
  }

  private startGenerating(tapes: TapeInfo[]): [AppModel, Cmd<Msg>] {
    if (tapes.length === 0) {
      return [this.copy({ state: 'done' }), quit()]
    }

    const first = tapes[0]
    if (!first) {
      return [this.copy({ state: 'done' }), quit()]
    }

    // Create fresh stopwatch for timing this generation
    const freshStopwatch = StopwatchModel.new({ interval: 10 })

    const nextModel = this.copy({
      state: 'generating',
      totalDemos: tapes.length,
      pending: tapes.slice(1),
      currentDemo: first.name,
      stopwatch: freshStopwatch,
    })

    // Return command that starts animations and sends StartVhsMsg
    return [
      nextModel,
      async () => {
        // Get spinner and stopwatch commands and execute them
        const spinnerCmd = nextModel.spinner.tick()
        const stopwatchCmd = nextModel.stopwatch.start()

        // Execute and collect results
        const spinnerResult = spinnerCmd ? await spinnerCmd() : null
        const stopwatchResult = stopwatchCmd ? await stopwatchCmd() : null
        const vhsStartMsg = new StartVhsMsg(first, Date.now())

        // Flatten and return all messages
        const messages: Msg[] = []
        if (spinnerResult) {
          if (Array.isArray(spinnerResult)) {
            messages.push(...spinnerResult)
          } else {
            messages.push(spinnerResult as Msg)
          }
        }
        if (stopwatchResult) {
          if (Array.isArray(stopwatchResult)) {
            messages.push(...stopwatchResult)
          } else {
            messages.push(stopwatchResult as Msg)
          }
        }
        messages.push(vhsStartMsg)

        return messages
      },
    ]
  }

  private updateGenerating(msg: Msg): [AppModel, Cmd<Msg>] {
    // Handle VHS start message
    if (msg instanceof StartVhsMsg) {
      const startTime = msg.startTime
      return [
        this,
        async () => {
          const result = await runVhsAsync(msg.tape.path)
          const duration = Date.now() - startTime
          return new VhsCompleteMsg(
            msg.tape.name,
            result.success,
            duration,
            result.error,
            result.compressedBytes,
          )
        },
      ]
    }

    if (msg instanceof VhsCompleteMsg) {
      const newCompleted: CompletedItem[] = [
        ...this.completed,
        {
          name: msg.name,
          success: msg.success,
          durationMs: msg.durationMs,
          error: msg.error,
          compressedBytes: msg.compressedBytes,
        },
      ]

      const percent = newCompleted.length / this.totalDemos
      const [nextProgress] = this.progress.setPercent(percent)

      // Check if we're done
      if (this.pending.length === 0) {
        return [
          this.copy({
            state: 'done',
            completed: newCompleted,
            progress: nextProgress,
            currentDemo: '',
          }),
          quit(),
        ]
      }

      // Process next
      const next = this.pending[0]
      if (!next) {
        return [this.copy({ state: 'done', completed: newCompleted }), quit()]
      }

      // Reset stopwatch for next item
      const freshStopwatch = StopwatchModel.new({ interval: 10 })

      const nextModel = this.copy({
        currentDemo: next.name,
        completed: newCompleted,
        pending: this.pending.slice(1),
        progress: nextProgress,
        stopwatch: freshStopwatch,
      })

      return [
        nextModel,
        async () => {
          // Restart stopwatch for next item (spinner continues from previous)
          const stopwatchCmd = nextModel.stopwatch.start()
          const stopwatchResult = stopwatchCmd ? await stopwatchCmd() : null
          const vhsStartMsg = new StartVhsMsg(next, Date.now())

          const messages: Msg[] = []
          if (stopwatchResult) {
            if (Array.isArray(stopwatchResult)) {
              messages.push(...stopwatchResult)
            } else {
              messages.push(stopwatchResult as Msg)
            }
          }
          messages.push(vhsStartMsg)

          return messages
        },
      ]
    }

    // Update spinner - keep it animating during generation
    const [nextSpinner, spinnerCmd] = this.spinner.update(msg)
    if (nextSpinner !== this.spinner) {
      return [this.copy({ spinner: nextSpinner }), spinnerCmd]
    }

    // Update stopwatch - keep it ticking
    const [nextStopwatch, stopwatchCmd] = this.stopwatch.update(msg)
    if (nextStopwatch !== this.stopwatch) {
      return [this.copy({ stopwatch: nextStopwatch }), stopwatchCmd]
    }

    // Update progress
    const [nextProgress, progressCmd] = this.progress.update(msg)
    if (nextProgress !== this.progress) {
      return [this.copy({ progress: nextProgress }), progressCmd]
    }

    return [this, null]
  }

  view(): string {
    switch (this.state) {
      case 'select':
        return this.viewSelect()
      case 'generating':
        return this.viewGenerating()
      case 'done':
        return this.viewDone()
    }
  }

  private viewSelect(): string {
    const lines: string[] = []

    lines.push('')
    lines.push(styles.title.render('📼 Boba-CLI Asset Generator'))
    lines.push(styles.muted.render('Generate GIF demos using VHS'))
    lines.push('')
    lines.push(this.list.view())
    lines.push('')

    const selectedCount = this.list.items.filter(
      (i: DemoItem) => i.selected,
    ).length
    const status =
      selectedCount > 0
        ? styles.success.render(`${selectedCount} demo(s) selected`)
        : styles.muted.render('No demos selected')

    lines.push(status)
    lines.push('')

    const help = [
      `${styles.key.render('↑↓')} navigate`,
      `${styles.key.render('space')} toggle`,
      `${styles.key.render('a')} select all`,
      `${styles.key.render('enter')} generate`,
      `${styles.key.render('q')} quit`,
    ].join('  •  ')

    lines.push(styles.muted.render(help))

    return lines.join('\n')
  }

  private viewGenerating(): string {
    const lines: string[] = []

    // Print completed items with timing and compression info
    for (const item of this.completed) {
      const icon = item.success
        ? styles.checkMark.render('✓')
        : styles.crossMark.render('✗')
      const duration = styles.time.render(
        `(${formatDuration(item.durationMs)})`,
      )
      const compression = item.compressedBytes
        ? styles.muted.render(
            ` ${formatCompression(item.compressedBytes.before, item.compressedBytes.after)}`,
          )
        : ''
      lines.push(`${icon} ${item.name}-demo.gif ${duration}${compression}`)
    }

    // Current progress line: spinner + name + elapsed + progress + count
    const n = this.totalDemos
    const w = String(n).length
    const pkgCount = `${String(this.completed.length + 1).padStart(w)}/${n}`

    const spin = this.spinner.view() + ' '
    const prog = this.progress.view()
    const pkgName = styles.currentPkg.render(`${this.currentDemo}-demo`)
    const elapsed = styles.time.render(
      `(${formatDuration(this.stopwatch.elapsed())})`,
    )

    lines.push(`${spin}${pkgName} ${elapsed}  ${prog}  ${pkgCount}`)

    return lines.join('\n')
  }

  private viewDone(): string {
    const lines: string[] = []

    // Print all completed items with timing and compression info
    for (const item of this.completed) {
      const icon = item.success
        ? styles.checkMark.render('✓')
        : styles.crossMark.render('✗')
      const duration = styles.time.render(
        `(${formatDuration(item.durationMs)})`,
      )
      const compression = item.compressedBytes
        ? styles.muted.render(
            ` ${formatCompression(item.compressedBytes.before, item.compressedBytes.after)}`,
          )
        : ''
      lines.push(`${icon} ${item.name}-demo.gif ${duration}${compression}`)
    }

    lines.push('')

    const successCount = this.completed.filter((c) => c.success).length
    const failCount = this.completed.length - successCount
    const totalTime = this.completed.reduce((sum, c) => sum + c.durationMs, 0)

    // Calculate total compression savings
    const totalSaved = this.completed.reduce((sum, c) => {
      if (c.compressedBytes) {
        return sum + (c.compressedBytes.before - c.compressedBytes.after)
      }
      return sum
    }, 0)

    const savedInfo =
      totalSaved > 0 ? ` Saved ${formatBytes(totalSaved)} via compression.` : ''

    if (failCount === 0) {
      lines.push(
        styles.success.render(
          `Done! Generated ${successCount} GIF(s) in ${formatDuration(totalTime)}.${savedInfo}`,
        ),
      )
    } else {
      lines.push(
        styles.warning.render(
          `Done! Generated ${successCount} GIF(s), ${failCount} failed. Total: ${formatDuration(totalTime)}.${savedInfo}`,
        ),
      )
    }

    return lines.join('\n')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Output (for --list)
// ─────────────────────────────────────────────────────────────────────────────

function printStatic(
  message: string,
  color?: 'red' | 'green' | 'yellow' | 'cyan',
): void {
  const colors: Record<string, string> = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
  }
  const reset = '\x1b[0m'

  if (color && colors[color]) {
    console.log(`${colors[color]}${message}${reset}`)
  } else {
    console.log(message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // Handle --list flag
  if (args.includes('--list')) {
    const tapes = discoverTapeFiles()
    printStatic('\n📼 Available demos:\n', 'cyan')
    for (const tape of tapes) {
      const desc = tape.description ? ` - ${tape.description}` : ''
      printStatic(`  • ${tape.name}${desc}`)
    }
    printStatic('')
    return
  }

  // Check for VHS
  if (!commandExists('vhs')) {
    printStatic('\n✗ Error: VHS is not installed or not in PATH\n', 'red')
    printStatic('VHS is required to generate GIF recordings.', 'yellow')
    printStatic('Install VHS using one of the following methods:\n')
    printStatic('  # macOS or Linux (Homebrew)')
    printStatic('  brew install vhs\n')
    printStatic('  # Go install')
    printStatic('  go install github.com/charmbracelet/vhs@latest\n')
    printStatic('  # See: https://github.com/charmbracelet/vhs\n')
    process.exit(1)
  }

  // Check for gifsicle (required for compression)
  if (!commandExists('gifsicle')) {
    printStatic('\n✗ Error: gifsicle is not installed or not in PATH\n', 'red')
    printStatic('gifsicle is required to compress generated GIFs.', 'yellow')
    printStatic('Install gifsicle using one of the following methods:\n')
    printStatic('  # macOS or Linux (Homebrew)')
    printStatic('  brew install gifsicle\n')
    printStatic('  # See: https://github.com/kohler/gifsicle\n')
    process.exit(1)
  }

  const requestedDemos = args.filter((a) => !a.startsWith('--'))
  const runAll = args.includes('--all')

  // Discover all tapes
  const allTapes = discoverTapeFiles()

  // Validate requested demos
  if (requestedDemos.length > 0) {
    const availableNames = allTapes.map((t) => t.name)
    for (const demo of requestedDemos) {
      if (!availableNames.includes(demo)) {
        printStatic(`\n✗ Error: No tape file found for "${demo}"`, 'red')
        printStatic(`  Available: ${availableNames.join(', ')}`, 'yellow')
        process.exit(1)
      }
    }
  }

  // Determine which tapes to use
  let tapes = allTapes
  if (requestedDemos.length > 0) {
    tapes = allTapes.filter((t) => requestedDemos.includes(t.name))
  }

  // Create model
  const model = new AppModel({ tapes })

  // Create program
  const program = new Program(model, { altScreen: false })

  // For non-interactive mode, send StartGeneratingMsg after init
  if (runAll || requestedDemos.length > 0) {
    // Use a small delay to let the program initialize
    setTimeout(() => {
      program.send(new StartGeneratingMsg(tapes))
    }, 10)
  }

  await program.run()
}

main().catch(console.error)

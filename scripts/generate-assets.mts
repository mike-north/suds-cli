#!/usr/bin/env npx tsx
/**
 * Generate GIF assets for Boba-CLI examples using VHS
 *
 * This script discovers `.tape` files in the examples directory and runs VHS
 * on them to produce GIFs. The tape files are the source of truth.
 *
 * Requirements:
 *   - VHS: https://github.com/charmbracelet/vhs
 *   - ffmpeg: https://ffmpeg.org (required by VHS)
 *   - gifsicle: https://github.com/kohler/gifsicle
 *
 * Usage:
 *   npx tsx scripts/generate-assets.mts              # Interactive selection
 *   npx tsx scripts/generate-assets.mts --all        # Generate all demos
 *   npx tsx scripts/generate-assets.mts -e spinner   # Generate specific demo
 *   npx tsx scripts/generate-assets.mts --list       # List available demos
 */

import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Command } from 'commander'

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
import { createNodePlatform } from '@boba-cli/machine/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const EXAMPLES_DIR = resolve(__dirname, '../examples')
const SRC_DIR = resolve(EXAMPLES_DIR, 'src')

// Track whether any generation failed (for exit code)
let hasFailure = false

// Track current VHS process for cleanup on quit
let currentVhsProcess: ReturnType<typeof spawn> | null = null

function killCurrentVhsProcess(): void {
  if (currentVhsProcess && currentVhsProcess.pid) {
    try {
      // Kill the entire process group (VHS + ttyd + ffmpeg)
      process.kill(-currentVhsProcess.pid, 'SIGKILL')
    } catch {
      // Fallback to killing just the process
      currentVhsProcess.kill('SIGKILL')
    }
    currentVhsProcess = null
  }
}

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
  // Extract name from parent directory, e.g., /examples/src/spinner/example.tape -> "spinner"
  const dir = dirname(tapePath)
  const name = basename(dir)

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
  const entries = readdirSync(SRC_DIR, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(SRC_DIR, entry.name, 'example.tape'))
    .filter((tapePath) => {
      try {
        statSync(tapePath)
        return true
      } catch {
        return false
      }
    })
    .map((tapePath) => parseTapeFile(tapePath))
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
  return new Promise((resolvePromise) => {
    // Run VHS from the tape file's directory
    const tapeDir = dirname(tapePath)

    const proc = spawn('vhs', [basename(tapePath)], {
      cwd: tapeDir,
      stdio: 'pipe',
      detached: true, // Create process group for clean killing
    })

    // Track for cleanup on quit
    currentVhsProcess = proc

    let stderr = ''
    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      // Clear the tracked process
      if (currentVhsProcess === proc) {
        currentVhsProcess = null
      }

      if (code === 0) {
        // Parse output path from tape file
        const tapeContent = readFileSync(tapePath, 'utf-8')
        const outputMatch = tapeContent.match(/Output\s+"([^"]+)"/)

        let gifPath: string
        if (outputMatch?.[1]) {
          // Resolve relative path from tape directory
          gifPath = resolve(tapeDir, outputMatch[1])
        } else {
          // Fallback: use example name
          const name = basename(tapeDir)
          gifPath = join(EXAMPLES_DIR, 'animations', `${name}.gif`)
        }

        void compressGifAsync(gifPath).then((compressedBytes) => {
          resolvePromise({
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
        resolvePromise({ success: false, error })
      }
    })

    proc.on('error', (err) => {
      resolvePromise({ success: false, error: err.message })
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

class VhsPendingMsg {
  readonly _tag = 'VhsPendingMsg' as const
  constructor(
    readonly tape: TapeInfo,
    readonly startTime: number,
    readonly promise: Promise<VhsResult>,
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
  readonly currentItemStartTime: number
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
    currentItemStartTime?: number
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
    this.currentItemStartTime = opts.currentItemStartTime ?? 0
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
      currentItemStartTime: opts.currentItemStartTime ?? this.currentItemStartTime,
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
      // Kill any running VHS process immediately
      killCurrentVhsProcess()
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
    const startTime = Date.now()

    const nextModel = this.copy({
      state: 'generating',
      totalDemos: tapes.length,
      pending: tapes.slice(1),
      currentDemo: first.name,
      currentItemStartTime: startTime,
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
        const vhsStartMsg = new StartVhsMsg(first, startTime)

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
    // Handle VHS start message - start VHS but don't block
    if (msg instanceof StartVhsMsg) {
      const vhsPromise = runVhsAsync(msg.tape.path)
      return [
        this,
        () => new VhsPendingMsg(msg.tape, msg.startTime, vhsPromise),
      ]
    }

    // Handle VHS pending - poll for completion while allowing ticks to continue
    if (msg instanceof VhsPendingMsg) {
      const POLL_INTERVAL = 50 // 50ms between polls

      // Update progress based on elapsed time
      const elapsedMs = Date.now() - msg.startTime
      const estimatedProgress = this.calculateEstimatedProgress(elapsedMs)
      const [nextProgress] = this.progress.setPercent(estimatedProgress)

      const nextModel = this.copy({
        progress: nextProgress,
        currentItemStartTime: msg.startTime,
      })

      return [
        nextModel,
        async () => {
          const timeout = new Promise<'timeout'>((resolve) =>
            setTimeout(() => resolve('timeout'), POLL_INTERVAL),
          )

          const result = await Promise.race([
            msg.promise.then((r) => ({ type: 'complete' as const, result: r })),
            timeout,
          ])

          if (result === 'timeout') {
            // VHS still running - return pending message to poll again
            return new VhsPendingMsg(msg.tape, msg.startTime, msg.promise)
          } else {
            // VHS completed
            const duration = Date.now() - msg.startTime
            return new VhsCompleteMsg(
              msg.tape.name,
              result.result.success,
              duration,
              result.result.error,
              result.result.compressedBytes,
            )
          }
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

      // Fail fast: if VHS failed, stop immediately
      if (!msg.success) {
        hasFailure = true
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
      const nextStartTime = Date.now()

      const nextModel = this.copy({
        currentDemo: next.name,
        currentItemStartTime: nextStartTime,
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
          const vhsStartMsg = new StartVhsMsg(next, nextStartTime)

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

    // Update stopwatch - keep it ticking and update progress based on elapsed time
    const [nextStopwatch, stopwatchCmd] = this.stopwatch.update(msg)
    if (nextStopwatch !== this.stopwatch) {
      // Calculate time-based progress estimate
      const estimatedProgress = this.calculateEstimatedProgress(
        nextStopwatch.elapsed(),
      )
      const [nextProgress] = this.progress.setPercent(estimatedProgress)

      return [
        this.copy({ stopwatch: nextStopwatch, progress: nextProgress }),
        stopwatchCmd,
      ]
    }

    // Update progress (for animation frames)
    const [nextProgress, progressCmd] = this.progress.update(msg)
    if (nextProgress !== this.progress) {
      return [this.copy({ progress: nextProgress }), progressCmd]
    }

    return [this, null]
  }

  /**
   * Calculate estimated progress based on elapsed time.
   *
   * Progress rates:
   * - 0-90%: ~15 seconds per image (fast phase)
   * - 90-99%: ~60 seconds per image (slow phase)
   * - 99%+: hold until actual completion
   */
  private calculateEstimatedProgress(elapsedMs: number): number {
    const completedCount = this.completed.length
    const totalCount = this.totalDemos

    // Base progress from completed items
    const baseProgress = completedCount / totalCount

    // Calculate how much progress this current item represents
    const progressPerItem = 1 / totalCount

    // Calculate progress within current item's slice
    // We need to handle the case where this item crosses phase boundaries
    const itemStartProgress = baseProgress
    const itemEndProgress = baseProgress + progressPerItem

    // Calculate how much of this item's slice we've filled based on elapsed time
    // Use fast rate (15s) for the portion under 90%, slow rate (60s) for 90-99%
    const FAST_RATE_MS = 15000 // 15 seconds per image in fast phase
    const SLOW_RATE_MS = 60000 // 60 seconds per image in slow phase

    let estimatedProgress: number

    if (itemEndProgress <= 0.9) {
      // Entire item is in fast phase
      const itemProgress = Math.min(elapsedMs / FAST_RATE_MS, 0.99)
      estimatedProgress = itemStartProgress + progressPerItem * itemProgress
    } else if (itemStartProgress >= 0.9) {
      // Entire item is in slow phase
      const itemProgress = Math.min(elapsedMs / SLOW_RATE_MS, 0.99)
      estimatedProgress = itemStartProgress + progressPerItem * itemProgress
    } else {
      // Item crosses the 90% boundary - split into fast and slow portions
      const fastPortion = (0.9 - itemStartProgress) / progressPerItem // 0 to 1
      const slowPortion = 1 - fastPortion

      const fastTimeMs = fastPortion * FAST_RATE_MS
      const slowTimeMs = slowPortion * SLOW_RATE_MS

      if (elapsedMs <= fastTimeMs) {
        // Still in fast portion
        const fastProgress = elapsedMs / FAST_RATE_MS
        estimatedProgress = itemStartProgress + progressPerItem * fastProgress
      } else {
        // In slow portion
        const slowElapsed = elapsedMs - fastTimeMs
        const slowProgress = Math.min(slowElapsed / SLOW_RATE_MS, slowPortion * 0.99)
        estimatedProgress = 0.9 + progressPerItem * slowProgress
      }
    }

    // Hard cap at 99% - never show 100% until actually complete
    return Math.min(estimatedProgress, 0.99)
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
      lines.push(`${icon} ${item.name}.gif ${duration}${compression}`)
    }

    // Current progress line: spinner + name + elapsed + progress + count
    const n = this.totalDemos
    const w = String(n).length
    const pkgCount = `${String(this.completed.length + 1).padStart(w)}/${n}`

    const spin = this.spinner.view() + ' '
    const pkgName = styles.currentPkg.render(this.currentDemo)
    // Calculate elapsed time from currentItemStartTime for smooth updates
    const elapsedMs =
      this.currentItemStartTime > 0
        ? Date.now() - this.currentItemStartTime
        : 0
    const elapsed = styles.time.render(`(${formatDuration(elapsedMs)})`)
    // Calculate and render progress directly (bypass animation since we poll frequently)
    const currentProgress = this.calculateEstimatedProgress(elapsedMs)
    const prog = this.progress.viewAs(currentProgress)

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
      lines.push(`${icon} ${item.name}.gif ${duration}${compression}`)
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
// CLI Setup
// ─────────────────────────────────────────────────────────────────────────────

interface CliOptions {
  list: boolean
  all: boolean
  example: string[]
}

function createCli(): Command {
  const program = new Command()

  program
    .name('generate-assets')
    .description('Generate GIF assets for Boba-CLI examples using VHS')
    .option('-l, --list', 'list available demos', false)
    .option('-a, --all', 'generate all demos', false)
    .option(
      '-e, --example <name>',
      'generate a specific example (can be used multiple times)',
      (value: string, previous: string[]) => [...previous, value],
      [] as string[],
    )

  return program
}

function listDemos(): void {
  const tapes = discoverTapeFiles()
  printStatic('\n📼 Available demos:\n', 'cyan')
  for (const tape of tapes) {
    const desc = tape.description ? ` - ${tape.description}` : ''
    printStatic(`  • ${tape.name}${desc}`)
  }
  printStatic('')
}

function checkDependencies(): boolean {
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
    return false
  }

  // Check for ttyd (required by VHS for terminal emulation)
  if (!commandExists('ttyd')) {
    printStatic('\n✗ Error: ttyd is not installed or not in PATH\n', 'red')
    printStatic('ttyd is required by VHS for terminal emulation.', 'yellow')
    printStatic('Install ttyd using one of the following methods:\n')
    printStatic('  # macOS (Homebrew)')
    printStatic('  brew install ttyd\n')
    printStatic('  # See: https://github.com/tsl0922/ttyd\n')
    return false
  }

  // Check for ffmpeg (required by VHS for recording)
  if (!commandExists('ffmpeg')) {
    printStatic('\n✗ Error: ffmpeg is not installed or not in PATH\n', 'red')
    printStatic('ffmpeg is required by VHS to generate recordings.', 'yellow')
    printStatic('Install ffmpeg using one of the following methods:\n')
    printStatic('  # macOS (Homebrew)')
    printStatic('  brew install ffmpeg\n')
    printStatic('  # Linux (apt)')
    printStatic('  sudo apt install ffmpeg\n')
    printStatic('  # See: https://ffmpeg.org/download.html\n')
    return false
  }

  // Check for gifsicle (required for compression)
  if (!commandExists('gifsicle')) {
    printStatic('\n✗ Error: gifsicle is not installed or not in PATH\n', 'red')
    printStatic('gifsicle is required to compress generated GIFs.', 'yellow')
    printStatic('Install gifsicle using one of the following methods:\n')
    printStatic('  # macOS or Linux (Homebrew)')
    printStatic('  brew install gifsicle\n')
    printStatic('  # See: https://github.com/kohler/gifsicle\n')
    return false
  }

  return true
}

function validateExamples(
  requestedDemos: string[],
  allTapes: TapeInfo[],
): boolean {
  const availableNames = allTapes.map((t) => t.name)
  for (const demo of requestedDemos) {
    if (!availableNames.includes(demo)) {
      printStatic(`\n✗ Error: No tape file found for "${demo}"`, 'red')
      printStatic(`  Available: ${availableNames.join(', ')}`, 'yellow')
      return false
    }
  }
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const cli = createCli()
  cli.parse()
  const opts = cli.opts<CliOptions>()

  // Handle --list flag
  if (opts.list) {
    listDemos()
    return
  }

  // Check dependencies
  if (!checkDependencies()) {
    process.exit(1)
  }

  // Discover all tapes
  const allTapes = discoverTapeFiles()

  // Validate requested demos
  if (opts.example.length > 0) {
    if (!validateExamples(opts.example, allTapes)) {
      process.exit(1)
    }
  }

  // Determine which tapes to use
  let tapes = allTapes
  if (opts.example.length > 0) {
    tapes = allTapes.filter((t) => opts.example.includes(t.name))
  }

  // Create model
  const model = new AppModel({ tapes })

  // Create program with explicit Node.js platform
  const program = new Program(model, {
    altScreen: false,
    platform: createNodePlatform(),
  })

  // For non-interactive mode, send StartGeneratingMsg after init
  if (opts.all || opts.example.length > 0) {
    // Use a small delay to let the program initialize
    setTimeout(() => {
      program.send(new StartGeneratingMsg(tapes))
    }, 10)
  }

  await program.run()

  // Exit with error code if any generation failed
  if (hasFailure) {
    process.exit(1)
  }
}

main().catch(console.error)

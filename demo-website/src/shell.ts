/**
 * Interactive shell for running boba-cli demos.
 *
 * Provides a terminal-like experience where users can type commands
 * to run different demos.
 */

import type { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@boba-cli/machine/browser'
import { Program, KeyMsg, KeyType, quit, type Cmd, type Model, type Msg } from '@boba-cli/tea'
import { createStyle } from './browser-style'
import { demos, findDemo, parseCommand, type DemoInfo } from './shared/registry'
import { SimpleFSAdapter } from './simple-fs-adapter'

// Shell styles
const promptStyle = createStyle().foreground('#50fa7b').bold(true)
const commandStyle = createStyle().foreground('#f8f8f2')
const errorStyle = createStyle().foreground('#ff5555')
const successStyle = createStyle().foreground('#50fa7b')
const headerStyle = createStyle().foreground('#bd93f9').bold(true)
const dimStyle = createStyle().foreground('#6272a4')
const accentStyle = createStyle().foreground('#8be9fd')
const filenameStyle = createStyle().foreground('#f1fa8c')

const BANNER = `
${headerStyle.render('╔═══════════════════════════════════════════════════╗')}
${headerStyle.render('║')}  ${accentStyle.render('Boba CLI')} - Terminal UIs in TypeScript            ${headerStyle.render('║')}
${headerStyle.render('║')}  ${dimStyle.render('A port of Bubble Tea')}              ${headerStyle.render('║')}
${headerStyle.render('╚═══════════════════════════════════════════════════╝')}
`

const HELP_TEXT = `
${dimStyle.render('Available commands:')}

  ${accentStyle.render('tsx <demo>.ts')}    Run a demo (e.g., ${filenameStyle.render('tsx spinner-demo.ts')})
  ${accentStyle.render('help')}             Show this help message
  ${accentStyle.render('ls')}               List available demos
  ${accentStyle.render('clear')}            Clear the screen

${dimStyle.render('Available demos:')}
${demos.map(d => `  ${filenameStyle.render(d.filename.padEnd(20))} ${dimStyle.render(d.description)}`).join('\n')}

${dimStyle.render('Press')} ${accentStyle.render('[q]')} ${dimStyle.render('in any demo to return to this shell.')}
`

/**
 * History entry for the shell.
 */
interface HistoryEntry {
  command: string
  output: string
}

/**
 * Shell model - the main interface for running demos.
 */
class ShellModel implements Model<Msg, ShellModel> {
  readonly input: string
  readonly cursorPos: number
  readonly history: HistoryEntry[]
  readonly showBanner: boolean
  private readonly runner: ShellRunner | null
  // Tab completion state
  private readonly tabCompletions: string[]
  private readonly tabIndex: number
  private readonly tabOriginalInput: string

  constructor(
    runner: ShellRunner | null,
    input = '',
    cursorPos = 0,
    history: HistoryEntry[] = [],
    showBanner = true,
    tabCompletions: string[] = [],
    tabIndex = 0,
    tabOriginalInput = '',
  ) {
    this.runner = runner
    this.input = input
    this.cursorPos = cursorPos
    this.history = history
    this.showBanner = showBanner
    this.tabCompletions = tabCompletions
    this.tabIndex = tabIndex
    this.tabOriginalInput = tabOriginalInput
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [ShellModel, Cmd<Msg>] {
    if (!(msg instanceof KeyMsg)) {
      return [this, null]
    }

    const key = msg.key

    // Handle special keys
    if (key.type === KeyType.Enter) {
      return this.executeCommand()
    }

    if (key.type === KeyType.Backspace) {
      if (this.cursorPos > 0) {
        const newInput =
          this.input.slice(0, this.cursorPos - 1) +
          this.input.slice(this.cursorPos)
        return [
          new ShellModel(this.runner, newInput, this.cursorPos - 1, this.history, false),
          null,
        ]
      }
      return [this, null]
    }

    if (key.type === KeyType.Delete) {
      if (this.cursorPos < this.input.length) {
        const newInput =
          this.input.slice(0, this.cursorPos) +
          this.input.slice(this.cursorPos + 1)
        return [
          new ShellModel(this.runner, newInput, this.cursorPos, this.history, false),
          null,
        ]
      }
      return [this, null]
    }

    if (key.type === KeyType.Left) {
      return [
        new ShellModel(
          this.runner,
          this.input,
          Math.max(0, this.cursorPos - 1),
          this.history,
          false,
        ),
        null,
      ]
    }

    if (key.type === KeyType.Right) {
      return [
        new ShellModel(
          this.runner,
          this.input,
          Math.min(this.input.length, this.cursorPos + 1),
          this.history,
          false,
        ),
        null,
      ]
    }

    if (key.type === KeyType.Home) {
      return [new ShellModel(this.runner, this.input, 0, this.history, false), null]
    }

    if (key.type === KeyType.End) {
      return [
        new ShellModel(this.runner, this.input, this.input.length, this.history, false),
        null,
      ]
    }

    // Handle Tab - autocomplete
    if (key.type === KeyType.Tab) {
      return this.handleTabCompletion()
    }

    // Handle Ctrl+C - clear input (Break key)
    if (key.type === KeyType.Break) {
      return [new ShellModel(this.runner, '', 0, this.history, false), null]
    }

    // Handle printable characters (Runes) and Space
    // Any other input resets tab completion
    if (key.type === KeyType.Runes && !key.alt) {
      const newInput =
        this.input.slice(0, this.cursorPos) +
        key.runes +
        this.input.slice(this.cursorPos)
      return [
        new ShellModel(this.runner, newInput, this.cursorPos + key.runes.length, this.history, false),
        null,
      ]
    }

    if (key.type === KeyType.Space) {
      const newInput =
        this.input.slice(0, this.cursorPos) +
        ' ' +
        this.input.slice(this.cursorPos)
      return [
        new ShellModel(this.runner, newInput, this.cursorPos + 1, this.history, false),
        null,
      ]
    }

    return [this, null]
  }

  private handleTabCompletion(): [ShellModel, Cmd<Msg>] {
    // Only complete at the end of the input
    if (this.cursorPos !== this.input.length) {
      return [this, null]
    }

    const input = this.input.trim()

    // If we're already in tab completion, cycle to next match
    if (this.tabCompletions.length > 0) {
      const nextIndex = (this.tabIndex + 1) % this.tabCompletions.length
      const completion = this.tabCompletions[nextIndex]

      return [
        new ShellModel(
          this.runner,
          completion ?? '',
          completion?.length ?? 0,
          this.history,
          false,
          this.tabCompletions,
          nextIndex,
          this.tabOriginalInput,
        ),
        null,
      ]
    }

    // Start new tab completion
    const completions = this.getCompletions(input)

    if (completions.length === 0) {
      return [this, null]
    }

    // If only one match, complete it directly
    if (completions.length === 1) {
      const completion = completions[0]
      return [
        new ShellModel(
          this.runner,
          completion ?? '',
          completion?.length ?? 0,
          this.history,
          false,
        ),
        null,
      ]
    }

    // Multiple matches - start cycling
    const firstCompletion = completions[0]
    return [
      new ShellModel(
        this.runner,
        firstCompletion ?? '',
        firstCompletion?.length ?? 0,
        this.history,
        false,
        completions,
        0,
        input,
      ),
      null,
    ]
  }

  private getCompletions(input: string): string[] {
    if (!input) {
      return []
    }

    const parts = input.split(/\s+/)
    const firstWord = parts[0]

    // If we're completing the first word (command)
    if (parts.length === 1) {
      const commands = ['help', 'ls', 'clear', 'tsx']
      const matches = commands.filter(cmd => cmd.startsWith(firstWord ?? ''))
      return matches
    }

    // If we're completing after "tsx "
    if (firstWord === 'tsx' && parts.length === 2) {
      const prefix = parts[1]?.toLowerCase() ?? ''
      const matches = demos
        .filter(demo => {
          const filename = demo.filename.toLowerCase()
          const name = demo.name.toLowerCase()
          return filename.startsWith(prefix) || name.startsWith(prefix)
        })
        .map(demo => `tsx ${demo.filename}`)

      return matches
    }

    return []
  }

  /**
   * Get the completion preview (the dim text that shows what would be completed).
   * Only shows when cursor is at the end of input and there's a single unambiguous match.
   */
  private getCompletionPreview(): string {
    // Only show preview when cursor is at the end
    if (this.cursorPos !== this.input.length) {
      return ''
    }

    const input = this.input.trim()
    if (!input) {
      return ''
    }

    const completions = this.getCompletions(input)

    // Only show preview if there's exactly one match
    if (completions.length === 1) {
      const completion = completions[0]
      if (completion && completion.startsWith(input)) {
        return completion.slice(input.length)
      }
    }

    return ''
  }

  private executeCommand(): [ShellModel, Cmd<Msg>] {
    const command = this.input.trim()

    if (!command) {
      return [new ShellModel(this.runner, '', 0, this.history, false), null]
    }

    let output = ''

    // Built-in commands
    if (command === 'help' || command === '?') {
      output = HELP_TEXT
    } else if (command === 'ls' || command === 'dir') {
      output = '\n' + demos
        .map(d => `  ${filenameStyle.render(d.filename.padEnd(20))} ${dimStyle.render(d.description)}`)
        .join('\n') + '\n'
    } else if (command === 'clear' || command === 'cls') {
      return [new ShellModel(this.runner, '', 0, [], false), null]
    } else {
      // Try to run a demo
      const demoName = parseCommand(command)
      if (demoName) {
        const demo = findDemo(demoName)
        if (demo) {
          // Store the demo name in the runner for later execution
          if (this.runner) {
            this.runner.setPendingDemo(demo.name)
          }
          // Exit the shell so the demo can run
          return [this, quit()]
        } else {
          output = errorStyle.render(`\nDemo not found: ${demoName}\n`) +
            dimStyle.render(`Type ${accentStyle.render('ls')} to see available demos.\n`)
        }
      } else {
        output = errorStyle.render(`\nUnknown command: ${command}\n`) +
          dimStyle.render(`Type ${accentStyle.render('help')} for available commands.\n`)
      }
    }

    const entry: HistoryEntry = { command, output }
    return [
      new ShellModel(this.runner, '', 0, [...this.history, entry], false),
      null,
    ]
  }

  view(): string {
    const lines: string[] = []

    // Show banner on first render
    if (this.showBanner) {
      lines.push(BANNER)
      lines.push(dimStyle.render(`Type ${accentStyle.render('help')} for commands, or ${accentStyle.render('tsx spinner-demo.ts')} to start.`))
      lines.push('')
    }

    // Show history
    for (const entry of this.history) {
      if (!entry.output.startsWith('__RUN_DEMO__:')) {
        lines.push(`${promptStyle.render('$ ')}${commandStyle.render(entry.command)}`)
        if (entry.output) {
          lines.push(entry.output)
        }
      }
    }

    // Show current prompt with cursor
    const beforeCursor = this.input.slice(0, this.cursorPos)
    const cursorChar = this.input[this.cursorPos] ?? ' '
    const afterCursor = this.input.slice(this.cursorPos + 1)

    const cursorStyle = createStyle().background('#f8f8f2').foreground('#0d1117')

    // Get completion preview and show it in dim style
    const preview = this.getCompletionPreview()
    const previewStyle = createStyle().foreground('#6272a4') // dim gray

    let inputLine = `${promptStyle.render('$ ')}${commandStyle.render(beforeCursor)}${cursorStyle.render(cursorChar)}${commandStyle.render(afterCursor)}`

    // Add preview if available (only when cursor is at end)
    if (preview && this.cursorPos === this.input.length) {
      inputLine += previewStyle.render(preview)
    }

    lines.push(inputLine)

    return lines.join('\n')
  }

  /**
   * Check if the last command requested running a demo.
   */
  getPendingDemo(): DemoInfo | null {
    const lastEntry = this.history[this.history.length - 1]
    if (lastEntry?.output.startsWith('__RUN_DEMO__:')) {
      const demoName = lastEntry.output.replace('__RUN_DEMO__:', '')
      return findDemo(demoName) ?? null
    }
    return null
  }
}

/**
 * Shell runner - manages the shell and demo lifecycle.
 */
class ShellRunner {
  private terminal: Terminal
  private platform: ReturnType<typeof createBrowserPlatform>
  private shellProgram: Program<ShellModel> | null = null
  private shellModel: ShellModel
  private isRunningDemo = false
  private pendingDemoName: string | null = null

  constructor(terminal: Terminal) {
    this.terminal = terminal
    this.platform = createBrowserPlatform({ terminal })
    this.shellModel = new ShellModel(this)
  }

  setPendingDemo(demoName: string): void {
    this.pendingDemoName = demoName
  }

  async start(): Promise<void> {
    await this.runShell()
  }

  stop(): void {
    if (this.shellProgram) {
      this.shellProgram.kill()
      this.shellProgram = null
    }
  }

  private async runShell(): Promise<void> {
    this.isRunningDemo = false
    // Reset pending demo to prevent re-running the same demo when shell restarts
    // after a demo completes (e.g., line 517)
    this.pendingDemoName = null

    // Create a new platform for each shell session to reset state
    const filesystem = new SimpleFSAdapter()
    this.platform = createBrowserPlatform({
      terminal: this.terminal,
      filesystem,
    })

    this.shellProgram = new Program(this.shellModel, {
      platform: this.platform,
    })

    // Run shell and check for demo requests
    await this.shellProgram.run()

    // After shell exits, check if we need to run a demo
    if (this.pendingDemoName && !this.isRunningDemo) {
      const demo = findDemo(this.pendingDemoName)
      if (demo) {
        this.isRunningDemo = true
        await this.runDemo(demo)
      }
    }
  }

  private async runDemo(demo: DemoInfo): Promise<void> {
    // Create a fresh platform for the demo
    const filesystem = new SimpleFSAdapter()
    this.platform = createBrowserPlatform({
      terminal: this.terminal,
      filesystem,
    })

    // Run the demo
    // Demos from @boba-cli/examples export async functions that take a platform
    await demo.create(this.platform)

    // Demo finished, return to shell
    const newHistory = this.shellModel.history.slice()
    newHistory.push({
      command: `tsx ${demo.filename}`,
      output: successStyle.render(`\n✓ Demo '${demo.name}' completed.\n`),
    })

    this.shellModel = new ShellModel(this, '', 0, newHistory, false)
    this.isRunningDemo = false

    // Restart shell
    await this.runShell()
  }
}

/**
 * Create and start a shell instance.
 */
export function createShell(terminal: Terminal): { stop: () => void } {
  const runner = new ShellRunner(terminal)
  runner.start().catch(console.error)

  return {
    stop: () => runner.stop(),
  }
}

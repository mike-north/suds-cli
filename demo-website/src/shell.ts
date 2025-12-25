/**
 * Interactive shell for running suds-cli demos.
 *
 * Provides a terminal-like experience where users can type commands
 * to run different demos.
 */

import type { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@suds-cli/machine/browser'
import { Program, KeyMsg, KeyType, type Cmd, type Model, type Msg } from '@suds-cli/tea'
import { createStyle } from './browser-style'
import { demos, findDemo, parseCommand, type DemoInfo } from './shared/registry'

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
${headerStyle.render('║')}  ${accentStyle.render('Suds CLI')} - Terminal UIs in TypeScript           ${headerStyle.render('║')}
${headerStyle.render('║')}  ${dimStyle.render('A port of Bubble Tea for the browser')}              ${headerStyle.render('║')}
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

  constructor(
    input = '',
    cursorPos = 0,
    history: HistoryEntry[] = [],
    showBanner = true,
  ) {
    this.input = input
    this.cursorPos = cursorPos
    this.history = history
    this.showBanner = showBanner
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
          new ShellModel(newInput, this.cursorPos - 1, this.history, false),
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
          new ShellModel(newInput, this.cursorPos, this.history, false),
          null,
        ]
      }
      return [this, null]
    }

    if (key.type === KeyType.Left) {
      return [
        new ShellModel(
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
          this.input,
          Math.min(this.input.length, this.cursorPos + 1),
          this.history,
          false,
        ),
        null,
      ]
    }

    if (key.type === KeyType.Home) {
      return [new ShellModel(this.input, 0, this.history, false), null]
    }

    if (key.type === KeyType.End) {
      return [
        new ShellModel(this.input, this.input.length, this.history, false),
        null,
      ]
    }

    // Handle Ctrl+C - clear input (Break key)
    if (key.type === KeyType.Break) {
      return [new ShellModel('', 0, this.history, false), null]
    }

    // Handle printable characters (Runes) and Space
    if (key.type === KeyType.Runes && !key.alt) {
      const newInput =
        this.input.slice(0, this.cursorPos) +
        key.runes +
        this.input.slice(this.cursorPos)
      return [
        new ShellModel(newInput, this.cursorPos + key.runes.length, this.history, false),
        null,
      ]
    }

    if (key.type === KeyType.Space) {
      const newInput =
        this.input.slice(0, this.cursorPos) +
        ' ' +
        this.input.slice(this.cursorPos)
      return [
        new ShellModel(newInput, this.cursorPos + 1, this.history, false),
        null,
      ]
    }

    return [this, null]
  }

  private executeCommand(): [ShellModel, Cmd<Msg>] {
    const command = this.input.trim()

    if (!command) {
      return [new ShellModel('', 0, this.history, false), null]
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
      return [new ShellModel('', 0, [], false), null]
    } else {
      // Try to run a demo
      const demoName = parseCommand(command)
      if (demoName) {
        const demo = findDemo(demoName)
        if (demo) {
          // Signal to run this demo (handled by shell runner)
          output = `__RUN_DEMO__:${demo.name}`
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
      new ShellModel('', 0, [...this.history, entry], false),
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
    const inputLine = `${promptStyle.render('$ ')}${commandStyle.render(beforeCursor)}${cursorStyle.render(cursorChar)}${commandStyle.render(afterCursor)}`
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private demoProgram: Program<any> | null = null
  private shellModel: ShellModel
  private isRunningDemo = false

  constructor(terminal: Terminal) {
    this.terminal = terminal
    this.platform = createBrowserPlatform({ terminal })
    this.shellModel = new ShellModel()
  }

  async start(): Promise<void> {
    await this.runShell()
  }

  stop(): void {
    if (this.shellProgram) {
      this.shellProgram.kill()
      this.shellProgram = null
    }
    if (this.demoProgram) {
      this.demoProgram.kill()
      this.demoProgram = null
    }
  }

  private async runShell(): Promise<void> {
    this.isRunningDemo = false

    // Create a new platform for each shell session to reset state
    this.platform = createBrowserPlatform({ terminal: this.terminal })

    this.shellProgram = new Program(this.shellModel, {
      platform: this.platform,
    })

    // Run shell and check for demo requests
    await this.shellProgram.run()

    // After shell exits, check if we need to run a demo
    // Get the final model state
    const finalModel = this.shellModel
    const pendingDemo = finalModel.getPendingDemo()

    if (pendingDemo && !this.isRunningDemo) {
      this.isRunningDemo = true
      await this.runDemo(pendingDemo)
    }
  }

  private async runDemo(demo: DemoInfo): Promise<void> {
    // Create a fresh platform for the demo
    this.platform = createBrowserPlatform({ terminal: this.terminal })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const model = demo.create()
    this.demoProgram = new Program(model, {
      platform: this.platform,
    })

    let demoSucceeded = true
    try {
      await this.demoProgram.run()
    } catch (err: unknown) {
      demoSucceeded = false
      console.error(err)
      const message = err instanceof Error ? err.message : String(err)
      this.terminal.write(`\r\n\x1b[31mDemo error: ${message}\x1b[0m\r\n`)
    }

    // Demo finished, return to shell
    // Clear the pending demo from history
    const newHistory = this.shellModel.history.filter(
      h => !h.output.startsWith('__RUN_DEMO__:')
    )
    newHistory.push({
      command: `tsx ${demo.filename}`,
      output: demoSucceeded
        ? successStyle.render(`\n✓ Demo '${demo.name}' completed.\n`)
        : errorStyle.render(`\n✗ Demo '${demo.name}' failed.\n`),
    })

    this.shellModel = new ShellModel('', 0, newHistory, false)
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
  runner.start().catch((err: unknown) => {
    // Log for developers
    console.error(err)
    // Display user-facing error in terminal
    const message = err instanceof Error ? err.message : String(err)
    terminal.write(`\r\n\x1b[31mError: ${message}\x1b[0m\r\n`)
  })

  return {
    stop: () => runner.stop(),
  }
}

/**
 * Boba Demo: Filepicker
 *
 * Demonstrates \@boba-cli/filepicker for browsing the filesystem.
 *
 * Controls (built into the filepicker keymap):
 *   j / k / arrows  - move selection
 *   enter / →       - open directory or select file
 *   backspace / ←   - go up a directory
 *   .               - toggle hidden files
 *   g / G           - go to top / bottom
 *   q               - quit
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Style } from '@boba-cli/chapstick'
import { newBinding, matches } from '@boba-cli/key'
import { NodeFileSystemAdapter, NodePathAdapter, createNodePlatform } from '@boba-cli/machine/node'
import {
  KeyMsg,
  Program,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import { FileSelectedMsg, FilepickerModel } from '@boba-cli/filepicker'

const filesystem = new NodeFileSystemAdapter()
const pathAdapter = new NodePathAdapter()

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp(
  'q',
  'quit',
)

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)
const statusStyle = new Style().foreground('#50fa7b')

/**
 * Create a demo directory with sample files
 */
function createDemoDirectory(): string {
  const demoDir = mkdtempSync(join(tmpdir(), 'boba-demo-'))

  // Create a subdirectory
  const docsDir = join(demoDir, 'documents')
  mkdirSync(docsDir)

  // Create 5 regular text files
  writeFileSync(
    join(demoDir, 'readme.txt'),
    'Welcome to the Boba filepicker demo!\n',
  )
  writeFileSync(join(demoDir, 'notes.txt'), 'These are some sample notes.\n')
  writeFileSync(
    join(demoDir, 'todo.txt'),
    '- Learn Boba\n- Build a TUI\n- Ship it!\n',
  )
  writeFileSync(
    join(docsDir, 'report.txt'),
    'Q4 Report: Everything is awesome.\n',
  )
  writeFileSync(join(docsDir, 'ideas.txt'), 'Ideas for new features...\n')

  // Create 3 hidden text files
  writeFileSync(join(demoDir, '.config'), 'theme=dark\n')
  writeFileSync(join(demoDir, '.secrets'), 'shhh... this is hidden\n')
  writeFileSync(join(demoDir, '.env'), 'DEBUG=true\n')

  return demoDir
}

class DemoModel implements Model<Msg, DemoModel> {
  readonly picker: FilepickerModel
  readonly status: string
  readonly demoDir: string

  constructor(
    demoDir: string,
    picker?: FilepickerModel,
    status = 'Select a file or folder',
  ) {
    this.demoDir = demoDir
    this.picker =
      picker ??
      FilepickerModel.new({
        filesystem,
        path: pathAdapter,
        showHidden: false,
        currentDir: demoDir,
      })[0]
    this.status = status
  }

  init(): Cmd<Msg> {
    return this.picker.init()
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    const [nextPicker, cmd] = this.picker.update(msg)

    if (msg instanceof FileSelectedMsg) {
      const nextStatus = msg.file.path
      if (nextStatus !== this.status) {
        return [new DemoModel(this.demoDir, nextPicker, nextStatus), cmd]
      }
    }

    // When selection happens, FileSelectedMsg is emitted via command; we also reflect current picker state
    const nextStatus = nextPicker.selectedFile?.path ?? this.status

    if (nextPicker !== this.picker || nextStatus !== this.status) {
      return [new DemoModel(this.demoDir, nextPicker, nextStatus), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Boba Demo — Filepicker')
    const help = helpStyle.render(
      "Use arrows/enter/backspace. '.' toggles hidden. q to quit.",
    )
    const status = statusStyle.render(`Selection: ${this.status}`)
    return [header, '', this.picker.view(), '', status, '', help, ''].join('\n')
  }
}

async function main(): Promise<void> {
  const demoDir = createDemoDirectory()

  try {
    console.clear()
    const program = new Program(new DemoModel(demoDir), { platform: createNodePlatform() })
    await program.run()
  } finally {
    // Clean up the demo directory
    rmSync(demoDir, { recursive: true, force: true })
  }
}

main().catch(console.error)

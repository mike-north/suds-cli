/**
 * Suds Demo: Filetree
 *
 * Demonstrates @suds-cli/filetree for browsing files with metadata.
 *
 * Controls:
 *   j / k / arrows  - move selection up/down
 *   q / ctrl+c / esc - quit
 */

import { Style } from '@suds-cli/chapstick'
import { newBinding, matches } from '@suds-cli/key'
import {
  KeyMsg,
  Program,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { FiletreeModel } from '@suds-cli/filetree'

const quitBinding = newBinding({ keys: ['q', 'Q', 'ctrl+c', 'esc'] }).withHelp(
  'q',
  'quit',
)

const headerStyle = new Style().bold(true).foreground('#8be9fd')
const helpStyle = new Style().foreground('#6272a4').italic(true)

class DemoModel implements Model<Msg, DemoModel> {
  readonly filetree: FiletreeModel

  constructor(filetree?: FiletreeModel) {
    this.filetree = filetree ?? FiletreeModel.new({
      currentDir: process.cwd(),
      showHidden: false,
    })
  }

  init(): Cmd<Msg> {
    return this.filetree.init()
  }

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
    // Handle quit
    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    // Update filetree
    const [nextFiletree, cmd] = this.filetree.update(msg)

    if (nextFiletree !== this.filetree) {
      return [new DemoModel(nextFiletree), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const header = headerStyle.render('🧼 Suds Demo — Filetree')
    const help = helpStyle.render(
      'Use j/k or arrows to navigate. q/esc to quit.',
    )
    
    const selectedFile = this.filetree.selectedFile
    const status = selectedFile 
      ? `Selected: ${selectedFile.name} (${selectedFile.path})`
      : 'No file selected'

    return [
      header,
      '',
      this.filetree.view(),
      '',
      status,
      '',
      help,
    ].join('\n')
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel())
  await program.run()
}

main().catch(console.error)

/**
 * Suds Demo: Filetree
 *
 * Demonstrates \@suds-cli/filetree for browsing files with metadata.
 *
 * Controls:
 *   j / k / arrows  - move selection up/down
 *   q / ctrl+c / esc - quit
 */

import { Style } from '@suds-cli/chapstick'
import { getIcon, getIndicator, type IconResult } from '@suds-cli/icons'
import { newBinding, matches } from '@suds-cli/key'
import { NodeFileSystemAdapter, NodePathAdapter } from '@suds-cli/machine/node'
import {
  KeyMsg,
  Program,
  WindowSizeMsg,
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

const filesystem = new NodeFileSystemAdapter()
const path = new NodePathAdapter()

class DemoModel implements Model<Msg, DemoModel> {
  readonly filetree: FiletreeModel

  constructor(filetree?: FiletreeModel) {
    // Use a dedicated demo directory for a cleaner, more confined example
    // This assumes the script is run from the examples directory
    const demoDir = './filetree'
    this.filetree =
      filetree ??
      FiletreeModel.new({
        filesystem,
        path,
        currentDir: demoDir,
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

    // Handle window resize - constrain filetree height to account for header, status, and help
    if (msg instanceof WindowSizeMsg) {
      // Reserve space for: header (1) + empty (1) + empty after filetree (1) + status (1) + empty (1) + help (1) = 6 lines
      const availableHeight = Math.max(6, msg.height - 6)
      const constrainedMsg = new WindowSizeMsg(msg.width, availableHeight)
      const [nextFiletree, cmd] = this.filetree.update(constrainedMsg)

      if (nextFiletree !== this.filetree) {
        return [new DemoModel(nextFiletree), cmd]
      }
      return [this, cmd]
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

    // Custom render the filetree with icons and purple background for selection
    const filetreeView = this.renderFiletreeWithIcons()

    return [header, '', filetreeView, '', status, '', help].join('\n')
  }

  private renderFiletreeWithIcons(): string {
    if (this.filetree.error) {
      return `Error: ${this.filetree.error.message}`
    }

    if (this.filetree.files.length === 0) {
      return '(empty directory)'
    }

    const lines: string[] = []
    const RESET = '\x1b[0m'
    const selectedStyle = new Style()
      .background('#bd93f9')
      .foreground('#ffffff')
      .bold(true)

    // Render visible items in viewport
    for (
      let i = this.filetree.min;
      i <= this.filetree.max && i < this.filetree.files.length;
      i++
    ) {
      const item = this.filetree.files[i]
      if (!item) continue

      const isSelected = i === this.filetree.cursor

      // Get icon for this item using the mode from DirectoryItem
      const indicator = getIndicator(item.mode)

      // Extract base name without extension for icon lookup
      const nameWithoutExt =
        item.extension && !item.isDirectory
          ? item.name.slice(0, -item.extension.length) || item.name
          : item.name
      const { glyph, color }: IconResult = getIcon(
        nameWithoutExt,
        item.extension,
        indicator,
      )

      // Format: "icon name  details"
      const iconDisplay = `${color}${glyph}${RESET}`
      const content = `${iconDisplay} ${item.name}  ${item.details}`

      // Pad content to full width for background styling
      const visibleLength: number = this.getVisibleLength(content)
      const paddingLength: number = Math.max(
        0,
        this.filetree.width - visibleLength,
      )
      const paddedContent: string = content + ' '.repeat(paddingLength)

      if (isSelected) {
        // Apply full-width background styling for selected items
        lines.push(selectedStyle.render(paddedContent))
      } else {
        // Normal items with icon styling preserved
        lines.push(paddedContent)
      }
    }

    // Fill remaining height with empty lines
    const remainingLines = this.filetree.height - lines.length
    for (let i = 0; i < remainingLines; i++) {
      lines.push('')
    }

    return lines.join('\n')
  }

  private getVisibleLength(str: string): number {
    // Remove ANSI escape codes (e.g., \x1b[38;2;...m or \x1b[0m)
    // eslint-disable-next-line no-control-regex
    const ansiRegex = /\x1b\[[0-9;]*[mGK]/g
    return str.replace(ansiRegex, '').length
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel())
  await program.run()
}

main().catch(console.error)

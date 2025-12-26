/**
 * Boba Demo: Icons
 *
 * Displays a showcase of file icons with their associated colors.
 *
 * Controls:
 *   q / ctrl+c / esc - quit
 */

import { Style, joinVertical } from '@boba-cli/chapstick'
import { getIcon } from '@boba-cli/icons'
import { newBinding, matches } from '@boba-cli/key'
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

const quitBinding = newBinding({ keys: ['q', 'ctrl+c', 'esc'] })

const RESET = '\x1b[0m'

// Sample files to showcase different icon types
const sampleFiles = [
  // Languages
  { name: 'app', ext: '.ts' },
  { name: 'app', ext: '.tsx' },
  { name: 'index', ext: '.js' },
  { name: 'style', ext: '.css' },
  { name: 'page', ext: '.html' },
  { name: 'main', ext: '.go' },
  { name: 'lib', ext: '.rs' },
  { name: 'app', ext: '.py' },
  { name: 'Main', ext: '.java' },
  { name: 'program', ext: '.c' },
  { name: 'module', ext: '.cpp' },
  { name: 'script', ext: '.rb' },

  // Config files
  { name: 'package', ext: '.json' },
  { name: 'tsconfig', ext: '.json' },
  { name: '.eslintrc', ext: '.js' },
  { name: '.prettierrc', ext: '' },
  { name: 'Dockerfile', ext: '' },
  { name: 'docker-compose', ext: '.yml' },
  { name: '.gitignore', ext: '' },
  { name: 'Makefile', ext: '' },

  // Documentation
  { name: 'README', ext: '.md' },
  { name: 'LICENSE', ext: '' },
  { name: 'CHANGELOG', ext: '.md' },

  // Data & assets
  { name: 'data', ext: '.sql' },
  { name: 'schema', ext: '.graphql' },
  { name: 'logo', ext: '.svg' },
  { name: 'photo', ext: '.png' },
  { name: 'video', ext: '.mp4' },
  { name: 'archive', ext: '.zip' },
]

// Directory samples
const sampleDirs = [
  'src',
  'node_modules',
  '.git',
  '.github',
  'dist',
  'images',
  '.config',
]

function renderIconRow(
  name: string,
  ext: string,
  indicator: string,
  colWidth: number,
): string {
  const { glyph, color } = getIcon(name, ext, indicator)
  const filename = name + ext + indicator
  const display = `${color}${glyph}${RESET}  ${filename}`
  // Pad to column width (accounting for ANSI codes)
  const visibleLength = glyph.length + 2 + filename.length
  const padding = Math.max(0, colWidth - visibleLength)
  return display + ' '.repeat(padding)
}

class IconsDemo implements Model<Msg, IconsDemo> {
  readonly width: number
  readonly height: number

  constructor(width = 80, height = 24) {
    this.width = width
    this.height = height
  }

  init(): Cmd<Msg> {
    return null
  }

  update(msg: Msg): [IconsDemo, Cmd<Msg>] {
    if (msg instanceof WindowSizeMsg) {
      return [new IconsDemo(msg.width, msg.height), null]
    }

    if (msg instanceof KeyMsg && matches(msg, quitBinding)) {
      return [this, quit()]
    }

    return [this, null]
  }

  view(): string {
    const headerStyle = new Style().bold(true).foreground('#8be9fd')
    const sectionStyle = new Style().bold(true).foreground('#bd93f9')
    const helpStyle = new Style().foreground('#6272a4').italic(true)

    const header = headerStyle.render('🧼 Boba Demo — File Icons')

    // Calculate columns based on width
    const colWidth = 24
    const numCols = Math.max(1, Math.floor((this.width - 4) / colWidth))

    // Render file icons in columns
    const fileRows: string[] = []
    for (let i = 0; i < sampleFiles.length; i += numCols) {
      const row = sampleFiles
        .slice(i, i + numCols)
        .map((f) => renderIconRow(f.name, f.ext, '', colWidth))
        .join('')
      fileRows.push(row)
    }

    // Render directory icons in columns
    const dirRows: string[] = []
    for (let i = 0; i < sampleDirs.length; i += numCols) {
      const row = sampleDirs
        .slice(i, i + numCols)
        .map((d) => renderIconRow(d, '', '/', colWidth))
        .join('')
      dirRows.push(row)
    }

    const filesSection = sectionStyle.render('Files')
    const dirsSection = sectionStyle.render('Directories')
    const help = helpStyle.render('Press q to quit')

    return joinVertical(
      header,
      '',
      filesSection,
      ...fileRows,
      '',
      dirsSection,
      ...dirRows,
      '',
      help,
    )
  }
}

async function main(): Promise<void> {
  console.clear()
  const program = new Program(new IconsDemo(), { platform: createNodePlatform() })
  await program.run()
}

main().catch(console.error)

import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import './styles/main.css'

// Initialize browser style context before importing demos
// This sets up color support for all Style instances
import './browser-style'

import { createShell } from './shell'

let terminal: Terminal
let fitAddon: FitAddon

function init() {
  const terminalEl = document.getElementById('terminal')
  if (!terminalEl) {
    console.error('Terminal element not found')
    return
  }

  // Create terminal
  terminal = new Terminal({
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 14,
    lineHeight: 1.2,
    theme: {
      background: '#0d1117',
      foreground: '#e6edf3',
      cursor: '#58a6ff',
      cursorAccent: '#0d1117',
      selectionBackground: '#264f78',
      black: '#0d1117',
      red: '#f85149',
      green: '#3fb950',
      yellow: '#d29922',
      blue: '#58a6ff',
      magenta: '#a371f7',
      cyan: '#56d4dd',
      white: '#e6edf3',
      brightBlack: '#484f58',
      brightRed: '#ff7b72',
      brightGreen: '#56d364',
      brightYellow: '#e3b341',
      brightBlue: '#79c0ff',
      brightMagenta: '#d2a8ff',
      brightCyan: '#76e3ea',
      brightWhite: '#f0f6fc',
    },
    cursorBlink: true,
    allowProposedApi: true,
  })

  // Add fit addon
  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)

  // Open terminal
  terminal.open(terminalEl)
  fitAddon.fit()

  // Handle resize
  window.addEventListener('resize', () => {
    fitAddon.fit()
  })

  // Start the interactive shell
  createShell(terminal)
  terminal.focus()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

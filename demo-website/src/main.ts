import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import './styles/main.css'

// Initialize browser style context before importing demos
// This sets up color support for all Style instances
import './browser-style'

import { createSpinnerDemo } from './demos/spinner'
import { createProgressDemo } from './demos/progress'
import { createListDemo } from './demos/list'

type DemoType = 'spinner' | 'progress' | 'list'

interface Demo {
  name: string
  controls: Array<{ key: string; description: string }>
  create: (terminal: Terminal) => { stop: () => void }
}

const demos: Record<DemoType, Demo> = {
  spinner: {
    name: 'spinner-demo',
    controls: [
      { key: 's', description: 'Change spinner style' },
      { key: 'q', description: 'Quit demo' },
    ],
    create: createSpinnerDemo,
  },
  progress: {
    name: 'progress-demo',
    controls: [
      { key: '+/=', description: 'Increase 10%' },
      { key: '-', description: 'Decrease 10%' },
      { key: 'r', description: 'Reset to 0%' },
      { key: 'g', description: 'Toggle gradient' },
      { key: 'q', description: 'Quit demo' },
    ],
    create: createProgressDemo,
  },
  list: {
    name: 'list-demo',
    controls: [
      { key: 'j/k', description: 'Move selection' },
      { key: '/', description: 'Start filtering' },
      { key: 'enter', description: 'Accept filter' },
      { key: 'esc', description: 'Clear filter' },
      { key: '?', description: 'Toggle help' },
      { key: 'q', description: 'Quit demo' },
    ],
    create: createListDemo,
  },
}

let terminal: Terminal
let fitAddon: FitAddon
let currentDemo: { stop: () => void } | null = null
let currentDemoType: DemoType = 'spinner'

function updateControls(demo: Demo) {
  const controlsDiv = document.getElementById('controls')
  if (!controlsDiv) return

  controlsDiv.innerHTML = demo.controls
    .map(
      ({ key, description }) =>
        `<kbd>${key}</kbd> <span>${description}</span>`,
    )
    .join('')
}

function updateTerminalTitle(name: string) {
  const titleEl = document.getElementById('terminal-title')
  if (titleEl) {
    titleEl.textContent = name
  }
}

function switchDemo(demoType: DemoType) {
  if (currentDemoType === demoType && currentDemo) return

  // Stop current demo
  if (currentDemo) {
    currentDemo.stop()
    currentDemo = null
  }

  // Clear terminal
  terminal.clear()
  terminal.reset()

  // Update UI
  const demo = demos[demoType]
  currentDemoType = demoType
  updateControls(demo)
  updateTerminalTitle(demo.name)

  // Update button states
  document.querySelectorAll('.demo-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-demo') === demoType)
  })

  // Start new demo
  currentDemo = demo.create(terminal)
  terminal.focus()
}

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

  // Setup demo button handlers
  document.querySelectorAll('.demo-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoType = btn.getAttribute('data-demo') as DemoType
      if (demoType && demos[demoType]) {
        switchDemo(demoType)
      }
    })
  })

  // Start initial demo
  const initialDemo = demos[currentDemoType]
  updateControls(initialDemo)
  currentDemo = initialDemo.create(terminal)
  terminal.focus()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

import type { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@boba-cli/machine/browser'
import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@boba-cli/tea'
import {
  SpinnerModel,
  line,
  dot,
  miniDot,
  pulse,
  points,
  moon,
  meter,
  ellipsis,
  type Spinner,
} from '@boba-cli/spinner'
import { newBinding, matches } from '@boba-cli/key'
import { createStyle } from '../browser-style'

// Available spinners to cycle through
const SPINNERS: { name: string; spinner: Spinner }[] = [
  { name: 'line', spinner: line },
  { name: 'dot', spinner: dot },
  { name: 'miniDot', spinner: miniDot },
  { name: 'pulse', spinner: pulse },
  { name: 'points', spinner: points },
  { name: 'moon', spinner: moon },
  { name: 'meter', spinner: meter },
  { name: 'ellipsis', spinner: ellipsis },
]

// Keybindings
const keys = {
  nextSpinner: newBinding({ keys: ['s', 'S'] }).withHelp('s', 'change spinner'),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

// Styles with browser color support
const titleStyle = createStyle().bold(true).foreground('#ff79c6')
const spinnerStyle = createStyle().foreground('#50fa7b')
const textStyle = createStyle().foreground('#f8f8f2')
const helpStyle = createStyle().foreground('#6272a4').italic(true)
const keyStyle = createStyle().foreground('#bd93f9').bold(true)

// Demo model
class SpinnerDemoModel implements Model<Msg, SpinnerDemoModel> {
  readonly spinner: SpinnerModel
  readonly spinnerIndex: number

  constructor(spinnerIndex = 0, spinner?: SpinnerModel) {
    this.spinnerIndex = spinnerIndex
    const current = SPINNERS[spinnerIndex]
    if (!current) {
      throw new Error(`Invalid spinner index: ${spinnerIndex}`)
    }
    this.spinner =
      spinner ??
      new SpinnerModel({
        spinner: current.spinner,
        style: spinnerStyle,
      })
  }

  init(): Cmd<Msg> {
    return this.spinner.tick()
  }

  update(msg: Msg): [SpinnerDemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }

      if (matches(msg, keys.nextSpinner)) {
        const nextIndex = (this.spinnerIndex + 1) % SPINNERS.length
        const nextSpinnerDef = SPINNERS[nextIndex]
        if (!nextSpinnerDef) {
          return [this, null]
        }
        const newSpinner = new SpinnerModel({
          spinner: nextSpinnerDef.spinner,
          style: spinnerStyle,
        })
        const next = new SpinnerDemoModel(nextIndex, newSpinner)
        return [next, newSpinner.tick()]
      }
    }

    const [nextSpinner, cmd] = this.spinner.update(msg)
    if (nextSpinner !== this.spinner) {
      return [new SpinnerDemoModel(this.spinnerIndex, nextSpinner), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const current = SPINNERS[this.spinnerIndex]
    const spinnerName = current?.name ?? 'unknown'

    const title = titleStyle.render('Boba Demo')
    const spinnerLine = `${this.spinner.view()}  ${textStyle.render('Loading something amazing...')}`
    const status = helpStyle.render(
      `Spinner: ${keyStyle.render(spinnerName)} | ` +
        `Press ${keyStyle.render('[s]')} to change | ` +
        `${keyStyle.render('[q]')} to quit`,
    )

    return ['', title, '', spinnerLine, '', status, ''].join('\n')
  }
}

export function createSpinnerDemo(terminal: Terminal): { stop: () => void } {
  const platform = createBrowserPlatform({ terminal })
  const program = new Program(new SpinnerDemoModel(), { platform })

  program.run().catch(console.error)

  return {
    stop: () => {
      program.kill()
    },
  }
}

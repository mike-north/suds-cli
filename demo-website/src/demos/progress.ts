import type { Terminal } from '@xterm/xterm'
import { createBrowserPlatform } from '@suds-cli/machine/browser'
import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { newBinding, matches } from '@suds-cli/key'
import { ProgressModel } from '@suds-cli/progress'
import { createStyle } from '../browser-style'

const keys = {
  inc: newBinding({ keys: ['+', '='] }).withHelp('+', 'increase 10%'),
  dec: newBinding({ keys: ['-'] }).withHelp('-', 'decrease 10%'),
  reset: newBinding({ keys: ['r', 'R'] }).withHelp('r', 'reset'),
  toggleGradient: newBinding({ keys: ['g', 'G'] }).withHelp(
    'g',
    'toggle gradient',
  ),
  quit: newBinding({ keys: ['q', 'Q', 'ctrl+c'] }).withHelp('q', 'quit'),
}

// Styles with browser color support
const titleStyle = createStyle().bold(true).foreground('#ff79c6')
const textStyle = createStyle().foreground('#f8f8f2')
const hintStyle = createStyle().foreground('#6272a4').italic(true)
const keyStyle = createStyle().foreground('#bd93f9').bold(true)

class ProgressDemoModel implements Model<Msg, ProgressDemoModel> {
  readonly progress: ProgressModel
  readonly useGradient: boolean
  readonly initCmd: Cmd<Msg> | null

  constructor(progress?: ProgressModel, useGradient = true) {
    if (progress) {
      this.progress = progress
      this.useGradient = useGradient
      this.initCmd = null
      return
    }

    const base = ProgressModel.withDefaultGradient({
      width: 40,
      showPercentage: true,
    })
    const [ready, cmd] = base.setPercent(0.3)
    this.progress = ready
    this.useGradient = useGradient
    this.initCmd = cmd
  }

  init(): Cmd<Msg> {
    return this.initCmd
  }

  update(msg: Msg): [ProgressDemoModel, Cmd<Msg>] {
    if (msg instanceof KeyMsg) {
      if (matches(msg, keys.quit)) {
        return [this, quit()]
      }

      if (matches(msg, keys.inc)) {
        return this.setPercent(this.progress.targetPercent() + 0.1)
      }

      if (matches(msg, keys.dec)) {
        return this.setPercent(this.progress.targetPercent() - 0.1)
      }

      if (matches(msg, keys.reset)) {
        return this.setPercent(0)
      }

      if (matches(msg, keys.toggleGradient)) {
        const nextUseGradient = !this.useGradient
        const base = nextUseGradient
          ? ProgressModel.withDefaultGradient({
              width: this.progress.width,
              showPercentage: this.progress.showPercentage,
            })
          : ProgressModel.withSolidFill(this.progress.fullColor, {
              width: this.progress.width,
              showPercentage: this.progress.showPercentage,
            })
        const [next, cmd] = base.setPercent(this.progress.targetPercent())
        return [new ProgressDemoModel(next, nextUseGradient), cmd]
      }
    }

    const [nextProgress, cmd] = this.progress.update(msg)
    if (nextProgress !== this.progress) {
      return [new ProgressDemoModel(nextProgress, this.useGradient), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const title = titleStyle.render('Suds Progress Demo')
    const bar = this.progress.view()
    const mode = this.useGradient ? 'Gradient' : 'Solid'

    const help = hintStyle.render(
      [
        `${keyStyle.render('[+]')} / ${keyStyle.render('[=]')} +10%`,
        `${keyStyle.render('[-]')} -10%`,
        `${keyStyle.render('[r]')} reset`,
        `${keyStyle.render('[g]')} toggle ${mode.toLowerCase()}`,
        `${keyStyle.render('[q]')} quit`,
      ].join(' | '),
    )

    return [
      '',
      title,
      '',
      bar,
      '',
      textStyle.render(`Mode: ${mode}`),
      '',
      help,
      '',
    ].join('\n')
  }

  private setPercent(value: number): [ProgressDemoModel, Cmd<Msg>] {
    const [next, cmd] = this.progress.setPercent(value)
    return [new ProgressDemoModel(next, this.useGradient), cmd]
  }
}

export function createProgressDemo(terminal: Terminal): { stop: () => void } {
  const platform = createBrowserPlatform({ terminal })
  const program = new Program(new ProgressDemoModel(), { platform })

  program.run().catch(console.error)

  return {
    stop: () => {
      program.kill()
    },
  }
}

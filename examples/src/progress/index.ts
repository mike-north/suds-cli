/**
 * Boba Demo: Animated Progress Bar
 *
 * Demonstrates \@boba-cli/progress with spring animation, gradient fill,
 * and keyboard controls.
 *
 * Controls:
 *   + / =   - Increase 10%
 *   -       - Decrease 10%
 *   r       - Reset to 0%
 *   g       - Toggle gradient vs solid fill
 *   q       - Quit
 *   Ctrl+C  - Quit
 */

import type { PlatformAdapter } from '\@boba-cli/machine'
import {
  Program,
  KeyMsg,
  quit,
  type Cmd,
  type Model,
  type Msg,
} from '\@boba-cli/tea'
import { newBinding, matches } from '\@boba-cli/key'
import { Style } from '\@boba-cli/chapstick'
import { ProgressModel } from '\@boba-cli/progress'

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

const titleStyle = new Style().bold(true).foreground('#ff79c6')
const textStyle = new Style().foreground('#f8f8f2')
const hintStyle = new Style().foreground('#6272a4').italic(true)
const keyStyle = new Style().foreground('#bd93f9').bold(true)

class DemoModel implements Model<Msg, DemoModel> {
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

  update(msg: Msg): [DemoModel, Cmd<Msg>] {
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
        return [new DemoModel(next, nextUseGradient), cmd]
      }
    }

    // Let the progress bar handle animation frames
    const [nextProgress, cmd] = this.progress.update(msg)
    if (nextProgress !== this.progress) {
      return [new DemoModel(nextProgress, this.useGradient), cmd]
    }

    return [this, cmd]
  }

  view(): string {
    const title = titleStyle.render('🧋 Boba Progress Demo')
    const bar = this.progress.view()
    const mode = this.useGradient ? 'Gradient' : 'Solid'

    const help = hintStyle.render(
      [
        `${keyStyle.render('[+]')} / ${keyStyle.render('[=]')} +10%`,
        `${keyStyle.render('[-]')} -10%`,
        `${keyStyle.render('[r]')} reset`,
        `${keyStyle.render('[g]')} toggle ${mode.toLowerCase()}`,
        `${keyStyle.render('[q]')} quit`,
      ].join(' • '),
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

  private setPercent(value: number): [DemoModel, Cmd<Msg>] {
    const [next, cmd] = this.progress.setPercent(value)
    return [new DemoModel(next, this.useGradient), cmd]
  }
}

/**
 * Run the progress demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  const program = new Program(new DemoModel(), { platform })
  await program.run()
}

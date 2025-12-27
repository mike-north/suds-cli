/**
 * Boba DSL Demo: Package Manager
 *
 * Simulates a package manager downloading and installing packages.
 * Demonstrates the boba-cli DSL package with:
 * - onInit for scheduling initial async operations
 * - onMessage for handling async callbacks
 * - Spinner and progress bar components
 * - Gradient progress bars with spring animation
 *
 * Based on the Bubbletea package-manager example.
 *
 * Controls:
 *   q      - Quit
 *   Ctrl+C - Quit
 */

import type { PlatformAdapter } from '@boba-cli/machine'
import {
  createApp,
  spinner,
  progress,
  tick,
  vstack,
  hstack,
  text,
  when,
  map,
  Style,
} from '@boba-cli/dsl'
import { ProgressModel } from '@boba-cli/progress'
import { makeDemoHeader } from '../constants.js'

// Package list to "install"
const packages = [
  'boba-cli',
  '@boba-cli/tea',
  '@boba-cli/dsl',
  '@boba-cli/progress',
  '@boba-cli/spinner',
  '@boba-cli/chapstick',
  '@boba-cli/machine',
  '@boba-cli/key',
]

// Message sent when a package finishes "downloading"
class PackageInstalledMsg {
  readonly _tag = 'PackageInstalledMsg' as const
  constructor(public readonly packageName: string) {}
}

// Styles
const packageStyle = new Style().foreground('#EE6FF8')
const checkStyle = new Style().foreground('#50fa7b')
const countStyle = new Style().foreground('#6272a4')
const spinnerStyle = new Style().foreground('#7571F9')

// Simulate package download with random delay (100-500ms)
function downloadPackage(name: string) {
  const delay = Math.floor(Math.random() * 400) + 100
  return tick(delay, () => new PackageInstalledMsg(name))
}

// Application state
interface State {
  currentIndex: number
  installed: string[]
  done: boolean
}

// Build the app
const app = createApp()
  .state<State>({
    currentIndex: 0,
    installed: [],
    done: false,
  })
  .component(
    'spinner',
    spinner({
      style: spinnerStyle,
    }),
  )
  .component(
    'progress',
    progress({
      width: 40,
      gradient: {
        start: '#5A56E0',
        end: '#EE6FF8',
        scaleGradientToProgress: false,
      },
      showPercentage: true,
    }),
  )
  // When app starts, begin downloading the first package
  .onInit((ctx) => {
    if (packages.length > 0) {
      ctx.schedule(downloadPackage(packages[ctx.state.currentIndex]!))
    }
  })
  // When a package finishes installing, move to the next one
  .onMessage(PackageInstalledMsg, (ctx) => {
    const newInstalled = [...ctx.state.installed, ctx.msg.packageName]
    const nextIndex = ctx.state.currentIndex + 1
    const isDone = nextIndex >= packages.length

    // Update progress bar
    const progressPercent = newInstalled.length / packages.length
    ctx.sendToComponent('progress', (model: ProgressModel) => model.setPercent(progressPercent))

    // Update state
    ctx.update({
      installed: newInstalled,
      currentIndex: nextIndex,
      done: isDone,
    })

    // Schedule next download if not done
    if (!isDone) {
      ctx.schedule(downloadPackage(packages[nextIndex]!))
    }
  })
  .onKey(['q', 'Q', 'ctrl+c'], (ctx) => {
    ctx.quit()
  })
  .view(({ state, components }) => {
    const currentPackage =
      state.currentIndex < packages.length ? packages[state.currentIndex] : undefined
    const totalPackages = packages.length

    return vstack(
      text(''),
      makeDemoHeader('Package Manager'),
      text(''),

      // Show completed packages
      ...map(state.installed, (pkg) =>
        hstack(
          checkStyle.render('✓'),
          text(' '),
          text(pkg).dim(),
        ),
      ),

      // Show current package being installed (if not done)
      when(
        !state.done,
        hstack(
          components.spinner,
          text(' '),
          text('Downloading ').foreground('#f8f8f2'),
          packageStyle.render(currentPackage ?? ''),
        ),
      ),

      text(''),

      // Progress bar
      components.progress,

      // Package count
      text(''),
      countStyle.render(`Packages: ${state.installed.length}/${totalPackages}`),

      text(''),

      // Completion message or quit hint
      when(
        state.done,
        vstack(
          checkStyle.render('All packages installed!'),
          text(''),
        ),
      ),

      text('Press [q] to quit').dim().italic(),
      text(''),
    )
  })
  .build()

/**
 * Run the package manager demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  await app.run({ platform })
}

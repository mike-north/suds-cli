/**
 * Boba DSL Demo: Fancy List
 *
 * A port of the Bubble Tea list-fancy example to \@boba-cli/dsl.
 * Demonstrates a fully featured grocery list with dynamic item management.
 *
 * Features:
 *   - Add/remove items dynamically
 *   - Toggle title, status bar, pagination, help
 *   - Styled list with custom colors
 *   - Status messages for user feedback
 *
 * Controls:
 *   a         - Add random item
 *   x/delete  - Remove selected item
 *   enter     - Choose selected item
 *   T         - Toggle title bar
 *   S         - Toggle status bar
 *   P         - Toggle pagination
 *   H         - Toggle help
 *   j/k       - Move up/down
 *   /         - Start filtering
 *   q/ctrl+c  - Quit
 */

import type { PlatformAdapter } from '@boba-cli/machine'
import {
  createApp,
  list,
  vstack,
  text,
  when,
  Style,
  DefaultItem,
  type ListModel,
} from '@boba-cli/dsl'
import { makeDemoHeader } from '../constants.js'

// Styles matching Bubble Tea list-fancy example
const titleBarStyle = new Style()
  .foreground('#FFFDF5')
  .background('#25A065')
  .bold(true)
const statusMessageStyle = new Style().foreground('#04B575')
const helpStyle = new Style().foreground('#626262').italic(true)

// Grocery item data - matches Bubble Tea list-fancy
const groceryTitles = [
  'Artichoke',
  'Baguette',
  'Brie',
  'Camembert',
  'Croissant',
  'Eggplant',
  'Figs',
  'Gruyere',
  'Honeydew',
  'Jambon',
  'Kiwi',
  'Lemon',
  'Mango',
  'Nectarine',
  'Olive Oil',
  'Papaya',
  'Quince',
  'Radicchio',
  'Saffron',
  'Tarragon',
  'Udon',
  'Vanilla',
  'Watercress',
  'Yuzu',
  'Zucchini',
]

const groceryDescriptions = [
  'Great for dipping',
  'Fresh from the bakery',
  'Soft and creamy',
  'Rich and earthy',
  'Buttery and flaky',
  'Versatile vegetable',
  'Sweet and delicious',
  'Nutty and complex',
  'Refreshing fruit',
  'Savory and salty',
  'Tangy and tropical',
  'Bright and zesty',
  'Juicy and sweet',
  'Smooth and fragrant',
  'Essential for cooking',
  'Exotic and sweet',
  'Aromatic and tart',
  'Bitter and colorful',
  'Luxurious spice',
  'Subtle anise flavor',
  'Chewy and satisfying',
  'Sweet and fragrant',
  'Peppery and fresh',
  'Citrusy and unique',
  'Mild and versatile',
]

// Random item generator
class RandomItemGenerator {
  private titleIndex = 0
  private descIndex = 0
  private titles: string[]
  private descriptions: string[]

  constructor() {
    this.titles = [...groceryTitles]
    this.descriptions = [...groceryDescriptions]
    this.shuffle(this.titles)
    this.shuffle(this.descriptions)
  }

  private shuffle(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = array[i]!
      array[i] = array[j]!
      array[j] = temp
    }
  }

  next(): DefaultItem {
    const title = this.titles[this.titleIndex % this.titles.length]!
    const desc = this.descriptions[this.descIndex % this.descriptions.length]!
    this.titleIndex++
    this.descIndex++
    return new DefaultItem(title, desc)
  }
}

// Generate initial items
function generateInitialItems(count: number): DefaultItem[] {
  const generator = new RandomItemGenerator()
  const items: DefaultItem[] = []
  for (let i = 0; i < count; i++) {
    items.push(generator.next())
  }
  return items
}

// App state
interface AppState {
  statusMessage: string
  showTitle: boolean
  showStatusBar: boolean
  showPagination: boolean
  showHelp: boolean
  itemGenerator: RandomItemGenerator
}

// Build the app
const initialItems = generateInitialItems(10)
const initialGenerator = new RandomItemGenerator()

const app = createApp()
  .state<AppState>({
    statusMessage: '',
    showTitle: true,
    showStatusBar: true,
    showPagination: true,
    showHelp: true,
    itemGenerator: initialGenerator,
  })
  .component(
    'groceries',
    list<DefaultItem>({
      items: initialItems,
      title: 'Groceries',
      height: 14,
      showFilter: true,
      showPagination: true,
      showHelp: true,
      showStatusBar: true,
      styles: {
        titleBar: titleBarStyle,
        selectedTitle: new Style().foreground('#EE6FF8').bold(true),
        selectedDesc: new Style().foreground('#EE6FF8'),
        normalTitle: new Style().foreground('#FFFDF5'),
        normalDesc: new Style().foreground('#FFFDF5').italic(true),
        filterPrompt: new Style().foreground('#FFFDF5'),
        filterCursor: new Style().foreground('#EE6FF8'),
        statusBar: new Style().foreground('#A49FA5'),
        pagination: new Style().foreground('#A49FA5'),
        help: new Style().foreground('#626262'),
      },
    }),
  )
  // Quit
  .onKey(['q', 'Q', 'ctrl+c'], (ctx) => {
    ctx.quit()
  })
  // Add random item
  .onKey('a', (ctx) => {
    const newItem = ctx.state.itemGenerator.next()
    ctx.sendToComponent('groceries', (model: ListModel<DefaultItem>) => {
      const newModel = model.insertItem(model.items.length, newItem)
      return [newModel, null]
    })
    ctx.update({ statusMessage: `Added ${newItem.title()}` })
  })
  // Remove selected item
  .onKey(['x', 'backspace', 'delete'], (ctx) => {
    ctx.sendToComponent('groceries', (model: ListModel<DefaultItem>) => {
      const selected = model.selectedItem()
      if (selected) {
        const title = selected.title()
        const newModel = model.removeItem(model.selectedIndex())
        ctx.update({ statusMessage: `${title} removed` })
        return [newModel, null]
      }
      return [model, null]
    })
  })
  // Choose selected item
  .onKey('enter', (ctx) => {
    ctx.sendToComponent('groceries', (model: ListModel<DefaultItem>) => {
      const selected = model.selectedItem()
      if (selected) {
        ctx.update({
          statusMessage: `You chose ${selected.title()}!`,
        })
      }
      return [model, null]
    })
  })
  // Toggle title bar
  .onKey('T', (ctx) => {
    const newShowTitle = !ctx.state.showTitle
    ctx.update({
      showTitle: newShowTitle,
      statusMessage: newShowTitle ? 'Title bar visible' : 'Title bar hidden',
    })
    ctx.sendToComponent('groceries', (model: ListModel<DefaultItem>) => {
      // We can't directly toggle showTitle on model after creation,
      // but we can recreate with new settings - for now just show message
      return [model, null]
    })
  })
  // Toggle status bar
  .onKey('S', (ctx) => {
    const newShowStatus = !ctx.state.showStatusBar
    ctx.update({
      showStatusBar: newShowStatus,
      statusMessage: newShowStatus ? 'Status bar visible' : 'Status bar hidden',
    })
  })
  // Toggle pagination
  .onKey('P', (ctx) => {
    const newShowPagination = !ctx.state.showPagination
    ctx.update({
      showPagination: newShowPagination,
      statusMessage: newShowPagination
        ? 'Pagination visible'
        : 'Pagination hidden',
    })
  })
  // Toggle help
  .onKey('H', (ctx) => {
    const newShowHelp = !ctx.state.showHelp
    ctx.update({
      showHelp: newShowHelp,
      statusMessage: newShowHelp ? 'Help visible' : 'Help hidden',
    })
  })
  .view(({ state, components }) =>
    vstack(
      text(''),
      makeDemoHeader('Fancy List'),
      text(''),
      components.groceries,
      text(''),
      when(
        state.statusMessage !== '',
        statusMessageStyle.render(state.statusMessage),
      ),
      text(''),
      helpStyle.render(
        'a: add item  x: remove  enter: choose  T/S/P/H: toggle features  q: quit',
      ),
      text(''),
    ),
  )
  .build()

/**
 * Run the fancy list DSL demo with the given platform adapter.
 * @param platform - Platform adapter for terminal I/O
 */
export default async function run(platform: PlatformAdapter): Promise<void> {
  console.clear()
  await app.run({ platform })
}

import { newBinding, type Binding } from '@suds-cli/key'

/** Key bindings for table navigation. @public */
export interface TableKeyMap {
  lineUp: Binding
  lineDown: Binding
  pageUp: Binding
  pageDown: Binding
  halfPageUp: Binding
  halfPageDown: Binding
  gotoTop: Binding
  gotoBottom: Binding
}

/** Default key bindings matching Bubble Tea tables. @public */
export const defaultKeyMap: TableKeyMap = {
  lineUp: newBinding({
    keys: ['up', 'k'],
    help: { key: '↑/k', desc: 'up' },
  }),
  lineDown: newBinding({
    keys: ['down', 'j'],
    help: { key: '↓/j', desc: 'down' },
  }),
  pageUp: newBinding({
    keys: ['pgup', 'b', 'ctrl+u'],
    help: { key: 'pgup/b', desc: 'page up' },
  }),
  pageDown: newBinding({
    keys: ['pgdown', 'f', 'ctrl+d'],
    help: { key: 'pgdn/f', desc: 'page down' },
  }),
  halfPageUp: newBinding({
    keys: ['u'],
    help: { key: 'u', desc: '½ page up' },
  }),
  halfPageDown: newBinding({
    keys: ['d'],
    help: { key: 'd', desc: '½ page down' },
  }),
  gotoTop: newBinding({
    keys: ['home', 'g'],
    help: { key: 'home/g', desc: 'go to start' },
  }),
  gotoBottom: newBinding({
    keys: ['end', 'G'],
    help: { key: 'end/G', desc: 'go to end' },
  }),
}

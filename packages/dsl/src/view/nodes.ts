import type { TextNode, LayoutNode, ViewNode, ComponentView } from '../types.js'

/**
 * Create a text node with chainable style methods.
 *
 * @remarks
 * Text nodes support fluent styling via methods like `bold()`,
 * `dim()`, `italic()`, `foreground()`, and `background()`.
 *
 * @example
 * ```typescript
 * text('Hello').bold().foreground('#ff79c6')
 * text('Warning').dim()
 * ```
 *
 * @param content - The text content to display
 * @returns A new {@link TextNode}
 *
 * @public
 */
export function text(content: string): TextNode {
  return createTextNode(content, false, false, false, undefined, undefined)
}

function createTextNode(
  content: string,
  bold: boolean,
  dim: boolean,
  italic: boolean,
  foreground: string | undefined,
  background: string | undefined,
): TextNode {
  return {
    _type: 'text',
    content,
    _bold: bold,
    _dim: dim,
    _italic: italic,
    _foreground: foreground,
    _background: background,
    bold() {
      return createTextNode(content, true, dim, italic, foreground, background)
    },
    dim() {
      return createTextNode(content, bold, true, italic, foreground, background)
    },
    italic() {
      return createTextNode(content, bold, dim, true, foreground, background)
    },
    foreground(color: string) {
      return createTextNode(content, bold, dim, italic, color, background)
    },
    background(color: string) {
      return createTextNode(content, bold, dim, italic, foreground, color)
    },
  }
}

/**
 * Create a vertical stack layout.
 *
 * @remarks
 * Arranges child views vertically with newlines between them. Children are
 * rendered in order from top to bottom.
 *
 * @example
 * ```typescript
 * vstack(
 *   text('Line 1'),
 *   text('Line 2'),
 *   text('Line 3')
 * )
 * ```
 *
 * @param children - View nodes to stack vertically
 * @returns A new {@link LayoutNode} with vertical stacking
 *
 * @public
 */
export function vstack(...children: ViewNode[]): LayoutNode {
  return {
    _type: 'vstack',
    children,
    spacing: 0,
  }
}

/**
 * Create a horizontal stack layout.
 *
 * @remarks
 * Arranges child views horizontally on the same line. Children are
 * rendered in order from left to right.
 *
 * @example
 * ```typescript
 * hstack(
 *   text('Left'),
 *   text(' | '),
 *   text('Right')
 * )
 * ```
 *
 * @param children - View nodes to stack horizontally
 * @returns A new {@link LayoutNode} with horizontal stacking
 *
 * @public
 */
export function hstack(...children: ViewNode[]): LayoutNode {
  return {
    _type: 'hstack',
    children,
    spacing: 0,
  }
}

/**
 * Create empty vertical space.
 *
 * @remarks
 * Useful for adding vertical spacing between sections of your UI.
 *
 * @example
 * ```typescript
 * vstack(
 *   text('Header'),
 *   spacer(2),
 *   text('Content')
 * )
 * ```
 *
 * @param height - Number of blank lines to insert (default: 1)
 * @returns A string containing the specified number of newlines
 *
 * @public
 */
export function spacer(height = 1): string {
  return '\n'.repeat(height)
}

/**
 * Create a divider line.
 *
 * @remarks
 * Renders a horizontal line using a repeated character.
 *
 * @example
 * ```typescript
 * vstack(
 *   text('Section 1'),
 *   divider(),
 *   text('Section 2'),
 *   divider('=', 50)
 * )
 * ```
 *
 * @param char - Character to repeat (default: '─')
 * @param width - Number of times to repeat the character (default: 40)
 * @returns A string containing the divider line
 *
 * @public
 */
export function divider(char = '─', width = 40): string {
  return char.repeat(width)
}

/**
 * Conditionally render a node.
 *
 * @remarks
 * Returns the node if the condition is true, otherwise returns an empty string.
 *
 * @example
 * ```typescript
 * vstack(
 *   text('Always visible'),
 *   when(state.showHelp, text('Help text'))
 * )
 * ```
 *
 * @param condition - Boolean condition to test
 * @param node - View node to render if condition is true
 * @returns The node if condition is true, empty string otherwise
 *
 * @public
 */
export function when(condition: boolean, node: ViewNode): ViewNode {
  return condition ? node : ''
}

/**
 * Choose between two nodes based on condition.
 *
 * @remarks
 * Returns one node if the condition is true, another if false.
 *
 * @example
 * ```typescript
 * vstack(
 *   choose(
 *     state.isLoading,
 *     text('Loading...').dim(),
 *     text('Ready!').bold()
 *   )
 * )
 * ```
 *
 * @param condition - Boolean condition to test
 * @param ifTrue - View node to render if condition is true
 * @param ifFalse - View node to render if condition is false
 * @returns Either ifTrue or ifFalse depending on condition
 *
 * @public
 */
export function choose(condition: boolean, ifTrue: ViewNode, ifFalse: ViewNode): ViewNode {
  return condition ? ifTrue : ifFalse
}

/**
 * Map items to view nodes.
 *
 * @remarks
 * Transforms an array of items into an array of view nodes. The render
 * function receives each item and its index.
 *
 * @example
 * ```typescript
 * vstack(
 *   ...map(state.items, (item, index) =>
 *     text(`${index + 1}. ${item.name}`)
 *   )
 * )
 * ```
 *
 * @typeParam T - The type of items in the array
 * @param items - Array of items to map
 * @param render - Function to transform each item into a view node
 * @returns Array of view nodes
 *
 * @public
 */
export function map<T>(items: T[], render: (item: T, index: number) => ViewNode): ViewNode[] {
  return items.map(render)
}

/**
 * Create a component view wrapper.
 * @internal
 */
export function componentView(view: string): ComponentView {
  return {
    _type: 'component',
    view,
  }
}

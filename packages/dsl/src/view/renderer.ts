import { Style } from '@suds-cli/chapstick'
import type { ViewNode, TextNode, LayoutNode, ComponentView } from '../types.js'

/**
 * Render a view node tree to a string.
 *
 * @remarks
 * Recursively renders a {@link ViewNode} tree into a terminal-ready string.
 * Handles text styling, layout stacking, and component views. This function
 * is typically called internally by the DSL, but can be used directly for
 * testing or custom rendering.
 *
 * @example
 * ```typescript
 * const tree = vstack(
 *   text('Hello').bold(),
 *   text('World').foreground('#ff79c6')
 * )
 * const output = render(tree)
 * console.log(output)
 * ```
 *
 * @param node - The view node tree to render
 * @returns A string ready to display in the terminal
 *
 * @public
 */
export function render(node: ViewNode): string {
  if (typeof node === 'string') {
    return node
  }

  if (isTextNode(node)) {
    return renderTextNode(node)
  }

  if (isLayoutNode(node)) {
    return renderLayoutNode(node)
  }

  if (isComponentView(node)) {
    return node.view
  }

  // Should not reach here, but TypeScript doesn't know that
  return ''
}

function isTextNode(node: ViewNode): node is TextNode {
  return typeof node === 'object' && '_type' in node && node._type === 'text'
}

function isLayoutNode(node: ViewNode): node is LayoutNode {
  return (
    typeof node === 'object' &&
    '_type' in node &&
    (node._type === 'vstack' || node._type === 'hstack')
  )
}

function isComponentView(node: ViewNode): node is ComponentView {
  return typeof node === 'object' && '_type' in node && node._type === 'component'
}

function renderTextNode(node: TextNode): string {
  let style = new Style()

  if (node._bold) {
    style = style.bold(true)
  }
  // Note: dim is rendered as a darker color when foreground is set
  // If dim and no foreground, use a gray color
  if (node._dim && !node._foreground) {
    style = style.foreground('#888888')
  }
  if (node._italic) {
    style = style.italic(true)
  }
  if (node._foreground) {
    style = style.foreground(node._foreground)
  }
  if (node._background) {
    style = style.background(node._background)
  }

  return style.render(node.content)
}

function renderLayoutNode(node: LayoutNode): string {
  const renderedChildren = node.children
    .map((child) => render(child))
    .filter((s) => s.length > 0)

  if (node._type === 'vstack') {
    const separator = node.spacing > 0 ? '\n'.repeat(node.spacing + 1) : '\n'
    return renderedChildren.join(separator)
  }

  // hstack
  const separator = node.spacing > 0 ? ' '.repeat(node.spacing) : ''
  return renderedChildren.join(separator)
}

import { describe, expect, it } from 'vitest'
import { markdown } from '../src/components/markdown.js'

describe('markdown component builder', () => {
  it('should create a component builder with required content', () => {
    const builder = markdown({ content: '# Hello World' })
    expect(builder).toBeDefined()
    expect(builder.init).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.view).toBeDefined()
  })

  it('should render markdown content on init', () => {
    const builder = markdown({ content: '# Hello\n\nThis is **bold** text.' })
    const [model, cmd] = builder.init()

    expect(model).toBeDefined()
    expect(cmd).toBeNull()

    const rendered = builder.view(model)
    expect(rendered).toBeTruthy()
    expect(typeof rendered).toBe('string')
  })

  it('should use default width of 80 when not specified', () => {
    const longLine = 'a'.repeat(100)
    const builder = markdown({ content: longLine })
    const [model] = builder.init()
    const rendered = builder.view(model)

    // With wrapping at 80, the content should be split across multiple lines
    const lines = rendered.split('\n')
    expect(lines.length).toBeGreaterThan(1)
  })

  it('should respect custom width option', () => {
    const builder = markdown({
      content: '# Test',
      width: 120,
    })
    const [model] = builder.init()

    expect(model).toBeDefined()
    expect(builder.view(model)).toBeTruthy()
  })

  it('should return the same model on update (static content)', () => {
    const builder = markdown({ content: '# Test' })
    const [initialModel] = builder.init()

    const mockMsg = { type: 'test' }
    const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

    expect(updatedModel).toBe(initialModel)
    expect(cmd).toBeNull()
  })

  it('should handle headings', () => {
    const builder = markdown({ content: '# Heading 1\n## Heading 2' })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('Heading 1')
    expect(rendered).toContain('Heading 2')
  })

  it('should handle bold text', () => {
    const builder = markdown({ content: 'This is **bold** text.' })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('bold')
  })

  it('should handle italic text', () => {
    const builder = markdown({ content: 'This is *italic* text.' })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('italic')
  })

  it('should handle code blocks', () => {
    const builder = markdown({ content: '```js\nconsole.log("hello")\n```' })
    const [model] = builder.init()
    const rendered = builder.view(model)

    // The markdown renderer applies syntax highlighting with ANSI codes,
    // so check for the text content being present (may have codes in between)
    expect(rendered).toContain('console')
    expect(rendered).toContain('hello')
  })

  it('should handle lists', () => {
    const builder = markdown({
      content: '- Item 1\n- Item 2\n- Item 3',
    })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('Item 1')
    expect(rendered).toContain('Item 2')
    expect(rendered).toContain('Item 3')
  })

  it('should handle links', () => {
    const builder = markdown({
      content: '[Example Link](https://example.com)',
    })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('Example Link')
  })

  it('should handle empty content', () => {
    const builder = markdown({ content: '' })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toBe('')
  })

  it('should handle mixed markdown elements', () => {
    const content = `
# Main Heading

This is a paragraph with **bold** and *italic* text.

## Subheading

- List item 1
- List item 2

\`\`\`typescript
const greeting = "Hello"
\`\`\`

[Link](https://example.com)
    `.trim()

    const builder = markdown({ content })
    const [model] = builder.init()
    const rendered = builder.view(model)

    expect(rendered).toContain('Main Heading')
    expect(rendered).toContain('Subheading')
    expect(rendered).toContain('bold')
    expect(rendered).toContain('italic')
    expect(rendered).toContain('List item 1')
    expect(rendered).toContain('greeting')
    expect(rendered).toContain('Link')
  })
})

import { describe, expect, it } from 'vitest'
import { Style } from '@boba-cli/chapstick'
import { type Item, DefaultItem } from '@boba-cli/list'
import { list } from '../../src/components/list.js'

// Test helper: create mock items
function createMockItems(count: number): DefaultItem[] {
  return Array.from({ length: count }, (_, i) =>
    new DefaultItem(`Item ${i + 1}`, `Description ${i + 1}`)
  )
}

// Test helper: custom item type
interface TodoItem extends Item {
  id: number
  completed: boolean
}

function createTodoItem(id: number, title: string, completed = false): TodoItem {
  return {
    id,
    completed,
    filterValue: () => title,
    title: () => title,
    description: () => completed ? 'Done' : 'Pending',
  }
}

describe('list component builder', () => {
  describe('initialization', () => {
    it('should create a component builder with required items', () => {
      const items = createMockItems(5)
      const builder = list({ items })

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with default options', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [model, cmd] = builder.init()

      expect(model).toBeDefined()
      expect(cmd).toBeDefined() // ListModel.init() returns a command
      expect(model.items).toEqual(items)
      expect(model.filteredItems).toEqual(items)
      expect(model.cursor).toBe(0)
    })

    it('should initialize with custom height', () => {
      const items = createMockItems(10)
      const builder = list({ items, height: 20 })
      const [model] = builder.init()

      expect(model.height).toBe(20)
    })

    it('should initialize with custom width', () => {
      const items = createMockItems(5)
      const builder = list({ items, width: 80 })
      const [model] = builder.init()

      expect(model.width).toBe(80)
    })

    it('should initialize with custom title', () => {
      const items = createMockItems(5)
      const builder = list({ items, title: 'My List' })
      const [model] = builder.init()

      expect(model.title).toBe('My List')
    })

    it('should initialize with filtering disabled', () => {
      const items = createMockItems(5)
      const builder = list({ items, filteringEnabled: false })
      const [model] = builder.init()

      expect(model.filteringEnabled).toBe(false)
    })

    it('should initialize with filtering enabled by default', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.filteringEnabled).toBe(true)
    })
  })

  describe('options handling', () => {
    it('should apply custom delegate', () => {
      const items = createMockItems(5)
      const customDelegate = {
        height: () => 2,
        spacing: () => 1,
        render: () => 'custom',
      }
      const builder = list({ items, delegate: customDelegate })
      const [model] = builder.init()

      expect(model.delegate).toBe(customDelegate)
    })

    it('should apply custom styles', () => {
      const items = createMockItems(5)
      const customStyles = {
        titleBar: new Style().foreground('#00FF00').bold(),
        filterPrompt: new Style().foreground('#FF0000'),
      }
      const builder = list({ items, styles: customStyles })
      const [model] = builder.init()

      expect(model.styles.titleBar).toBe(customStyles.titleBar)
      expect(model.styles.filterPrompt).toBe(customStyles.filterPrompt)
    })

    it('should apply visibility options', () => {
      const items = createMockItems(5)
      const builder = list({
        items,
        showTitle: false,
        showFilter: false,
        showPagination: false,
        showHelp: false,
        showStatusBar: false,
      })
      const [model] = builder.init()

      expect(model.showTitle).toBe(false)
      expect(model.showFilter).toBe(false)
      expect(model.showPagination).toBe(false)
      expect(model.showHelp).toBe(false)
      expect(model.showStatusBar).toBe(false)
    })

    it('should enable all visibility options by default', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.showTitle).toBe(true)
      expect(model.showFilter).toBe(true)
      expect(model.showPagination).toBe(true)
      expect(model.showHelp).toBe(true)
      expect(model.showStatusBar).toBe(true)
    })

    it('should apply custom key map', () => {
      const items = createMockItems(5)
      const customKeyMap = {
        up: ['k'],
        down: ['j'],
        quit: ['q'],
      }
      const builder = list({ items, keyMap: customKeyMap as any })
      const [model] = builder.init()

      expect(model.keyMap).toBeDefined()
    })

    it('should combine multiple options', () => {
      const items = createMockItems(10)
      const builder = list({
        items,
        height: 30,
        width: 100,
        title: 'Combined Options Test',
        showTitle: true,
        showFilter: true,
        filteringEnabled: true,
        styles: {
          titleBar: new Style().bold(),
        },
      })
      const [model] = builder.init()

      expect(model.height).toBe(30)
      expect(model.width).toBe(100)
      expect(model.title).toBe('Combined Options Test')
      expect(model.showTitle).toBe(true)
      expect(model.showFilter).toBe(true)
      expect(model.filteringEnabled).toBe(true)
      expect(model.styles.titleBar).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const builder = list({ items: [] })
      const [model] = builder.init()

      expect(model.items).toEqual([])
      expect(model.filteredItems).toEqual([])
      expect(model.cursor).toBe(0)
    })

    it('should handle single item', () => {
      const items = createMockItems(1)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items.length).toBe(1)
      expect(model.cursor).toBe(0)
    })

    it('should handle very large arrays', () => {
      const items = createMockItems(1000)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items.length).toBe(1000)
      expect(model.filteredItems.length).toBe(1000)
    })

    it('should handle height of 0', () => {
      const items = createMockItems(5)
      const builder = list({ items, height: 0 })
      const [model] = builder.init()

      expect(model.height).toBe(0)
    })

    it('should handle width of 0', () => {
      const items = createMockItems(5)
      const builder = list({ items, width: 0 })
      const [model] = builder.init()

      expect(model.width).toBe(0)
    })

    it('should handle negative height', () => {
      const items = createMockItems(5)
      const builder = list({ items, height: -10 })
      const [model] = builder.init()

      // Height is stored as-is, but pagination should handle it
      expect(model).toBeDefined()
    })

    it('should handle negative width', () => {
      const items = createMockItems(5)
      const builder = list({ items, width: -10 })
      const [model] = builder.init()

      // Width is stored as-is, but rendering should handle it
      expect(model).toBeDefined()
    })

    it('should handle very large height', () => {
      const items = createMockItems(5)
      const builder = list({ items, height: 10000 })
      const [model] = builder.init()

      expect(model.height).toBe(10000)
    })

    it('should handle very large width', () => {
      const items = createMockItems(5)
      const builder = list({ items, width: 10000 })
      const [model] = builder.init()

      expect(model.width).toBe(10000)
    })

    it('should handle empty title', () => {
      const items = createMockItems(5)
      const builder = list({ items, title: '' })
      const [model] = builder.init()

      expect(model.title).toBe('')
    })

    it('should handle undefined title', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [model] = builder.init()

      // Should use default or empty title
      expect(model.title).toBeDefined()
    })
  })

  describe('generic type parameter handling', () => {
    it('should work with DefaultItem type', () => {
      const items: DefaultItem[] = createMockItems(5)
      const builder = list<DefaultItem>({ items })
      const [model] = builder.init()

      expect(model.items).toEqual(items)
      expect(model.items[0]).toBeInstanceOf(DefaultItem)
    })

    it('should work with custom Item type', () => {
      const items: TodoItem[] = [
        createTodoItem(1, 'Buy milk'),
        createTodoItem(2, 'Walk dog', true),
        createTodoItem(3, 'Write tests'),
      ]
      const builder = list<TodoItem>({ items })
      const [model] = builder.init()

      expect(model.items).toEqual(items)
      expect(model.items[0]?.id).toBe(1)
      expect(model.items[1]?.completed).toBe(true)
    })

    it('should preserve custom item properties', () => {
      const items: TodoItem[] = [
        createTodoItem(1, 'Task 1', false),
        createTodoItem(2, 'Task 2', true),
      ]
      const builder = list<TodoItem>({ items })
      const [model] = builder.init()

      const firstItem = model.items[0]
      expect(firstItem).toBeDefined()
      if (firstItem) {
        expect(firstItem.id).toBe(1)
        expect(firstItem.completed).toBe(false)
        expect(firstItem.title()).toBe('Task 1')
      }
    })

    it('should work with items implementing Item interface', () => {
      const customItem: Item = {
        filterValue: () => 'test',
        title: () => 'Test Item',
        description: () => 'A test item',
      }
      const builder = list({ items: [customItem] })
      const [model] = builder.init()

      expect(model.items[0]).toBe(customItem)
      expect(model.items[0]?.title()).toBe('Test Item')
    })
  })

  describe('model lifecycle', () => {
    it('should render initial list', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })

    it('should handle update messages', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }
      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should maintain items through updates', () => {
      const items = createMockItems(5)
      const builder = list({ items })
      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }
      const [updatedModel] = builder.update(initialModel, mockMsg)

      expect(updatedModel.items).toEqual(items)
    })

    it('should render with different item counts', () => {
      const builderWith3 = list({ items: createMockItems(3) })
      const [modelWith3] = builderWith3.init()
      const renderedWith3 = builderWith3.view(modelWith3)
      expect(renderedWith3).toBeDefined()

      const builderWith10 = list({ items: createMockItems(10) })
      const [modelWith10] = builderWith10.init()
      const renderedWith10 = builderWith10.view(modelWith10)
      expect(renderedWith10).toBeDefined()
    })

    it('should render empty list', () => {
      const builder = list({ items: [] })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })
  })

  describe('negative cases', () => {
    it('should handle items with empty filter values', () => {
      const items: Item[] = [
        {
          filterValue: () => '',
          title: () => 'Empty Filter',
          description: () => 'Has no filter value',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items.length).toBe(1)
      expect(model.items[0]?.filterValue()).toBe('')
    })

    it('should handle items with empty titles', () => {
      const items: Item[] = [
        {
          filterValue: () => 'test',
          title: () => '',
          description: () => 'Empty title',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items[0]?.title()).toBe('')
    })

    it('should handle items with empty descriptions', () => {
      const items: Item[] = [
        {
          filterValue: () => 'test',
          title: () => 'Test',
          description: () => '',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items[0]?.description()).toBe('')
    })

    it('should handle partial styles without crashing', () => {
      const items = createMockItems(5)
      const partialStyles = {
        titleBar: new Style().bold(),
        // Intentionally omit other style properties
      }
      const builder = list({ items, styles: partialStyles })
      const [model] = builder.init()

      // Should merge with defaults
      expect(model.styles).toBeDefined()
      expect(model.styles.titleBar).toBe(partialStyles.titleBar)
    })

    it('should handle empty styles object', () => {
      const items = createMockItems(5)
      const builder = list({ items, styles: {} })
      const [model] = builder.init()

      // Should use default styles
      expect(model.styles).toBeDefined()
    })

    it('should not crash with undefined delegate', () => {
      const items = createMockItems(5)
      const builder = list({ items, delegate: undefined })
      const [model] = builder.init()

      // Should use default delegate
      expect(model.delegate).toBeDefined()
    })

    it('should handle items with very long filter values', () => {
      const longText = 'a'.repeat(10000)
      const items: Item[] = [
        {
          filterValue: () => longText,
          title: () => 'Long filter',
          description: () => 'Has very long filter value',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items[0]?.filterValue()).toBe(longText)
    })

    it('should handle items with special characters in filter values', () => {
      const items: Item[] = [
        {
          filterValue: () => '!@#$%^&*()',
          title: () => 'Special chars',
          description: () => 'Has special characters',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items[0]?.filterValue()).toBe('!@#$%^&*()')
    })

    it('should handle items with unicode characters', () => {
      const items: Item[] = [
        {
          filterValue: () => '你好世界 🌍',
          title: () => 'Unicode test',
          description: () => 'Has unicode chars',
        },
      ]
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.items[0]?.filterValue()).toBe('你好世界 🌍')
    })

    it('should handle inconsistent filteringEnabled and showFilter', () => {
      const items = createMockItems(5)
      const builder = list({
        items,
        filteringEnabled: false,
        showFilter: true, // Conflicting options
      })
      const [model] = builder.init()

      expect(model.filteringEnabled).toBe(false)
      expect(model.showFilter).toBe(true)
      // Rendering should handle the conflict gracefully
      const rendered = builder.view(model)
      expect(rendered).toBeDefined()
    })
  })

  describe('filtering and pagination', () => {
    it('should initialize with all items visible when no filter', () => {
      const items = createMockItems(10)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.filteredItems).toEqual(items)
      expect(model.filteredItems.length).toBe(10)
    })

    it('should initialize paginator', () => {
      const items = createMockItems(20)
      const builder = list({ items, height: 10 })
      const [model] = builder.init()

      expect(model.paginator).toBeDefined()
    })

    it('should handle pagination with more items than page size', () => {
      const items = createMockItems(50)
      const builder = list({ items, height: 10 })
      const [model] = builder.init()

      expect(model.items.length).toBe(50)
      expect(model.paginator).toBeDefined()
    })

    it('should handle pagination with fewer items than page size', () => {
      const items = createMockItems(5)
      const builder = list({ items, height: 20 })
      const [model] = builder.init()

      expect(model.items.length).toBe(5)
    })

    it('should initialize with cursor at 0', () => {
      const items = createMockItems(10)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.cursor).toBe(0)
    })

    it('should handle empty filter value initially', () => {
      const items = createMockItems(10)
      const builder = list({ items })
      const [model] = builder.init()

      expect(model.filterValue).toBe('')
    })
  })

  describe('rendering variations', () => {
    it('should render with title visible', () => {
      const items = createMockItems(5)
      const builder = list({ items, title: 'My Title', showTitle: true })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should render without title when hidden', () => {
      const items = createMockItems(5)
      const builder = list({ items, showTitle: false })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should render without filter when hidden', () => {
      const items = createMockItems(5)
      const builder = list({ items, showFilter: false })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should render without pagination when hidden', () => {
      const items = createMockItems(20)
      const builder = list({ items, showPagination: false })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should render without status bar when hidden', () => {
      const items = createMockItems(5)
      const builder = list({ items, showStatusBar: false })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should render with all UI elements hidden', () => {
      const items = createMockItems(5)
      const builder = list({
        items,
        showTitle: false,
        showFilter: false,
        showPagination: false,
        showHelp: false,
        showStatusBar: false,
      })
      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })
  })
})

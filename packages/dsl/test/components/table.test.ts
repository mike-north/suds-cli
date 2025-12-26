import { describe, expect, it } from 'vitest'
import { table } from '../../src/components/table.js'
import type { Column, Row } from '@boba-cli/table'
import { borderStyles } from '@boba-cli/chapstick'
import { Style } from '@boba-cli/chapstick'

describe('table component builder', () => {
  // Test helper: create basic columns for reuse
  const createBasicColumns = (): Column[] => [
    { title: 'Name', width: 20 },
    { title: 'Age', width: 10 },
  ]

  // Test helper: create basic rows for reuse
  const createBasicRows = (): Row[] => [
    ['Alice', '30'],
    ['Bob', '25'],
    ['Charlie', '35'],
  ]

  describe('initialization', () => {
    it('should create a component builder with columns and rows', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with columns only (empty rows)', () => {
      const builder = table({
        columns: createBasicColumns(),
      })

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.columns).toHaveLength(2)
      expect(model.rows).toHaveLength(0)
    })

    it('should initialize with empty rows array', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: [],
      })

      const [model] = builder.init()

      expect(model.rows).toHaveLength(0)
    })

    it('should return null cmd from init', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      const [_model, cmd] = builder.init()

      expect(cmd).toBeNull()
    })
  })

  describe('custom dimensions', () => {
    it('should set custom height', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        height: 2,
      })

      const [model] = builder.init()

      expect(model.height).toBe(2)
    })

    it('should set custom width', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        width: 100,
      })

      const [model] = builder.init()

      expect(model.width).toBe(100)
    })

    it('should default height to number of rows when not specified', () => {
      const rows = createBasicRows()
      const builder = table({
        columns: createBasicColumns(),
        rows,
      })

      const [model] = builder.init()

      expect(model.height).toBe(rows.length)
    })

    it('should handle zero height', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        height: 0,
      })

      const [model] = builder.init()

      expect(model.height).toBe(0)
    })
  })

  describe('borders and styling', () => {
    it('should initialize without borders by default', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      const [model] = builder.init()

      expect(model.bordered).toBe(false)
    })

    it('should initialize with borders when specified', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        bordered: true,
      })

      const [model] = builder.init()

      expect(model.bordered).toBe(true)
    })

    it('should accept custom border style', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        bordered: true,
        borderStyle: borderStyles.rounded,
      })

      const [model] = builder.init()

      expect(model.styles.borderStyle).toBe(borderStyles.rounded)
    })

    it('should accept custom table styles', () => {
      const customHeaderStyle = new Style().foreground('#FF0000')
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        styles: {
          header: customHeaderStyle,
        },
      })

      const [model] = builder.init()

      expect(model.styles.header).toBe(customHeaderStyle)
    })
  })

  describe('focus state', () => {
    it('should initialize with focused=false by default', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      const [model] = builder.init()

      expect(model.focused).toBe(false)
    })

    it('should initialize with focused=true when specified', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        focused: true,
      })

      const [model] = builder.init()

      expect(model.focused).toBe(true)
    })
  })

  describe('key mappings', () => {
    it('should accept custom key mappings', () => {
      const customKeyMap = {
        lineUp: ['w'],
        lineDown: ['s'],
        pageUp: ['W'],
        pageDown: ['S'],
        halfPageUp: ['u'],
        halfPageDown: ['d'],
        gotoTop: ['g', 'g'],
        gotoBottom: ['G'],
      }

      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        keyMap: customKeyMap,
      })

      const [model] = builder.init()

      expect(model.keyMap.lineUp).toEqual(['w'])
      expect(model.keyMap.lineDown).toEqual(['s'])
    })

    it('should merge partial key mappings with defaults', () => {
      const partialKeyMap = {
        lineUp: ['w'],
      }

      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        keyMap: partialKeyMap,
      })

      const [model] = builder.init()

      expect(model.keyMap.lineUp).toEqual(['w'])
      // Other keys should remain defaults (not testing exact defaults, just that they exist)
      expect(model.keyMap.lineDown).toBeDefined()
      expect(model.keyMap.pageUp).toBeDefined()
    })
  })

  describe('view rendering', () => {
    it('should render table content', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
      expect(rendered.length).toBeGreaterThan(0)
    })

    it('should render empty table with columns but no rows', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: [],
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
      expect(typeof rendered).toBe('string')
    })
  })

  describe('update behavior', () => {
    it('should handle update messages', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        focused: true,
      })

      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }
      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should return null cmd for unhandled messages', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
      })

      const [initialModel] = builder.init()
      const mockMsg = { type: 'unknown' }
      const [_updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(cmd).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle mismatched column/row counts', () => {
      const builder = table({
        columns: createBasicColumns(), // 2 columns
        rows: [
          ['Alice', '30', 'Extra'], // 3 values
          ['Bob'], // 1 value
        ],
      })

      const [model] = builder.init()

      expect(model.rows).toHaveLength(2)
      expect(model.columns).toHaveLength(2)
    })

    it('should handle zero height with rows', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        height: 0,
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(model.height).toBe(0)
      expect(rendered).toBeDefined()
    })

    it('should handle single column', () => {
      const builder = table({
        columns: [{ title: 'Name', width: 20 }],
        rows: [['Alice'], ['Bob']],
      })

      const [model] = builder.init()

      expect(model.columns).toHaveLength(1)
      expect(model.rows).toHaveLength(2)
    })

    it('should handle single row', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: [['Alice', '30']],
      })

      const [model] = builder.init()

      expect(model.rows).toHaveLength(1)
    })

    it('should handle very narrow columns', () => {
      const builder = table({
        columns: [
          { title: 'A', width: 1 },
          { title: 'B', width: 1 },
        ],
        rows: [
          ['X', 'Y'],
          ['Z', 'W'],
        ],
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBeDefined()
    })

    it('should handle very wide table', () => {
      const builder = table({
        columns: [
          { title: 'Column1', width: 100 },
          { title: 'Column2', width: 100 },
        ],
        rows: [['value1', 'value2']],
      })

      const [model] = builder.init()

      expect(model.columns).toHaveLength(2)
    })
  })

  describe('negative tests', () => {
    it('should handle empty columns array', () => {
      const builder = table({
        columns: [],
        rows: [],
      })

      const [model] = builder.init()

      expect(model.columns).toHaveLength(0)
      expect(model.rows).toHaveLength(0)
    })

    it('should handle rows with all empty strings', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: [
          ['', ''],
          ['', ''],
        ],
      })

      const [model] = builder.init()

      expect(model.rows).toHaveLength(2)
      expect(model.rows[0]).toEqual(['', ''])
    })

    it('should handle negative height (should clamp to 0)', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        height: -5,
      })

      const [model] = builder.init()

      expect(model.height).toBe(0)
    })

    it('should handle negative width (stored as-is in model)', () => {
      const builder = table({
        columns: createBasicColumns(),
        rows: createBasicRows(),
        width: -10,
      })

      const [model] = builder.init()

      // TableModel.new() does not clamp width, but rendering methods handle negative values gracefully
      expect(model.width).toBe(-10)
    })

    it('should handle columns with zero width', () => {
      const builder = table({
        columns: [
          { title: 'Name', width: 0 },
          { title: 'Age', width: 0 },
        ],
        rows: createBasicRows(),
      })

      const [model] = builder.init()

      expect(model.columns).toHaveLength(2)
    })

    it('should handle columns with negative width (should clamp to 0)', () => {
      const builder = table({
        columns: [
          { title: 'Name', width: -10 },
          { title: 'Age', width: -5 },
        ],
        rows: createBasicRows(),
      })

      const [model] = builder.init()

      expect(model.columns).toHaveLength(2)
      expect(model.columnWidths[0]).toBe(0)
      expect(model.columnWidths[1]).toBe(0)
    })
  })
})

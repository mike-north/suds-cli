import { describe, expect, it } from 'vitest'
import { paginator } from '../../src/components/paginator.js'

describe('paginator component builder', () => {
  // Test helper: create basic dots paginator options
  const createDotsOptions = () => ({
    type: 'dots' as const,
    perPage: 1,
    totalItems: 5,
  })

  // Test helper: create basic arabic paginator options
  const createArabicOptions = () => ({
    type: 'arabic' as const,
    perPage: 10,
    totalItems: 100,
  })

  describe('initialization', () => {
    it('should create a component builder with dots type', () => {
      const builder = paginator(createDotsOptions())

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should create a component builder with arabic type', () => {
      const builder = paginator(createArabicOptions())

      expect(builder).toBeDefined()
      expect(builder.init).toBeDefined()
      expect(builder.update).toBeDefined()
      expect(builder.view).toBeDefined()
    })

    it('should initialize with dots type correctly', () => {
      const builder = paginator(createDotsOptions())

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.perPage).toBe(1)
      expect(model.totalPages).toBe(5) // 5 items / 1 per page = 5 pages
    })

    it('should initialize with arabic type correctly', () => {
      const builder = paginator(createArabicOptions())

      const [model] = builder.init()

      expect(model).toBeDefined()
      expect(model.perPage).toBe(10)
      expect(model.totalPages).toBe(10) // 100 items / 10 per page = 10 pages
    })

    it('should return null cmd from init', () => {
      const builder = paginator(createDotsOptions())

      const [_model, cmd] = builder.init()

      expect(cmd).toBeNull()
    })
  })

  describe('required options', () => {
    it('should require type option', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 10,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model).toBeDefined()
    })

    it('should require perPage option', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 5,
        totalItems: 50,
      })

      const [model] = builder.init()

      expect(model.perPage).toBe(5)
    })

    it('should require totalItems option', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 75,
      })

      const [model] = builder.init()

      // totalItems / perPage = totalPages (75 / 10 = 7.5, rounded up = 8)
      expect(model.totalPages).toBe(8)
    })
  })

  describe('page calculation', () => {
    it('should calculate total pages from totalItems and perPage', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(10) // 100 / 10 = 10
    })

    it('should round up partial pages', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 95,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(10) // 95 / 10 = 9.5, rounded up = 10
    })

    it('should handle single item', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 1,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(1)
    })

    it('should handle exact division', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 20,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(5) // 100 / 20 = 5
    })
  })

  describe('custom page start', () => {
    it('should start at page 0 by default', () => {
      const builder = paginator(createArabicOptions())

      const [model] = builder.init()

      expect(model.page).toBe(0)
    })

    it('should start at custom page when specified', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 5,
      })

      const [model] = builder.init()

      expect(model.page).toBe(5)
    })

    it('should handle page beyond total pages (clamped during navigation)', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 999,
      })

      const [model] = builder.init()

      // The model stores the page as-is (999), but navigation methods handle clamping
      expect(model.page).toBe(999)
      expect(model.onLastPage()).toBe(true)
    })
  })

  describe('custom dot characters', () => {
    it('should use default active dot (•)', () => {
      const builder = paginator(createDotsOptions())

      const [model] = builder.init()

      expect(model.activeDot).toBe('•')
    })

    it('should use default inactive dot (○)', () => {
      const builder = paginator(createDotsOptions())

      const [model] = builder.init()

      expect(model.inactiveDot).toBe('○')
    })

    it('should accept custom activeDot', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 5,
        activeDot: '●',
      })

      const [model] = builder.init()

      expect(model.activeDot).toBe('●')
    })

    it('should accept custom inactiveDot', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 5,
        inactiveDot: '◯',
      })

      const [model] = builder.init()

      expect(model.inactiveDot).toBe('◯')
    })

    it('should accept both custom dot characters', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 5,
        activeDot: '■',
        inactiveDot: '□',
      })

      const [model] = builder.init()

      expect(model.activeDot).toBe('■')
      expect(model.inactiveDot).toBe('□')
    })
  })

  describe('custom arabic format', () => {
    it('should use default format (%d/%d)', () => {
      const builder = paginator(createArabicOptions())

      const [model] = builder.init()

      expect(model.arabicFormat).toBe('%d/%d')
    })

    it('should accept custom arabic format', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        arabicFormat: 'Page %d of %d',
      })

      const [model] = builder.init()

      expect(model.arabicFormat).toBe('Page %d of %d')
    })

    it('should render with custom format', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 2,
        arabicFormat: 'Page %d of %d',
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBe('Page 3 of 10') // page 2 is the 3rd page (0-indexed)
    })
  })

  describe('custom key mappings', () => {
    it('should accept custom key mappings', () => {
      const customKeyMap = {
        nextPage: ['n', 'space'],
        prevPage: ['p', 'backspace'],
      }

      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        keyMap: customKeyMap,
      })

      const [model] = builder.init()

      expect(model.keyMap.nextPage).toEqual(['n', 'space'])
      expect(model.keyMap.prevPage).toEqual(['p', 'backspace'])
    })
  })

  describe('view rendering', () => {
    it('should render dots pagination', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 3,
        page: 1,
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBe('○•○') // 2nd dot active (0-indexed page 1)
    })

    it('should render arabic pagination', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 0,
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBe('1/10') // page 0 is displayed as page 1
    })

    it('should render dots with custom characters', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 3,
        page: 0,
        activeDot: '■',
        inactiveDot: '□',
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBe('■□□')
    })

    it('should render arabic with custom format', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 5,
        totalItems: 25,
        page: 3,
        arabicFormat: '[%d/%d]',
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      expect(rendered).toBe('[4/5]')
    })
  })

  describe('update behavior', () => {
    it('should handle update messages', () => {
      const builder = paginator(createArabicOptions())

      const [initialModel] = builder.init()
      const mockMsg = { type: 'test' }
      const [updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(updatedModel).toBeDefined()
      expect(cmd).toBeDefined()
    })

    it('should return null cmd for unhandled messages', () => {
      const builder = paginator(createArabicOptions())

      const [initialModel] = builder.init()
      const mockMsg = { type: 'unknown' }
      const [_updatedModel, cmd] = builder.update(initialModel, mockMsg)

      expect(cmd).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('should handle perPage=1 with large totalItems', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 1,
        totalItems: 1000,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(1000)
    })

    it('should handle totalItems=1 with perPage=1', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 1,
        totalItems: 1,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(1)
      expect(model.page).toBe(0)
    })

    it('should handle large perPage exceeding totalItems', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 100,
        totalItems: 10,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(1) // Only 1 page needed
    })

    it('should handle single page scenario', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 10,
        totalItems: 5,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(1)
      expect(model.onFirstPage()).toBe(true)
      expect(model.onLastPage()).toBe(true)
    })

    it('should handle many pages (dots)', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model.totalPages).toBe(100)
    })
  })

  describe('negative tests', () => {
    it('should handle perPage=0 (clamped to 1)', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 0,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model.perPage).toBe(1) // Should be clamped to minimum 1
    })

    it('should handle negative perPage (clamped to 1)', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: -10,
        totalItems: 100,
      })

      const [model] = builder.init()

      expect(model.perPage).toBe(1)
    })

    it('should handle totalItems=0 (model handles it gracefully)', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 0,
      })

      const [model] = builder.init()

      // setTotalPages returns early for items < 1, so totalPages defaults to 1
      expect(model.totalPages).toBe(1)
    })

    it('should handle negative totalItems', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: -50,
      })

      const [model] = builder.init()

      // setTotalPages returns early for items < 1, so totalPages defaults to 1
      expect(model.totalPages).toBe(1)
    })

    it('should handle negative page (clamped to 0)', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: -5,
      })

      const [model] = builder.init()

      expect(model.page).toBe(0) // Should be clamped to minimum 0
    })

    it('should handle empty custom format', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        arabicFormat: '',
      })

      const [model] = builder.init()

      expect(model.arabicFormat).toBe('')
    })

    it('should handle format with no %d placeholders', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 0,
        arabicFormat: 'Static text',
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      // First %d not found, second %d not found, returns as-is
      expect(rendered).toBe('Static text')
    })

    it('should handle format with only one %d', () => {
      const builder = paginator({
        type: 'arabic',
        perPage: 10,
        totalItems: 100,
        page: 2,
        arabicFormat: 'Page %d',
      })

      const [model] = builder.init()
      const rendered = builder.view(model)

      // First %d replaced with current page, second %d not found
      expect(rendered).toBe('Page 3')
    })

    it('should handle empty dot characters', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 3,
        activeDot: '',
        inactiveDot: '',
      })

      const [model] = builder.init()

      expect(model.activeDot).toBe('')
      expect(model.inactiveDot).toBe('')
    })

    it('should handle very long dot characters', () => {
      const builder = paginator({
        type: 'dots',
        perPage: 1,
        totalItems: 3,
        activeDot: '>>>',
        inactiveDot: '---',
      })

      const [model] = builder.init()

      expect(model.activeDot).toBe('>>>')
      expect(model.inactiveDot).toBe('---')
    })
  })
})

import { describe, expect, it } from 'vitest'
import { KeyMsg, KeyType } from '@boba-cli/tea'
import { DefaultItem, ListModel } from '../src/index.js'

function keyMsg(
  type: KeyType,
  runes = '',
  alt = false,
): KeyMsg {
  return new KeyMsg({ type, runes, alt, paste: false })
}

describe('ListModel', () => {
  it('creates a model with default items', () => {
    const model = ListModel.new({
      items: [new DefaultItem('Alpha'), new DefaultItem('Beta')],
      showPagination: false,
    })
    expect(model.selectedItem()?.title()).toBe('Alpha')
    expect(model.visibleItems()).toHaveLength(2)
  })

  it('filters items with fuzzy matching', () => {
    const model = ListModel.new({
      items: [new DefaultItem('Alpha'), new DefaultItem('Beta')],
      showPagination: false,
    })

    const filtered = model.setFilter('alp').acceptFilter()
    expect(filtered.filteredItems.map((i) => i.title())).toEqual(['Alpha'])
    expect(filtered.filterState).toBe('applied')
  })

  describe('filter character input', () => {
    it('appends typed characters when in filtering mode', () => {
      const model = ListModel.new({
        items: [new DefaultItem('Apple'), new DefaultItem('Banana')],
        showPagination: false,
      })

      const filtering = model.startFiltering()
      expect(filtering.filterState).toBe('filtering')
      expect(filtering.filterValue).toBe('')

      // Type 'a'
      const [afterA] = filtering.update(keyMsg(KeyType.Runes, 'a'))
      expect(afterA.filterValue).toBe('a')

      // Type 'p'
      const [afterAP] = afterA.update(keyMsg(KeyType.Runes, 'p'))
      expect(afterAP.filterValue).toBe('ap')
      expect(afterAP.filteredItems.map((i) => i.title())).toEqual(['Apple'])
    })

    it('handles space key during filtering', () => {
      const model = ListModel.new({
        items: [new DefaultItem('Red Apple'), new DefaultItem('Banana')],
        showPagination: false,
      })

      const filtering = model.startFiltering()

      // Type 'red' then space
      let [current] = filtering.update(keyMsg(KeyType.Runes, 'red'))
      ;[current] = current.update(keyMsg(KeyType.Space, ' '))
      expect(current.filterValue).toBe('red ')

      // Type 'a'
      ;[current] = current.update(keyMsg(KeyType.Runes, 'a'))
      expect(current.filterValue).toBe('red a')
    })

    it('removes last character on backspace', () => {
      const model = ListModel.new({
        items: [new DefaultItem('Apple'), new DefaultItem('Banana')],
        showPagination: false,
      })

      const filtering = model.startFiltering().setFilter('app')
      expect(filtering.filterValue).toBe('app')

      const [afterBackspace] = filtering.update(keyMsg(KeyType.Backspace))
      expect(afterBackspace.filterValue).toBe('ap')

      // Backspace on empty string should stay empty
      const emptyFilter = model.startFiltering()
      const [stillEmpty] = emptyFilter.update(keyMsg(KeyType.Backspace))
      expect(stillEmpty.filterValue).toBe('')
    })

    it('ignores alt+character during filtering', () => {
      const model = ListModel.new({
        items: [new DefaultItem('Apple')],
        showPagination: false,
      })

      const filtering = model.startFiltering()
      const [afterAlt] = filtering.update(keyMsg(KeyType.Runes, 'a', true))
      expect(afterAlt.filterValue).toBe('')
    })

    it('does not restart filtering when already in filter mode', () => {
      const model = ListModel.new({
        items: [new DefaultItem('Apple/Pie'), new DefaultItem('Banana')],
        showPagination: false,
      })

      const filtering = model.startFiltering().setFilter('app')
      expect(filtering.filterValue).toBe('app')

      // Pressing '/' should add to filter, not restart
      const [afterSlash] = filtering.update(keyMsg(KeyType.Runes, '/'))
      expect(afterSlash.filterValue).toBe('app/')
      expect(afterSlash.filterState).toBe('filtering')
    })
  })
})

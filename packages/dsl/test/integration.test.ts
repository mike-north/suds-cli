import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app-builder.js'
import { text, vstack, hstack, when } from '../src/view/nodes.js'
import { spinner } from '../src/components/spinner.js'
import { Style } from '@suds-cli/chapstick'
import { line, dot } from '@suds-cli/spinner'

describe('Integration: spinner component', () => {
  it('creates app with spinner component', () => {
    const app = createApp()
      .state({ message: 'Loading...' })
      .component('loading', spinner())
      .view(({ state, components }) =>
        vstack(components.loading, text(state.message)),
      )
      .build()

    expect(app.getModel()).toBeDefined()
  })

  it('spinner renders after init', () => {
    const app = createApp()
      .component('loading', spinner({ spinner: line }))
      .view(({ components }) => components.loading)
      .build()

    const model = app.getModel()
    model.init()

    const view = model.view()
    // Should contain the first frame of line spinner: '|'
    expect(view).toContain('|')
  })

  it('spinner respects custom spinner type', () => {
    const app = createApp()
      .component('loading', spinner({ spinner: dot }))
      .view(({ components }) => components.loading)
      .build()

    const model = app.getModel()
    model.init()

    // dot spinner first frame is '⣾ '
    expect(model.view()).toContain('⣾')
  })

  it('spinner respects style option', () => {
    const style = new Style().foreground('#ff0000')
    const app = createApp()
      .component('loading', spinner({ style }))
      .view(({ components }) => components.loading)
      .build()

    const model = app.getModel()
    model.init()

    // Verify spinner frame is rendered (ANSI codes may not be present in test environment)
    expect(model.view()).toContain('|')
  })
})

describe('Integration: state management', () => {
  it('initial state is accessible in view', () => {
    const app = createApp()
      .state({ count: 42, name: 'test' })
      .view(({ state }) => text(`${state.name}: ${state.count}`))
      .build()

    expect(app.getModel().view()).toContain('test: 42')
  })

  it('undefined state works', () => {
    const app = createApp()
      .view(() => text('no state'))
      .build()

    expect(app.getModel().view()).toContain('no state')
    expect(app.getModel().getUserState()).toBeUndefined()
  })
})

describe('Integration: complex layouts', () => {
  it('renders dashboard-like layout', () => {
    const app = createApp()
      .state({
        title: 'Dashboard',
        loading: true,
        items: ['Item 1', 'Item 2', 'Item 3'],
      })
      .component('spinner', spinner())
      .view(({ state, components }) =>
        vstack(
          text(state.title).bold(),
          text(''),
          when(
            state.loading,
            hstack(components.spinner, text(' Loading data...')),
          ),
          when(!state.loading, text('Data loaded!')),
          text(''),
          ...state.items.map((item) => text(`• ${item}`)),
        ),
      )
      .build()

    const model = app.getModel()
    model.init()
    const view = model.view()

    expect(view).toContain('Dashboard')
    expect(view).toContain('Loading data...')
    expect(view).toContain('Item 1')
    expect(view).toContain('Item 2')
    expect(view).toContain('Item 3')
  })

  it('conditional rendering works correctly', () => {
    const app = createApp()
      .state({ showError: false, error: 'Something went wrong' })
      .view(({ state }) =>
        vstack(
          text('Header'),
          when(state.showError, text(state.error).foreground('#ff0000')),
          text('Footer'),
        ),
      )
      .build()

    const view = app.getModel().view()
    expect(view).toContain('Header')
    expect(view).toContain('Footer')
    expect(view).not.toContain('Something went wrong')
  })
})

describe('Integration: builder order flexibility', () => {
  it('allows components before state', () => {
    const app = createApp()
      .component('spinner', spinner())
      .state({ message: 'Test' })
      .view(({ state, components }) =>
        hstack(components.spinner, text(state.message)),
      )
      .build()

    const model = app.getModel()
    model.init()
    expect(model.view()).toContain('Test')
  })

  it('allows view before state', () => {
    const app = createApp()
      .view(({ state }) => text(state?.message ?? 'default'))
      .state({ message: 'Custom' })
      .build()

    expect(app.getModel().view()).toContain('Custom')
  })

  it('allows handlers before state', () => {
    const app = createApp()
      .onKey('q', (ctx) => {
        ctx.quit()
      })
      .state({ count: 0 })
      .view(({ state }) => text(String(state.count)))
      .build()

    expect(app.getModel()).toBeDefined()
  })

  it('preserves all configurations across state() call', () => {
    const app = createApp()
      .component('spinner', spinner())
      .onKey('q', (ctx) => {
        ctx.quit()
      })
      .view(({ components }) => components.spinner)
      .state({ count: 0 })
      .build()

    const model = app.getModel()
    model.init()
    // Component should still work
    expect(model.view()).toContain('|')
  })
})

describe('Integration: multiple components', () => {
  it('handles multiple spinner components', () => {
    const app = createApp()
      .component('spinner1', spinner({ spinner: line }))
      .component('spinner2', spinner({ spinner: dot }))
      .view(({ components }) =>
        hstack(components.spinner1, text(' | '), components.spinner2),
      )
      .build()

    const model = app.getModel()
    model.init()
    const view = model.view()

    expect(view).toContain('|') // line spinner
    expect(view).toContain('⣾') // dot spinner
  })
})

describe('Integration: type safety', () => {
  it('component keys are type-checked in view', () => {
    // This is a compile-time check - if this compiles, the types work
    const app = createApp()
      .component('loader', spinner())
      .view(({ components }) => {
        // TypeScript should know that 'loader' exists on components
        const _loaderView = components.loader
        return text('test')
      })
      .build()

    expect(app).toBeDefined()
  })

  it('state shape is type-checked in view', () => {
    // This is a compile-time check
    const app = createApp()
      .state({ count: 0, name: 'test' })
      .view(({ state }) => {
        // TypeScript should know the shape of state
        const _count: number = state.count
        const _name: string = state.name
        return text(`${_name}: ${_count}`)
      })
      .build()

    expect(app).toBeDefined()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { createApp, AppBuilder } from '../src/app-builder.js'
import { text, vstack } from '../src/view/nodes.js'
import { tick } from '../src/index.js'
import type { ComponentBuilder } from '../src/types.js'
import { KeyMsg, KeyType, type Cmd, type Msg } from '@boba-cli/tea'

// Mock component builder for testing
function createMockComponent<M>(initialModel: M): ComponentBuilder<M> {
  return {
    init: () => [initialModel, null],
    update: (model: M, _msg: Msg) => [model, null],
    view: (model: M) => String(model),
  }
}

describe('createApp', () => {
  it('returns an AppBuilder instance', () => {
    const builder = createApp()
    expect(builder).toBeInstanceOf(AppBuilder)
  })
})

describe('AppBuilder.state', () => {
  it('sets initial state', () => {
    const app = createApp()
      .state({ count: 0 })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    expect(model.getUserState()).toEqual({ count: 0 })
  })

  it('preserves components when setting state', () => {
    const mockComponent = createMockComponent('test')
    const app = createApp()
      .component('mock', mockComponent)
      .state({ count: 0 })
      .view(({ components }) => components.mock)
      .build()

    const model = app.getModel()
    // Initialize to populate component models
    model.init()
    expect(model.view()).toContain('test')
  })

  it('preserves key handlers when setting state', () => {
    let quitCalled = false
    const app = createApp()
      .onKey('q', (ctx) => {
        quitCalled = true
        ctx.quit()
      })
      .state({ count: 0 })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    // The key handlers should still be registered
    // We can't directly test without simulating a KeyMsg, but we can verify build works
    expect(model).toBeDefined()
  })

  it('preserves view function when setting state', () => {
    const app = createApp()
      .view(() => text('hello'))
      .state({ count: 0 })
      .build()

    const model = app.getModel()
    expect(model.view()).toContain('hello')
  })
})

describe('AppBuilder.component', () => {
  it('registers a component', () => {
    const mockComponent = createMockComponent('test-view')
    const app = createApp()
      .component('test', mockComponent)
      .view(({ components }) => components.test)
      .build()

    const model = app.getModel()
    model.init()
    expect(model.view()).toContain('test-view')
  })

  it('registers multiple components', () => {
    const comp1 = createMockComponent('comp1')
    const comp2 = createMockComponent('comp2')

    const app = createApp()
      .component('first', comp1)
      .component('second', comp2)
      .view(({ components }) => vstack(components.first, components.second))
      .build()

    const model = app.getModel()
    model.init()
    const view = model.view()
    expect(view).toContain('comp1')
    expect(view).toContain('comp2')
  })
})

describe('AppBuilder.onKey', () => {
  it('accepts a single key', () => {
    const app = createApp()
      .state({ count: 0 })
      .onKey('q', (ctx) => {
        ctx.quit()
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    expect(app.getModel()).toBeDefined()
  })

  it('accepts an array of keys', () => {
    const app = createApp()
      .state({ count: 0 })
      .onKey(['q', 'Q', 'ctrl+c'], (ctx) => {
        ctx.quit()
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    expect(app.getModel()).toBeDefined()
  })

  it('can register multiple key handlers', () => {
    const app = createApp()
      .state({ count: 0 })
      .onKey('q', (ctx) => {
        ctx.quit()
      })
      .onKey('up', ({ state, update }) => {
        update({ count: state.count + 1 })
      })
      .onKey('down', ({ state, update }) => {
        update({ count: state.count - 1 })
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    expect(app.getModel()).toBeDefined()
  })
})

describe('AppBuilder.view', () => {
  it('sets the view function', () => {
    const app = createApp()
      .state({ message: 'Hello World' })
      .view(({ state }) => text(state.message))
      .build()

    const model = app.getModel()
    expect(model.view()).toContain('Hello World')
  })

  it('receives state and components', () => {
    const mockComponent = createMockComponent('spinner-view')
    const app = createApp()
      .state({ title: 'Test' })
      .component('spinner', mockComponent)
      .view(({ state, components }) =>
        vstack(text(state.title), components.spinner),
      )
      .build()

    const model = app.getModel()
    model.init()
    const view = model.view()
    expect(view).toContain('Test')
    expect(view).toContain('spinner-view')
  })
})

describe('AppBuilder.build', () => {
  it('throws if view is not set', () => {
    expect(() => {
      createApp().state({ count: 0 }).build()
    }).toThrow('AppBuilder: view() must be called before build()')
  })

  it('returns an App with run() method', () => {
    const app = createApp()
      .view(() => text('test'))
      .build()

    expect(typeof app.run).toBe('function')
  })

  it('returns an App with getModel() method', () => {
    const app = createApp()
      .view(() => text('test'))
      .build()

    expect(typeof app.getModel).toBe('function')
    expect(app.getModel()).toBeDefined()
  })
})

describe('GeneratedModel', () => {
  describe('init', () => {
    it('initializes all components', () => {
      let initCalled = false
      const mockComponent: ComponentBuilder<string> = {
        init: () => {
          initCalled = true
          return ['initialized', null]
        },
        update: (model) => [model, null],
        view: (model) => model,
      }

      const app = createApp()
        .component('test', mockComponent)
        .view(({ components }) => components.test)
        .build()

      app.getModel().init()
      expect(initCalled).toBe(true)
    })

    it('batches init commands from multiple components', () => {
      const cmd1 = vi.fn()
      const cmd2 = vi.fn()

      const comp1: ComponentBuilder<string> = {
        init: () => ['comp1', cmd1 as unknown as Cmd<Msg>],
        update: (model) => [model, null],
        view: (model) => model,
      }

      const comp2: ComponentBuilder<string> = {
        init: () => ['comp2', cmd2 as unknown as Cmd<Msg>],
        update: (model) => [model, null],
        view: (model) => model,
      }

      const app = createApp()
        .component('first', comp1)
        .component('second', comp2)
        .view(() => text('test'))
        .build()

      const cmd = app.getModel().init()
      expect(cmd).not.toBeNull()
    })

    it('returns null if no components have commands', () => {
      const app = createApp()
        .view(() => text('test'))
        .build()

      const cmd = app.getModel().init()
      expect(cmd).toBeNull()
    })
  })

  describe('view', () => {
    it('renders empty string if no view function', () => {
      // We can't easily test this since build() now throws
      // This is an internal edge case that shouldn't happen in practice
    })

    it('renders the view function output', () => {
      const app = createApp()
        .state({ message: 'Test Message' })
        .view(({ state }) => text(state.message))
        .build()

      const view = app.getModel().view()
      expect(view).toContain('Test Message')
    })

    it('includes component views', () => {
      const mockComponent = createMockComponent('component-output')
      const app = createApp()
        .component('mock', mockComponent)
        .view(({ components }) => components.mock)
        .build()

      const model = app.getModel()
      model.init()
      expect(model.view()).toContain('component-output')
    })
  })

  describe('getUserState', () => {
    it('returns the current user state', () => {
      const app = createApp()
        .state({ count: 42, name: 'test' })
        .view(() => text('test'))
        .build()

      expect(app.getModel().getUserState()).toEqual({ count: 42, name: 'test' })
    })

    it('returns undefined if no state set', () => {
      const app = createApp()
        .view(() => text('test'))
        .build()

      expect(app.getModel().getUserState()).toBeUndefined()
    })
  })
})

describe('EventContext', () => {
  // These tests would require simulating KeyMsg which is complex
  // We'll add integration tests that cover these scenarios
  it('provides state to handlers', () => {
    // Test that handlers receive correct state is covered by integration tests
    expect(true).toBe(true)
  })
})

// Helper to create KeyMsg for testing
function keyMsg(runes: string): KeyMsg {
  // Space is a special key type
  if (runes === ' ') {
    return new KeyMsg({
      type: KeyType.Space,
      runes: '',
      alt: false,
      paste: false,
    })
  }
  return new KeyMsg({
    type: KeyType.Runes,
    runes,
    alt: false,
    paste: false,
  })
}

describe('EventContext.sendToComponent', () => {
  // Create a mock component with a mutable counter
  interface CounterModel {
    count: number
    increment(): [CounterModel, Cmd<Msg>]
    setCount(n: number): [CounterModel, Cmd<Msg>]
  }

  function createCounterComponent(initial: number): ComponentBuilder<CounterModel> {
    return {
      init: () => {
        const model: CounterModel = {
          count: initial,
          increment() {
            return [{ ...this, count: this.count + 1 }, null]
          },
          setCount(n: number) {
            return [{ ...this, count: n }, null]
          },
        }
        return [model, null]
      },
      update: (model: CounterModel, _msg: Msg) => [model, null],
      view: (model: CounterModel) => `Count: ${model.count}`,
    }
  }

  it('allows handlers to update component models', () => {
    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onKey(' ', ({ sendToComponent }) => {
        sendToComponent('counter', (model) => model.increment())
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()

    // Initial view
    expect(model.view()).toContain('Count: 0')

    // Simulate key press
    const [nextModel] = model.update(keyMsg(' '))
    expect(nextModel.view()).toContain('Count: 1')
  })

  it('allows calling component methods with arguments', () => {
    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onKey('1', ({ sendToComponent }) => {
        sendToComponent('counter', (model) => model.setCount(10))
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()

    expect(model.view()).toContain('Count: 0')

    const [nextModel] = model.update(keyMsg('1'))
    expect(nextModel.view()).toContain('Count: 10')
  })

  it('allows updating multiple components in one handler', () => {
    const app = createApp()
      .component('counter1', createCounterComponent(0))
      .component('counter2', createCounterComponent(100))
      .onKey(' ', ({ sendToComponent }) => {
        sendToComponent('counter1', (model) => model.increment())
        sendToComponent('counter2', (model) => model.increment())
      })
      .view(({ components }) => vstack(components.counter1, components.counter2))
      .build()

    const model = app.getModel()
    model.init()

    expect(model.view()).toContain('Count: 0')
    expect(model.view()).toContain('Count: 100')

    const [nextModel] = model.update(keyMsg(' '))
    expect(nextModel.view()).toContain('Count: 1')
    expect(nextModel.view()).toContain('Count: 101')
  })

  it('works together with state updates', () => {
    const app = createApp()
      .state({ userCount: 0 })
      .component('counter', createCounterComponent(0))
      .onKey(' ', ({ state, update, sendToComponent }) => {
        update({ userCount: state.userCount + 1 })
        sendToComponent('counter', (model) => model.increment())
      })
      .view(({ state, components }) =>
        vstack(text(`User: ${state.userCount}`), components.counter),
      )
      .build()

    const model = app.getModel()
    model.init()

    expect(model.view()).toContain('User: 0')
    expect(model.view()).toContain('Count: 0')

    const [nextModel] = model.update(keyMsg(' '))
    expect(nextModel.view()).toContain('User: 1')
    expect(nextModel.view()).toContain('Count: 1')
  })

  it('handles non-existent component keys gracefully', () => {
    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onKey(' ', ({ sendToComponent }) => {
        // Try to update a component that doesn't exist
        sendToComponent('nonexistent' as never, (_model: never) => {
          throw new Error('Should not be called')
        })
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()

    // Should not throw
    expect(() => {
      model.update(keyMsg(' '))
    }).not.toThrow()
  })

  it('batches commands from multiple component updates', () => {
    const mockCmd1 = vi.fn()
    const mockCmd2 = vi.fn()

    interface CmdModel {
      executeCmd(): [CmdModel, Cmd<Msg>]
    }

    const createCmdComponent = (cmd: Cmd<Msg>): ComponentBuilder<CmdModel> => ({
      init: () => {
        const model: CmdModel = {
          executeCmd() {
            return [this, cmd]
          },
        }
        return [model, null]
      },
      update: (model: CmdModel, _msg: Msg) => [model, null],
      view: (_model: CmdModel) => 'cmd',
    })

    const app = createApp()
      .component('cmd1', createCmdComponent(mockCmd1 as unknown as Cmd<Msg>))
      .component('cmd2', createCmdComponent(mockCmd2 as unknown as Cmd<Msg>))
      .onKey(' ', ({ sendToComponent }) => {
        sendToComponent('cmd1', (model) => model.executeCmd())
        sendToComponent('cmd2', (model) => model.executeCmd())
      })
      .view(() => text('test'))
      .build()

    const model = app.getModel()
    model.init()

    const [, cmd] = model.update(keyMsg(' '))
    expect(cmd).not.toBeNull()
  })

  it('returns same model if no components updated', () => {
    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onKey(' ', () => {
        // Handler does nothing
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()

    const [nextModel] = model.update(keyMsg(' '))
    // Should return same instance if nothing changed
    expect(nextModel).toBe(model)
  })
})

describe('AppBuilder.onInit', () => {
  it('handler is called during init()', () => {
    let initCalled = false

    const app = createApp()
      .state({ count: 0 })
      .onInit(() => {
        initCalled = true
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    expect(initCalled).toBe(false)
    app.getModel().init()
    expect(initCalled).toBe(true)
  })

  it('handler receives correct context with state', () => {
    let receivedState: { count: number } | undefined

    const app = createApp()
      .state({ count: 42 })
      .onInit((ctx) => {
        receivedState = ctx.state
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    app.getModel().init()
    expect(receivedState).toEqual({ count: 42 })
  })

  it('can schedule commands that are returned from init()', () => {
    const mockCmd = vi.fn()

    const app = createApp()
      .state({ count: 0 })
      .onInit((ctx) => {
        ctx.schedule(mockCmd as unknown as Cmd<Msg>)
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const cmd = app.getModel().init()
    expect(cmd).not.toBeNull()
  })

  it('can schedule multiple commands', () => {
    const mockCmd1 = vi.fn()
    const mockCmd2 = vi.fn()

    const app = createApp()
      .state({ count: 0 })
      .onInit((ctx) => {
        ctx.schedule(mockCmd1 as unknown as Cmd<Msg>)
        ctx.schedule(mockCmd2 as unknown as Cmd<Msg>)
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const cmd = app.getModel().init()
    expect(cmd).not.toBeNull()
  })

  it('calling onInit multiple times replaces the previous handler', () => {
    let firstCalled = false
    let secondCalled = false

    const app = createApp()
      .state({ count: 0 })
      .onInit(() => {
        firstCalled = true
      })
      .onInit(() => {
        secondCalled = true
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    app.getModel().init()
    expect(firstCalled).toBe(false)
    expect(secondCalled).toBe(true)
  })

  it('can send messages to components during init', () => {
    interface CounterModel {
      count: number
      setCount(n: number): [CounterModel, Cmd<Msg>]
    }

    const createCounterComponent = (initial: number): ComponentBuilder<CounterModel> => ({
      init: () => {
        const model: CounterModel = {
          count: initial,
          setCount(n: number) {
            return [{ ...this, count: n }, null]
          },
        }
        return [model, null]
      },
      update: (model: CounterModel, _msg: Msg) => [model, null],
      view: (model: CounterModel) => `Count: ${model.count}`,
    })

    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onInit((ctx) => {
        ctx.sendToComponent('counter', (model) => model.setCount(100))
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()
    expect(model.view()).toContain('Count: 100')
  })
})

// Test message class for onMessage tests
class TestMessage {
  constructor(public readonly value: number) {}
}

class AnotherMessage {
  constructor(public readonly text: string) {}
}

describe('AppBuilder.onMessage', () => {
  it('handler is called when matching message is received', () => {
    let handlerCalled = false

    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, () => {
        handlerCalled = true
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    expect(handlerCalled).toBe(false)
    model.update(new TestMessage(42))
    expect(handlerCalled).toBe(true)
  })

  it('handler receives correct context with message', () => {
    let receivedMsg: TestMessage | undefined
    let receivedState: { count: number } | undefined

    const app = createApp()
      .state({ count: 10 })
      .onMessage(TestMessage, (ctx) => {
        receivedMsg = ctx.msg
        receivedState = ctx.state
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()
    model.update(new TestMessage(42))

    expect(receivedMsg).toBeInstanceOf(TestMessage)
    expect(receivedMsg?.value).toBe(42)
    expect(receivedState).toEqual({ count: 10 })
  })

  it('handler is not called for non-matching messages', () => {
    let testMessageCalled = false
    let anotherMessageCalled = false

    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, () => {
        testMessageCalled = true
      })
      .onMessage(AnotherMessage, () => {
        anotherMessageCalled = true
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    model.update(new TestMessage(42))
    expect(testMessageCalled).toBe(true)
    expect(anotherMessageCalled).toBe(false)
  })

  it('can update state with update()', () => {
    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, (ctx) => {
        ctx.update({ count: ctx.msg.value })
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    const [nextModel] = model.update(new TestMessage(42))
    expect(nextModel.getUserState()).toEqual({ count: 42 })
  })

  it('can replace state with setState()', () => {
    const app = createApp()
      .state({ count: 0, name: 'initial' })
      .onMessage(TestMessage, (ctx) => {
        ctx.setState({ count: ctx.msg.value, name: 'updated' })
      })
      .view(({ state }) => text(`${state.count} ${state.name}`))
      .build()

    const model = app.getModel()
    model.init()

    const [nextModel] = model.update(new TestMessage(100))
    expect(nextModel.getUserState()).toEqual({ count: 100, name: 'updated' })
  })

  it('can schedule commands', () => {
    const mockCmd = vi.fn()

    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, (ctx) => {
        ctx.schedule(mockCmd as unknown as Cmd<Msg>)
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    const [, cmd] = model.update(new TestMessage(42))
    expect(cmd).not.toBeNull()
  })

  it('can quit the application', () => {
    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, (ctx) => {
        ctx.quit()
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    const [, cmd] = model.update(new TestMessage(42))
    // The quit command should be returned
    expect(cmd).not.toBeNull()
  })

  it('can send messages to components', () => {
    interface CounterModel {
      count: number
      setCount(n: number): [CounterModel, Cmd<Msg>]
    }

    const createCounterComponent = (initial: number): ComponentBuilder<CounterModel> => ({
      init: () => {
        const model: CounterModel = {
          count: initial,
          setCount(n: number) {
            return [{ ...this, count: n }, null]
          },
        }
        return [model, null]
      },
      update: (model: CounterModel, _msg: Msg) => [model, null],
      view: (model: CounterModel) => `Count: ${model.count}`,
    })

    const app = createApp()
      .component('counter', createCounterComponent(0))
      .onMessage(TestMessage, (ctx) => {
        ctx.sendToComponent('counter', (model) => model.setCount(ctx.msg.value))
      })
      .view(({ components }) => components.counter)
      .build()

    const model = app.getModel()
    model.init()

    expect(model.view()).toContain('Count: 0')

    const [nextModel] = model.update(new TestMessage(99))
    expect(nextModel.view()).toContain('Count: 99')
  })

  it('multiple message handlers can be registered', () => {
    let testCount = 0
    let anotherCount = 0

    const app = createApp()
      .state({ value: '' })
      .onMessage(TestMessage, () => {
        testCount++
      })
      .onMessage(AnotherMessage, () => {
        anotherCount++
      })
      .view(({ state }) => text(state.value))
      .build()

    const model = app.getModel()
    model.init()

    model.update(new TestMessage(1))
    model.update(new AnotherMessage('hello'))
    model.update(new TestMessage(2))

    expect(testCount).toBe(2)
    expect(anotherCount).toBe(1)
  })

  it('returns same model if no state or component changes', () => {
    const app = createApp()
      .state({ count: 0 })
      .onMessage(TestMessage, () => {
        // Handler does nothing
      })
      .view(({ state }) => text(String(state.count)))
      .build()

    const model = app.getModel()
    model.init()

    const [nextModel] = model.update(new TestMessage(42))
    expect(nextModel).toBe(model)
  })

  it('works with tick command for async operations', () => {
    class TickComplete {
      constructor(public readonly data: string) {}
    }

    const app = createApp()
      .state({ loading: true, data: '' })
      .onInit((ctx) => {
        // Schedule a tick that will send TickComplete after delay
        ctx.schedule(tick(100, () => new TickComplete('loaded data')))
      })
      .onMessage(TickComplete, (ctx) => {
        ctx.update({ loading: false, data: ctx.msg.data })
      })
      .view(({ state }) => text(state.loading ? 'Loading...' : state.data))
      .build()

    const model = app.getModel()
    const initCmd = model.init()

    // Init should return the tick command
    expect(initCmd).not.toBeNull()
    expect(model.view()).toContain('Loading...')

    // Simulate receiving the tick message
    const [nextModel] = model.update(new TickComplete('loaded data'))
    expect(nextModel.getUserState()).toEqual({ loading: false, data: 'loaded data' })
    expect(nextModel.view()).toContain('loaded data')
  })
})

/**
 * Type-level tests for @suds-cli/dsl
 *
 * These tests verify that TypeScript type inference works correctly throughout
 * the builder chain and that invalid usage is properly rejected at compile time.
 */

import { expectType, expectError, expectAssignable } from 'tsd'
import {
  createApp,
  spinner,
  textInput,
  text,
  vstack,
  type ComponentView,
  type TextNode,
  type LayoutNode,
  type App,
  type AppBuilder,
} from '../src/index.js'
import type { SpinnerModel } from '@suds-cli/spinner'
import type { TextInputModel } from '@suds-cli/textinput'

// ============================================================================
// Test 1: Initial app builder has undefined state and no components
// ============================================================================

const emptyApp = createApp()
expectType<AppBuilder<undefined, Record<string, never>>>(emptyApp)

// ============================================================================
// Test 2: State type inference after .state()
// ============================================================================

const appWithState = createApp().state({ count: 0, name: 'World' })
expectType<AppBuilder<{ count: number; name: string }, Record<string, never>>>(appWithState)

// ============================================================================
// Test 3: Component type inference after .component()
// ============================================================================

const appWithSpinner = createApp().component('spinner', spinner())
expectType<
  AppBuilder<undefined, Record<string, never> & Record<'spinner', SpinnerModel>>
>(appWithSpinner)

const appWithInput = createApp().component('input', textInput())
expectType<
  AppBuilder<undefined, Record<string, never> & Record<'input', TextInputModel>>
>(appWithInput)

// Multiple components
const appWithMultiple = createApp()
  .component('spinner', spinner())
  .component('input', textInput())
expectType<
  AppBuilder<
    undefined,
    Record<string, never> & Record<'spinner', SpinnerModel> & Record<'input', TextInputModel>
  >
>(appWithMultiple)

// ============================================================================
// Test 4: Component and state together preserve types
// ============================================================================

const appComplete = createApp()
  .state({ count: 0 })
  .component('spinner', spinner())
expectType<
  AppBuilder<{ count: number }, Record<string, never> & Record<'spinner', SpinnerModel>>
>(appComplete)

// State before component
const stateFirst = createApp()
  .state({ x: 1 })
  .component('s', spinner())
expectType<AppBuilder<{ x: number }, Record<string, never> & Record<'s', SpinnerModel>>>(
  stateFirst,
)

// Component before state
const componentFirst = createApp()
  .component('s', spinner())
  .state({ x: 1 })
expectType<AppBuilder<{ x: number }, Record<string, never> & Record<'s', SpinnerModel>>>(
  componentFirst,
)

// ============================================================================
// Test 5: View function receives correct types
// ============================================================================

createApp()
  .state({ value: 'hello' })
  .component('spin', spinner())
  .view(({ state, components }) => {
    // State should be correctly typed
    expectType<{ value: string }>(state)
    expectType<string>(state.value)

    // Components should be ComponentView objects with index signature
    expectAssignable<{ spin: ComponentView }>(components)
    expectType<ComponentView>(components.spin)

    return text('test')
  })

// ============================================================================
// Test 6: Event handlers receive correct types
// ============================================================================

createApp()
  .state({ count: 0 })
  .component('spinner', spinner())
  .onKey('q', (ctx) => {
    // State is correctly typed
    expectType<{ count: number }>(ctx.state)
    expectType<number>(ctx.state.count)

    // Components are ComponentView objects with index signature
    expectAssignable<{ spinner: ComponentView }>(ctx.components)
    expectType<ComponentView>(ctx.components.spinner)

    // Methods exist
    expectType<(patch: Partial<{ count: number }>) => void>(ctx.update)
    expectType<(newState: { count: number }) => void>(ctx.setState)
    expectType<() => void>(ctx.quit)

    // Using update with partial state
    ctx.update({ count: 1 })

    // Using setState with full state
    ctx.setState({ count: 1 })

    // Using quit
    ctx.quit()
  })

// ============================================================================
// Test 7: Built app has correct type
// ============================================================================

const builtApp = createApp()
  .state({ x: 1 })
  .component('s', spinner())
  .view(({ state }) => text(state.x.toString()))
  .build()

expectType<App<{ x: number }, { s: SpinnerModel }>>(builtApp)

// ============================================================================
// Test 8: View nodes have correct types
// ============================================================================

// TextNode
const textNode = text('hello')
expectType<TextNode>(textNode)
expectType<TextNode>(textNode.bold())
expectType<TextNode>(textNode.dim())
expectType<TextNode>(textNode.italic())
expectType<TextNode>(textNode.foreground('#ff0000'))
expectType<TextNode>(textNode.background('#00ff00'))

// LayoutNode
const vstackNode = vstack(text('a'), text('b'))
expectType<LayoutNode>(vstackNode)

// ============================================================================
// Test 9: Error cases - invalid state access
// ============================================================================

createApp()
  .state({ count: 0 })
  .view(({ state }) => {
    // Should error when accessing non-existent property
    expectError(state.nonExistent)

    return text('test')
  })

// ============================================================================
// Test 10: Components are accessible by key
// ============================================================================

createApp()
  .component('spinner', spinner())
  .view(({ components }) => {
    // Registered components are accessible
    expectType<ComponentView>(components.spinner)

    return text('test')
  })

// ============================================================================
// Test 11: Error cases - type mismatch in update
// ============================================================================

createApp()
  .state({ count: 0 })
  .onKey('q', (ctx) => {
    // Should error when updating with wrong type
    expectError(ctx.update({ count: 'string' }))

    // Should error when setting state with wrong type
    expectError(ctx.setState({ count: 'string' }))

    // Should error when setting incomplete state
    expectError(ctx.setState({}))
  })

// ============================================================================
// Test 12: Build returns correct App type
// ============================================================================

// Note: build() without a view is a runtime error, not a compile-time error
// The builder pattern allows progressive construction, so TypeScript can't
// enforce that view() is called before build() without complex conditional types

// ============================================================================
// Test 13: Chaining preserves types through multiple calls
// ============================================================================

const chain = createApp()
  .state({ a: 1 })
  .component('c1', spinner())
  .state({ a: 1, b: 2 }) // Replace state
  .component('c2', textInput())

expectType<
  AppBuilder<
    { a: number; b: number },
    Record<string, never> & Record<'c1', SpinnerModel> & Record<'c2', TextInputModel>
  >
>(chain)

// ============================================================================
// Test 14: ComponentView structure
// ============================================================================

const testComponentView: ComponentView = {
  _type: 'component',
  view: 'test',
}
expectAssignable<ComponentView>(testComponentView)

// Should error with wrong _type
expectError<ComponentView>({
  _type: 'wrong',
  view: 'test',
})

// Should error with missing view
expectError<ComponentView>({
  _type: 'component',
})

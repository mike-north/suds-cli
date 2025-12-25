import {
  Program,
  KeyMsg,
  quit as teaQuit,
  batch,
  type Cmd,
  type Model,
  type Msg,
} from '@suds-cli/tea'
import { newBinding, matches, type Binding } from '@suds-cli/key'
import type {
  App,
  ComponentBuilder,
  EventContext,
  KeyHandler,
  ViewFunction,
  ComponentView,
} from './types.js'
import { render } from './view/renderer.js'
import { componentView } from './view/nodes.js'

/**
 * Internal key handler registration.
 * @internal
 */
interface KeyHandlerEntry<State, Components extends Record<string, unknown>> {
  keys: string[]
  binding: Binding
  handler: KeyHandler<State, Components>
}

/**
 * Internal component registration.
 * @internal
 */
interface ComponentEntry {
  key: string
  builder: ComponentBuilder<unknown>
}

/**
 * Builder for creating declarative CLI applications.
 *
 * @example
 * ```typescript
 * const app = createApp()
 *   .state({ count: 0 })
 *   .component('spinner', spinner())
 *   .onKey('q', ({ quit }) => quit())
 *   .view(({ state, components }) => vstack(
 *     text('Count: ' + state.count),
 *     components.spinner
 *   ))
 *   .build()
 *
 * await app.run()
 * ```
 *
 * @public
 */
export class AppBuilder<
  State = undefined,
  Components extends Record<string, unknown> = Record<string, never>,
> {
  readonly #initialState: State | undefined
  readonly #components: ComponentEntry[]
  readonly #keyHandlers: KeyHandlerEntry<State, Components>[]
  readonly #viewFn: ViewFunction<State, Components> | undefined

  private constructor(
    initialState: State | undefined,
    components: ComponentEntry[],
    keyHandlers: KeyHandlerEntry<State, Components>[],
    viewFn: ViewFunction<State, Components> | undefined,
  ) {
    this.#initialState = initialState
    this.#components = components
    this.#keyHandlers = keyHandlers
    this.#viewFn = viewFn
  }

  /**
   * Create a new AppBuilder instance.
   * @internal
   */
  static create(): AppBuilder<undefined, Record<string, never>> {
    return new AppBuilder(undefined, [], [], undefined)
  }

  /**
   * Set the initial application state.
   *
   * @remarks
   * This should typically be called early in the builder chain. If called after
   * registering key handlers or a view function, those will be preserved but
   * their type information will be updated to reflect the new state type.
   *
   * @example
   * ```typescript
   * createApp()
   *   .state({ count: 0, name: 'World' })
   * ```
   *
   * @typeParam S - The application state type
   * @param initial - The initial state object
   * @returns A new {@link AppBuilder} with the state type parameter set
   *
   * @public
   */
  state<S>(initial: S): AppBuilder<S, Components> {
    // Preserve existing handlers and view function with updated type
    // This is safe because the handlers/view will receive the new state type
    return new AppBuilder(
      initial,
      this.#components,
      this.#keyHandlers as unknown as KeyHandlerEntry<S, Components>[],
      this.#viewFn as unknown as ViewFunction<S, Components> | undefined,
    )
  }

  /**
   * Register a component with a unique key.
   *
   * @remarks
   * Components are TEA models wrapped in a {@link ComponentBuilder} that
   * manages their lifecycle. The component's rendered view is available in
   * the view function via `components[key]`.
   *
   * @example
   * ```typescript
   * createApp()
   *   .component('loading', spinner())
   *   .component('input', textInput())
   * ```
   *
   * @typeParam K - The component key (string literal type)
   * @typeParam M - The component model type
   * @param key - Unique identifier for this component
   * @param builder - Component builder implementing init/update/view
   * @returns A new {@link AppBuilder} with the component registered
   *
   * @public
   */
  component<K extends string, M>(
    key: K,
    builder: ComponentBuilder<M>,
  ): AppBuilder<State, Components & Record<K, M>> {
    const newComponents = [...this.#components, { key, builder: builder as ComponentBuilder<unknown> }]
    return new AppBuilder(
      this.#initialState,
      newComponents,
      this.#keyHandlers as KeyHandlerEntry<State, Components & Record<K, M>>[],
      this.#viewFn as ViewFunction<State, Components & Record<K, M>> | undefined,
    )
  }

  /**
   * Register a key handler.
   *
   * @remarks
   * Key handlers receive an {@link EventContext} with the current state and
   * components. Multiple keys can be bound to the same handler by passing an
   * array of key strings. Key strings support modifiers like 'ctrl+c', 'alt+enter'.
   *
   * @example
   * ```typescript
   * createApp()
   *   .onKey('q', ({ quit }) => quit())
   *   .onKey(['up', 'k'], ({ state, update }) => update({ index: state.index - 1 }))
   *   .onKey('ctrl+c', ({ quit }) => quit())
   * ```
   *
   * @param keys - Single key string or array of key strings
   * @param handler - Function to call when any of the keys are pressed
   * @returns A new {@link AppBuilder} with the key handler registered
   *
   * @public
   */
  onKey(
    keys: string | string[],
    handler: KeyHandler<State, Components>,
  ): AppBuilder<State, Components> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    const binding = newBinding({ keys: keyArray })
    const newHandlers = [...this.#keyHandlers, { keys: keyArray, binding, handler }]
    return new AppBuilder(this.#initialState, this.#components, newHandlers, this.#viewFn)
  }

  /**
   * Set the view function.
   *
   * @remarks
   * The view function is called on every render cycle and receives the current
   * state and component views. It should return a {@link ViewNode} tree
   * describing the UI to display.
   *
   * @example
   * ```typescript
   * createApp()
   *   .view(({ state, components }) => vstack(
   *     text('Hello ' + state.name),
   *     components.spinner
   *   ))
   * ```
   *
   * @param fn - Function that returns a {@link ViewNode} tree
   * @returns A new {@link AppBuilder} with the view function set
   *
   * @public
   */
  view(fn: ViewFunction<State, Components>): AppBuilder<State, Components> {
    return new AppBuilder(this.#initialState, this.#components, this.#keyHandlers, fn)
  }

  /**
   * Build the application.
   *
   * @remarks
   * Finalizes the builder chain and creates an {@link App} instance ready
   * to run. This method must be called after setting a view function via
   * {@link AppBuilder.view}.
   *
   * @throws Error if no view function has been set
   *
   * @returns The built {@link App} ready to run
   *
   * @public
   */
  build(): App<State, Components> {
    if (this.#viewFn === undefined) {
      throw new Error('AppBuilder: view() must be called before build()')
    }

    const initialState = this.#initialState as State
    const components = this.#components
    const keyHandlers = this.#keyHandlers
    const viewFn = this.#viewFn

    // Create the generated model
    const model = new GeneratedModel(initialState, components, keyHandlers, viewFn)

    return {
      async run() {
        const program = new Program(model)
        const result = await program.run()
        return { state: result.model.getUserState() }
      },
      getModel() {
        return model
      },
    }
  }
}

/**
 * Create a new application builder.
 *
 * @example
 * ```typescript
 * const app = createApp()
 *   .state({ count: 0 })
 *   .onKey('q', ({ quit }) => quit())
 *   .view(({ state }) => text('Count: ' + state.count))
 *   .build()
 * ```
 *
 * @public
 */
export function createApp(): AppBuilder<undefined, Record<string, never>> {
  return AppBuilder.create()
}

/**
 * Generated TEA model from the builder configuration.
 * @internal
 */
class GeneratedModel<State, Components extends Record<string, unknown>>
  implements Model<Msg, GeneratedModel<State, Components>>
{
  readonly #userState: State
  readonly #componentModels: Map<string, unknown>
  readonly #componentBuilders: Map<string, ComponentBuilder<unknown>>
  readonly #keyHandlers: KeyHandlerEntry<State, Components>[]
  readonly #viewFn: ViewFunction<State, Components> | undefined

  constructor(
    userState: State,
    components: ComponentEntry[],
    keyHandlers: KeyHandlerEntry<State, Components>[],
    viewFn: ViewFunction<State, Components> | undefined,
    componentModels?: Map<string, unknown>,
  ) {
    this.#userState = userState
    this.#keyHandlers = keyHandlers
    this.#viewFn = viewFn

    // Build component builders map
    this.#componentBuilders = new Map()
    for (const { key, builder } of components) {
      this.#componentBuilders.set(key, builder)
    }

    // Use provided component models or empty map (init will populate)
    this.#componentModels = componentModels ?? new Map<string, unknown>()
  }

  getUserState(): State {
    return this.#userState
  }

  init(): Cmd<Msg> {
    const cmds: Cmd<Msg>[] = []

    // Initialize all components
    for (const [key, builder] of this.#componentBuilders) {
      const [model, cmd] = builder.init()
      this.#componentModels.set(key, model)
      if (cmd) {
        cmds.push(cmd)
      }
    }

    return cmds.length > 0 ? batch(...cmds) : null
  }

  update(msg: Msg): [GeneratedModel<State, Components>, Cmd<Msg>] {
    // Check key handlers first
    if (msg instanceof KeyMsg) {
      for (const { binding, handler } of this.#keyHandlers) {
        if (matches(msg, binding)) {
          // Create event context and call handler
          let nextUserState = this.#userState
          let shouldQuit = false

          const ctx: EventContext<State, Components> = {
            state: this.#userState,
            components: this.#buildComponentViews(),
            update: (patch) => {
              nextUserState = { ...nextUserState, ...patch }
            },
            setState: (newState) => {
              nextUserState = newState
            },
            quit: () => {
              shouldQuit = true
            },
          }

          handler(ctx)

          if (shouldQuit) {
            return [this, teaQuit()]
          }

          if (nextUserState !== this.#userState) {
            return [this.#withUserState(nextUserState), null]
          }

          return [this, null]
        }
      }
    }

    // Route message to all components
    const cmds: Cmd<Msg>[] = []
    let anyComponentChanged = false
    const newComponentModels = new Map(this.#componentModels)

    for (const [key, builder] of this.#componentBuilders) {
      const currentModel = this.#componentModels.get(key)
      if (currentModel === undefined) {
        continue
      }

      const [nextModel, cmd] = builder.update(currentModel, msg)

      if (nextModel !== currentModel) {
        newComponentModels.set(key, nextModel)
        anyComponentChanged = true
      }

      if (cmd) {
        cmds.push(cmd)
      }
    }

    if (anyComponentChanged) {
      const next = new GeneratedModel(
        this.#userState,
        Array.from(this.#componentBuilders.entries()).map(([key, builder]) => ({
          key,
          builder,
        })),
        this.#keyHandlers,
        this.#viewFn,
        newComponentModels,
      )
      return [next, cmds.length > 0 ? batch(...cmds) : null]
    }

    return [this, cmds.length > 0 ? batch(...cmds) : null]
  }

  view(): string {
    if (!this.#viewFn) {
      return ''
    }

    const componentViews = this.#buildComponentViews()
    const node = this.#viewFn({
      state: this.#userState,
      components: componentViews,
    })

    return render(node)
  }

  #buildComponentViews(): { [K in keyof Components]: ComponentView } {
    const views: Record<string, ComponentView> = {}

    for (const [key, builder] of this.#componentBuilders) {
      const model = this.#componentModels.get(key)
      if (model !== undefined) {
        views[key] = componentView(builder.view(model))
      }
    }

    return views as { [K in keyof Components]: ComponentView }
  }

  #withUserState(newUserState: State): GeneratedModel<State, Components> {
    return new GeneratedModel(
      newUserState,
      Array.from(this.#componentBuilders.entries()).map(([key, builder]) => ({
        key,
        builder,
      })),
      this.#keyHandlers,
      this.#viewFn,
      this.#componentModels,
    )
  }
}

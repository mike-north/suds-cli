import type { Cmd, Model, Msg } from '@suds-cli/tea'

/**
 * View node types for the view DSL.
 * @public
 */
export type ViewNode = string | TextNode | LayoutNode | ComponentView

/**
 * Text node with chainable style methods.
 *
 * @remarks
 * Text nodes provide a fluent API for applying terminal styling to text content.
 * All styling methods return a new {@link TextNode} instance, allowing for method chaining.
 *
 * @example
 * ```typescript
 * text('Hello').bold().foreground('#ff79c6')
 * text('Warning').dim().italic()
 * ```
 *
 * @public
 */
export interface TextNode {
  /** Internal discriminator for type narrowing. */
  readonly _type: 'text'
  /** The text content to display. */
  readonly content: string
  /** Whether bold styling is applied. */
  readonly _bold: boolean
  /** Whether dim styling is applied. */
  readonly _dim: boolean
  /** Whether italic styling is applied. */
  readonly _italic: boolean
  /** Foreground color (hex or named color). */
  readonly _foreground: string | undefined
  /** Background color (hex or named color). */
  readonly _background: string | undefined

  /**
   * Apply bold styling to the text.
   * @returns A new {@link TextNode} with bold styling applied.
   */
  bold(): TextNode
  /**
   * Apply dim styling to the text.
   * @returns A new {@link TextNode} with dim styling applied.
   */
  dim(): TextNode
  /**
   * Apply italic styling to the text.
   * @returns A new {@link TextNode} with italic styling applied.
   */
  italic(): TextNode
  /**
   * Set the foreground color.
   * @param color - Hex color (e.g., '#ff79c6') or named color
   * @returns A new {@link TextNode} with the foreground color applied.
   */
  foreground(color: string): TextNode
  /**
   * Set the background color.
   * @param color - Hex color (e.g., '#282a36') or named color
   * @returns A new {@link TextNode} with the background color applied.
   */
  background(color: string): TextNode
}

/**
 * Layout node for stacking views vertically or horizontally.
 *
 * @remarks
 * Layout nodes arrange child views in either a vertical stack ({@link vstack})
 * or horizontal stack ({@link hstack}). Children are rendered with optional
 * spacing between them.
 *
 * @example
 * ```typescript
 * vstack(
 *   text('Line 1'),
 *   text('Line 2')
 * )
 *
 * hstack(
 *   text('Left'),
 *   text('Right')
 * )
 * ```
 *
 * @public
 */
export interface LayoutNode {
  /** Layout direction: 'vstack' for vertical, 'hstack' for horizontal. */
  readonly _type: 'vstack' | 'hstack'
  /** Child view nodes to arrange. */
  readonly children: ViewNode[]
  /** Spacing between children (in newlines for vstack, spaces for hstack). */
  readonly spacing: number
}

/**
 * Component view wrapper containing rendered output from a TEA component.
 *
 * @remarks
 * Component views are returned by the builder when registering components
 * via {@link AppBuilder.component}. They contain the pre-rendered string
 * output from the component's `view()` method.
 *
 * @example
 * ```typescript
 * createApp()
 *   .component('spinner', spinner())
 *   .view(({ components }) => components.spinner)
 *   //                        ^^^^^^^^^^^^^^^^^ ComponentView
 * ```
 *
 * @public
 */
export interface ComponentView {
  /** Internal discriminator for type narrowing. */
  readonly _type: 'component'
  /** The rendered view string from the component. */
  readonly view: string
}

/**
 * Component builder interface for wrapping TEA components.
 *
 * @remarks
 * Component builders provide an adapter between TEA components (which follow
 * the Model-Update-View pattern) and the DSL. When you register a component
 * via {@link AppBuilder.component}, you provide a `ComponentBuilder` that
 * handles initialization, updates, and rendering.
 *
 * @example
 * ```typescript
 * const spinnerBuilder: ComponentBuilder<SpinnerModel> = {
 *   init: () => {
 *     const model = new SpinnerModel()
 *     return [model, model.tick()]
 *   },
 *   update: (model, msg) => model.update(msg),
 *   view: (model) => model.view(),
 * }
 * ```
 *
 * @typeParam M - The model type managed by this component
 *
 * @public
 */
export interface ComponentBuilder<M> {
  /**
   * Initialize the component and return the initial model and command.
   * @returns A tuple of [initial model, initial command]
   */
  init(): [M, Cmd<Msg>]
  /**
   * Update the component with a message.
   * @param model - The current component model
   * @param msg - The message to process
   * @returns A tuple of [next model, next command]
   */
  update(model: M, msg: Msg): [M, Cmd<Msg>]
  /**
   * Render the component to a string.
   * @param model - The current component model
   * @returns The rendered view string
   */
  view(model: M): string
}

/**
 * Event context passed to key event handlers.
 *
 * @remarks
 * The event context provides access to the current application state and
 * component views, along with methods to update state or quit the application.
 * It's passed to handlers registered via {@link AppBuilder.onKey}.
 *
 * @example
 * ```typescript
 * createApp()
 *   .state({ count: 0 })
 *   .onKey('up', ({ state, update }) => {
 *     update({ count: state.count + 1 })
 *   })
 *   .onKey('q', ({ quit }) => quit())
 * ```
 *
 * @typeParam State - The application state type
 * @typeParam Components - Record of registered components
 *
 * @public
 */
export interface EventContext<State, Components extends Record<string, unknown>> {
  /** Current application state. */
  readonly state: State
  /** Current component views (rendered strings). */
  readonly components: { [K in keyof Components]: ComponentView }
  /**
   * Update state with a partial patch (shallow merge).
   * @param patch - Partial state object to merge with current state
   */
  update(patch: Partial<State>): void
  /**
   * Replace entire state with a new value.
   * @param newState - The new complete state
   */
  setState(newState: State): void
  /**
   * Quit the application gracefully.
   */
  quit(): void
}

/**
 * Key handler function type.
 *
 * @remarks
 * Key handlers are registered via {@link AppBuilder.onKey} and receive an
 * {@link EventContext} with the current state and component views. Handlers
 * can update state or quit the application.
 *
 * @typeParam State - The application state type
 * @typeParam Components - Record of registered components
 *
 * @public
 */
export type KeyHandler<State, Components extends Record<string, unknown>> = (
  ctx: EventContext<State, Components>,
) => void

/**
 * View function type.
 *
 * @remarks
 * The view function is registered via {@link AppBuilder.view} and is called
 * on every render cycle. It receives the current state and component views,
 * and returns a {@link ViewNode} tree to display.
 *
 * @typeParam State - The application state type
 * @typeParam Components - Record of registered components
 *
 * @public
 */
export type ViewFunction<State, Components extends Record<string, unknown>> = (ctx: {
  state: State
  components: { [K in keyof Components]: ComponentView }
}) => ViewNode

/**
 * Built application ready to run.
 *
 * @remarks
 * An `App` is created by calling {@link AppBuilder.build}. It provides a
 * `run()` method to start the application event loop and a `getModel()` escape
 * hatch to access the underlying TEA model for advanced use cases.
 *
 * @typeParam State - The application state type
 * @typeParam _Components - Record of registered components (phantom type)
 *
 * @public
 */
export interface App<State, _Components extends Record<string, unknown>> {
  /**
   * Run the application and block until it quits.
   * @returns A promise resolving to the final application state
   */
  run(): Promise<{ state: State }>
  /**
   * Get the underlying TEA model (escape hatch for advanced use cases).
   * @returns The generated TEA Model from `@suds-cli/tea`
   */
  getModel(): Model<Msg>
}


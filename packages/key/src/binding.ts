/**
 * Help text for a keybinding, used to render help views.
 * @public
 */
export interface Help {
  /** Display key (e.g. "↑/k", "ctrl+c") */
  readonly key: string
  /** Description (e.g. "move up", "quit") */
  readonly desc: string
}

/**
 * Options for creating a Binding.
 * @public
 */
export interface BindingOptions {
  /** Key strings that trigger this binding (e.g. ["k", "up"]) */
  keys?: readonly string[]
  /** Help text for display */
  help?: Help
  /** Whether the binding is disabled */
  disabled?: boolean
}

/**
 * A set of keybindings with optional help text.
 * Immutable—use with* methods to derive modified copies.
 * @public
 */
export class Binding {
  readonly #keys: readonly string[]
  readonly #help: Help
  readonly #disabled: boolean

  constructor(options: BindingOptions = {}) {
    this.#keys = options.keys ?? []
    this.#help = options.help ?? { key: '', desc: '' }
    this.#disabled = options.disabled ?? false
  }

  /** Returns the keys for this binding. */
  keys(): readonly string[] {
    return this.#keys
  }

  /** Returns the help text for this binding. */
  help(): Help {
    return this.#help
  }

  /**
   * Returns true if this binding is enabled (not disabled and has keys).
   * Disabled bindings won't be matched and won't show up in help.
   */
  enabled(): boolean {
    return !this.#disabled && this.#keys.length > 0
  }

  /** Returns a new Binding with the given keys. */
  withKeys(...keys: string[]): Binding {
    return new Binding({
      keys,
      help: this.#help,
      disabled: this.#disabled,
    })
  }

  /** Returns a new Binding with the given help text. */
  withHelp(key: string, desc: string): Binding {
    return new Binding({
      keys: this.#keys,
      help: { key, desc },
      disabled: this.#disabled,
    })
  }

  /** Returns a new Binding with disabled set to the given value (default: true). */
  withDisabled(disabled = true): Binding {
    return new Binding({
      keys: this.#keys,
      help: this.#help,
      disabled,
    })
  }

  /** Returns a new Binding with enabled set (inverse of disabled). */
  withEnabled(enabled = true): Binding {
    return this.withDisabled(!enabled)
  }

  /**
   * Returns a new Binding with keys and help cleared.
   * This is a step beyond disabling—it nullifies the binding entirely.
   */
  unbound(): Binding {
    return new Binding({
      keys: [],
      help: { key: '', desc: '' },
      disabled: this.#disabled,
    })
  }
}

/**
 * Create a new keybinding with optional configuration.
 *
 * @example
 * ```ts
 * const up = newBinding({
 *   keys: ["k", "up"],
 *   help: { key: "↑/k", desc: "move up" },
 * });
 *
 * // Or fluent style:
 * const down = newBinding()
 *   .withKeys("j", "down")
 *   .withHelp("↓/j", "move down");
 * ```
 * @public
 */
export function newBinding(options?: BindingOptions): Binding {
  return new Binding(options)
}

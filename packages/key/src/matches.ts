import type { Binding } from './binding.js'

/**
 * Interface for key-like objects that can be matched.
 * Compatible with `\@suds-cli/tea` KeyMsg without importing it.
 * @public
 */
export interface Matchable {
  toString(): string
}

/**
 * Check if a key matches any of the given bindings.
 * Only enabled bindings are considered.
 *
 * @example
 * ```ts
 * import { KeyMsg } from "@suds-cli/tea";
 * import { matches, newBinding } from "@suds-cli/key";
 *
 * const keymap = {
 *   up: newBinding({ keys: ["k", "up"], help: { key: "↑/k", desc: "up" } }),
 *   down: newBinding({ keys: ["j", "down"], help: { key: "↓/j", desc: "down" } }),
 * };
 *
 * function update(msg: Msg) {
 *   if (msg._tag === "key") {
 *     if (matches(msg, keymap.up)) {
 *       // handle up
 *     } else if (matches(msg, keymap.down)) {
 *       // handle down
 *     }
 *   }
 * }
 * ```
 * @public
 */
export function matches(key: Matchable, ...bindings: Binding[]): boolean {
  const keyStr = key.toString()
  for (const binding of bindings) {
    if (!binding.enabled()) {
      continue
    }
    for (const k of binding.keys()) {
      if (keyStr === k) {
        return true
      }
    }
  }
  return false
}

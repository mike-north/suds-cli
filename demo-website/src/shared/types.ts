/**
 * Shared types for demo models.
 */

import type { Cmd, Model, Msg } from '@boba-cli/tea'

/**
 * Interface for demo models that can be run in both Node.js and browser.
 */
export interface DemoModel extends Model<Msg, DemoModel> {
  init(): Cmd<Msg>
  update(msg: Msg): [DemoModel, Cmd<Msg>]
  view(): string
}

/**
 * Factory function type for creating demo instances.
 */
export type DemoFactory = () => DemoModel

/**
 * Demo metadata for registry.
 */
export interface DemoInfo {
  /** Name shown in help */
  name: string
  /** Description shown in help */
  description: string
  /** Filename (e.g., 'spinner-demo.ts') */
  filename: string
  /** Factory to create the demo model */
  create: DemoFactory
}

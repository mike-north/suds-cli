interface SpringConfig {
  /** Oscillation speed (Hz). */
  frequency?: number;
  /** Damping factor (1.0 = critical-ish). */
  damping?: number;
  /** Starting position (0-1). */
  position?: number;
  /** Starting velocity. */
  velocity?: number;
}

/**
 * Minimal damped spring integrator (ported from harmonica).
 * Stores its own position/velocity and integrates using a simple
 * damped harmonic oscillator step.
 */
export class Spring {
  readonly frequency: number;
  readonly damping: number;
  readonly #angular: number;
  readonly #pos: number;
  readonly #vel: number;

  constructor(config: SpringConfig = {}) {
    this.frequency = config.frequency ?? 18;
    this.damping = config.damping ?? 1;
    // Note: using the provided frequency directly (not 2π) keeps the
    // explicit Euler step stable at ~60 FPS for our use case.
    this.#angular = this.frequency;
    this.#pos = config.position ?? 0;
    this.#vel = config.velocity ?? 0;
  }

  /** Current position. */
  position(): number {
    return this.#pos;
  }

  /** Current velocity. */
  velocity(): number {
    return this.#vel;
  }

  /** Return a copy with new spring options, keeping state. */
  withOptions(frequency: number, damping: number): Spring {
    return new Spring({
      frequency,
      damping,
      position: this.#pos,
      velocity: this.#vel,
    });
  }

  /**
   * Integrate toward target over the provided timestep (ms).
   * Returns the new position and velocity.
   */
  update(target: number, deltaMs: number): Spring {
    // Clamp dt to avoid instability on slow frames.
    const dt = Math.min(0.05, Math.max(0, deltaMs / 1000));
    const displacement = this.#pos - target;

    const springForce = -this.#angular * this.#angular * displacement;
    const dampingForce = -2 * this.damping * this.#angular * this.#vel;
    const acceleration = springForce + dampingForce;

    const velocity = this.#vel + acceleration * dt;
    const position = this.#pos + velocity * dt;

    return new Spring({
      frequency: this.frequency,
      damping: this.damping,
      position,
      velocity,
    });
  }
}




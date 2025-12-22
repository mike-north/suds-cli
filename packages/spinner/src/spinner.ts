/**
 * Spinner animation definition with frames and timing.
 * @public
 */
export interface Spinner {
  /** Animation frames to cycle through */
  readonly frames: readonly string[]
  /** Milliseconds per frame */
  readonly fps: number
}

/**
 * Classic line spinner
 * @public
 */
export const line: Spinner = {
  frames: ['|', '/', '-', '\\'],
  fps: 100,
}

/**
 * Braille dot spinner
 * @public
 */
export const dot: Spinner = {
  frames: ['⣾ ', '⣽ ', '⣻ ', '⢿ ', '⡿ ', '⣟ ', '⣯ ', '⣷ '],
  fps: 100,
}

/**
 * Mini braille dot spinner
 * @public
 */
export const miniDot: Spinner = {
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  fps: 83,
}

/**
 * Jumping dot spinner
 * @public
 */
export const jump: Spinner = {
  frames: ['⢄', '⢂', '⢁', '⡁', '⡈', '⡐', '⡠'],
  fps: 100,
}

/**
 * Pulsing block spinner
 * @public
 */
export const pulse: Spinner = {
  frames: ['█', '▓', '▒', '░'],
  fps: 125,
}

/**
 * Moving dot points
 * @public
 */
export const points: Spinner = {
  frames: ['∙∙∙', '●∙∙', '∙●∙', '∙∙●'],
  fps: 143,
}

/**
 * Rotating globe emoji
 * @public
 */
export const globe: Spinner = {
  frames: ['🌍', '🌎', '🌏'],
  fps: 250,
}

/**
 * Moon phases
 * @public
 */
export const moon: Spinner = {
  frames: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
  fps: 125,
}

/**
 * See no evil, hear no evil, speak no evil
 * @public
 */
export const monkey: Spinner = {
  frames: ['🙈', '🙉', '🙊'],
  fps: 333,
}

/**
 * Progress meter style
 * @public
 */
export const meter: Spinner = {
  frames: ['▱▱▱', '▰▱▱', '▰▰▱', '▰▰▰', '▰▰▱', '▰▱▱', '▱▱▱'],
  fps: 143,
}

/**
 * Hamburger menu animation
 * @public
 */
export const hamburger: Spinner = {
  frames: ['☱', '☲', '☴', '☲'],
  fps: 333,
}

/**
 * Growing ellipsis
 * @public
 */
export const ellipsis: Spinner = {
  frames: ['', '.', '..', '...'],
  fps: 333,
}

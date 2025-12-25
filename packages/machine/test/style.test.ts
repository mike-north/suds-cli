import { describe, expect, it } from 'vitest'
import type { ColorSupport } from '../src/types.js'
import { createAlwaysEnabledStyle, createStyle } from '../src/style/index.js'

describe('createStyle', () => {
  describe('with colors enabled (level 3)', () => {
    const colorSupport: ColorSupport = {
      level: 3,
      hasBasic: true,
      has256: true,
      has16m: true,
    }
    const style = createStyle(colorSupport)

    describe('modifiers', () => {
      it('should apply bold', () => {
        expect(style.bold('text')).toBe('\x1b[1mtext\x1b[22m')
      })

      it('should apply dim', () => {
        expect(style.dim('text')).toBe('\x1b[2mtext\x1b[22m')
      })

      it('should apply italic', () => {
        expect(style.italic('text')).toBe('\x1b[3mtext\x1b[23m')
      })

      it('should apply underline', () => {
        expect(style.underline('text')).toBe('\x1b[4mtext\x1b[24m')
      })

      it('should apply inverse', () => {
        expect(style.inverse('text')).toBe('\x1b[7mtext\x1b[27m')
      })

      it('should apply hidden', () => {
        expect(style.hidden('text')).toBe('\x1b[8mtext\x1b[28m')
      })

      it('should apply strikethrough', () => {
        expect(style.strikethrough('text')).toBe('\x1b[9mtext\x1b[29m')
      })
    })

    describe('basic colors', () => {
      it('should apply black', () => {
        expect(style.black('text')).toBe('\x1b[30mtext\x1b[39m')
      })

      it('should apply red', () => {
        expect(style.red('text')).toBe('\x1b[31mtext\x1b[39m')
      })

      it('should apply green', () => {
        expect(style.green('text')).toBe('\x1b[32mtext\x1b[39m')
      })

      it('should apply yellow', () => {
        expect(style.yellow('text')).toBe('\x1b[33mtext\x1b[39m')
      })

      it('should apply blue', () => {
        expect(style.blue('text')).toBe('\x1b[34mtext\x1b[39m')
      })

      it('should apply magenta', () => {
        expect(style.magenta('text')).toBe('\x1b[35mtext\x1b[39m')
      })

      it('should apply cyan', () => {
        expect(style.cyan('text')).toBe('\x1b[36mtext\x1b[39m')
      })

      it('should apply white', () => {
        expect(style.white('text')).toBe('\x1b[37mtext\x1b[39m')
      })
    })

    describe('bright colors', () => {
      it('should apply blackBright (gray)', () => {
        expect(style.blackBright('text')).toBe('\x1b[90mtext\x1b[39m')
      })

      it('should apply gray as alias for blackBright', () => {
        expect(style.gray('text')).toBe('\x1b[90mtext\x1b[39m')
      })

      it('should apply grey as alias for blackBright', () => {
        expect(style.grey('text')).toBe('\x1b[90mtext\x1b[39m')
      })

      it('should apply redBright', () => {
        expect(style.redBright('text')).toBe('\x1b[91mtext\x1b[39m')
      })

      it('should apply greenBright', () => {
        expect(style.greenBright('text')).toBe('\x1b[92mtext\x1b[39m')
      })

      it('should apply yellowBright', () => {
        expect(style.yellowBright('text')).toBe('\x1b[93mtext\x1b[39m')
      })

      it('should apply blueBright', () => {
        expect(style.blueBright('text')).toBe('\x1b[94mtext\x1b[39m')
      })

      it('should apply magentaBright', () => {
        expect(style.magentaBright('text')).toBe('\x1b[95mtext\x1b[39m')
      })

      it('should apply cyanBright', () => {
        expect(style.cyanBright('text')).toBe('\x1b[96mtext\x1b[39m')
      })

      it('should apply whiteBright', () => {
        expect(style.whiteBright('text')).toBe('\x1b[97mtext\x1b[39m')
      })
    })

    describe('background colors', () => {
      it('should apply bgBlack', () => {
        expect(style.bgBlack('text')).toBe('\x1b[40mtext\x1b[49m')
      })

      it('should apply bgRed', () => {
        expect(style.bgRed('text')).toBe('\x1b[41mtext\x1b[49m')
      })

      it('should apply bgGreen', () => {
        expect(style.bgGreen('text')).toBe('\x1b[42mtext\x1b[49m')
      })

      it('should apply bgYellow', () => {
        expect(style.bgYellow('text')).toBe('\x1b[43mtext\x1b[49m')
      })

      it('should apply bgBlue', () => {
        expect(style.bgBlue('text')).toBe('\x1b[44mtext\x1b[49m')
      })

      it('should apply bgMagenta', () => {
        expect(style.bgMagenta('text')).toBe('\x1b[45mtext\x1b[49m')
      })

      it('should apply bgCyan', () => {
        expect(style.bgCyan('text')).toBe('\x1b[46mtext\x1b[49m')
      })

      it('should apply bgWhite', () => {
        expect(style.bgWhite('text')).toBe('\x1b[47mtext\x1b[49m')
      })

      it('should apply bgBlackBright', () => {
        expect(style.bgBlackBright('text')).toBe('\x1b[100mtext\x1b[49m')
      })

      it('should apply bgRedBright', () => {
        expect(style.bgRedBright('text')).toBe('\x1b[101mtext\x1b[49m')
      })

      it('should apply bgGreenBright', () => {
        expect(style.bgGreenBright('text')).toBe('\x1b[102mtext\x1b[49m')
      })

      it('should apply bgYellowBright', () => {
        expect(style.bgYellowBright('text')).toBe('\x1b[103mtext\x1b[49m')
      })

      it('should apply bgBlueBright', () => {
        expect(style.bgBlueBright('text')).toBe('\x1b[104mtext\x1b[49m')
      })

      it('should apply bgMagentaBright', () => {
        expect(style.bgMagentaBright('text')).toBe('\x1b[105mtext\x1b[49m')
      })

      it('should apply bgCyanBright', () => {
        expect(style.bgCyanBright('text')).toBe('\x1b[106mtext\x1b[49m')
      })

      it('should apply bgWhiteBright', () => {
        expect(style.bgWhiteBright('text')).toBe('\x1b[107mtext\x1b[49m')
      })
    })

    describe('extended colors', () => {
      it('should apply hex color (6 digits)', () => {
        const result = style.hex('#ff5733')('text')
        expect(result).toBe('\x1b[38;2;255;87;51mtext\x1b[39m')
      })

      it('should apply hex color (3 digits)', () => {
        const result = style.hex('#f57')('text')
        expect(result).toBe('\x1b[38;2;255;85;119mtext\x1b[39m')
      })

      it('should apply hex color without #', () => {
        const result = style.hex('ff5733')('text')
        expect(result).toBe('\x1b[38;2;255;87;51mtext\x1b[39m')
      })

      it('should apply rgb color', () => {
        const result = style.rgb(255, 87, 51)('text')
        expect(result).toBe('\x1b[38;2;255;87;51mtext\x1b[39m')
      })

      it('should apply bgHex color', () => {
        const result = style.bgHex('#ff5733')('text')
        expect(result).toBe('\x1b[48;2;255;87;51mtext\x1b[49m')
      })

      it('should apply bgRgb color', () => {
        const result = style.bgRgb(255, 87, 51)('text')
        expect(result).toBe('\x1b[48;2;255;87;51mtext\x1b[49m')
      })

      it('should apply ansi256 color', () => {
        const result = style.ansi256(208)('text')
        expect(result).toBe('\x1b[38;5;208mtext\x1b[39m')
      })

      it('should apply bgAnsi256 color', () => {
        const result = style.bgAnsi256(208)('text')
        expect(result).toBe('\x1b[48;5;208mtext\x1b[49m')
      })
    })

    describe('chaining', () => {
      it('should chain modifiers', () => {
        const result = style.bold.italic('text')
        expect(result).toBe('\x1b[1m\x1b[3mtext\x1b[23m\x1b[22m')
      })

      it('should chain colors', () => {
        const result = style.red.bgWhite('text')
        expect(result).toBe('\x1b[31m\x1b[47mtext\x1b[49m\x1b[39m')
      })

      it('should chain modifiers and colors', () => {
        const result = style.bold.red.bgWhite('text')
        expect(result).toBe('\x1b[1m\x1b[31m\x1b[47mtext\x1b[49m\x1b[39m\x1b[22m')
      })

      it('should handle complex chaining', () => {
        const result = style.bold.underline.red.bgYellow('text')
        expect(result).toBe(
          '\x1b[1m\x1b[4m\x1b[31m\x1b[43mtext\x1b[49m\x1b[39m\x1b[24m\x1b[22m',
        )
      })

      it('should properly nest styles in text with existing codes', () => {
        const inner = style.red('inner')
        const result = style.bold(inner)
        // Follows chalk-like behavior: no restoration of outer styles after inner resets
        expect(result).toBe('\x1b[1m\x1b[31minner\x1b[39m\x1b[22m')
      })
    })
  })

  describe('with colors disabled (level 0)', () => {
    const colorSupport: ColorSupport = {
      level: 0,
      hasBasic: false,
      has256: false,
      has16m: false,
    }
    const style = createStyle(colorSupport)

    it('should passthrough text without modification', () => {
      expect(style('text')).toBe('text')
    })

    it('should not apply bold', () => {
      expect(style.bold('text')).toBe('text')
    })

    it('should not apply colors', () => {
      expect(style.red('text')).toBe('text')
    })

    it('should not apply background colors', () => {
      expect(style.bgBlue('text')).toBe('text')
    })

    it('should not apply chained styles', () => {
      expect(style.bold.red.bgWhite('text')).toBe('text')
    })

    it('should not apply hex colors', () => {
      expect(style.hex('#ff5733')('text')).toBe('text')
    })

    it('should not apply rgb colors', () => {
      expect(style.rgb(255, 87, 51)('text')).toBe('text')
    })

    it('should not apply ansi256 colors', () => {
      expect(style.ansi256(208)('text')).toBe('text')
    })
  })

  describe('with basic colors only (level 1)', () => {
    const colorSupport: ColorSupport = {
      level: 1,
      hasBasic: true,
      has256: false,
      has16m: false,
    }
    const style = createStyle(colorSupport)

    it('should apply basic colors', () => {
      expect(style.red('text')).toBe('\x1b[31mtext\x1b[39m')
    })

    it('should apply modifiers', () => {
      expect(style.bold('text')).toBe('\x1b[1mtext\x1b[22m')
    })

    it('should not apply 256 colors', () => {
      expect(style.ansi256(208)('text')).toBe('text')
    })

    it('should not apply true color', () => {
      expect(style.hex('#ff5733')('text')).toBe('text')
    })
  })

  describe('with 256 colors (level 2)', () => {
    const colorSupport: ColorSupport = {
      level: 2,
      hasBasic: true,
      has256: true,
      has16m: false,
    }
    const style = createStyle(colorSupport)

    it('should apply basic colors', () => {
      expect(style.red('text')).toBe('\x1b[31mtext\x1b[39m')
    })

    it('should apply 256 colors', () => {
      expect(style.ansi256(208)('text')).toBe('\x1b[38;5;208mtext\x1b[39m')
    })

    it('should not apply true color', () => {
      expect(style.hex('#ff5733')('text')).toBe('text')
    })
  })

  describe('edge cases', () => {
    const colorSupport: ColorSupport = {
      level: 3,
      hasBasic: true,
      has256: true,
      has16m: true,
    }
    const style = createStyle(colorSupport)

    it('should handle empty strings', () => {
      expect(style.red('')).toBe('\x1b[31m\x1b[39m')
    })

    it('should handle strings with newlines', () => {
      expect(style.red('line1\nline2')).toBe('\x1b[31mline1\nline2\x1b[39m')
    })

    it('should handle strings with special characters', () => {
      expect(style.red('tab\there')).toBe('\x1b[31mtab\there\x1b[39m')
    })

    it('should handle multiple word strings', () => {
      expect(style.bold('hello world')).toBe('\x1b[1mhello world\x1b[22m')
    })
  })
})

describe('createAlwaysEnabledStyle', () => {
  const style = createAlwaysEnabledStyle()

  it('should always apply colors', () => {
    expect(style.red('text')).toBe('\x1b[31mtext\x1b[39m')
  })

  it('should support true color', () => {
    expect(style.hex('#ff5733')('text')).toBe('\x1b[38;2;255;87;51mtext\x1b[39m')
  })

  it('should support 256 colors', () => {
    expect(style.ansi256(208)('text')).toBe('\x1b[38;5;208mtext\x1b[39m')
  })

  it('should support chaining', () => {
    expect(style.bold.red('text')).toBe('\x1b[1m\x1b[31mtext\x1b[39m\x1b[22m')
  })
})

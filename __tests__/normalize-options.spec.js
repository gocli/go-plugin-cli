const { normalizeOptions } = require('../lib/normalize-options')

describe('normalizeOptions()', () => {
  it('is a function', () => {
    expect(typeof normalizeOptions).toBe('function')
  })

  it('returns default options', () => {
    expect(normalizeOptions({})).toEqual({ cli: {}, guide: {} })
  })

  it('fails if options is not an object', () => {
    expect(() => normalizeOptions(null))
      .toThrow('options argument should be defined as an object')
  })

  describe('cli', () => {
    it('works properly when cli is an empty object', () => {
      expect(normalizeOptions({ cli: {} }))
        .toEqual({ cli: {}, guide: {} })
    })

    it('adds allowShort to cli property', () => {
      expect(normalizeOptions({ cli: { allowShort: true } }))
        .toEqual({ cli: { allowShort: true }, guide: {} })
    })

    it('adds allowShort to cli property even if it is falsy', () => {
      expect(normalizeOptions({ cli: { allowShort: false } }))
        .toEqual({ cli: { allowShort: false }, guide: {} })
    })

    it('ignores cli if it is not an object', () => {
      expect(normalizeOptions({ cli: 42 }))
        .toEqual({ cli: {}, guide: {} })
    })
  })

  describe('guide', () => {
    it('works properly when guide is an empty object', () => {
      expect(normalizeOptions({ guide: {} }))
        .toEqual({ cli: {}, guide: {} })
    })

    it('adds firstMessage to guide property', () => {
      expect(normalizeOptions({ guide: { firstMessage: 'hello' } }))
        .toEqual({ cli: {}, guide: { firstMessage: 'hello' } })
    })

    it('ignores firstMessage if it is not a string', () => {
      expect(normalizeOptions({ guide: { firstMessage: 42 } }))
        .toEqual({ cli: {}, guide: {} })
    })

    it('adds beforeCallback to guide property if guide is set to function', () => {
      const cb = () => {}
      expect(normalizeOptions({ guide: cb }))
        .toEqual({ cli: {}, guide: { beforeCallback: cb } })
    })

    it('adds beforeCallback to guide property', () => {
      const cb = () => {}
      expect(normalizeOptions({ guide: { beforeCallback: cb } }))
        .toEqual({ cli: {}, guide: { beforeCallback: cb } })
    })

    it('ignores beforeCallback if it is not a function', () => {
      expect(normalizeOptions({ guide: { beforeCallback: 42 } }))
        .toEqual({ cli: {}, guide: {} })
    })

    it('ignores guide if it is not an object or a function', () => {
      expect(normalizeOptions({ guide: 42 }))
        .toEqual({ cli: {}, guide: {} })
    })
  })
})

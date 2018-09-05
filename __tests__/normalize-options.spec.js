const { normalizeOptions } = require('../lib/normalize-options')

describe('normalizeOptions()', () => {
  it('is a function', () => {
    expect(typeof normalizeOptions).toBe('function')
  })

  it('returns default options', () => {
    expect(normalizeOptions({})).toEqual({ guide: {} })
  })

  it('fails if options is not an object', () => {
    expect(() => normalizeOptions(null))
      .toThrow('options argument should be defined as an object')
  })

  it('adds firstMessage to guide property', () => {
    expect(normalizeOptions({ guide: { firstMessage: 'hello' } }))
      .toEqual({ guide: { firstMessage: 'hello' } })
  })

  it('ignores firstMessage if it is not a string', () => {
    expect(normalizeOptions({ guide: { firstMessage: 42 } }))
      .toEqual({ guide: {} })
  })

  it('adds beforeCallback to guide property if guide is set to function', () => {
    const cb = () => {}
    expect(normalizeOptions({ guide: cb }))
      .toEqual({ guide: { beforeCallback: cb } })
  })

  it('adds beforeCallback to guide property', () => {
    const cb = () => {}
    expect(normalizeOptions({ guide: { beforeCallback: cb } }))
      .toEqual({ guide: { beforeCallback: cb } })
  })

  it('ignores beforeCallback if it is not a function', () => {
    expect(normalizeOptions({ guide: { beforeCallback: 42 } }))
      .toEqual({ guide: {} })
  })

  it('ignores guide if it is not an object or a function', () => {
    expect(normalizeOptions({ guide: 42 }))
      .toEqual({ guide: {} })
  })
})

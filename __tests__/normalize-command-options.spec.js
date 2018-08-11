const { normalizeCommandOptions } = require('../lib/helpers/normalize-command-options')

describe('normalizeCommandOtions()', () => {
  it('normalize options list', () => {
    const options = {
      who: String,
      force: Boolean,
      why: { default: 'because' },
      module: { alias: 'm' },
      modules: { alias: ['s', 'mods'] }
    }

    const expectedOptions = {
      who: { type: String, default: undefined, alias: [] },
      force: { type: Boolean, default: undefined, alias: [] },
      why: { type: String, default: 'because', alias: [] },
      module: { type: String, default: undefined, alias: ['m'] },
      modules: { type: String, default: undefined, alias: ['mods', 's'] }
    }

    const parsed = normalizeCommandOptions(options)
    parsed.modules.alias.sort()
    expect(parsed).toEqual(expectedOptions)
  })

  it('normalize inherited option list', () => {
    const options = {
      child: Boolean,
      force: { default: false, alias: ['f'] },
      location: { alias: ['map', 'm', 'l'] },
      version: { alias: 'v' }
    }

    const inherited = {
      parent: String,
      force: Boolean,
      location: { alias: 'l' },
      version: { default: '0.0.0' }
    }

    const normalized = normalizeCommandOptions(options, normalizeCommandOptions(inherited))
    normalized.location.alias.sort()

    expect(normalized)
      .toEqual({
        child: { type: Boolean, default: undefined, alias: [] },
        parent: { type: String, default: undefined, alias: [] },
        force: { type: Boolean, default: false, alias: ['f'] },
        location: { type: String, default: undefined, alias: ['l', 'm', 'map'] },
        version: { type: String, default: '0.0.0', alias: ['v'] }
      })
  })

  it('fails when trying to redefine inherited option type', () => {
    expect(() => normalizeCommandOptions({ location: Boolean }, normalizeCommandOptions({ location: String })))
      .toThrowError(
        '`location.type` is defined in parent command as `String` and can not be redefined (given: Boolean)'
      )

    expect(() => normalizeCommandOptions({ location: String }, normalizeCommandOptions({ location: Boolean })))
      .toThrowError(
        '`location.type` is defined in parent command as `Boolean` and can not be redefined (given: String)'
      )
  })

  it('fails when trying to redefine inherited option default', () => {
    const options = {
      version: { default: '0.0.0' }
    }

    const inherited = {
      version: { default: '0.0.1' }
    }

    expect(() => normalizeCommandOptions(options, normalizeCommandOptions(inherited)))
      .toThrowError('`version.default` is defined in parent command as `0.0.1` and can not be redefined (given: "0.0.0")')
  })

  it('fails when trying to reuse existing aliases in sub commands', () => {
    const options = {
      version: { alias: 'v' }
    }
    const inherited = {
      verbose: { alias: 'v' }
    }

    expect(() => normalizeCommandOptions(options, normalizeCommandOptions(inherited)))
      .toThrowError('aliases can not be redefined in inherited options (`v` is used for `verbose`, `version`)')
  })

  it('throws if options are invalid', () => {
    const invalidOptionMsg = '`option` should be either Boolean, String or Object({ type, default, alias })'
    expect(() => normalizeCommandOptions({}))
      .not.toThrow()

    expect(() => normalizeCommandOptions({ prop: null }))
      .toThrowError(`${invalidOptionMsg} (given: null)`)

    expect(() => normalizeCommandOptions({ prop: 'boolean' }))
      .toThrowError(`${invalidOptionMsg} (given: "boolean")`)

    expect(() => normalizeCommandOptions({ prop: { type: 'boolean' } }))
      .toThrowError('`prop.type` should be either Boolean or String (given: "boolean")')

    expect(() => normalizeCommandOptions({ prop: { alias: 1 } }))
      .toThrowError('`prop.alias` should be a string or an array of strings (given: 1)')

    expect(() => normalizeCommandOptions({ prop: { alias: [1] } }))
      .toThrowError('`prop.alias` should be a string or an array of strings (given: [1])')
  })
})

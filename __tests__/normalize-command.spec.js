const { normalizeCommand } = require('../lib/normalize-command')

describe('normalizeCommand()', () => {
  const name = 'command'
  const callback = () => {}

  it('is a function', () => {
    expect(typeof normalizeCommand).toBe('function')
  })

  it('throws if properties are invalid', () => {
    expect(() => normalizeCommand(() => {}))
      .toThrowError('`command` should be an object (given: "() => {}")')
    expect(() => normalizeCommand({}))
      .toThrowError('`name` should be not empty string (given: undefined)')
    expect(() => normalizeCommand({ randomPropertyHere: 1 }))
      .toThrowError('`name` should be not empty string (given: undefined)')
    expect(() => normalizeCommand({ name: null }))
      .toThrowError('`name` should be not empty string (given: null)')
    expect(() => normalizeCommand({ name }))
      .toThrowError('`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
    expect(() => normalizeCommand({ name, callback: 1 }))
      .toThrowError('`callback` must be a function (given: 1)')
    expect(() => normalizeCommand({ name, commands: [] }))
      .toThrowError('`commands` must be an array and it can not be empty (given: [])')
    expect(() => normalizeCommand({ name, commands: [ name ] }))
      .toThrowError('`command` should be an object (given: "command")')
    expect(() => normalizeCommand({ name, callback, description: 1 }))
      .toThrowError('`description` must be a string (given: 1)')
    expect(() => normalizeCommand({ name, callback, title: 1 }))
      .toThrowError('`title` must be a string (given: 1)')
    expect(() => normalizeCommand({ name, callback, prefix: 1 }))
      .toThrowError('`prefix` must be a string (given: 1)')
  })

  it('throws if options are invalid', () => {
    const invalidOptionMsg = '`option` should be either Boolean, String or Object({ type, default, alias })'
    expect(() => normalizeCommand({ name, callback, options: {} }))
      .not.toThrow()

    expect(() => normalizeCommand({ name, callback, options: { prop: null } }))
      .toThrowError(`${invalidOptionMsg} (given: null)`)

    expect(() => normalizeCommand({ name, callback, options: { prop: 'boolean' } }))
      .toThrowError(`${invalidOptionMsg} (given: "boolean")`)

    expect(() => normalizeCommand({ name, callback, options: { prop: { type: 'boolean' } } }))
      .toThrowError('`prop.type` should be either Boolean or String (given: "boolean")')

    expect(() => normalizeCommand({ name, callback, options: { prop: { alias: 1 } } }))
      .toThrowError('`prop.alias` should be a string or an array of strings (given: 1)')

    expect(() => normalizeCommand({ name, callback, options: { prop: { alias: [1] } } }))
      .toThrowError('`prop.alias` should be a string or an array of strings (given: [1])')
  })

  it('normalize valid commands', () => {
    expect(normalizeCommand({ name, callback }))
      .toEqual({ name, callback })

    expect(normalizeCommand({ name, commands: [{ name, callback }] }))
      .toEqual({ name, commands: [{ name, callback }] })

    const props = {
      name: ' name ',
      description: ' description ',
      title: ' title ',
      prefix: ' prefix ',
      options: {
        force: { type: Boolean, default: false, alias: 'f' },
        who: String
      }
    }

    const normalized = {
      name: 'name',
      description: ' description ',
      title: ' title ',
      prefix: ' prefix ',
      options: {
        force: { type: Boolean, default: false, alias: [ 'f' ] },
        who: { type: String, default: undefined, alias: [] }
      }
    }

    const source = Object.assign({}, props, {
      commands: [Object.assign({}, props, { callback })]
    })
    const expected = Object.assign({}, normalized, {
      commands: [Object.assign({}, normalized, { callback })]
    })

    expect(normalizeCommand(source))
      .toEqual(expected)
  })

  it('normalize options list', () => {
    const command = {
      name,
      callback,
      options: {
        who: String,
        force: Boolean,
        why: { default: 'because' },
        module: { alias: 'm' },
        modules: { alias: ['s', 'mods'] }
      }
    }

    const expectedOptions = {
      who: { type: String, default: undefined, alias: [] },
      force: { type: Boolean, default: undefined, alias: [] },
      why: { type: String, default: 'because', alias: [] },
      module: { type: String, default: undefined, alias: ['m'] },
      modules: { type: String, default: undefined, alias: ['mods', 's'] }
    }

    const parsed = normalizeCommand(command).options
    parsed.modules.alias.sort()
    expect(parsed).toEqual(expectedOptions)
  })

  it('normalize inherited option list', () => {
    const nested = {
      name,
      callback,
      options: {
        child: Boolean,
        force: { default: false, alias: ['f'] },
        location: { alias: ['map', 'm', 'l'] },
        version: { alias: 'v' }
      }
    }

    const command = {
      name,
      commands: [ nested ],
      options: {
        parent: String,
        force: Boolean,
        location: { alias: 'l' },
        version: { default: '0.0.0' }
      }
    }

    const parsed = normalizeCommand(command)
    parsed.commands[0].options.location.alias.sort()

    expect(parsed)
      .toEqual({
        name,
        description: undefined,
        title: undefined,
        prefix: undefined,
        callback: undefined,
        options: {
          parent: { type: String, default: undefined, alias: [] },
          force: { type: Boolean, default: undefined, alias: [] },
          location: { type: String, default: undefined, alias: ['l'] },
          version: { type: String, default: '0.0.0', alias: [] }
        },
        commands: [{
          name,
          callback,
          description: undefined,
          title: undefined,
          prefix: undefined,
          commands: undefined,
          options: {
            child: { type: Boolean, default: undefined, alias: [] },
            parent: { type: String, default: undefined, alias: [] },
            force: { type: Boolean, default: false, alias: ['f'] },
            location: { type: String, default: undefined, alias: ['l', 'm', 'map'] },
            version: { type: String, default: '0.0.0', alias: ['v'] }
          }
        }]
      })
  })

  it('fails when trying to redefine inherited option type', () => {
    const command1 = {
      name,
      commands: [ { name, callback, options: { location: Boolean } } ],
      options: { location: String }
    }

    const command2 = {
      name,
      commands: [ { name, callback, options: { location: String } } ],
      options: { location: Boolean }
    }

    expect(() => normalizeCommand(command1))
      .toThrowError(
        '`location.type` is defined in parent command as `String` and can not be redefined (given: Boolean)'
      )

    expect(() => normalizeCommand(command2))
      .toThrowError(
        '`location.type` is defined in parent command as `Boolean` and can not be redefined (given: String)'
      )
  })

  it('fails when trying to redefine inherited option default', () => {
    const nested = {
      name,
      callback,
      options: {
        version: { default: '0.0.0' }
      }
    }

    const command = {
      name,
      commands: [ nested ],
      options: {
        version: { default: '0.0.1' }
      }
    }

    expect(() => normalizeCommand(command))
      .toThrowError('`version.default` is defined in parent command as `0.0.1` and can not be redefined')
  })

  it('fails when trying to reuse existing aliases in sub commands', () => {
    const nested = {
      name,
      callback,
      options: {
        version: { alias: 'v' }
      }
    }

    const command = {
      name,
      commands: [ nested ],
      options: {
        verbose: { alias: 'v' }
      }
    }

    expect(() => normalizeCommand(command))
      .toThrowError('aliases can not be redefined in inherited options (`v` is used for verbose, version)')
  })
})

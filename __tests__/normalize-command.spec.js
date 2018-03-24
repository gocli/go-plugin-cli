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
      .toThrowError('`option.type` should be either Boolean or String (given: "boolean")')

    expect(() => normalizeCommand({ name, callback, options: { prop: { alias: 1 } } }))
      .toThrowError('`option.alias` should be a string or an array of strings (given: 1)')

    expect(() => normalizeCommand({ name, callback, options: { prop: { alias: [1] } } }))
      .toThrowError('`option.alias` should be a string or an array of strings (given: [1])')
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
      modules: { type: String, default: undefined, alias: ['s', 'mods'] }
    }

    expect(normalizeCommand(command).options)
      .toEqual(expectedOptions)
  })
})

const { normalizeCommand } = require('../lib/normalize-command')

describe('normalizeCommand()', () => {
  const name = 'command'
  const callback = () => {}

  it('is a function', () => {
    expect(typeof normalizeCommand).toBe('function')
  })

  it('throws', () => {
    expect(() => normalizeCommand(() => {}))
      .toThrowError('`command` should be a string, an object or an array and can not be empty (given: "() => {}")')
    expect(() => normalizeCommand({}))
      .toThrowError('`command` should be a string, an object or an array and can not be empty (given: {})')
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
      .toThrowError('`description` must be not empty string (given: 1)')
    expect(() => normalizeCommand({ name, callback, description: ' ' }))
      .toThrowError('`description` must be not empty string (given: " ")')
    expect(() => normalizeCommand({ name, callback, title: 1 }))
      .toThrowError('`title` must be not empty string (given: 1)')
    expect(() => normalizeCommand({ name, callback, title: ' ' }))
      .toThrowError('`title` must be not empty string (given: " ")')
    expect(() => normalizeCommand({ name, callback, prefix: 1 }))
      .toThrowError('`prefix` must be not empty string (given: 1)')
    expect(() => normalizeCommand({ name, callback, prefix: ' ' }))
      .toThrowError('`prefix` must be not empty string (given: " ")')
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
      prefix: ' prefix '
    }

    const normalized = {
      name: 'name',
      description: 'description',
      title: 'title',
      prefix: 'prefix'
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
})

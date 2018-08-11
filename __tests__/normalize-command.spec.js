const mockNormalizeCommandOptions = (() => {
  const mock = { normalizeCommandOptions: jest.fn() }
  jest.mock('../lib/helpers/normalize-command-options', () => mock)
  return mock.normalizeCommandOptions
})()

const { normalizeCommand } = require('../lib/helpers/normalize-command')

describe('normalizeCommand()', () => {
  const name = 'command'
  const callback = () => {}

  beforeEach(() => {
    mockNormalizeCommandOptions.mockReset()
  })

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

  it('normalize valid command with callback only', () => {
    expect(normalizeCommand({ name, callback }))
      .toEqual({ name, callback })
  })

  it('normalize valid command with sub-command only', () => {
    const normalized = normalizeCommand({ name, commands: [{ name, callback }] })
    const parent = normalized.commands[0].parent
    delete normalized.commands[0].parent

    expect(normalized).toEqual({ name, commands: [{ name, callback }] })
    expect(parent).toEqual(normalized)
  })

  it('normalize valid command with all properties', () => {
    const sourceCmd = {
      name: ' name ',
      description: ' description ',
      title: ' title ',
      prefix: ' prefix ',
      when: ' force '
    }

    const expectedCmd = {
      name: 'name',
      description: ' description ',
      title: ' title ',
      prefix: ' prefix ',
      when: ' force '
    }

    const source = Object.assign({}, sourceCmd, {
      commands: [Object.assign({}, sourceCmd, { callback })]
    })
    const expected = Object.assign({}, expectedCmd, {
      commands: [Object.assign({}, expectedCmd, { callback })]
    })

    const normalized = normalizeCommand(source)
    const parent = normalized.commands[0].parent
    delete normalized.commands[0].parent

    expect(normalized).toEqual(expected)
    expect(parent).toEqual(normalized)
  })

  it('normalizes options list', () => {
    const givenOptions = 'OPTIONS'
    const expectedOptions = { NORMALIZED: {} }

    mockNormalizeCommandOptions.mockReturnValue(expectedOptions)

    expect(normalizeCommand({ name, callback, options: givenOptions }))
      .toEqual({ name, callback, options: expectedOptions })
    expect(mockNormalizeCommandOptions)
      .toHaveBeenCalledTimes(1)
    expect(mockNormalizeCommandOptions)
      .toHaveBeenCalledWith(givenOptions, undefined)
  })

  it('normalizes options list with inherited options', () => {
    const givenOptions = 'OPTIONS'
    const givenChildOptions = 'CHILD_OPTIONS'
    const expectedOptions = { NORMALIZED: {} }
    const expectedChildOptions = { CHILD_NORMALIZED: {} }
    const cmd = {
      name,
      options: givenOptions,
      commands: [{ name, callback, options: givenChildOptions }]
    }

    mockNormalizeCommandOptions.mockImplementation((opts) => {
      if (opts === givenOptions) return expectedOptions
      if (opts === givenChildOptions) return expectedChildOptions
      return 'FAILED'
    })

    normalizeCommand(cmd)

    expect(mockNormalizeCommandOptions)
      .toHaveBeenCalledTimes(2)
    expect(mockNormalizeCommandOptions)
      .toHaveBeenCalledWith(givenOptions, undefined)
    expect(mockNormalizeCommandOptions)
      .toHaveBeenCalledWith(givenChildOptions, expectedOptions)
  })
})

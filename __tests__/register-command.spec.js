const { registerCommand } = require('../lib/register-command')

describe('registerCommand()', () => {
  it('is a function', () => {
    expect(typeof registerCommand).toBe('function')
  })

  it('creates command with the short syntax', () => {
    const name = 'ping'
    const callback = () => 'pong'

    const commands = []
    registerCommand(commands, name, callback)
    expect(commands.length).toBe(1)
    expect(commands).toContainEqual({ name, callback })
  })

  it('register object-formatted command', () => {
    const name = 'ping'
    const callback = () => 'pong'

    const commands = []
    registerCommand(commands, { name, callback })
    expect(commands.length).toBe(1)
    expect(commands).toContainEqual({ name, callback })
  })

  it('register multiple commands', () => {
    const [ command1, command2 ] = [
      { name: 'command1', callback () {} },
      { name: 'command2', callback () {} }
    ]

    const commands = []
    registerCommand(commands, [ command1, command2 ])
    expect(commands.length).toBe(2)
    expect(commands).toContainEqual(command1)
    expect(commands).toContainEqual(command2)
  })

  it('ignore callback option when it is in an object', () => {
    const name = 'foo'
    const callback = () => 'bar'
    const commands = []

    registerCommand(commands, { name, callback }, () => 'baz')
    expect(commands[0].callback()).toBe('bar')
  })

  it('trigger errors', () => {
    expect(() => registerCommand([])).toThrowError('`command` is required')
    expect(() => registerCommand([], 1)).toThrowError('`command` should be an object (given: 1)')
    expect(() => registerCommand([], '')).toThrowError('`name` should be not empty string (given: "")')
    expect(() => registerCommand([], ' ')).toThrowError('`name` should be not empty string (given: " ")')
    expect(() => registerCommand([], null)).toThrowError('`command` should be an object (given: null)')
    expect(() => registerCommand([], 'command')).toThrowError('`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
  })

  it('register with meta properties', () => {
    const command = {
      name: 'command',
      title: 'TITLE',
      prefix: 'PREFIX',
      description: 'DESCRIPTION',
      callback () {}
    }

    const commands = []

    registerCommand(commands, command)
    expect(commands[0]).toEqual(command)
  })

  it('register one command with unknown options', () => {
    const command = { name: 'command', callback () {} }
    const unknownProperty = '__unknownProperty__'
    const commands = []
    command[unknownProperty] = 1

    registerCommand(commands, command)
    expect(commands[0]).not.toHaveProperty(unknownProperty)
  })

  it('register nested command', () => {
    const nested = { name: 'nested', callback () {} }
    const command = {
      name: 'command',
      callback () {},
      commands: [ nested ]
    }
    const commands = []

    registerCommand(commands, command)
    const { parent } = commands[0].commands[0]
    delete commands[0].commands[0].parent

    expect(commands.length).toBe(1)
    expect(commands).toContainEqual({
      name: command.name,
      callback: command.callback,
      commands: [ nested ]
    })
    expect(parent).toEqual(commands[0])
  })

  it('register multiple nested commands', () => {
    const nested1 = { name: 'nested1', callback () {} }
    const nested2 = { name: 'nested2', callback () {} }
    const command = {
      name: 'command',
      callback () {},
      commands: [ nested1, nested2 ]
    }
    const commands = []

    registerCommand(commands, command)
    const parent1 = commands[0].commands[0].parent
    delete commands[0].commands[0].parent
    const parent2 = commands[0].commands[1].parent
    delete commands[0].commands[1].parent

    expect(commands.length).toBe(1)
    expect(commands).toContainEqual({
      name: command.name,
      callback: command.callback,
      commands: [ nested1, nested2 ]
    })
    expect(parent1).toEqual(commands[0])
    expect(parent2).toEqual(commands[0])
  })
})

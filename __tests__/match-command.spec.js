const { matchCommand } = require('../lib/match-command')

describe('matchCommand()', () => {
  const callback = () => {}
  const nestedCommands = [
    { name: 'nested1', callback },
    { name: 'nested2', callback },
    { name: 'nested3', callback }
  ]
  const commands = [
    { name: 'command1', callback },
    { name: 'command2', callback },
    { name: 'command3', commands: nestedCommands }
  ]

  const [ command1, command2, command3 ] = commands

  it('is a function', () => {
    expect(typeof matchCommand).toBe('function')
  })

  it('returns undefined if list is empty', () => {
    expect(matchCommand([], '')).not.toBeDefined()
  })

  it('matches commands', () => {
    expect(matchCommand(commands, command1.name)).toEqual(command1)
    expect(matchCommand(commands, `${command2.name} extra`)).toEqual(command2)
    expect(matchCommand(commands, `${command3.name} --and --with flags`)).toEqual(command3)
  })

  it('matches nested commands', () => {
    expect(matchCommand(commands, `${command3.name} ${command3.commands[0].name}`))
      .toEqual(command3.commands[0])
    expect(matchCommand(commands, `${command3.name} ${command3.commands[1].name} extra`))
      .toEqual(command3.commands[1])
    expect(matchCommand(commands, `${command3.name} ${command3.commands[2].name} --and --with flags`))
      .toEqual(command3.commands[2])
  })

  it('filters commands by `when` option if it is a function', () => {
    const commands = [
      {
        callback: jest.fn(),
        name: 'command'
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: ({ name, force }) => force && name === 'some'
      },
      {
        callback: jest.fn(),
        name: 'generate'
      },
      {
        callback: jest.fn(),
        name: 'generate',
        when: ({ _ }) => _[1] === 'component'
      }
    ]

    const [ woFilter, wFilter, generalGenerate, componentGenerate ] = commands

    expect(matchCommand(commands, 'command --force --name some')).toEqual(wFilter)
    expect(matchCommand(commands, 'command --force --name someone')).toEqual(woFilter)
    expect(matchCommand(commands, 'command')).toEqual(woFilter)

    expect(matchCommand(commands, 'generate')).toEqual(generalGenerate)
    expect(matchCommand(commands, 'generate component')).toEqual(componentGenerate)
  })

  it('filters commands by `when` option if it is a string', () => {
    const commands = [
      {
        callback: jest.fn(),
        name: 'command'
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: 'force'
      }
    ]

    const [ woForce, wForce ] = commands

    expect(matchCommand(commands, 'command --force')).toEqual(wForce)
    expect(matchCommand(commands, 'command')).toEqual(woForce)
  })

  it('filters commands by `when` option if it is an array', () => {
    const commands = [
      {
        callback: jest.fn(),
        name: 'command'
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: ['force']
      },
      {
        callback: jest.fn(),
        name: 'command',
        options: {
          force: { type: Boolean, default: undefined, alias: [] }
        },
        when: ['force', 'name']
      }
    ]

    const [ firstCommandWithoutForce, secondCommandWithForce, lastCommandWithForceAndName ] = commands

    expect(matchCommand(commands, 'command --force')).toEqual(secondCommandWithForce)
    expect(matchCommand(commands, 'command')).toEqual(firstCommandWithoutForce)
    expect(matchCommand(commands, 'command --no-force')).toEqual(firstCommandWithoutForce)
    expect(matchCommand(commands, 'command --force --name some')).toEqual(lastCommandWithForceAndName)
  })

  it('filters commands by `when` option if it is an object', () => {
    const commands = [
      {
        callback: jest.fn(),
        name: 'command',
        options: {
          force: { type: Boolean, default: undefined, alias: [] }
        },
        when: { force: false }
      },
      {
        callback: jest.fn(),
        name: 'command',
        options: {
          force: { type: Boolean, default: undefined, alias: [] }
        },
        when: { force: true }
      }
    ]

    const [ woForce, wForce ] = commands

    expect(matchCommand(commands, 'command --force')).toEqual(wForce)
    expect(matchCommand(commands, 'command')).toEqual(woForce)
  })

  it('filters commands by `when` they are specified interpreting them as boolean', () => {
    const commands = [
      {
        callback: jest.fn(),
        name: 'command'
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: true
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: null
      },
      {
        callback: jest.fn(),
        name: 'command',
        when: false
      }
    ]

    const alwaysValidCommand = commands[1]

    expect(matchCommand(commands, 'command')).toEqual(alwaysValidCommand)
  })

  it('match deep nested commands', () => {
    const deepCommand = { name: 'you can', callback }
    const commands = [{
      name: 'ping me',
      commands: [
        { name: 'if', commands: [ deepCommand ] }
      ]
    }]

    expect(matchCommand(commands, 'ping me if you can')).toEqual(deepCommand)
  })
})

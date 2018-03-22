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
})

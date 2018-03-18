const { CliPlugin } = require('..')

const uid = () => (uid.id = (uid.id || 0) + 1).toString()

const createApp = () =>
  ({ use (plugin) { (plugin.install || plugin)(app) } })

const defaults = {
  callback: undefined,
  commands: undefined,
  description: undefined,
  name: undefined,
  prefix: undefined,
  title: undefined
}

const applyDefaults = command => Object.assign({}, defaults, command)

const methods = {}
const fixture = (id = uid()) => ({
  callback: (methods[id] || (methods[id] = () => {})),
  commands: undefined,
  description: `description-${id}`,
  name: `name-${id}`,
  prefix: `prefix-${id}`,
  title: `title-${id}`
})

let app
beforeEach(() => {
  app = createApp()
  app.use(CliPlugin)
})

describe('Cli Plugin', () => {
  it('export API', () => {
    expect(typeof app.validateCommand).toBe('function', 'exports validateCommand()')
    expect(typeof app.executeCommand).toBe('function', 'exports executeCommand()')
    expect(typeof app.registerCommand).toBe('function', 'exports registerCommand()')
  })

  it('receive empty list of commands', () => {
    const commands = app.getCommands()
    expect(Array.isArray(commands)).toBeTruthy()
    expect(commands.length).toBe(0)
  })

  it('register one command using shortcut', () => {
    const { name, callback } = fixture()

    app.registerCommand(name, callback)
    const commands = app.getCommands()

    expect(commands).toEqual([
      applyDefaults({ name, callback })
    ])
  })

  it('register one command using object', () => {
    const { name, callback } = fixture()

    app.registerCommand({ name, callback })
    const commands = app.getCommands()
    expect(commands).toEqual([
      applyDefaults({ name, callback })
    ])
  })

  it('ignore callback option when command is an object', () => {
    const { name, callback } = fixture()

    app.registerCommand({ name, callback }, () => {})
    const commands = app.getCommands()
    expect(commands).toEqual([
      applyDefaults({ name, callback })
    ])
  })

  it('register one command with extra options', () => {
    const id = uid()
    const command = fixture(id)
    command._extra_option = 1

    app.registerCommand(command)
    const commands = app.getCommands()
    expect(commands).toEqual([fixture(id)])
  })

  it('register multiple commands', () => {
    const command1 = { name: 'name1', callback: () => {} }
    const command2 = { name: 'name2', callback: () => {} }

    app.registerCommand([ command1, command2 ])
    expect(app.getCommands()).toEqual([
      applyDefaults(command1),
      applyDefaults(command2)
    ])
  })

  it('register nested command', () => {
    const id1 = uid()
    const id2 = uid()

    const command = fixture(id1)
    const { name, callback } = fixture(id2)
    command.commands = [ { name, callback } ]

    app.registerCommand(command)

    const commands = app.getCommands()
    expect(commands).toEqual([
      applyDefaults({
        ...command,
        commands: [
          applyDefaults({ name, callback })
        ]
      })
    ])
  })

  it('register multiple nested commands', () => {
    const id1 = uid()
    const id2 = uid()

    const command = fixture()
    command.commands = [ fixture(id1), fixture(id2) ]

    app.registerCommand(command)
    const commands = app.getCommands()
    expect(commands).toEqual([
      applyDefaults({
        ...command,
        commands: [
          fixture(id1),
          fixture(id2)
        ]
      })
    ])
  })

  it('register multiple commands', () => {
    const [ id1, id2 ] = [ uid(), uid() ]
    app.registerCommand(fixture(id1))
    app.registerCommand(fixture(id2))
    expect(app.getCommands()).toEqual([
      fixture(id1),
      fixture(id2)
    ])
  })

  it('validate commands', async () => {
    const command1 = fixture()
    const command2 = fixture()
    const [ name, name2 ] = [ command1.name, command2.name ]
    app.registerCommand([ command1, command2 ])

    expect(await app.validateCommand(name)).toBeTruthy()
    expect(await app.validateCommand(name2)).toBeTruthy()
    expect(await app.validateCommand(` ${name} `)).toBeTruthy()
    expect(await app.validateCommand(`${name} extra`)).toBeTruthy()
    expect(await app.validateCommand(`${name} --flag`)).toBeTruthy()
    expect(await app.validateCommand(`--flag drop ${name}`)).toBeTruthy()

    expect(await app.validateCommand(`${name}0`)).toBeFalsy()
    expect(await app.validateCommand(`not_a_command_name ${name}`)).toBeFalsy()
    expect(await app.validateCommand(`--flag ${name}`)).toBeFalsy()
  })

  it('validate nested command', async () => {
    const command1 = fixture()
    const command2 = fixture()
    const [ name, nestedName ] = [ command1.name, command2.name ]
    command1.commands = [ command2 ]
    app.registerCommand(command1)

    expect(await app.validateCommand(name)).toBeTruthy()
    expect(await app.validateCommand(`${name} ${nestedName}`)).toBeTruthy()
    expect(await app.validateCommand(`${name} -k ${nestedName}`)).toBeTruthy()

    expect(await app.validateCommand(`${name} not_a_command_name ${nestedName}`)).toBeFalsy()
    expect(await app.validateCommand(`${nestedName} ${name}`)).toBeFalsy()
    expect(await app.validateCommand(nestedName)).toBeFalsy()
  })

  it('execute commands', async () => {
    const callback = jest.fn()
    const command = { ...fixture(), callback }

    app.registerCommand(command)

    await app.executeCommand(command.name)
    expect(callback).toHaveBeenCalledTimes(1)

    await app.executeCommand(`${command.name} extra`)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith(
      { _: [ command.name, 'extra' ] },
      `${command.name} extra`
    )
  })

  it('execute nested commands', async () => {
    const callback = jest.fn()
    const nestedCallback = jest.fn()

    const nestedCommand = { ...fixture(), callback: nestedCallback }
    const command = {
      ...fixture(),
      callback,
      commands: [ nestedCommand ]
    }

    app.registerCommand(command)

    await app.executeCommand(command.name)
    expect(callback).toHaveBeenCalled()
    expect(nestedCallback).not.toHaveBeenCalled()
    callback.mockReset()

    await app.executeCommand(`${command.name} ${nestedCommand.name}`)
    expect(callback).not.toHaveBeenCalled()
    expect(nestedCallback).toHaveBeenCalled()
  })

  it('overload commands', async () => {
    const command1 = { ...fixture(), callback: jest.fn() }
    const command2 = { ...fixture(), callback: jest.fn() }

    command2.name = command1.name

    app.registerCommand([ command1, command2 ])

    await app.executeCommand(command2.name)
    expect(command2.callback).toHaveBeenCalled()
    expect(command1.callback).not.toHaveBeenCalled()
    command2.callback.mockReset()

    await app.executeCommand(command1.name)
    expect(command2.callback).toHaveBeenCalled()
    expect(command1.callback).not.toHaveBeenCalled()
  })

  it('execute triggers errors', async () => {
    await expect(() => app.executeCommand()).toThrowError('`command` should be not empty string')
    await expect(app.executeCommand('not_registerd_command')).rejects.toThrowError('command is not registered')
    app.registerCommand({ name: 'command', commands: [ fixture() ] })
    await expect(app.executeCommand('command')).rejects.toThrowError('command doesn\'t have a callback')
  })

  it('trigger all register errors', async () => {
    const name = 'command'
    const callback = () => {}

    await expect(() => app.registerCommand()).toThrowError('`command` is required')
    await expect(() => app.registerCommand(1)).toThrowError('`command` should be a string, an object or an array')
    await expect(() => app.registerCommand('')).toThrowError('`name` should be not empty string (given: "")')
    await expect(() => app.registerCommand(' ')).toThrowError('`name` should be not empty string (given: " ")')
    await expect(() => app.registerCommand(null)).toThrowError('`command` should be a string, an object or an array and can not be empty (given: null)')
    await expect(() => app.registerCommand({})).toThrowError('`command` should be a string, an object or an array and can not be empty (given: {})')
    await expect(() => app.registerCommand({ randomPropertyHere: 1 })).toThrowError('`name` should be not empty string (given: undefined)')
    await expect(() => app.registerCommand({ name: null })).toThrowError('`name` should be not empty string (given: null)')
    await expect(() => app.registerCommand(name)).toThrowError('`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
    await expect(() => app.registerCommand({ name })).toThrowError('`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
    await expect(() => app.registerCommand({ name }, callback)).toThrowError('`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
    await expect(() => app.registerCommand({ name, callback: 1 })).toThrowError('`callback` must be a function (given: 1)')
    await expect(() => app.registerCommand({ name, commands: [] })).toThrowError('`commands` must be an array and it can not be empty (given: [])')
    await expect(() => app.registerCommand({ name, commands: [ name ] })).toThrowError('`command` should be an object (given: "command")')
    await expect(() => app.registerCommand({ name, callback, description: 1 })).toThrowError('`description` must be not empty string (given: 1)')
    await expect(() => app.registerCommand({ name, callback, title: 1 })).toThrowError('`title` must be not empty string (given: 1)')
    await expect(() => app.registerCommand({ name, callback, prefix: 1 })).toThrowError('`prefix` must be not empty string (given: 1)')
  })
})

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
    expect(typeof app.executeCommand).toBe('function', 'exports executeCommand()')
    expect(typeof app.registerCommand).toBe('function', 'exports registerCommand()')
    expect(typeof app.getCommands).toBe('function', 'exports getCommands()')
  })

  it('receive empty list of commands', () => {
    const commands = app.getCommands()
    expect(Array.isArray(commands)).toBeTruthy()
    expect(commands.length).toBe(0)
  })

  it('execute commands', async () => {
    const callback = jest.fn()
    const command = { ...fixture(), callback }

    app.registerCommand(command)

    await app.executeCommand(command.name)
    expect(callback).toHaveBeenCalledTimes(1)

    await app.executeCommand(`${command.name} extra`)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith({ _: [ command.name, 'extra' ] })
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
    await expect(() => app.executeCommand()).toThrowError('`command` should be a string or an object (read docs)')
    await expect(app.executeCommand('not_registerd_command')).rejects.toThrowError('command is not registered')
    app.registerCommand({ name: 'command', commands: [ fixture() ] })
    await expect(app.executeCommand('command')).rejects.toThrowError('command doesn\'t have a callback')
  })
})

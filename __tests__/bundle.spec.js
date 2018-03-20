const { CliPlugin } = require('..')

const uid = () => (uid.id = (uid.id || 0) + 1).toString()

const createApp = () =>
  ({ use (plugin) { (plugin.install || plugin)(app) } })

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
})

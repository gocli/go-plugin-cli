const plugin = require('../lib/plugin')

describe('Cli Plugin', () => {
  it('exists', () => {
    expect(typeof plugin.install).toBe('function')
    expect(typeof plugin.CliPlugin).toBe('function')
    expect(plugin.install).toBe(plugin.CliPlugin)
    expect(plugin.install()).toHaveProperty('executeCommand')
    expect(plugin.install()).toHaveProperty('registerCommand')
    expect(plugin.install()).toHaveProperty('getCommands')
    expect(() => plugin.install({})).not.toThrow()
  })

  it('export API', () => {
    const obj = {}
    plugin.install(obj)

    expect(typeof obj.executeCommand).toBe('function', 'exports executeCommand()')
    expect(typeof obj.registerCommand).toBe('function', 'exports registerCommand()')
    expect(typeof obj.getCommands).toBe('function', 'exports getCommands()')
  })

  it('receive empty list of commands', () => {
    const commands = plugin.install().getCommands()
    expect(Array.isArray(commands)).toBeTruthy()
    expect(commands.length).toBe(0)
  })
})

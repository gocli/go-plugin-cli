const mockNormalizeOptions = jest.fn()
jest.mock('../lib/normalize-options', () => ({ normalizeOptions: mockNormalizeOptions }))

const plugin = require('../lib/plugin')

describe('Cli Plugin', () => {
  beforeEach(() => {
    mockNormalizeOptions.mockReset()
    mockNormalizeOptions.mockReturnValue({ guide: { mocked: true } })
  })

  it('exists', () => {
    expect(typeof plugin.install).toBe('function')
    expect(typeof plugin.CliPlugin).toBe('function')
    expect(plugin.install).toBe(plugin.CliPlugin)
    expect(plugin.install()).toHaveProperty('cli')
    expect(plugin.install().cli).toHaveProperty('executeCommand')
    expect(plugin.install().cli).toHaveProperty('registerCommand')
    expect(plugin.install().cli).toHaveProperty('matchCommand')
    expect(plugin.install().cli).toHaveProperty('getCommands')
    expect(plugin.install().cli).toHaveProperty('getGuideOptions')
    expect(() => plugin.install({})).not.toThrow()
  })

  it('exports API', () => {
    const obj = {}
    plugin.install(obj)

    expect(typeof obj.cli.executeCommand).toBe('function', 'exports cli.executeCommand()')
    expect(typeof obj.cli.registerCommand).toBe('function', 'exports cli.registerCommand()')
    expect(typeof obj.cli.matchCommand).toBe('function', 'exports cli.matchCommand()')
    expect(typeof obj.cli.getCommands).toBe('function', 'exports cli.getCommands()')
    expect(typeof obj.cli.getGuideOptions).toBe('function', 'exports cli.getGuideOptions()')
  })

  it('exports API even if cli property was defined previously', () => {
    const obj = {
      cli: { prev: true }
    }
    plugin.install(obj)

    expect(obj.cli.prev).toBe(true)
    expect(typeof obj.cli.executeCommand).toBe('function', 'exports cli.executeCommand()')
    expect(typeof obj.cli.registerCommand).toBe('function', 'exports cli.registerCommand()')
    expect(typeof obj.cli.matchCommand).toBe('function', 'exports cli.matchCommand()')
    expect(typeof obj.cli.getCommands).toBe('function', 'exports cli.getCommands()')
    expect(typeof obj.cli.getGuideOptions).toBe('function', 'exports cli.getGuideOptions()')
  })

  it('exposes some API to the root object', () => {
    const obj = {}
    plugin.install(obj)

    expect(obj.executeCommand).toBe(obj.cli.executeCommand)
    expect(obj.registerCommand).toBe(obj.cli.registerCommand)
  })

  it('receive empty list of commands', () => {
    const commands = plugin.install().cli.getCommands()
    expect(Array.isArray(commands)).toBeTruthy()
    expect(commands.length).toBe(0)
  })

  describe('getGuideOptions()', () => {
    it('returns normalized options for guide', () => {
      expect(plugin.install({}).cli.getGuideOptions())
        .toEqual({ mocked: true })
    })
  })
})

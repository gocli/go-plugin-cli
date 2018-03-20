const { executeCommand } = require('../src/execute-command')

describe('executeCommand()', () => {
  it('is a function', () => {
    expect(typeof executeCommand).toBe('function')
  })

  it('calls a command using a string', async () => {
    const name = 'ping'
    const callback = jest.fn()

    await executeCommand([{ name, callback }], 'ping')
    expect(callback).toHaveBeenCalled()
  })

  it('calls a command using an object', async () => {
    const name = 'ping'
    const callback = jest.fn()

    await executeCommand([{ name, callback }], { _: ['ping'] })
    expect(callback).toHaveBeenCalled()
  })

  it('calls only one command', async () => {
    const name = 'ping'
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    await executeCommand([
      { name, callback: callback1 },
      { name, callback: callback2 }
    ], 'ping')

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls when there are more arguments then in the command name', async () => {
    const name = 'ping'
    const callback = jest.fn()

    await executeCommand([{ name, callback }], 'ping me')
    expect(callback).toHaveBeenCalled()
  })

  it('calls a command that consist of several parts', async () => {
    const name = 'ping me now'
    const callback = jest.fn()

    await executeCommand([{ name, callback }], 'ping me now')
    expect(callback).toHaveBeenCalled()
  })

  it('resolves with the result of callback', async () => {
    const name = 'ping'
    const callback = () => Promise.resolve(42)

    const result = await executeCommand([{ name, callback }], 'ping')
    expect(result).toBe(42)
  })

  it('trigger nested commands', async () => {
    const name = 'ping'
    const nestedName = 'me'
    const callback = jest.fn()
    const commands = [
      { name, commands: [{ name: nestedName, callback }] }
    ]

    await executeCommand(commands, 'ping me')
    expect(callback).toHaveBeenCalled()
  })

  it('fails if invalid command is given', async () => {
    await expect(() => executeCommand([]))
      .toThrowError('`command` should be a string or a specific object (read docs)')
    await expect(() => executeCommand([], 1))
      .toThrowError('`command` should be a string or a specific object (read docs)')
    await expect(() => executeCommand([], null))
      .toThrowError('`command` should be a string or a specific object (read docs)')
    await expect(() => executeCommand([], {}))
      .toThrowError('`command` should be a string or a specific object (read docs)')
  })

  it('fails if command is not exists, or when you call it with not complete set of arguments', async () => {
    await expect(executeCommand([], 'ping'))
      .rejects.toThrowError('command is not registered')
    await expect(executeCommand([{ name: 'ping me', callback () {} }], 'ping'))
      .rejects.toThrowError('command is not registered')
    await expect(executeCommand([{ name: 'ping', commands: [] }], 'ping'))
      .rejects.toThrowError('command doesn\'t have a callback')
  })
})

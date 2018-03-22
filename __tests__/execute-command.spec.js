const { executeCommand } = require('../lib/execute-command')

describe('executeCommand()', () => {
  it('is a function', () => {
    expect(typeof executeCommand).toBe('function')
  })

  it('calls a command using a string', () => {
    const name = 'ping'
    const callback = jest.fn()

    return executeCommand([{ name, callback }], 'ping')
      .then(() => {
        expect(callback).toHaveBeenCalled()
      })
  })

  it('calls only one command', () => {
    const name = 'ping'
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    return executeCommand([
      { name, callback: callback1 },
      { name, callback: callback2 }
    ], 'ping')
      .then(() => {
        expect(callback1).not.toHaveBeenCalled()
        expect(callback2).toHaveBeenCalled()
      })
  })

  it('calls when there are more arguments then in the command name', () => {
    const name = 'ping'
    const callback = jest.fn()

    return executeCommand([{ name, callback }], 'ping me')
      .then(() => {
        expect(callback).toHaveBeenCalled()
      })
  })

  it('calls a command that consist of several parts', () => {
    const name = 'ping me now'
    const callback = jest.fn()

    return executeCommand([{ name, callback }], 'ping me now')
      .then(() => {
        expect(callback).toHaveBeenCalled()
      })
  })

  it('resolves with the result of callback', () => {
    const name = 'ping'
    const callback = () => Promise.resolve(42)

    return executeCommand([{ name, callback }], 'ping')
      .then(result => {
        expect(result).toBe(42)
      })
  })

  it('trigger nested commands', () => {
    const name = 'ping'
    const nestedName = 'me'
    const callback = jest.fn()
    const commands = [
      { name, commands: [{ name: nestedName, callback }] }
    ]

    return executeCommand(commands, 'ping me')
      .then(() => {
        expect(callback).toHaveBeenCalled()
      })
  })

  it('fails if invalid command is given', () => {
    return Promise.all([
      expect(() => executeCommand([]))
        .toThrowError('`command` should be not empty string'),
      expect(() => executeCommand([], 1))
        .toThrowError('`command` should be not empty string'),
      expect(() => executeCommand([], null))
        .toThrowError('`command` should be not empty string'),
      expect(() => executeCommand([], ''))
        .toThrowError('`command` should be not empty string')
    ])
  })

  it('fails if command is not exists, or when you call it with not complete set of arguments', () => {
    return Promise.all([
      expect(executeCommand([], 'ping'))
        .rejects.toThrowError('command is not registered'),
      expect(executeCommand([{ name: 'ping me', callback () {} }], 'ping'))
        .rejects.toThrowError('command is not registered'),
      expect(executeCommand([{ name: 'ping', commands: [] }], 'ping'))
        .rejects.toThrowError('command doesn\'t have a callback')
    ])
  })

  it('calls to callback with parsed args', () => {
    const pingCallback = jest.fn()
    const meCallback = jest.fn()
    const commands = [{
      name: 'ping',
      callback: pingCallback,
      commands: [
        { name: 'me', callback: meCallback }
      ]
    }]

    return Promise.all([
      executeCommand(commands, 'ping'),
      executeCommand(commands, 'ping you'),
      executeCommand(commands, 'ping me'),
      executeCommand(commands, 'ping --who me')
    ]).then(() => {
      expect(pingCallback).toHaveBeenCalledWith({ _: ['ping'] })
      expect(pingCallback).toHaveBeenCalledWith({ _: ['ping', 'you'] })
      expect(meCallback).toHaveBeenCalledWith({ _: ['ping', 'me'] })
      expect(pingCallback).toHaveBeenCalledWith({ _: ['ping'], who: 'me' })
    })
  })
})

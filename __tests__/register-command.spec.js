const { registerCommand } = require('../src/register-command')

describe('registerCommand()', () => {
  it('is a function', () => {
    expect(typeof registerCommand).toBe('function')
  })
})

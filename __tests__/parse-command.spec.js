const { parseCommand } = require('../lib/parse-command')

describe('parseCommand()', () => {
  const command = 'ping --who me now -f pretty -- do --not parse'

  it('is a function', () => {
    expect(typeof parseCommand).toBe('function')
  })

  it('parse with default options', () => {
    expect(parseCommand(command))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('uses type option', () => {
    expect(parseCommand(command, { who: { type: Boolean, alias: [] } }))
      .toEqual({
        _: ['ping', 'me', 'now'],
        who: true,
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })

    expect(parseCommand(command, { who: { type: String, alias: [] } }))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('uses default option', () => {
    expect(parseCommand(command, { why: { default: 'because', alias: [] } }))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        why: 'because',
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('can overwrite default value', () => {
    expect(parseCommand(command, { who: { default: 'you', alias: [] } }))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('uses alias option', () => {
    expect(parseCommand(command, { format: { alias: ['f'] } }))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        f: 'pretty',
        format: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('can overwrite default value', () => {
    expect(parseCommand(command, { who: { default: 'you', alias: [] } }))
      .toEqual({
        _: ['ping', 'now'],
        who: 'me',
        f: 'pretty',
        '--': ['do', '--not', 'parse']
      })
  })

  it('collects multiple values', () => {
    expect(parseCommand('ping -u 428 -u 985'))
      .toEqual({
        _: ['ping'],
        u: [428, 985],
        '--': []
      })
  })
})

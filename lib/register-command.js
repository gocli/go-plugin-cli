const { normalizeCommand } = require('./normalize-command')

const registerCommand = (stash, commands, callback) => {
  if (typeof commands === 'undefined') {
    throw new Error('`command` is required')
  }

  if (typeof commands === 'string') {
    commands = {
      name: commands,
      callback
    }
  }

  if (typeof commands !== 'object') {
    throw new Error('you can register as a command a string, an object or an array')
  }

  if (!Array.isArray(commands)) {
    commands = [commands]
  }

  commands
    .map(normalizeCommand)
    .forEach((command) => stash.push(command))
}

exports.registerCommand = registerCommand

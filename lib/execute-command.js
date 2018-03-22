const { parseCommand } = require('./parse-command')
const { matchCommand } = require('./match-command')

const executeCommand = (stash, commandRequest) => {
  if (typeof commandRequest !== 'string') {
    if (!commandRequest || typeof commandRequest !== 'object' || !Array.isArray(commandRequest._)) {
      throw new Error('`command` should be a string or a specific object (read docs)')
    }
  }

  const command = matchCommand(stash, commandRequest)

  if (!command) {
    return Promise.reject(new Error('command is not registered'))
  }

  if (typeof command.callback !== 'function') {
    return Promise.reject(new Error('command doesn\'t have a callback'))
  }

  const args = parseCommand(commandRequest)
  return Promise.resolve(command.callback(args))
}

exports.executeCommand = executeCommand

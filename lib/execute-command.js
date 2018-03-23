const { parseCommand } = require('./parse-command')
const { matchCommand } = require('./match-command')

const executeCommand = (stash, commandRequest) => {
  if (!commandRequest || typeof commandRequest !== 'string') {
    throw new Error('`command` should be not empty string')
  }

  const command = matchCommand(stash, commandRequest)

  if (!command) {
    return Promise.reject(new Error('command is not registered'))
  }

  if (typeof command.callback !== 'function') {
    return Promise.reject(new Error('command doesn\'t have a callback'))
  }

  const args = parseCommand(commandRequest, command.options)
  return Promise.resolve(command.callback(args))
}

exports.executeCommand = executeCommand

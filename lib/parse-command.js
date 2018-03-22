const minimist = require('minimist')

const parseCommand = (commandRequest) =>
  typeof commandRequest === 'string' ? minimist(commandRequest.trim().split(/\s+/g)) : commandRequest

exports.parseCommand = parseCommand

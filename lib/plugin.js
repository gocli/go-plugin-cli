const { executeCommand } = require('./execute-command')
const { registerCommand } = require('./register-command')

const CliPlugin = (proto = {}) => {
  const stash = []

  proto.executeCommand = executeCommand.bind(null, stash)
  proto.registerCommand = registerCommand.bind(null, stash)
  proto.getCommands = () => stash

  return proto
}

exports.CliPlugin = CliPlugin
exports.install = CliPlugin

const { executeCommand } = require('./execute-command')
const { registerCommand } = require('./register-command')
const { matchCommand } = require('./match-command')
const { normalizeOptions } = require('./normalize-options')

const CliPlugin = (proto = {}, options = {}) => {
  const stash = []

  options = normalizeOptions(options)

  proto.executeCommand = executeCommand.bind(null, stash, options.cli.allowShort)
  proto.registerCommand = registerCommand.bind(null, stash)

  if (typeof proto.cli !== 'object') proto.cli = {}
  proto.cli.executeCommand = proto.executeCommand
  proto.cli.registerCommand = proto.registerCommand
  proto.cli.matchCommand = matchCommand.bind(null, stash, options.cli.allowShort)
  proto.cli.getCommands = () => stash
  proto.cli.getGuideOptions = () => options.guide

  return proto
}

exports.CliPlugin = CliPlugin
exports.install = CliPlugin

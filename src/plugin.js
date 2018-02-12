import validate from './validate'
import execute from './execute'
import register from './register'

const CliPlugin = (proto) => {
  const stash = []

  const validateCommand = (commandString) =>
    validate(stash, commandString, validateCommand)

  const executeCommand = (commandString) =>
    execute(stash, commandString, executeCommand)

  const registerCommand = (command, optionsOrCallback) =>
    register(stash, command, optionsOrCallback, registerCommand)

  const getCommands = () => stash

  proto.validateCommand = validateCommand
  proto.executeCommand = executeCommand
  proto.registerCommand = registerCommand
  proto.getCommands = getCommands
}

const install = CliPlugin
export { install, CliPlugin }

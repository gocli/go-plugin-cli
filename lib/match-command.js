const { parseCommand } = require('./parse-command')

const match = (stash, commandString, parentCommand) => {
  const getParsedCommand = (options) => {
    const parsed = parseCommand(commandString, options)
    return parentCommand
      ? Object.assign(parsed, { _: parsed._.slice(parentCommand.split(' ').length) })
      : parsed
  }

  const command = stash.slice(0).reverse()
    .find(({ name, options, when }) => {
      const parsedCommand = getParsedCommand(options)
      const isCommandMatch = name.split(' ')
        .every((part, index) => part === parsedCommand._[index])

      if (!isCommandMatch) return false
      if (!when) return true

      return Object.keys(when)
        .every((key) => when[key] === parsedCommand[key])
    })

  if (!command) {
    return undefined
  }

  if (Array.isArray(command.commands)) {
    const matchedCommand = parentCommand
      ? `${parentCommand} ${command.name}`
      : command.name
    return match(command.commands, commandString, matchedCommand) || command
  }

  return command
}

const matchCommand = (stash, commandString) => match(stash, commandString)

exports.matchCommand = matchCommand

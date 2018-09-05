const { parseCommand } = require('./parse-command')

const matchCompleteCommandName = (part, parsedPart) => part === parsedPart
const matchPartialCommandName = (part, parsedPart) => part.startsWith(parsedPart)

const match = (stash, allowShort, commandString, parentCommand) => {
  const getParsedCommand = (options) => {
    const parsed = parseCommand(commandString, options)
    return parentCommand
      ? Object.assign(parsed, { _: parsed._.slice(parentCommand.split(' ').length) })
      : parsed
  }

  const filterCommand = matchCommandName => stash.slice(0).reverse()
    .find(({ name, options, when }) => {
      const parsedCommand = getParsedCommand(options)
      const isCommandMatch = name.split(' ')
        .every((part, index) => matchCommandName(part, parsedCommand._[index]))

      if (!isCommandMatch) return false

      if (typeof when === 'undefined') {
        return true
      }

      if (!when) {
        return false
      }

      if (when instanceof Array) {
        return when.every(key => parsedCommand[key])
      }

      if (typeof when === 'string') {
        return !!parsedCommand[when]
      }

      if (typeof when === 'function') {
        return when(parsedCommand)
      }

      if (typeof when === 'object') {
        return Object.keys(when)
          .every((key) => when[key] === parsedCommand[key])
      }

      return true
    })

  const command = filterCommand(matchCompleteCommandName) || allowShort && filterCommand(matchPartialCommandName)

  if (!command) {
    return undefined
  }

  if (Array.isArray(command.commands)) {
    const matchedCommand = parentCommand
      ? `${parentCommand} ${command.name}`
      : command.name
    return match(command.commands, allowShort, commandString, matchedCommand) || command
  }

  return command
}

const matchCommand = (stash, allowShort, commandString) => match(stash, allowShort, commandString)

exports.matchCommand = matchCommand

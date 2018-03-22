const { parseCommand } = require('./parse-command')

const matchCommand = (stash, triggered) => {
  const parsed = parseCommand(triggered)

  const command = stash.slice(0).reverse()
    .find(({ name }) => {
      return name.split(' ')
        .every((part, index) => part === parsed._[index])
    })

  if (!command) {
    return undefined
  }

  const parts = command.name.split(' ')

  if (parts.length === parsed._.length) {
    return command
  }

  if (Array.isArray(command.commands)) {
    const nestedTriggered = Object.assign({}, parsed, { _: parsed._.slice(parts.length) })
    return matchCommand(command.commands, nestedTriggered) || command
  }

  return command
}

exports.matchCommand = matchCommand

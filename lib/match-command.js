const { parseCommand } = require('./parse-command')

const matchCommand = (stash, triggered) => {
  const command = stash.slice(0).reverse()
    .find(({ name, options }) => {
      const parsed = parseCommand(triggered, options)
      return name.split(' ')
        .every((part, index) => part === parsed._[index])
    })

  if (!command) {
    return undefined
  }

  const parts = command.name.split(' ')
  const parsed = parseCommand(triggered)

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

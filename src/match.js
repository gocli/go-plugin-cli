import parse from './parse'

const matchCommand = (stash, triggered) => {
  const command = stash.slice(0).reverse()
    .find(({ name }) => {
      return name.split(' ')
        .every((part, index) => part === triggered[index])
    })

  if (!command) return

  const parts = command.name.split(' ')

  if (parts.length === triggered.length) {
    return command
  }

  if (Array.isArray(command.commands)) {
    return matchCommand(command.commands, triggered.slice(parts.length))
  }

  return command
}

const match = (stash, commandString) =>
  matchCommand(stash, parse(commandString)._)

export default match

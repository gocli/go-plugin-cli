import { parseCommand } from './parse-command'
import { ICommand, ICommandRequest } from './plugin'

const matchCommand = (stash: ICommand[], triggered: ICommandRequest): ICommand | void => {
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
    return matchCommand(command.commands, { ...parsed, _: parsed._.slice(parts.length) }) || command
  }

  return command
}

export default matchCommand
export { matchCommand }

import { parseCommand } from './parse'
import { ICommand, ICommandRequest, IParsedCommand } from './plugin'

const match = (stash: ICommand[], triggered: IParsedCommand): ICommand | void => {
  const command = stash.slice(0).reverse()
    .find(({ name }) => {
      return name.split(' ')
        .every((part, index) => part === triggered._[index])
    })

  if (!command) {
    return undefined
  }

  const parts = command.name.split(' ')

  if (parts.length === triggered._.length) {
    return command
  }

  if (Array.isArray(command.commands)) {
    return match(command.commands, { ...triggered, _: triggered._.slice(parts.length) })
  }

  return command
}

const matchCommand = (stash: ICommand[], commandRequest: ICommandRequest) =>
  match(stash, parseCommand(commandRequest))

export default matchCommand
export { matchCommand }

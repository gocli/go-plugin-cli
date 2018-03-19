import parse from './parse'
import { ICommand } from './plugin'

const match = (stash: ICommand[], triggered: string[]): ICommand | void => {
  const command = stash.slice(0).reverse()
    .find(({ name }) => {
      return name.split(' ')
        .every((part, index) => part === triggered[index])
    })

  if (!command) {
    return undefined
  }

  const parts = command.name.split(' ')

  if (parts.length === triggered.length) {
    return command
  }

  if (Array.isArray(command.commands)) {
    return match(command.commands, triggered.slice(parts.length))
  }

  return command
}

const matchCommand = (stash: ICommand[], commandString: string) =>
  match(stash, parse(commandString)._)

export default matchCommand
export { matchCommand }

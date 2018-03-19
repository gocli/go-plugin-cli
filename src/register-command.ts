import { normalizeCommand } from './normalize-command'
import { ICommand, ICommandCallback } from './plugin'

const registerCommand = (stash: ICommand[], commands: string | ICommand | ICommand[], callback?: ICommandCallback) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof commands === 'undefined') {
    throw new Error('`command` is required')
  }

  if (typeof commands === 'string') {
    commands = {
      name: commands,
      callback
    }
  }

  // tslint:disable-next-line: strict-type-predicates
  if (typeof commands !== 'object') {
    throw new Error('you can register as a command a string, an object or an array')
  }

  if (!Array.isArray(commands)) {
    commands = [commands]
  }

  commands
    .map(normalizeCommand)
    .forEach((command) => stash.push(command))
}

export default registerCommand
export { registerCommand }

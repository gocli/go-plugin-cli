import normalize from './normalize'
import { ICommand, ICommandCallback } from './plugin'

const register = (stash: ICommand[], commands: string | ICommand | ICommand[], callback?: ICommandCallback) => {
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
    throw new Error('`command` should be a string, an object or an array')
  }

  if (!Array.isArray(commands)) {
    commands = [commands]
  }

  commands
    .map((command) => normalize(command, (error) => { throw error }))
    .forEach((command) => stash.push(command))
}

export default register
export { register }

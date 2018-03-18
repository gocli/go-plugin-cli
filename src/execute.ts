import parse from './parse'
import match from './match'
import { ICommand } from './plugin'

const execute = (stash: ICommand[], commandString: string) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof commandString !== 'string') {
    throw new Error('`command` should be not empty string')
  }

  const command = match(stash, commandString)

  if (!command) {
    return Promise.reject(new Error('command is not registered'))
  }

  if (typeof command.callback !== 'function') {
    return Promise.reject(new Error('command doesn\'t have a callback'))
  }

  const argv = parse(commandString)
  return Promise.resolve(command.callback(argv, commandString))
}

export default execute

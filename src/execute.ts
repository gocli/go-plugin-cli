import parse from './parse'
import match from './match'
import fail from './fail'
import { ICommand } from './plugin'

const execute = (stash: ICommand[], commandString: string, caller?: any) => {
  caller = caller || execute

  // tslint:disable-next-line: strict-type-predicates
  if (typeof commandString !== 'string') {
    throw fail(caller, '`command` should be not empty string')
  }

  const command = match(stash, commandString)

  if (!command) {
    return Promise.reject(fail(caller, 'command is not registered'))
  }

  if (typeof command.callback !== 'function') {
    return Promise.reject(fail(caller, 'command doesn\'t have a callback'))
  }

  const argv = parse(commandString)
  return Promise.resolve(command.callback(argv, commandString))
}

export default execute

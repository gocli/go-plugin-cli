import { parseCommand } from './parse'
import { matchCommand } from './match-command'
import { ICommand, ICommandRequest } from './plugin'

const executeCommand = (stash: ICommand[], commandRequest: ICommandRequest) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof commandRequest !== 'string') {
    // tslint:disable-next-line: strict-type-predicates
    if (!commandRequest || typeof commandRequest !== 'object' || !Array.isArray(commandRequest)) {
      throw new Error('`command` should be a string or an object (read docs)')
    }
  }

  const command = matchCommand(stash, commandRequest)

  if (!command) {
    return Promise.reject(new Error('command is not registered'))
  }

  if (typeof command.callback !== 'function') {
    return Promise.reject(new Error('command doesn\'t have a callback'))
  }

  const args = parseCommand(commandRequest)
  return Promise.resolve(command.callback(args))
}

export default executeCommand
export { executeCommand }

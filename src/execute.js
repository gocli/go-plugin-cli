import parse from './parse'
import match from './match'
import fail from './fail'
import isFunction from './is-function'

const execute = (stash, commandString, caller) => {
  caller = caller || execute

  if (typeof commandString !== 'string') {
    throw fail(caller, '`command` should be not empty string')
  }

  const command = match(stash, commandString)

  if (!command) {
    return Promise.reject(fail(caller, 'command is not registered'))
  }

  if (!isFunction(command.callback)) {
    return Promise.reject(fail(caller, 'command doesn\'t have a callback'))
  }

  const argv = parse(commandString)
  return Promise.resolve(command.callback(argv, commandString))
}

export default execute

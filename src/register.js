import normalize from './normalize'
import fail from './fail'

const register = (stash, commands, callback, caller) => {
  caller = caller || register

  if (typeof commands === 'undefined') {
    throw fail(caller, '`command` is required')
  }

  if (typeof commands === 'string') {
    commands = {
      name: commands,
      callback
    }
  }

  if (typeof commands !== 'object') {
    throw fail(caller, '`command` should be a string, an object or an array')
  }

  if (!Array.isArray(commands)) {
    commands = [commands]
  }

  commands
    .map((command) => normalize(command, (error) => fail(caller, error)))
    .forEach((command) => stash.push(command))
}

export default register

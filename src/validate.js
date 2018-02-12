import match from './match'

const validate = (stash, commandString, caller) => {
  caller = caller || validate

  if (typeof commandString !== 'string') {
    throw new TypeError('`commandString` should be a string')
  }

  const isCommandValid = !!match(stash, commandString)
  return Promise.resolve(isCommandValid)
}

export default validate

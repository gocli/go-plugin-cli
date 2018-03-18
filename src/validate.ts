import match from './match'
import { ICommand } from './plugin'

const validate = (stash: ICommand[], commandString: string) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof commandString !== 'string') {
    throw new TypeError('`commandString` should be a string')
  }

  const isCommandValid = !!match(stash, commandString)
  return Promise.resolve(isCommandValid)
}

export default validate
export { validate }

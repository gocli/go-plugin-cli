import { matchCommand } from './match-command'
import { ICommand } from './plugin'

const validateCommand = (stash: ICommand[], commandString: string) => {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof commandString !== 'string') {
    throw new TypeError('`commandString` should be a string')
  }

  const isCommandValid = !!matchCommand(stash, commandString)
  return Promise.resolve(isCommandValid)
}

export default validateCommand
export { validateCommand }

import minimist from 'minimist'
import { ICommandRequest, IParsedCommand } from './plugin'

const parseCommand = (commandRequest: ICommandRequest): IParsedCommand =>
  typeof commandRequest === 'string' ? minimist(commandRequest.trim().split(/\s+/g)) : commandRequest

export default parseCommand
export { parseCommand }

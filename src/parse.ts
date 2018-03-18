import minimist from 'minimist'

const parseCommand = (commandRequest: string) =>
  minimist(commandRequest.trim().split(/\s+/g))

export default parseCommand
export { parseCommand }

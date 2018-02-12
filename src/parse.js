import minimist from 'minimist'

const parseCommand = (commandRequest) =>
  minimist(commandRequest.trim().split(/\s+/g))

export default parseCommand

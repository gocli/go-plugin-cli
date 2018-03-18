import validate from './validate'
import execute from './execute'
import register from './register'
import { ParsedArgs } from 'minimist'

interface ICommandCallback {
  (args: ParsedArgs, command: string): void
}

interface ICommand {
  name: string
  commands?: ICommand[]
  description?: string
  title?: string
  prefix?: string
  callback?: ICommandCallback
}

interface ICliPlugable {
  validateCommand? (command: string): Promise<boolean>
  executeCommand? (command: string): Promise<void>
  registerCommand? (stash: ICommand[], caller: any, commands: string | ICommand | ICommand[], callback?: ICommandCallback): void
  getCommands? (): ICommand[]
}

interface ICliPlugged {
  validateCommand (command: string): Promise<boolean>
  executeCommand (command: string): Promise<void>
  registerCommand (stash: ICommand[], caller: any, commands: string | ICommand | ICommand[], callback?: ICommandCallback): void
  getCommands (): ICommand[]
}

const CliPlugin = (proto: ICliPlugable = {}): ICliPlugged => {
  const stash: ICommand[] = []

  const validateCommand = (commandString: string) =>
    validate(stash, commandString)

  const executeCommand = (commandString: string) =>
    execute(stash, commandString)

  const registerCommand = (command: string | ICommand | ICommand[], callback?: ICommandCallback) =>
    register(stash, command, callback)

  const getCommands = () => stash

  proto.validateCommand = validateCommand
  proto.executeCommand = executeCommand
  proto.registerCommand = registerCommand
  proto.getCommands = getCommands

  return proto as ICliPlugged
}

const install = CliPlugin
export { install, CliPlugin, ICommand, ICliPlugable, ICliPlugged, ICommandCallback }

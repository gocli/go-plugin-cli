import { executeCommand } from './execute-command'
import { registerCommand } from './register-command'
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
  executeCommand? (command: string): Promise<void>
  registerCommand? (stash: ICommand[], caller: any, commands: string | ICommand | ICommand[], callback?: ICommandCallback): void
  getCommands? (): ICommand[]
}

interface ICliPlugged {
  executeCommand (command: string): Promise<void>
  registerCommand (stash: ICommand[], caller: any, commands: string | ICommand | ICommand[], callback?: ICommandCallback): void
  getCommands (): ICommand[]
}

const CliPlugin = (proto: ICliPlugable = {}): ICliPlugged => {
  const stash: ICommand[] = []

  proto.executeCommand = executeCommand.bind(null, stash)
  proto.registerCommand = registerCommand.bind(null, stash)
  proto.getCommands = () => stash

  return proto as ICliPlugged
}

const install = CliPlugin
export { install, CliPlugin, ICommand, ICliPlugable, ICliPlugged, ICommandCallback }

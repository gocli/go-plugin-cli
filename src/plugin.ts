import { executeCommand } from './execute-command'
import { registerCommand } from './register-command'
import { ParsedArgs as IParsedCommand } from 'minimist'

type ICommandRequest = string | IParsedCommand

interface ICommandCallback {
  (args: IParsedCommand): void
}

interface ICommand {
  name: string
  commands?: ICommand[]
  description?: string
  title?: string
  prefix?: string
  callback?: ICommandCallback
}

interface IExecuteCommand {
  (command: string): Promise<void>
}

interface IRegisterCommand {
  (stash: ICommand[], caller: any, commands: string | ICommand | ICommand[], callback?: ICommandCallback): void
}

interface IGetCommands {
  (): ICommand[]
}

interface ICliPlugable {
  executeCommand?: IExecuteCommand
  registerCommand?: IRegisterCommand
  getCommands?: IGetCommands
}

interface ICliPlugged {
  executeCommand: IExecuteCommand
  registerCommand: IRegisterCommand
  getCommands: IGetCommands
}

const CliPlugin = (proto: ICliPlugable = {}): ICliPlugged => {
  const stash: ICommand[] = []

  proto.executeCommand = executeCommand.bind(null, stash)
  proto.registerCommand = registerCommand.bind(null, stash)
  proto.getCommands = () => stash

  return proto as ICliPlugged
}

const install = CliPlugin
export {
  CliPlugin,
  ICliPlugable,
  ICliPlugged,
  ICommand,
  ICommandCallback,
  ICommandRequest,
  IExecuteCommand,
  IGetCommands,
  IParsedCommand,
  IRegisterCommand,
  install
}

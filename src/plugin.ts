import { executeCommand } from './execute-command'
import { registerCommand } from './register-command'
import { Opts as IParserOptions , ParsedArgs as IParsedCommand } from 'minimist'

type ICommandRequest = string | IParsedCommand

interface ICommandCallback {
  (args: IParsedCommand): void
}

interface IParser {
  (command: string): IParsedCommand
}

interface IValidator {
  (args: IParsedCommand): any
}

type ICommandParser = IParserOptions | IParser
type ICommandValidator = string | string[] | IValidator

interface ICommand {
  name: string
  commands?: ICommand[]
  description?: string
  title?: string
  prefix?: string
  parse?: ICommandParser
  when?: ICommandValidator
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
  ICommandParser,
  ICommandRequest,
  ICommandValidator,
  IExecuteCommand,
  IGetCommands,
  IParsedCommand,
  IParser,
  IRegisterCommand,
  IValidator,
  install
}

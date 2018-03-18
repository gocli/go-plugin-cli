import isEmpty from './is-empty'
import isFunction from './is-function'
import isString from './is-string'
import isObject from './is-object'
import { ICommand } from './plugin'

interface IFail {
  (msg: string): Error
}

const display = (value: any): any => {
  if (isFunction(value)) {
    return value.toString()
  }

  if (!isObject(value)) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(display)
  }

  return Object.keys(value).reduce((result, key) => ({
    ...result,
    [key]: display(value[key])
  }), {})
}

const normalize = (command: ICommand, fail: IFail): ICommand => {
  const failGiven = (value: any, message: string) =>
    fail(`${message} (given: ${JSON.stringify(display(value))})`)

  if (isEmpty(command)) {
    throw failGiven(command, '`command` should be a string, an object or an array and can not be empty')
  }

  if (!isObject(command)) {
    throw failGiven(command, '`command` should be an object')
  }

  if (isEmpty(command.name) || !isString(command.name)) {
    throw failGiven(command.name, '`name` should be not empty string')
  }

  if (command.callback && !isFunction(command.callback)) {
    throw failGiven(command.callback, '`callback` must be a function')
  }

  if (command.commands && (!Array.isArray(command.commands) || isEmpty(command.commands))) {
    throw failGiven(command.commands, '`commands` must be an array and it can not be empty')
  }

  if (command.description && (!isString(command.description) || isEmpty(command.description))) {
    throw failGiven(command.description, '`description` must be not empty string')
  }

  if (command.title && (!isString(command.title) || isEmpty(command.title))) {
    throw failGiven(command.title, '`title` must be not empty string')
  }

  if (command.prefix && (!isString(command.prefix) || isEmpty(command.prefix))) {
    throw failGiven(command.prefix, '`prefix` must be not empty string')
  }

  if (!command.callback && !command.commands) {
    throw failGiven(command, '`command` should contain either `callback` function or `commands` array')
  }

  return {
    name: command.name,
    description: command.description,
    title: command.title,
    prefix: command.prefix,
    callback: command.callback ? command.callback : undefined,
    commands: command.commands
      ? command.commands.map((nestedCommand) => normalize(nestedCommand, fail))
      : undefined
  }
}

export default normalize
export { normalize, IFail }

const isEmpty = require('is-empty')

const display = (value) => {
  if (!value) {
    return value
  }

  if (typeof value === 'function') {
    return value.toString()
  }

  if (typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(display)
  }

  return Object.keys(value)
    .reduce((result, key) => Object.assign({ [key]: display(value[key]) }, result), {})
}

const OPTION_TYPES = [String, Boolean]

const failGiven = (value, message) => {
  throw new Error(`${message} (given: ${JSON.stringify(display(value))})`)
}

const normalizeCommandOption = (option) => {
  if (!option) {
    throw failGiven(option, '`option` can not be empty')
  }

  if (OPTION_TYPES.includes(option)) {
    option = { type: option }
  }

  if (option.type && !OPTION_TYPES.includes(option.type)) {
    throw failGiven(option.type, '`option.type` should be either Boolean or String')
  }

  if (option.alias && typeof option.alias !== 'string') {
    if (!Array.isArray(option.alias)) {
      throw failGiven(option.alias, '`option.alias` should be a string or an array of strings')
    }

    if (!option.alias.every(alias => typeof alias === 'string')) {
      throw failGiven(option.alias, '`option.alias` should be a string or an array of strings')
    }
  }

  return {
    type: option.type || String,
    default: option.default,
    alias: option.alias
      ? typeof option.alias === 'string' ? [option.alias] : option.alias
      : []
  }
}

const normalizeCommandOptions = (options) =>
  Object.keys(options)
    .reduce((newOptions, key) => Object.assign(newOptions, {
      [key]: normalizeCommandOption(options[key])
    }), {})

const normalizeCommand = (command) => {
  if (!command || typeof command !== 'object') {
    throw failGiven(command, '`command` should be an object')
  }

  if (typeof command.name !== 'string' || isEmpty(command.name.trim())) {
    throw failGiven(command.name, '`name` should be not empty string')
  }

  if (command.callback && typeof command.callback !== 'function') {
    throw failGiven(command.callback, '`callback` must be a function')
  }

  if (command.commands && (!Array.isArray(command.commands) || isEmpty(command.commands))) {
    throw failGiven(command.commands, '`commands` must be an array and it can not be empty')
  }

  if (command.description && typeof command.description !== 'string') {
    throw failGiven(command.description, '`description` must be a string')
  }

  if (command.title && typeof command.title !== 'string') {
    throw failGiven(command.title, '`title` must be a string')
  }

  if (command.prefix && typeof command.prefix !== 'string') {
    throw failGiven(command.prefix, '`prefix` must be a string')
  }

  if (command.options && typeof command.options !== 'object') {
    throw failGiven(command.options, '`options` must be an object')
  }

  if (!command.callback && !command.commands) {
    throw failGiven(command, '`command` should contain either `callback` function or `commands` array')
  }

  return {
    name: command.name.trim(),
    description: command.description,
    title: command.title,
    prefix: command.prefix,
    callback: command.callback || undefined,
    commands: command.commands ? command.commands.map(normalizeCommand) : undefined,
    options: command.options ? normalizeCommandOptions(command.options) : undefined
  }
}

exports.normalizeCommand = normalizeCommand

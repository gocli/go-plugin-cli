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

const normalizeCommand = (command) => {
  const failGiven = (value, message) => {
    throw new Error(`${message} (given: ${JSON.stringify(display(value))})`)
  }

  if (isEmpty(command)) {
    throw failGiven(command, '`command` should be a string, an object or an array and can not be empty')
  }

  if (typeof command !== 'object') {
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

  if (command.description && (typeof command.description !== 'string' || isEmpty(command.description.trim()))) {
    throw failGiven(command.description, '`description` must be not empty string')
  }

  if (command.title && (typeof command.title !== 'string' || isEmpty(command.title.trim()))) {
    throw failGiven(command.title, '`title` must be not empty string')
  }

  if (command.prefix && (typeof command.prefix !== 'string' || isEmpty(command.prefix.trim()))) {
    throw failGiven(command.prefix, '`prefix` must be not empty string')
  }

  if (!command.callback && !command.commands) {
    throw failGiven(command, '`command` should contain either `callback` function or `commands` array')
  }

  return {
    name: command.name.trim(),
    description: command.description ? command.description.trim() : command.description,
    title: command.title ? command.title.trim() : command.title,
    prefix: command.prefix ? command.prefix.trim() : command.prefix,
    callback: command.callback ? command.callback : undefined,
    commands: command.commands
      ? command.commands.map(normalizeCommand)
      : undefined
  }
}

exports.normalizeCommand = normalizeCommand

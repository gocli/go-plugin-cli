const uniq = require('uniq')
const isEmpty = require('is-empty')
const failGiven = require('./fail-given')
const normalizeCommandOptions = require('./normalize-command-options')

const isDefined = value => typeof value !== 'undefined'

const validateCommand = (command) => {
  if (!command || typeof command !== 'object') {
    throw failGiven(command, '`command` should be an object')
  }

  if (typeof command.name !== 'string' || isEmpty(command.name.trim())) {
    throw failGiven(command.name, '`name` should be not empty string')
  }

  if (isDefined(command.callback) && typeof command.callback !== 'function') {
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

  if (!command.callback && !command.commands) {
    throw failGiven(command, '`command` should contain either `callback` function or `commands` array')
  }
}

const validateAliasInterpolation = (options) => {
  const optionsNames = Object.keys(options)

  const allAliases = optionsNames
    .map(option => options[option].alias)
    .reduce((allAliases, aliases) => allAliases.concat(aliases), [])
    .sort()

  const uniqAliases = uniq(allAliases.slice(0)).sort()
  if (allAliases.length === uniqAliases.length) return

  const alias = allAliases.find((alias, index) => alias !== uniqAliases[index])
  optionsNames.filter(option => options[option].alias.includes(alias))
  throw new Error(`aliases can not be redefined in inherited options (\`v\` is used for ${optionsNames.join(', ')})`)
}

const normalize = (command, inheritedOptions) => {
  validateCommand(command) // will throw if fail

  const options = command.options
    ? normalizeCommandOptions(command.options, inheritedOptions)
    : undefined

  if (options) {
    validateAliasInterpolation(options)
  }

  const commands = command.commands
    ? command.commands.map(c => normalize(c, options))
    : undefined

  return {
    name: command.name.trim(),
    description: command.description,
    title: command.title,
    prefix: command.prefix,
    callback: command.callback,
    when: command.when,
    commands,
    options
  }
}

const normalizeCommand = (command) => normalize(command)

exports.normalizeCommand = normalizeCommand

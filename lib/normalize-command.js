const uniq = require('uniq')
const isEmpty = require('is-empty')

const isDefined = value => typeof value !== 'undefined'

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

const normalizeCommandOption = (name, option, inheritedOption = {}) => {
  if (!option || (!OPTION_TYPES.includes(option) && typeof option !== 'object')) {
    throw failGiven(option, '`option` should be either Boolean, String or Object({ type, default, alias })')
  }

  if (OPTION_TYPES.includes(option)) {
    option = { type: option }
  }

  if (option.type && !OPTION_TYPES.includes(option.type)) {
    throw failGiven(option.type, `\`${name}.type\` should be either Boolean or String`)
  }

  if (option.alias && typeof option.alias !== 'string') {
    if (!Array.isArray(option.alias)) {
      throw failGiven(option.alias, `\`${name}.alias\` should be a string or an array of strings`)
    }

    if (!option.alias.every(alias => typeof alias === 'string')) {
      throw failGiven(option.alias, `\`${name}.alias\` should be a string or an array of strings`)
    }
  }

  if (option.type && inheritedOption.type && option.type !== inheritedOption.type) {
    const definedAs = inheritedOption.type === Boolean ? 'Boolean' : 'String'
    const errorMessage = `\`${name}.type\` is defined in parent command as \`${definedAs}\` and can not be redefined`
    throw new Error(errorMessage + ` (given: ${definedAs === 'Boolean' ? 'String' : 'Boolean'})`)
  }

  if (isDefined(option.default) && isDefined(inheritedOption.default) && option.default !== inheritedOption.default) {
    const definedAs = display(inheritedOption.default)
    const errorMessage = `\`${name}.default\` is defined in parent command as \`${definedAs}\` and can not be redefined`
    throw failGiven(option.default, errorMessage)
  }

  const alias = option.alias ? typeof option.alias === 'string' ? [option.alias] : option.alias : []

  return {
    type: option.type || inheritedOption.type || String,
    default: isDefined(option.default) ? option.default : inheritedOption.default,
    alias: uniq(alias.concat(inheritedOption.alias || []))
  }
}

const normalizeCommandOptions = (options, inheritedOptions = {}) =>
  Object.keys(options)
    .reduce((newOptions, key) => Object.assign(newOptions, {
      [key]: normalizeCommandOption(key, options[key], inheritedOptions[key])
    }), Object.assign({}, inheritedOptions))

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
    commands,
    options
  }
}

const normalizeCommand = (command) => normalize(command)

exports.normalizeCommand = normalizeCommand

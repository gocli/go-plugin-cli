import test from 'ava'
import { CliPlugin } from '.'

const uid = () => (uid.id = (uid.id || 0) + 1).toString()

const createApp = () =>
  ({ use (plugin) { (plugin.install || plugin)(app) } })

const defaults = {
  callback: undefined,
  commands: undefined,
  description: undefined,
  name: undefined,
  prefix: undefined,
  title: undefined
}

const applyDefaults = command => Object.assign({}, defaults, command)

const methods = {}
const fixture = (id = uid()) => ({
  callback: (methods[id] || (methods[id] = () => {})),
  commands: undefined,
  description: `description-${id}`,
  name: `name-${id}`,
  prefix: `prefix-${id}`,
  title: `title-${id}`
})

let app
test.beforeEach(t => {
  app = createApp()
  app.use(CliPlugin)
})

test('export API', t => {
  t.is(typeof app.validateCommand, 'function', 'exports validateCommand()')
  t.is(typeof app.executeCommand, 'function', 'exports executeCommand()')
  t.is(typeof app.registerCommand, 'function', 'exports registerCommand()')
})

test('receive empty list of commands', t => {
  const commands = app.getCommands()
  t.truthy(Array.isArray(commands), 'commands should be of type Array')
  t.is(commands.length, 0, 'should be no commands')
})

test('register one command using shortcut', t => {
  const { name, callback } = fixture()

  app.registerCommand(name, callback)
  const commands = app.getCommands()

  t.is(commands.length, 1)
  t.deepEqual(commands[0], applyDefaults({ name, callback }))
})

test('register one command using object', t => {
  const { name, callback } = fixture()

  app.registerCommand({ name, callback })
  const commands = app.getCommands()
  t.is(commands.length, 1)

  const command = commands[0]
  t.deepEqual(command, applyDefaults({ name, callback }))
})

test('ignore callback option when command is an object', t => {
  const { name, callback } = fixture()

  app.registerCommand({ name, callback }, () => {})
  const commands = app.getCommands()

  t.deepEqual(commands[0], applyDefaults({ name, callback }))
})

test('register one command with extra options', t => {
  const id = uid()
  const command = fixture(id)
  command._extra_option = 1

  app.registerCommand(command)
  const commands = app.getCommands()

  t.deepEqual(commands[0], fixture(id))
})

test('register multiple commands', t => {
  const command1 = { name: 'name1', callback: () => {} }
  const command2 = { name: 'name2', callback: () => {} }

  app.registerCommand([ command1, command2 ])
  t.deepEqual(app.getCommands(), [ applyDefaults(command1), applyDefaults(command2) ])
})

test('register nested command', t => {
  const id1 = uid()
  const id2 = uid()

  const command = fixture(id1)
  const { name, callback } = fixture(id2)
  command.commands = [ { name, callback } ]

  app.registerCommand(command)

  const commands = app.getCommands()
  t.is(commands.length, 1)

  t.truthy(Array.isArray(command.commands))
  t.is(commands.length, 1)
  t.is(commands[0].commands.length, 1)
  t.deepEqual(commands[0].commands[0], applyDefaults({ name, callback }))
})

test('register multiple nested commands', t => {
  const id1 = uid()
  const id2 = uid()

  const command = fixture()
  command.commands = [ fixture(id1), fixture(id2) ]

  app.registerCommand(command)
  const commands = app.getCommands()
  t.is(commands.length, 1)

  t.truthy(Array.isArray(command.commands))
  t.is(commands.length, 1)
  t.is(commands[0].commands.length, 2)
  t.deepEqual(commands[0].commands, [ fixture(id1), fixture(id2) ])
})

test('register multiple commands', t => {
  const [ id1, id2 ] = [ uid(), uid() ]
  app.registerCommand(fixture(id1))
  app.registerCommand(fixture(id2))
  t.deepEqual(app.getCommands(), [ fixture(id1), fixture(id2) ])
})

test.serial('validate commands', async t => {
  const command1 = fixture()
  const command2 = fixture()
  const [ name, name2 ] = [ command1.name, command2.name ]
  app.registerCommand([ command1, command2 ])

  t.truthy(await app.validateCommand(name))
  t.truthy(await app.validateCommand(name2))
  t.truthy(await app.validateCommand(` ${name} `))
  t.truthy(await app.validateCommand(`${name} extra`))
  t.truthy(await app.validateCommand(`${name} --flag`))
  t.truthy(await app.validateCommand(`--flag drop ${name}`))

  t.falsy(await app.validateCommand(`${name}0`))
  t.falsy(await app.validateCommand(`not_a_command_name ${name}`))
  t.falsy(await app.validateCommand(`--flag ${name}`))
})

test.serial('validate nested command', async t => {
  const command1 = fixture()
  const command2 = fixture()
  const [ name, nestedName ] = [ command1.name, command2.name ]
  command1.commands = [ command2 ]
  app.registerCommand(command1)

  t.truthy(await app.validateCommand(name))
  t.truthy(await app.validateCommand(`${name} ${nestedName}`))
  t.truthy(await app.validateCommand(`${name} -k ${nestedName}`))

  t.falsy(await app.validateCommand(`${name} not_a_command_name ${nestedName}`))
  t.falsy(await app.validateCommand(`${nestedName} ${name}`))
  t.falsy(await app.validateCommand(nestedName))
})

test.serial('execute commands', async t => {
  const command = fixture()
  let called = false
  command.callback = () => { called = true }

  app.registerCommand(command)

  await app.executeCommand(command.name)
  t.truthy(called)

  called = false
  await app.executeCommand(`${command.name} extra`)
  t.truthy(called)
})

test('execute nested commands', async t => {
  const [ command, nestedCommand ] = [ fixture(), fixture() ]
  let [ called, nestedCalled ] = [ false, false ]
  command.callback = () => { called = true }
  nestedCommand.callback = () => { nestedCalled = true }

  command.commands = [ nestedCommand ]
  app.registerCommand(command)

  await app.executeCommand(command.name)
  t.truthy(called)
  t.falsy(nestedCalled)

  ;[ called, nestedCalled ] = [ false, false ]
  await app.executeCommand(`${command.name} ${nestedCommand.name}`)
  t.truthy(nestedCalled)
  t.falsy(called)
})

test.serial('overload commands', async t => {
  const [ command1, command2 ] = [ fixture(), fixture() ]
  let [ called1, called2 ] = [ false, false ]
  command1.callback = () => { called1 = true }
  command2.callback = () => { called2 = true }

  command2.name = command1.name

  app.registerCommand([ command1, command2 ])

  await app.executeCommand(command2.name)
  t.truthy(called2)
  t.falsy(called1)

  ;[ called1, called2 ] = [ false, false ]
  await app.executeCommand(command2.name)
  t.truthy(called2)
  t.falsy(called1)

  ;[ called1, called2 ] = [ false, false ]
  await app.executeCommand(command1.name)
  t.truthy(called2)
  t.falsy(called1)
})

test.serial('execute triggers errors', async t => {
  await t.throws(() => app.executeCommand(), '`command` should be not empty string')
  await t.throws(app.executeCommand('not_registerd_command'), 'command is not registered')
  app.registerCommand({ name: 'command', commands: [ fixture() ] })
  await t.throws(app.executeCommand('command'), 'command doesn\'t have a callback')
})

test.serial('trigger all register errors', async t => {
  const name = 'command'
  const callback = () => {}

  await t.throws(() => app.registerCommand(), '`command` is required')
  await t.throws(() => app.registerCommand(1), '`command` should be a string, an object or an array')
  await t.throws(() => app.registerCommand(''), '`name` should be not empty string (given: "")')
  await t.throws(() => app.registerCommand(' '), '`name` should be not empty string (given: " ")')
  await t.throws(() => app.registerCommand(null), '`command` should be a string, an object or an array and can not be empty (given: null)')
  await t.throws(() => app.registerCommand({}), '`command` should be a string, an object or an array and can not be empty (given: {})')
  await t.throws(() => app.registerCommand({ randomPropertyHere: 1 }), '`name` should be not empty string (given: undefined)')
  await t.throws(() => app.registerCommand({ name: null }), '`name` should be not empty string (given: null)')
  await t.throws(() => app.registerCommand(name), '`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
  await t.throws(() => app.registerCommand({ name }), '`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
  await t.throws(() => app.registerCommand({ name }, callback), '`command` should contain either `callback` function or `commands` array (given: {"name":"command"})')
  await t.throws(() => app.registerCommand({ name, callback: 1 }), '`callback` must be a function (given: 1)')
  await t.throws(() => app.registerCommand({ name, commands: [] }), '`commands` must be an array and it can not be empty (given: [])')
  await t.throws(() => app.registerCommand({ name, commands: [ name ] }), '`command` should be an object (given: "command")')
  await t.throws(() => app.registerCommand({ name, callback, description: 1 }), '`description` must be not empty string (given: 1)')
  await t.throws(() => app.registerCommand({ name, callback, title: 1 }), '`title` must be not empty string (given: 1)')
  await t.throws(() => app.registerCommand({ name, callback, prefix: 1 }), '`prefix` must be not empty string (given: 1)')
})

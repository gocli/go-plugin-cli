# go-plugin-cli [![npm](https://img.shields.io/npm/v/go-plugin-cli.svg?style=flat-square)](https://www.npmjs.com/package/go-plugin-cli) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-green.svg?style=flat-square)](https://github.com/gocli/go-plugin-cli) [![Travis](https://img.shields.io/travis/gocli/go-plugin-cli.svg?style=flat-square)](https://travis-ci.org/gocli/go-plugin-cli)

[Go](https://www.npmjs.com/package/go) plugin to create and [execute commmands](https://www.npmjs.com/package/go-cli).

## Table of Contents

- [Usage](#usage)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [API Reference](#api-reference)
    - [registerCommand](#goregistercommand)
    - [executeCommand](#goexecutecommand)
    - [validateCommand](#govalidatecommand)
    - [getCommands](#gogetcommands)
  - [Command Options](#command-options)
- [Examples](#examples)
- [License](#license)

## Usage

### Installation

```bash
$ npm install go go-plugin-cli
```

```js
const go = require('go')
go.use(require('go-plugin-cli'))

// or

import { CliPlugin } from 'go-plugin-cli'
go.use(CliPlugin)
```

### Quick Start

CLI Plugin is made to use in pair with [go-cli](https://www.npmjs.com/package/go-cli).
Anyway, it can be used as a standalone plugin:

```js
const go = require('go')
go.use(require('go-plugin-cli'))

go.registerCommand('ping', () => console.log('pong'))
go.executeCommand('ping') // outputs: pong
```

### API Reference

#### go.registerCommand

```
go.registerCommand( command [ , callback ] )
```

Save command to execute it later.
`command` can be an object with [command options](#command-options), an array of command objects, or a string.
If `command` is given as a string, `callback` property is required.

#### go.executeCommand

```
go.executeCommand( command ): Promise<any>
```

Find and call the command (string) if it is exists, or rejects the promise.

#### go.validateCommand

```
go.validateCommand( command ): Promise<boolean>
```

Check if any registered callback can process the command (string).

#### go.getCommands

```
go.getCommands(): Array
```

Return a tree representation of registered commands.

### Command Options

#### name

- **type**: `string`
- **required**: yes

What should be executed to trigger the command.

#### callback

- **type**: `function`
- **required**: if `command.commands` is empty
- **arguments**: `argv`, `commandString`

Will be called when `command.name` is triggered.
`argv` contains arguments parsed by [minimist](https://npmjs.org/package/minimist) from executed command.
`commandString` is raw string that was executed.

#### commands

- **type**: `array`
- **required**: if `command.callback` is empty

Define nested commands.
Nested commands has the [same syntax](#command-options).

#### description

- **type**: `string`
- **required**: no

Add description for the command.
Used by Go CLI [interactive menu](https://www.npmjs.com/package/go-cli#interactive-menu).

#### title

- **type**: `string`
- **required**: no

Change prompt message for [nested commands](#commands).
Used by Go CLI [interactive menu](https://www.npmjs.com/package/go-cli#interactive-menu).

#### prefix

- **type**: `string`
- **required**: no

Change prompt prefix for [nested commands](#commands).
Used by Go CLI [interactive menu](https://www.npmjs.com/package/go-cli#interactive-menu).

## Examples

### Register and execute basic command

```js
go.registerCommand('ping', () => console.log('pong'))
go.executeCommand('ping') // outputs: pong
```

### Register command as an object

```js
go.registerCommand({
  name: 'ping',
  callback: () => console.log('pong')
})
```

### Use given arguments

```js
go.registerCommand('ping', (argv) => {
  console.log(`${argv.say || 'hello'} to ${argv._[1]}`)
})

go.executeCommand('ping neighbor --say hi') // outputs: hi to neighbor
```

### Trigger nested command

```js
go.registerCommand({
  name: 'ping',
  callback: () => console.log('pong'),
  commands: [
    { name: 'me',
      callback: () => console.log('I am here') },
    { name: 'server',
      callback: () => console.log('I don\'t know any server') }
  ]
})

go.executeCommand('ping') // outputs: pong
go.executeCommand('ping server') // outputs: I don't know any server
```

### Additional options

To see how to apply additional options like [description](#description), [title](#title) and [prefix](#prefix) see [Go CLI documentation](https://npmjs.org/package/go-cli).

## License

MIT © [Stanislav Termosa](https://github.com/termosa)


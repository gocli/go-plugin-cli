# go-plugin-cli [![npm](https://img.shields.io/npm/v/go-plugin-cli.svg?style=flat-square)](https://www.npmjs.com/package/go-plugin-cli)

[Go](https://www.npmjs.com/package/go) plugin to create and [execute commmands](https://www.npmjs.com/package/go-cli).

## Usage

```bash
$ npm install go go-plugin-cli
```

```js
const go = require('go')
go.use(require('go-plugin-cli'))
```

## API

### Execute command

Find and call the command if it is exists, or rejects the promise.

```js
/* promise */ go.executeCommand( /* string */ command )
```

### Validate command

Check if any registered callback can process the command.

```js
/* boolean */ go.validateCommand( /* string */ command )
```

### Register new command

```js
go.registerCommand(
  /* string|regexp */ selector,
  /* optional object */ options,
  /* function */ callback
)
```

### Unregister command

```js
go.unregisterCommand( /* string|regexp */ selector )
```

## Examples

### The simplest example

```js
go.registerCommand('ping', () => 'pong')
go.executeCommand('ping').then(console.log) // 'pong'
```

### Using given arguments

```js
go.registerCommand('create', argv => console.log(`create ${argv._[1]}`))
go.executeCommand('create component')
```

The command string is parsed with [minimist](https://www.npmjs.com/package/minimist) so you can use all its power:

```js
go.registerCommand('create', argv => {
  console.log(`create ${argv.name} of type ${argv._[1]}`)
})
go.executeCommand('create component --name login-form')
```

### Regular expressions

```js
go.registerCommand(/(g|generate)/, (argv) => {
  console.log(`g ${argv.name} of type ${argv._[1]}`)
})

go.executeCommand('g component --name login-form')
```

### Command validation

```js
go.registerCommand(/(p|ping)/, () => 'pong')

console.log( go.validateCommand('ping') ) // true
console.log( go.validateCommand('p') ) // true
console.log( go.validateCommand('p me') ) // true
console.log( go.validateCommand('pin') ) // false
```

## License

MIT © [Stanislav Termosa](https://github.com/termosa)


class CliPluginError extends Error {
  constructor (caller, error) {
    const message = error instanceof Error ? error.message : error ? error.toString() : error
    super(message)

    this.name = 'CliPluginError'
    this.message = message

    Error.captureStackTrace(this, caller)
  }
}

const fail = (caller, error) => new CliPluginError(caller, error)

export default fail

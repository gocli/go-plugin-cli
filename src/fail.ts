class CliPluginError extends Error {
  constructor (caller: any, error: string | Error) {
    const message = error instanceof Error ? error.message : error ? error.toString() : error
    super(message)

    this.name = 'CliPluginError'
    this.message = message

    Error.captureStackTrace(this, caller)
  }
}

const fail = (caller: any, error: string | Error) => new CliPluginError(caller, error)

export default fail
export { fail, CliPluginError }

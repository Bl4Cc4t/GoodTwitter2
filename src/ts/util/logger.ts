const GLOBAL_PREFIX = "[GT2]"


/**
 * Logging class for the script.
 */
export class Logger {
  prefixes: string[]

  constructor(...origin: string[]) {
    let originPrefix = null

    if (origin.length)
      originPrefix = `${origin.join("/")}:`

    this.prefixes = [GLOBAL_PREFIX, originPrefix].filter(e => e)
  }

  /**
   * Logs a message with the debug level.
   * @param msg the message to log
   */
  debug(...msg: any) {
    console.debug(...this.prefixes, ...msg)
  }

  /**
   * Logs a message with the info level.
   * @param msg the message to log
   */
  info(...msg: any) {
    console.info(...this.prefixes, ...msg)
  }

  /**
   * Logs a message with the warn level.
   * @param msg the message to log
   */
  warn(...msg: any) {
    console.warn(...this.prefixes, ...msg)
  }

  /**
   * Logs a message with the error level.
   * @param msg the message to log
   */
  error(...msg: any) {
    console.error(...this.prefixes, ...msg)
  }
}

/**
 * "Singleton" of the logger, used for general purposes.
 */
export const logger = new Logger()

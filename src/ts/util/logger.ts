const LOG_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
]

const LOG_PREFIX = "[GT2]"

class Logger {
  debug(...msg: any) {
    console.debug(LOG_PREFIX, msg)
  }
  info(...msg: any) {
    console.info(LOG_PREFIX, msg)
  }
  warn(...msg: any) {
    console.warn(LOG_PREFIX, msg)
  }

  error(...msg: any) {
    console.error(LOG_PREFIX, msg)
  }
}

export let logger = new Logger()

const GLOBAL_PREFIX = "[GT2]"

export class Logger {
  prefixes: string[]

  constructor(...origin: string[]) {
    let originPrefix = null

    if (origin.length)
      originPrefix = `${origin.join("/")}:`

    this.prefixes = [GLOBAL_PREFIX, originPrefix].filter(e => e)
  }

  debug(...msg: any) {
    console.debug(this.prefixes, ...msg)
  }

  info(...msg: any) {
    console.info(this.prefixes, ...msg)
  }

  warn(...msg: any) {
    console.warn(this.prefixes, ...msg)
  }

  error(...msg: any) {
    console.error(this.prefixes, ...msg)
  }
}

export {}

declare global {
  interface Number {
    /**
     * Makes a number more readable by adding commas.
     *
     * Examples:
     * - `1400000` -> `1,400,000`
     * - `23400` -> `23,400`
     * @return human readable number
     */
    humanize(): string

    /**
     * Makes a number more readable by adding commas.
     * Also shortens thousands/millions.
     *
     * Examples:
     * - `1400000` -> `1.4M`
     * - `23400` -> `23.4K`
     * @return shortened, human readable number
     */
    humanizeShort(): string
  }
}


Number.prototype.humanize = function(): string {
  let t = this.toString().split("")
  let out = ""
  let c = 1
  for (let i=t.length-1; i>=0; i--) {
    out = `${t[i]}${out}`
    if (c++ % 3 == 0 && i-1 >= 0) {
      out = `,${out}`
    }
  }
  return out
}


Number.prototype.humanizeShort = function(): string {
  let t = this.toString()
  if (this >= 1000000) {
    t = t.slice(0, -5)
    return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}M`
  } else if (this >= 10000) {
    t = t.slice(0, -2)
    return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}K`
  } else return this.humanize()
}

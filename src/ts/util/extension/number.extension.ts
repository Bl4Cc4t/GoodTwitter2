export {}

declare global {
  interface Number {
    humanize(): string
    humanizeShort(): string
  }
}

/**
 * Make number better readible by adding commas
 * @return human readable number
 */
Number.prototype.humanize = function() {
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

/**
 * shorter version: 1.4M, 23.4K, etc
 * @return [description]
 */
Number.prototype.humanizeShort = function() {
  let t = this.toString()
  if (this >= 1000000) {
    t = t.slice(0, -5)
    return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}M`
  } else if (this >= 10000) {
    t = t.slice(0, -2)
    return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}K`
  } else return this.humanize()
}

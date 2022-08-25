export {}

declare global {
  interface Array<T> {
    dedupe(): Array<T>
  }
}

Array.prototype.dedupe = function() {
  return [...new Set(this.filter(e => typeof e != "undefined").map(e => JSON.stringify(e)))].map((e: any) => JSON.parse(e))
}

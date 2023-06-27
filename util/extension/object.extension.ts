export {}

declare global {
  interface Object {
    flatten(): Object
    getByPath(...path: string[]): any
  }
}

// flatten an object
Object.prototype.flatten = function() {
  // https://stackoverflow.com/a/33037683
  return Object.assign({},
    ...function f(obj) {
      return [].concat(
        ...Object.keys(obj).map(k => typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]) ? f(obj[k]) : {[k]: obj[k]})
      )
    }(this)
  )
}


Object.prototype.getByPath = function(...path: string[]) {
  // https://stackoverflow.com/a/8817531
  if (!path.length) return this
  if (Array.isArray(path[0])) path = path[0]
  return path.length == 1 ? this[path[0]] : this[path[0]].getByPath(path.slice(1))
}

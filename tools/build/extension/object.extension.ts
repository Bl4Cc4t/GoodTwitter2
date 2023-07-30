export {}

declare global {
    interface Object {
        /**
         * Flattens an object.
         *
         * Reference: https://stackoverflow.com/a/33037683
         */
        flatten(): Object
        /**
         * Gets a property of an object by path.
         *
         * Reference: https://stackoverflow.com/a/8817531
         * @param path the path of the propery
         */
        getByPath(...path: string[]): any
    }
}

Object.prototype.flatten = function () {
    return Object.assign({},
        ...function f(obj) {
            return [].concat(
                ...Object.keys(obj).map(k => typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]) ? f(obj[k]) : { [k]: obj[k] })
            )
        }(this)
    )
}

Object.prototype.getByPath = function (...path: string[]) {
    if (!path.length) return this
    if (Array.isArray(path[0])) path = path[0]
    return path.length == 1 ? this[path[0]] : this[path[0]].getByPath(path.slice(1))
}

import { MODAL_PAGES } from "../constants"

/**
 * Checks if the current location is in a given path object.
 * @param path the path to check
 * @param level internal path level
 * @returns true if the current location is in the given path object
 */
export function onPage(path: Path, level=0): boolean {
    let pathSplit = location.pathname.split("/")
    pathSplit.shift()

    // given path is too deep
    if (pathSplit.length < level) return false
    let pathCurrent = pathSplit[level]

    // path is an array
    if (Array.isArray(path)) {
        for (const sub of path) {
            // single string
            if (typeof sub == "string" && (pathCurrent == sub || sub == "*")) return true
            // another path object
            else if (typeof sub != "string" && onPage(sub, level)) return true
        }
    }

    // path object
    else {
        for (const [top, sub] of Object.entries(path)) {
            if ((pathCurrent == top || top == "*") && onPage(sub, level+1)) return true
        }
    }

    return false
}


/**
 * Checks whether the current location is a modal page.
 * @returns true if the current location is a modal page
 */
export function onModal(): boolean {
    return onPage(MODAL_PAGES) || location.pathname.match(/\/(photo|video)\/\d\/?$/) != null
}

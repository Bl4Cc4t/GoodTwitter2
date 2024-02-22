import { MODAL_PAGES } from "../constants"
import { Logger } from "./logger"
import { getRootReactPropByName } from "./react-util"

const _logger = new Logger("location.page")


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


/**
 * Navigates to a url using the RichHistory prop.
 *
 * Falls back to normal History.pushState if RichHistory was not found.
 * @param url the url to navigate to
 */
export function navigate(url: string) {
    const richHistory = getRootReactPropByName<RichHistory>("history")

    if (richHistory) {
        richHistory?.push({
            pathname: url
        })
    } else {
        window.history.pushState(null, null, url)
    }
}


/**
 * Adds a link handler to an element for soft navigation
 * @param element the element to add the handler to
 * @param url the url to navigate to. leave out if element is an anchor
 */
export function addLinkClickHandler(element: Element, url?: string) {
    if (!url) {
        if (element.nodeName != "A") {
            _logger.error("Cannot add link handler to an element without a provided link", element)
            return
        }

        url = element.getAttribute("href")
    }

    _logger.debug("adding click handler to element", element)
    element.addEventListener("click", (event: MouseEvent) => {
        if (event.ctrlKey)
            return

        event.preventDefault()
        navigate(url)
    })
}

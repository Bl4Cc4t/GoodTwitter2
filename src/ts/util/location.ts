import { removeSearch } from "../component/navbar"
import { addSettings, addSettingsMenuEntry, hideSettings } from "../component/page-settings"
import { MODAL_PAGES, TITLE_ADJUSTMENTS } from "../constants"
import { Logger } from "./logger"
import { Settings } from "./settings"
import { enableLatestTweets } from "./timeline"
import { addSourceLabel, labelMoreTweetsElement, scrollTweetUp } from "./tweet"
import { isLoggedIn, waitForElements, watchForElementChanges } from "./util"


const _logger = new Logger("location")


/**
 * Entry function for all location adjustments.
 */
export function initializeLocation(): void {
    window.addEventListener("popstate", function() {
        onLocationChange("pop")
    })

    onLocationChange("init")
    watchTitle()
}


/**
 * Sets the type of the page.
 * @param type type of the page
 */
function setPageType(type: string): void {
    if (document.body.dataset.pageType != type) {
        document.body.dataset.pageType = type
        _logger.debug(`page type set to: ${type}`)
    }
}


/**
 * Resets the page type.
 */
function resetPageType(): void {
    delete document.body.dataset.pageType
    _logger.debug("reset page type")
}


/**
 * Sets the current page as an error page.
 */
function setErrorPage(): void {
    document.body.dataset.pageError = "true"
    _logger.debug("on error page")
}


/**
 * Watches the page title for changes and modifies it if necessary.
 */
function watchTitle(): void {
    watchForElementChanges("head title", title => {
        if (title.textContent != title.getAttribute("content")) {
            for (let adj of TITLE_ADJUSTMENTS) {
                if (location.pathname == adj.location)
                    changeTitle(adj.title)
            }
        }
    }, {
        attributes: false
    })
}


/**
 * Changes the current page title.
 * @param newTitle the new title of the page
 */
export function changeTitle(newTitle: string): void {
    let title = document.querySelector("title")
    if (!title) {
        _logger.error("title element not found.")
        return
    }

    let newContent = title.textContent.replace(/(\(.*\) )?.*/, `$1${newTitle} / Twitter`)
    if (title.textContent != newContent) {
        title.setAttribute("content-old", title.textContent)
        title.textContent = newContent
        title.setAttribute("content", newContent)
        _logger.debug(`title changed to "${newContent}"`)
    }
}


/**
 * Resets the page title to the last one.
 */
export function resetTitle(): void {
    let title = document.querySelector("title")
    if (!title) {
        _logger.error("title element not found.")
        return
    }

    let oldContent = title.getAttribute("content-old")
    if (oldContent) {
        title.setAttribute("content", oldContent)
        title.removeAttribute("content-old")
        title.textContent = oldContent
        _logger.debug("reset title to: ", oldContent)
    }
}


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
 * Changes to apply to the page whenever a location change happens.
 * Gets called by push/pop/replace event listeners.
 * @param type type of the change event
 */
export function onLocationChange(type: string): void {
    _logger.info(`location change: [${type}] ${location.pathname}`)

    document.body.dataset.pagePathname = location.pathname.slice(1)

    // not logged in
    if (!isLoggedIn()) {
        document.body.classList.add("gt2-not-logged-in")
    }

    // error
    delete document.body.dataset.pageError
    waitForElements(`main > div > div > div [data-testid=error-detail]`, e => {
        if (!onPage({ settings: ["gt2"] })) {
            setErrorPage()
        }
    }, false)

    // tweet
    if (onPage({
        "*": ["status"],
        i: { web: ["status"] }
    }) && !onPage({
        "*": { "status": { "*": { "retweets": ["with_comments"] } } },
        i: { web: { "status": { "*": { "retweets": ["with_comments"] } } } }
    })) {
        setPageType("tweet")

        addSourceLabel()
        labelMoreTweetsElement()
        scrollTweetUp(75)
    }

    // home
    else if (onPage(["home"])) {
        setPageType("home")

        enableLatestTweets()
    }

    // search/explore
    else if (onPage(["search", "explore"])) {
        setPageType("search")

        // remove navbar search
        removeSearch()
    }

    // settings
    else if (onPage(["settings"]) && !onModal()) {
        setPageType("settings")
        addSettingsMenuEntry()

        if (onPage({settings: ["gt2"]})) {
            changeTitle("GoodTwitter2")
            addSettings()
        } else {
            resetTitle()
            hideSettings()
        }
    }

    // messages
    else if (onPage(["messages"])) {
        setPageType("messages")
    }

    // 404
    else if (onPage(["404"])) {
        setErrorPage()
    }

    else if (onModal()) {
        _logger.debug("on modal")
    }

    // unhandled / not important
    else if (onPage(["hashtag", "i", "places", "notifications"]) || onPage({
        "*": ["communities", "followers", "followers_you_follow", "following", "lists", "moments", "status", "topics"],
    })) {
        _logger.warn("on unhandled page")
        resetPageType()
    }

    // profile page
    else if (!onModal() || onPage({intent: ["user"]})) {
        setPageType("profile")

        // @option profileMediaRedirect
        if (Settings.get("profileMediaRedirect") && !location.pathname.endsWith("/media")) {
            waitForElements(`[href$="/media"][aria-selected=false]`, e => e.click())
            _logger.debug("redirected to /media page")
        }
    }

    // unhandled modals
    else {
        _logger.warn("on unhandled modal")
        // resetPageType()
    }
}

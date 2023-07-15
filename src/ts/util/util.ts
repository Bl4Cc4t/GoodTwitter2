import { DEFAULT_AVATAR_URL, GM_KEYS, SVG } from "../constants"
import { Logger } from "./logger"
import { settings } from "./settings"


const _logger = new Logger("util")


/**
 * Returns an SVG string.
 * @param key name of the SVG
 * @return SVG string
 */
export function getSvg(key: keyof typeof SVG): string {
    return `
        <svg class="gt2-svg" viewBox="0 0 ${key == "google" ? 74 : 24} 24">
          ${SVG[key]}
        </svg>`
}


/**
 * Checks if the current user is logged in.
 * @return true if logged in, false if not
 */
export function isLoggedIn(): boolean {
    return document.cookie.match(/twid=u/) != null
}


/**
 * Gets the current display language.
 * @return display language code
 */
export function getLanguage(): string {
    let lang = document.documentElement.lang
    return lang == "en-GB" ? "en" : lang
}


/**
 * Gets the localized version of a string.
 * Defaults to the english version.
 * @param key the key of the string
 * @returns the localized string
 */
export function getLocalizedString(key: string): string {
    if (!i18n) {
        _logger.error("error getting i18n data.")
        return key
    }

    let lang = getLanguage()
    if (!Object.keys(i18n).includes(lang)) {
        _logger.warn(`the language file for ${lang} does not exist yet. falling back to english.`)
        lang = "en"
    }

    if (!Object.keys(i18n[lang]).includes(key)) {
        if (!hasLocalizedString(key)) {
            _logger.error(`the string "${key}" does not exist.`)
            return null
        }

        _logger.warn(`the language file for ${lang} does not contain a translation for the string "${key}". falling back to english.`)
        lang = "en"
    }

    return i18n[lang][key]
}


/**
 * Checks whether a string has a localized version or not.
 * @param key the key of the string
 * @returns true if the string has a localized version
 */
export function hasLocalizedString(key: string): boolean {
    return Object.keys(i18n["en"]).includes(key)
}


export function getLocalizedReplaceableString<K extends keyof I18nReplaceable, V extends I18nReplaceable[K]>(key: K, val: V): string {
    let loc = getLocalizedString(key)

    Object.entries(val).forEach(e => {
        loc = loc.replace(`$${e[0]}$`, e[1].toString())
    })

    return loc
}


/**
 * Execute a callback function on elements once they are available in the DOM.
 * Heavily based on https://gist.github.com/BrockA/2625891 but without jQuery.
 * @param selector a valid CSS selector string
 * @param callback the callback function to execute. Gets passed the added element node
 * @param waitOnce if set to false, continue to search for new elements even after the first match is found
 * @param iframeSelector a valid CSS selector string for an iframe to search elements in
 */
export function waitForElements(
    selector: string,
    callback: (e: HTMLElement) => void,
    waitOnce = true,
    iframeSelector?: string
): () => void {
    let targetNodes: NodeListOf<HTMLElement>
    let targetsFound = false
    const WAIT_TIME_MS = 300

    // get the target nodes
    if (typeof iframeSelector == "undefined") {
        targetNodes = document.querySelectorAll(selector)
    }
    // get nodes from iframe
    else {
        let iframe = document.querySelector<HTMLIFrameElement>(iframeSelector)
        if (!iframe) return
        else {
            targetNodes = iframe.contentDocument.querySelectorAll(selector)
        }
    }

    if (targetNodes && targetNodes.length > 0) {
        targetsFound = true

        // loop over all nodes and execute the callback function
        targetNodes.forEach(node => {
            if (!node.alreadyFound) {
                callback(node)
                node.alreadyFound = true
            }
        })
    }

    // get the timer-control variable for this selector
    let controlObj = unsafeWindow.controlObj || {}
    let controlKey = selector.replace(/\s/g, "")
    let timeControl = controlObj[controlKey]

    function teardown() {
        _logger.debug("teardown of:", controlKey)
        clearInterval(timeControl)
        delete controlObj[controlKey]
        targetNodes.forEach(e => e.alreadyFound = false)
    }

    // now set or clear the timer as appropriate
    if (targetsFound && waitOnce && timeControl) {
        // the only condition where we need to clear the timer
        teardown()
    }

    // set a timer, if needed
    else if (!timeControl) {
        timeControl = setInterval(() => {
            waitForElements(selector, callback, waitOnce, iframeSelector)
        }, WAIT_TIME_MS)
        controlObj[controlKey] = timeControl
    }
    unsafeWindow.controlObj = controlObj

    return teardown
}


/**
 * Watch a given element for changes and execute a callback function when they happen.
 * @param selector a valid CSS selector string of the element to watch
 * @param callback the function to execute when a change happens
 * @param options additional options for the observe function
 * @param waitOnce if set to false, continue to search for new elements even after the first match is found
 */
export function watchForElementChanges(
    selector: string,
    callback: (e: HTMLElement) => void,
    options?: MutationObserverInit,
    waitOnce = true
): () => void {
    let observer: MutationObserver
    const teardown = waitForElements(selector, element => {
        callback(element)

        if (observer)
            observer.disconnect()

        observer = new MutationObserver(mutationRecord => {
            mutationRecord.forEach(() => callback(element))
        })

        observer.observe(element, {
            attributes: true,
            childList: true,
            ...options
        })
    }, waitOnce)

    return () => {
        teardown()
        if (observer)
            observer.disconnect()
    }
}
        }
    })
}


/**
 * Get information about the currently logged in account.
 * @returns user info object
 */
export function getCurrentUserInfo(): UserInfo {
    if (window.userInfo)
        return window.userInfo

    let user = null
    try {
        for (let e of Array.from(document.querySelectorAll("#react-root ~ script"))) {
            if (e.textContent.includes("__INITIAL_STATE__")) {
                let match = e.textContent.match(/__INITIAL_STATE__=(\{.*?});window/)
                if (match) {
                    let initialState = JSON.parse(match[1])
                    user = Object.values(initialState?.entities?.users?.entities)[0] ?? null
                }
                break
            }
        }
    } catch (e) {
        _logger.error(e)
    }


    if (user) {
        window.userInfo = {
            bannerUrl: user.profile_banner_url,
            avatarUrl: user.profile_image_url_https.replace("_normal", "_bigger"),
            screenName: user.screen_name,
            name: user.name,
            id: user.id_str,
            stats: {
                tweets: user.statuses_count,
                followers: user.followers_count,
                following: user.friends_count
            }
        }
        _logger.info("got user info", window.userInfo)
    } else {
        _logger.error("match of __INITIAL_STATE__ unsuccessful, falling back to default values")
        window.userInfo = {
            bannerUrl: "",
            avatarUrl: DEFAULT_AVATAR_URL,
            screenName: "youarenotloggedin",
            name: "Anonymous",
            id: "0",
            stats: {
                tweets: 0,
                followers: 0,
                following: 0
            }
        }
    }

    return window.userInfo
}


/**
 * Adds a click EventListener to a mock element.
 * @param mockElement the mock element to append the listener to
 * @param originalElement the original element to click on
 * @param callback an optional callback
 */
export function addClickHandlerToMockElement(mockElement: Element, originalElement: HTMLElement, callback?: () => void): void {
    mockElement.addEventListener("click", (event: MouseEvent) => {
        if (!event.ctrlKey && originalElement != null) {
            event.preventDefault()
            originalElement.dispatchEvent(new MouseEvent("click", { bubbles: true }))

            if (callback)
                callback()
        }
    })
}


/**
 * Checks, if the current layout only consists of a single sidebar.
 * @returns true, if it does
 */
export function isOnSingleSidebarLayout(): boolean {
    let smallSidebars = settings.get("smallSidebars")
    let width = window.innerWidth
    return (!smallSidebars && width <= 1350) || (smallSidebars && width <= 1230)
}


/**
 * Checks, if a sidebar notice has been dismissed.
 * @param key the key of the notice to check
 * @returns true, if the notice has been dismissed
 */
export function isSidebarNoticeDismissed(key: string): boolean {
    return GM_getValue(GM_KEYS.DISMISSED_SIDEBAR_NOTICES, []).includes(key)
}


/**
 * Dismisses a sidebar notice.
 * @param key the key of the notice to dismiss.
 */
export function dismissSidebarNotice(key: string): void {
    let notices = GM_getValue(GM_KEYS.DISMISSED_SIDEBAR_NOTICES, [])
    notices.push(key)
    GM_setValue(GM_KEYS.DISMISSED_SIDEBAR_NOTICES, notices)
    _logger.debug("dismissed sidebar notice with key: ", key)
}

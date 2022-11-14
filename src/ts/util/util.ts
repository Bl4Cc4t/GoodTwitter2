import { DEFAULT_AVATAR_URL, MODAL_PAGES, SVG } from "../constants"
import { I18nReplacable, Path, UserInfo } from "../types"
import { Logger } from "./logger"
import { settings } from "./settings"


const logger = new Logger("util")


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
  return Boolean(document.cookie.match(/twid=u/))
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
 * @return localized string
 */
export function getLocalizedString(key: string): string {
  if (!i18n) {
    logger.error("error getting i18n data.")
    return key
  }

  let lang = getLanguage()
  if (!Object.keys(i18n).includes(lang)) {
    logger.warn(`the language file for ${lang} does not exist yet. falling back to english.`)
    lang = "en"
  }

  if (!Object.keys(i18n[lang]).includes(key)) {
    if (!hasLocalizedString(key)) {
      logger.error(`the string "${key}" does not exist.`)
      return null
    }

    logger.warn(`the language file for ${lang} does not contain a translation for the string "${key}". falling back to english.`)
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


export function getLocalizedReplacableString<K extends keyof I18nReplacable, V extends I18nReplacable[K]>(key: K, val: V): string {
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
export function waitForKeyElements(
  selector: string,
  callback: (e: HTMLElement) => void,
  waitOnce = true,
  iframeSelector?: string
): void {
  let targetNodes: NodeListOf<HTMLElement>
  let targetsFound = false
  let WAIT_TIME_MS = 300


  // get the target nodes
  if (typeof iframeSelector == "undefined") {
    targetNodes = document.querySelectorAll(selector)
  }
  // get nodes from iframe
  else {
    let iframe: HTMLIFrameElement | null = document.querySelector(iframeSelector)
    if (!iframe) return
    else {
      targetNodes = iframe.contentDocument.querySelectorAll(selector)
    }
  }

  if (targetNodes && targetNodes.length > 0) {
    targetsFound = true

    // loop over all nodes and execute the callback function
    for (let node of Array.from(targetNodes)) {
      if (!node.alreadyFound) {
        callback(node)
        node.alreadyFound = true
      }
    }
  }

  // Get the timer-control letiable for this selector.
  let controlObj  = window.controlObj || {}
  let controlKey  = selector.replace(/[^\w]/g, "_")
  let timeControl = controlObj[controlKey]

  // Now set or clear the timer as appropriate.
  if (targetsFound && waitOnce && timeControl) {
    // The only condition where we need to clear the timer.
    clearInterval(timeControl)
    delete controlObj[controlKey]
  }

  // Set a timer, if needed.
  else if (!timeControl) {
    timeControl = setInterval(function () { waitForKeyElements(selector, callback, waitOnce, iframeSelector) }, WAIT_TIME_MS)
    controlObj[controlKey] = timeControl
  }
  window.controlObj = controlObj
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
      else if (typeof sub != "string" && onPage(sub, level+1)) return true
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
 * Watch a given element for changes and execute a callback function when they happen.
 * @param selector a valid CSS selector string of the element to watch
 * @param callback the function to execute when a change happens
 * @param subtree whether to watch child elements as well.
 */
export function watchForChanges(selector: string, callback: (e: HTMLElement) => void, subtree=false): void {
  waitForKeyElements(selector, element => {
    if (element) {
      callback(element)
      new MutationObserver(mut => {
        mut.forEach(() => callback(element))
      }).observe(element, {
        attributes: true,
        subtree,
        childList: true
      })
    }
  })
}


/**
 * Get information about the currently logged in account.
 * @returns user info object
 */
export function getCurrentUserInfo(): UserInfo {
  let infoScript = document.querySelector("#react-root ~ script").innerHTML
  function x(reg: RegExp) {
    let m = infoScript.match(reg)
    return m ? m[1] : null
  }

  let avatarUrl = x(/profile_image_url_https\":\"(.+?)\",/)
    .replace(/_(bigger|normal|(reasonably_)?small|\d*x\d+)/, "_bigger")

  return {
    bannerUrl:  x(/profile_banner_url\":\"(.+?)\",/)        ?? "",
    avatarUrl:  avatarUrl                                   ?? DEFAULT_AVATAR_URL,
    screenName: x(/screen_name\":\"(.+?)\",/)               ?? "youarenotloggedin",
    name:       x(/(?:true|false),\"name\":\"(.+?)\",/)     ?? x(/screen_name\":\"(.+?)\",/)
                                                            ?? "Anonymous",
    id:         x(/id_str\":\"(\d+)\"/)                     ?? "0",
    stats: {
      tweets:    parseInt(x(/statuses_count\":(\d+),/))     ?? 0,
      followers: parseInt(x(/\"followers_count\":(\d+),/))  ?? 0,
      following: parseInt(x(/friends_count\":(\d+),/))      ?? 0,
    }
  }
}


/**
 * Adds a click EventListener to a mock element.
 * @param mockElement the mock element to append the listener to
 * @param originalElement the original element to click on
 */
export function addClickHandlerToMockElement(mockElement: Element, originalElement: HTMLElement, callback?: () => void) {
  mockElement.addEventListener("click", (event: MouseEvent) => {
    if (!event.ctrlKey && originalElement != null) {
      event.preventDefault()
      originalElement.click()

      if (callback)
        callback()
    }
  })
}


export function isOnSmallerView(): boolean {
  let smallSidebars = settings.get("smallSidebars")
  let width = window.innerWidth
  return (!smallSidebars && width <= 1350) || (smallSidebars && width <= 1230)
}


export function updateNoticeDismissed(): boolean {
  return GM_getValue("updateNoticesDismissed", []).includes(GM_info.script.version)
}

export function dismissUpdateNotice(): void {
  let notices = GM_getValue("updateNoticesDismissed", [])
  notices.push(GM_info.script.version)
  GM_setValue("updateNoticesDismissed", notices)
  logger.debug("dismissed update notice")
}

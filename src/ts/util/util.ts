import { MODAL_PAGES, SVG } from "../constants"
import { I18nReplacable, Path } from "../types"
import { logger } from "./logger"


/**
 * returns an SVG string
 * @param  key icon to return
 * @return     SVG string
 */
export function getSvg(key: keyof typeof SVG) {
  return `
    <svg class="gt2-svg" viewBox="0 0 ${key == "google" ? 74 : 24} 24">
      ${SVG[key]}
    </svg>`
}


/**
 * Check if the user is logged in
 * @return true if logged in, false if not
 */
export function isLoggedIn(): boolean {
  return Boolean(document.cookie.match(/twid=u/))
}


/**
 * Get current display language
 * @return display language
 */
export function getLanguage() {
  let lang = document.documentElement.lang
  return lang == "en-GB" ? "en" : lang
}


/**
 * Get localized version of a string.
 * Defaults to english version.
 * @param  key the value to look up
 * @return     localized string
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
    if (!Object.keys(i18n["en"]).includes(key)) {
      logger.error(`the string "${key}" does not exist.`)
      return key
    }

    logger.warn(`the language file for ${lang} does not contain a translation for the string "${key}". falling back to english.`)
    lang = "en"
  }

  return i18n[lang][key]
}


export function getLocalizedReplacableString<K extends keyof I18nReplacable, V extends I18nReplacable[K]>(key: K, val: V): string {
  let loc = getLocalizedString(key)

  Object.entries(val).forEach(e => {
    loc = loc.replace(`$${e[0]}$`, e[1].toString())
  })

  return loc
}


/**
 * Execute callback function on elements once they are available in the DOM.
 * Heavily based on https://gist.github.com/BrockA/2625891 but without jQuery.
 * @param selector        A valid CSS selector string.
 * @param callback        The callback function to execute. Gets passed the added element node.
 * @param waitOnce       If set to false, continue to search for new elements even after the first match is found.
 * @param iframeSelector Valid CSS selector string for an iframe to search elements in.
 */
export function waitForKeyElements(
  selector: string,
  callback: (e: HTMLElement) => void,
  waitOnce = true,
  iframeSelector?: string
) {
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


// path helper functions
export function onPage(path: Path, level=0) {
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


export function onModal() {
  return onPage(MODAL_PAGES) || location.pathname.match(/\/(photo|video)\/\d\/?$/)
}


export function watchForChanges(selector: string, callback: (e: HTMLElement) => void) {
  waitForKeyElements(selector, element => {
    if (element) {
      new MutationObserver(mut => {
        mut.forEach(() => callback(element))
      }).observe(element, {
        attributes: true,
        childList: true
      })
    }
  })
}


export function getTweetId(tweetArticle: HTMLElement): string | null {
  // on tweet page
  if (document.documentElement.dataset.pageType == "tweet") {
    return location.pathname.replace(/.*\/status\/(\d+)/, "$1")
  }

  // check
  if (!tweetArticle?.matches("article[data-testid=tweet]")) {
    logger.error("Given element is not a valid tweet article.", tweetArticle)
    return null
  }

  // inline tweet
  let id = tweetArticle
    ?.querySelector("time")
    ?.parentElement
    ?.getAttribute("href")
    ?.replace(/.*\/status\/(\d+)/, "$1")

  if (!id) {
    logger.error("error getting tweet id for element: ", tweetArticle)
    return null
  }

  return id
}

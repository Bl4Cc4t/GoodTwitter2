import { removeSearch } from "../component/navbar"
import { addSettings, addSettingsMenuEntry, hideSettings } from "../component/page-settings"
import { TITLE_ADJUSTMENTS } from "../constants"
import { Logger } from "./logger"
import { settings } from "./settings"
import { addSourceLabel, labelMoreTweetsElement, scrollTweetUp } from "./tweet"
import { isLoggedIn, onModal, onPage, waitForKeyElements, watchForChanges } from "./util"


const logger = new Logger("location")


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
    logger.debug(`page type set to: ${type}`)
  }
}


/**
 * Resets the page type.
 */
function resetPageType(): void {
  delete document.body.dataset.pageType
  logger.debug("reset page type")
}


/**
 * Sets the current page as an error page.
 */
function setErrorPage(): void {
  document.body.dataset.pageError = "true"
  logger.debug("on error page")
}


/**
 * Watches the page title for changes and modifies it if necessary.
 */
function watchTitle(): void {
  watchForChanges("head title", title => {
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
    logger.error("title element not found.")
    return
  }

  let newContent = title.textContent.replace(/(\(.*\) )?.*/, `$1${newTitle} / Twitter`)
  if (title.textContent != newContent) {
    title.setAttribute("content-old", title.textContent)
    title.textContent = newContent
    title.setAttribute("content", newContent)
    logger.debug(`title changed to "${newContent}"`)
  }
}


/**
 * Resets the page title to the last one.
 */
export function resetTitle(): void {
  let title = document.querySelector("title")
  if (!title) {
    logger.error("title element not found.")
    return
  }

  let oldContent = title.getAttribute("content-old")
  if (oldContent) {
    title.setAttribute("content", oldContent)
    title.removeAttribute("content-old")
    title.textContent = oldContent
    logger.debug("reset title to: ", oldContent)
  }
}


/**
 * Changes to apply to the page whenever a location change happens.
 * Gets called by push/pop/replace event listeners.
 * @param type type of the change event
 */
export function onLocationChange(type: string): void {
  logger.info(`location change: [${type}] ${location.pathname}`)

  document.body.dataset.pagePathname = location.pathname.slice(1)

  // not logged in
  if (!isLoggedIn()) {
    document.body.classList.add("gt2-not-logged-in")
  }

  // error
  delete document.body.dataset.pageError
  waitForKeyElements(`main > div > div > div [data-testid=error-detail]`, e => {
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
    scrollTweetUp()
  }

  // home
  else if (onPage(["home"])) {
    setPageType("home")
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
      addSettings()
    } else {
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
    logger.debug("on modal")
  }

  // unhandled / not important
  else if (onPage(["hashtag", "i", "places", "notifications"]) || onPage({
    "*": ["communities", "followers", "followers_you_follow", "following", "lists", "moments", "status", "topics"],
  })) {
    logger.warn("on unhandled page")
    resetPageType()
  }

  // profile page
  else if (!onModal() || onPage({intent: ["user"]})) {
    setPageType("profile")

    // @option profileMediaRedirect
    if (settings.get("profileMediaRedirect") && !location.pathname.endsWith("/media")) {
      waitForKeyElements(`[href$="/media"][aria-selected=false]`, e => e.click())
      logger.debug("redirected to /media page")
    }
  }

  // unhandled modals
  else {
    logger.warn("on unhandled modal")
    // resetPageType()
  }
}

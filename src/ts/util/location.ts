import { addSettings, addSettingsMenuEntry, hideSettings } from "../component/page-settings"
import { TITLE_ADJUSTMENTS } from "../constants"
import { Logger } from "./logger"
import { isLoggedIn, onModal, onPage, waitForKeyElements } from "./util"


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
  document.body.dataset.pageType = type
  logger.debug(`page type set to: ${type}`)
}


/**
 * Resets the page type.
 */
function resetPageType(): void {
  delete document.body.dataset.pageType
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
  waitForKeyElements("head title", title => {
    new MutationObserver(mut => {
      mut.forEach(() => {
        if (title.textContent != title.getAttribute("content")) {
          for (let adj of TITLE_ADJUSTMENTS) {
            if (location.pathname == adj.location)
              changeTitle(adj.title)
          }
        }
      })
    }).observe(title, { childList: true })
  })
}


/**
 * Changes the current page title.
 * @param newTitle the new title of the page
 */
export function changeTitle(newTitle: string): void {
  let title = document.querySelector("title")
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
  let oldContent = title.getAttribute("content-old")
  if (oldContent) {
    title.setAttribute("content", oldContent)
    title.removeAttribute("content-old")
    title.textContent = oldContent
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
  waitForKeyElements(`main > div > div > div`, e => {
    if (document.querySelector(`[data-testid=error-detail]`) && !onPage({ settings: ["gt2"] })) {
      setErrorPage()
    } else {
      delete document.body.dataset.pageError
    }
  })

  // tweet
  if (onPage({
    "*": ["status"],
    i: { web: ["status"] }
  })) {
    setPageType("tweet")
  }

  // home
  else if (onPage(["home"])) {
    setPageType("home")
  }

  // search/explore
  else if (onPage(["search", "explore"])) {
    setPageType("search")
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

  // unhandled / not important
  else if (onPage(["hashtag", "i", "places", "notifications"]) || onPage({
    "*": ["communities", "followers", "followers_you_follow", "following", "lists", "moments", "status", "topics"],
  })) {
    logger.debug("on unhandled page")
    resetPageType()
  }

  // profile page
  else if (!onModal() || onPage({intent: ["user"]})) {
    setPageType("profile")
  }

  // unhandled modals
  else {
    logger.debug("on unhandled modal")
    // resetPageType()
  }
}

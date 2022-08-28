import { addSettings, addSettingsMenuEntry } from "../component/page-settings"
import { logger } from "./logger"
import { onModal, onPage, waitForKeyElements } from "./util"



function setPageType(type: string) {
  document.body.dataset.pageType = type
  logger.debug(`page type set to: ${type}`)
}

function resetPageType() {
  delete document.body.dataset.pageType
}

function setErrorPage() {
  document.body.dataset.pageError = "true"
  logger.debug("on error page")
}

export function initializeLocation() {
  window.addEventListener("popstate", function() {
    onLocationChange("pop")
  })

  onLocationChange("init")
}


export function onLocationChange(type: string) {
  logger.info(`location change: [${type}] ${location.pathname}`)

  document.body.dataset.pagePathname = location.pathname.slice(1)


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
    resetPageType()
  }
}

import { isLoggedIn } from "./util/util"
import { settings } from "./util/settings"
import { initializeStyle } from "./style"
import { initializeInlineTranslation } from "./component/translation"
import { overrideFunctions } from "./util/overrides"
import { initializeLocation } from "./util/location"
import "./util/extension"
import "../style/main.scss"
import { logger } from "./util/logger"
import { initializeNavbar } from "./component/navbar"
import { initializeSidebar } from "./component/sidebar"
import { watchForTweets } from "./util/timeline"


(() => {
  // do not execute on these pages
  if (!isLoggedIn() && location.pathname == "") return

  // redirect for mobile urls
  if (location.host == "mobile.twitter.com") {
    if (settings.get("mobileRedirect")) {
      location.href = location.href.replace("//mobile.twitter.com", "//twitter.com")
    } else return
  }

  // add settings to body
  settings.setAllInDom()
  logger.debug("set all settings in the dom")

  // basic
  overrideFunctions()
  initializeLocation()
  watchForTweets()

  // styling
  initializeStyle()

  // components
  initializeInlineTranslation()
  initializeNavbar()
  initializeSidebar()
})()

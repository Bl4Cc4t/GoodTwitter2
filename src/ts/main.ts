import { isLoggedIn } from "./util/util"
import { settings } from "./util/settings"
import { initializeStyle, setAdditionalStyleRules } from "./style"
import { initializeInlineTranslation } from "./component/translation"
import { overrideFunctions } from "./util/overrides"
import { initializeLocation } from "./util/location"
import "./util/extension"
import "../style/main.scss"
import { Logger } from "./util/logger"
import { initializeNavbar } from "./component/navbar"




(() => {
  const logger = new Logger()

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

  // styling
  initializeStyle()
  setAdditionalStyleRules()

  // components
  initializeInlineTranslation()
  initializeNavbar()
})()


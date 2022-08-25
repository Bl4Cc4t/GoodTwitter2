import { isLoggedIn, waitForKeyElements } from "./util/util"
import { settings } from "./util/settings"
import { initializeStyle, additionalStyleRules } from "./style"
import "./util/extension"
// import "../style/main.scss"

(() => {

  // do not execute on these pages
  if (!isLoggedIn() && location.pathname == "") return

  // redirect for mobile urls
  if (location.host == "mobile.twitter.com") {
    if (settings.get("mobileRedirect")) {
      location.href = location.href.replace("//mobile.twitter.com", "//twitter.com")
    } else return
  }

  initializeStyle()
  additionalStyleRules()


  waitForKeyElements("body", e => {
    console.log(settings.getAll())
  })
})()


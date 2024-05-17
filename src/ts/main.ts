import { isLoggedIn } from "./util/util"
import { Settings } from "./util/settings"
import { initializeStyle } from "./style"
import { initializeInlineTranslation } from "./component/translation"
import { overrideFunctions } from "./util/overrides"
import { initializeLocation } from "./util/location"
import "./util/extension"
import "../style/main.scss"
import { globalLogger } from "./util/logger"
import { initializeNavbar } from "./component/navbar"
import { initializeSidebar } from "./component/sidebar"
import { watchForTweets } from "./util/timeline"
import { addResizeHandler, addScrollHandler, addVisibilityChangeHandler } from "./util/responsive"
import { initializeProfile } from "./component/profile"


(() => {
    // do not execute on these pages
    if (!isLoggedIn() && location.pathname == "") return

    // redirect for mobile urls
    if (location.host.startsWith("mobile.")) {
        if (Settings.get("mobileRedirect")) {
            location.href = location.href.replace("//mobile.", "//")
        } else return
    }

    // add settings to body
    Settings.setAllInDom()
    globalLogger.debug("set all settings in the dom")

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
    initializeProfile()

    // handlers
    addScrollHandler()
    addResizeHandler()
    addVisibilityChangeHandler()
})()

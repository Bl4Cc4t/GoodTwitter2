import { getScrollbarWidth } from "../style"
import { Logger } from "./logger"
import { ESidebar, GM_KEYS } from "../constants"
import { getSidebarType, isSet } from "./util"
import { moveSidebarElements } from "../component/sidebar"

const _logger = new Logger("responsive")


/**
 * Adds an event handler for document scroll events.
 */
export function addScrollHandler(): void {
    function scrollHandler() {
        let currentY = window.scrollY

        // prevent auto scroll to top on /search and /explore
        if (previousY > 1500 && currentY == 0 && document.body.dataset.pageType == "search") {
            window.scroll(0, previousY)
            return
        }

        if (previousY < currentY)
            document.body.classList.add("gt2-scrolled-down")
        else
            document.body.classList.remove("gt2-scrolled-down")

        previousY = currentY

        // legacy profile banner parallax
        if (document.body.dataset.pageType == "profile") {
            const bannerHeight = GM_getValue<number>(GM_KEYS.LEGACY_PROFILE_BANNER_HEIGHT)

            if (currentY > bannerHeight) {
                document.body.classList.add("gt2-scrolled-down-banner")
            } else {
                document.body.classList.remove("gt2-scrolled-down-banner")
                document.querySelector<HTMLElement>(".gt2-legacy-profile-banner img")
                    .style.transform = `translate3d(0px, ${currentY / bannerHeight * 42}%, 0px)`
            }
        }
    }

    let previousY = window.scrollY

    _logger.debug("adding scroll event handler")
    document.addEventListener("scroll", scrollHandler)
}


/**
 * Adds an event handler to the window for resize events.
 */
export function addResizeHandler(): void {
    function resizeHandler(): void {
        // set banner height
        const bannerHeight = (window.innerWidth - getScrollbarWidth()) / 3 - 15
        GM_setValue(GM_KEYS.LEGACY_PROFILE_BANNER_HEIGHT, bannerHeight)

        // sidebar
        const type = getSidebarType()
        if (isSet(type, ESidebar.Left))
            moveSidebarElements("left")
        else if (isSet(type, ESidebar.Right))
            moveSidebarElements("right")
    }

    _logger.debug("adding resize event handler")
    window.addEventListener("resize", resizeHandler)
    resizeHandler()
}

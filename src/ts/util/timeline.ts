import { Logger } from "./logger"
import { settings } from "./settings"
import { waitForKeyElements } from "./util"


const logger = new Logger("timeline")


/**
 * Enables the "Latest Tweets" timeline mode.
 * @option forceLatest
 */
export function enableLatestTweets(): void {
  if (!settings.get("forceLatest"))
    return

  let sparkOptSelector = `[d*="M2 4c1.66 0 3-1.34 3-3h1c0"]`
  let dropdownSelector = "#layers [data-testid=Dropdown]"

  waitForKeyElements(sparkOptSelector, toggleIcon => {
    var toggleDropdown = toggleIcon.closest<HTMLElement>("[aria-haspopup]")
    if (toggleDropdown == null) {
      logger.error("spark button not found")
      return
    }

    document.body.classList.add("gt2-hide-spark-opt")
    toggleDropdown.click()
    logger.debug("toggled spark dropdown menu")

    waitForKeyElements(`${dropdownSelector} a[href="/settings/content_preferences"]`, e => {
      let dropdown = e.closest(dropdownSelector)

      // switch to latest
      if (dropdown.querySelectorAll(":scope > :nth-child(1) path").length == 3) {
        var enableLatest = dropdown.querySelector<HTMLElement>(":scope > :nth-child(2)")
        enableLatest.click()
        logger.info("switched home timeline to latest tweets")
      }

      // hide dropdown again
      else {
        toggleDropdown.click()
        logger.debug("timeline already on latest tweets mode, nothing to do")
      }
      document.body.classList.remove("gt2-hide-spark-opt")
    })
  })
}

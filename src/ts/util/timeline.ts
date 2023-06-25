import { Logger } from "./logger"
import { settings } from "./settings"
import { getTweetData } from "./tweet"
import { waitForKeyElements } from "./util"


const _logger = new Logger("timeline")


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
      _logger.error("spark button not found")
      return
    }

    document.body.classList.add("gt2-hide-spark-opt")
    toggleDropdown.click()
    _logger.debug("toggled spark dropdown menu")

    waitForKeyElements(`${dropdownSelector} a[href="/settings/content_preferences"]`, e => {
      let dropdown = e.closest(dropdownSelector)

      // switch to latest
      if (dropdown.querySelectorAll(":scope > :nth-child(1) path").length == 3) {
        var enableLatest = dropdown.querySelector<HTMLElement>(":scope > :nth-child(2)")
        enableLatest.click()
        _logger.info("switched home timeline to latest tweets")
      }

      // hide dropdown again
      else {
        toggleDropdown.click()
        _logger.debug("timeline already on latest tweets mode, nothing to do")
      }
      document.body.classList.remove("gt2-hide-spark-opt")
    })
  })
}


/**
 * Actions to execute when a new tweet is added to the DOM.
 */
export function watchForTweets(): void {
  waitForKeyElements(`article[data-testid=tweet] time`, element => {
    const tweetArticle = element.closest(`article[data-testid=tweet]`)
    if (settings.get("expandTcoShortlinks"))
      expandTweetTcoShortlinks(tweetArticle)
  })
}


/**
 * Expands t.co shortlinks in a tweet element.
 * @param tweetArticle the tweet element where the shortlinks should be replaced
 */
function expandTweetTcoShortlinks(tweetArticle: Element): void {
  const anchors = tweetArticle.querySelectorAll(`a[href^="http://t.co"], a[href^="https://t.co"]`)

  const tweet = getTweetData(tweetArticle)
  if (!tweet)
    return

  // loop over all tco anchors in the tweet
  anchors.forEach(anchor => {
    let tcoUrl = anchor.getAttribute("href")
    let url = tweet.entities.urls.find(e => e.url == tcoUrl.split("?")[0])

    if (!url) {
      _logger.error("expandTcoShortlinks: error getting url object", tcoUrl, tweet, tweetArticle)
      return
    }

    if (!url.expanded_url) {
      _logger.error("expandTcoShortlinks: url object has no expanded_url", tcoUrl, tweet, tweetArticle)
      return
    }

    anchor.setAttribute("href", url.expanded_url)
    _logger.debug("expanded", tcoUrl, "to", url.expanded_url)
  })
}

import { Logger } from "./logger"
import { getReactPropByName } from "./react-util"
import { Settings } from "./settings"
import { getTweetData } from "./tweet"
import { expandTcoShortlink, waitForElements } from "./util"


const _logger = new Logger("timeline")


/**
 * Enables the "Latest Tweets" timeline mode.
 * @option forceLatest
 */
export function enableLatestTweets(): void {
    if (!Settings.get("forceLatest"))
        return

    let sparkOptSelector = `[d*="M2 4c1.66 0 3-1.34 3-3h1c0"]`
    let dropdownSelector = "#layers [data-testid=Dropdown]"

    waitForElements(sparkOptSelector, toggleIcon => {
        const toggleDropdown = toggleIcon.closest<HTMLElement>("[aria-haspopup]");
        if (toggleDropdown == null) {
            _logger.error("spark button not found")
            return
        }

        document.body.classList.add("gt2-hide-spark-opt")
        toggleDropdown.click()
        _logger.debug("toggled spark dropdown menu")

        waitForElements(`${dropdownSelector} a[href="/settings/content_preferences"]`, e => {
            let dropdown = e.closest(dropdownSelector)

            // switch to latest
            if (dropdown.querySelectorAll(":scope > :nth-child(1) path").length == 3) {
                const enableLatest = dropdown.querySelector<HTMLElement>(":scope > :nth-child(2)");
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
    if (Settings.get("expandTcoShortlinks"))
        expandTweetTcoShortlinks()
    if (Settings.get("hideMoreTweets"))
        hideMoreTweets()
}


/**
 * Expands t.co shortlinks in a tweet element.
 */
function expandTweetTcoShortlinks(): void {
    const selector = `
    article[data-testid=tweet] a[href^="http://t.co"],
    article[data-testid=tweet] a[href^="https://t.co"]`
    waitForElements(selector, expandTweetTcoShortlink, false)
}


/**
 * Expands a t.co shortlink in a tweet element.
 * @param anchor the t.co shortlink DOM element
 */
function expandTweetTcoShortlink(anchor: Element): void {
    const tweetArticle = anchor.closest(`article[data-testid=tweet]`)

    const tweet = getTweetData(tweetArticle)
    if (!tweet)
        return

    const urls = tweet.entities.urls.concat(tweet.note_tweet?.entity_set?.urls || [])
    expandTcoShortlink(anchor, urls)
}


function hideMoreTweets() {
    waitForElements(`[data-testid=cellInnerDiv]`, cell => {
        const entry = getReactPropByName<Entry>(cell, "entry", true)
        if (!entry)
            return

        if (entry?.itemMetadata?.clientEventInfo?.details?.conversationDetails?.conversationSection == "RelatedTweet") {
            _logger.debug(`Removed tweet from "More tweets" section: `, entry.entryId)
            cell.remove()
        }
    }, false)
}

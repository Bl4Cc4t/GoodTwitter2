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

    waitForElements(`[data-testid=primaryColumn] > :first-child > :first-child nav [role=presentation]:nth-child(2) > [aria-selected=false]`, header => header.click())
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
    waitForElements(selector, expandTweetTcoShortlink, { waitOnce: false })
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
    }, { waitOnce: false })
}

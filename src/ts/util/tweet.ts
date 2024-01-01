import { Logger } from "./logger"
import { getReactPropByName } from "./react-util"
import { getLocalizedString, waitForElements } from "./util"


const _logger = new Logger("tweet")


/**
 * Gets the tweet id of a given tweet article element.
 * @returns the if of the tweet or null if an error occurred
 */
export function getTweetPageId(): string | null {
    // on tweet page
    if (document.body.dataset.pageType == "tweet")
        return location.pathname.replace(/.*\/status\/(\d+)/, "$1")

    // error
    _logger.error("Not on a tweet page")
    return null
}

export function getTweetData(element: Element): TwitterApi.TweetLegacy {
    var tweet = getReactPropByName<TwitterApi.TweetLegacy>(element, "tweet")

    if (tweet)
        return tweet

    _logger.error("Error getting tweet data from react props for element: ", element)
    return null
}


/**
 * Re-adds the source label to tweets.
 */
export function addSourceLabel(): void {
    let tweetId = getTweetPageId()
    waitForElements(`[data-testid=tweet][tabindex="-1"] [href*="${tweetId}"] time`, element => {
        const tweet = getTweetData(element.closest("[data-testid=tweet]"))

        if (!tweet?.source) {
            _logger.warn(`tweet with id ${tweetId} has no source label.`)
            return
        }

        element.parentElement?.insertAdjacentHTML("afterend", /*html*/`
            <span class="gt2-tweet-source">${tweet.source}</span>`)
    })
}


/**
 * Labels the "More Tweets" timeline elements for optional hiding.
 */
export function labelMoreTweetsElement(): void {
    let moreTweetsLocalized = getLocalizedString("moreTweets").trim()
    waitForElements(`[data-testid=cellInnerDiv] h2 span`, header => {
        if (header.innerText.match(moreTweetsLocalized)) {
            _logger.debug("found more tweets header, adding label")
            header.closest("[data-testid=cellInnerDiv]")
                .classList.add("gt2-timeline-elem-more-tweets-header")
        }
    })
}


/**
 * Scrolls up to make up for the added navbar height.
 */
export function scrollTweetUp(amount: number): void {
    waitForElements(`[data-testid=tweet][tabindex="-1"] > :nth-child(1)`, () => {
        window.scroll(0, window.scrollY - amount)
        _logger.debug(`scrolled up ${amount}px to make up for the added navbar height`)
    })
}

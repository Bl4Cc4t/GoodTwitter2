import { TwitterApi } from "../types"
import { Logger } from "./logger"
import { requestTweet } from "./request"
import { getLocalizedString, waitForKeyElements } from "./util"


const logger = new Logger("tweet")


/**
 * Gets the tweet id of a given tweet article element.
 * @param tweetArticle the article DOM element of a tweet
 * @returns the if of the tweet or null if an error occurred
 */
export function getTweetId(tweetArticle?: Element): string | null {
  // on tweet page
  if (document.body.dataset.pageType == "tweet") {
    return location.pathname.replace(/.*\/status\/(\d+)/, "$1")
  } else if (!tweetArticle) {
    logger.error("Not on a tweet page and given tweetArticle element is not valid.")
    return null
  }

  // check
  if (!tweetArticle?.matches("article[data-testid=tweet]")) {
    logger.error("Given element is not a valid tweet article.", tweetArticle)
    return null
  }

  // inline tweet
  let id = tweetArticle
    ?.querySelector("time")
    ?.parentElement
    ?.getAttribute("href")
    ?.replace(/.*\/status\/(\d+)/, "$1")

  if (!id) {
    logger.error("error getting tweet id for element: ", tweetArticle)
    return null
  }

  return id
}


/**
 * Saves tweet details in the window object for later use.
 * Makes requesting individual tweets obsolete.
 * @param res the response from request
 */
export function saveTweetResponse(res:
  TwitterApi.Graphql.TweetDetailResponse
  | TwitterApi.Graphql.HomeLatestTimelineResponse
  | TwitterApi.Graphql.UserTweets
  | TwitterApi.v2.search.adaptive): void {

  if ("data" in res) {
    // TwitterApi.Graphql.UserTweets
    if ("user" in res.data)
      saveTweetTimelineInstructions(res.data.user.result.timeline_v2.timeline.instructions)

    // TwitterApi.Graphql.HomeLatestTimelineResponse
    else if ("home" in res.data)
      saveTweetTimelineInstructions(res.data.home.home_timeline_urt.instructions)

    // TwitterApi.Graphql.TweetDetailResponse
    else
      saveTweetTimelineInstructions(res.data.threaded_conversation_with_injections_v2.instructions)
  }

  // TwitterApi.v2.search.adaptive
  else {
    unsafeWindow.tweetData = unsafeWindow.tweetData || {}
    Object.assign(unsafeWindow.tweetData, res.globalObjects.tweets)
  }
}


/**
 * Helper function for saving tweet data.
 * @param instructions the timeline instructions to process
 */
function saveTweetTimelineInstructions(instructions: TwitterApi.Graphql.Instruction[]) {
  instructions
  .forEach(instr => {
    if (instr.type == "TimelineAddEntries") {
      instr.entries.forEach(entry => {
        if (entry.content.entryType == "TimelineTimelineItem" && entry.content.itemContent.itemType == "TimelineTweet") {
          saveTweetResults(entry.content.itemContent.tweet_results)
        }

        if (entry.content.entryType == "TimelineTimelineModule") {
          entry.content.items.forEach(item => {
            if (item.item.itemContent.itemType == "TimelineTweet") {
              saveTweetResults(item.item.itemContent.tweet_results)
            }
          })
        }
      })
    }
  })
}


/**
 * Helper function for `saveTweetTimelineInstructions`.
 * @param tweetResults the tweet data to save
 */
function saveTweetResults(tweetResults?: TwitterApi.TweetResults) {
  if ("result" in tweetResults && tweetResults.result.__typename == "Tweet") {
    unsafeWindow.tweetData = unsafeWindow.tweetData || {}
    unsafeWindow.tweetData[tweetResults.result.rest_id] = tweetResults.result.legacy
  }
}


/**
 * Gets information about a tweet by its id.
 * @param tweetId Id of the tweet to retrieve data for
 * @param callback function to execute once the data has been fetched
 */
export function getTweetData(tweetId: string, callback: (result: TwitterApi.TweetLegacy) => void): void {
  if (unsafeWindow && unsafeWindow.hasOwnProperty("tweetData") && unsafeWindow.tweetData.hasOwnProperty(tweetId)) {
    callback(unsafeWindow.tweetData[tweetId])
  }

  else {
    logger.warn(`Tweet with id "${tweetId} not found in index, requesting it manually`)
    requestTweet(tweetId, callback)
  }
}


/**
 * Re-adds the source label to tweets.
 */
export function addSourceLabel(): void {
  let tweetId = getTweetId()
  waitForKeyElements(`[data-testid=tweet][tabindex="-1"] [href*="${tweetId}"] time`, e => {
    getTweetData(tweetId, result => {
      if (!result.source) {
        logger.warn(`tweet with id ${tweetId} has no source label.`)
        return
      }

      e.parentElement.insertAdjacentHTML("afterend", `
        <span class="gt2-tweet-source">${result.source}</span>
      `)
    })
  })
}


/**
 * Labels the "More Tweets" timeline elements for optional hiding.
 */
export function labelMoreTweetsElement(): void {
  let moreTweetsLocalized = getLocalizedString("moreTweets").trim()
  waitForKeyElements(`[data-testid=cellInnerDiv] h2 span`, header => {
    if (header.innerText.match(moreTweetsLocalized)) {
      logger.debug("found more tweets header, adding label")
      header.closest("[data-testid=cellInnerDiv]")
        .classList.add("gt2-timeline-elem-more-tweets-header")
    }
  })
}


/**
 * Scrolls up to make up for the added navbar height.
 */
export function scrollTweetUp(): void {
  waitForKeyElements(`[data-testid=tweet][tabindex="-1"] > :nth-child(1)`, () => {
    let amount = 75
    window.scroll(0, window.pageYOffset - amount)
    logger.debug(`scrolled up ${amount}px to make up for the added navbar height`)
  })
}

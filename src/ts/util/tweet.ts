import { TwitterApi } from "../types"
import { Logger } from "./logger"
import { requestTweet } from "./request"


const logger = new Logger("tweet")


/**
 * Gets the tweet id of a given tweet article element.
 * @param tweetArticle the article DOM element of a tweet
 * @returns the if of the tweet or null if an error occurred
 */
export function getTweetId(tweetArticle: Element): string | null {
  // on tweet page
  if (document.body.dataset.pageType == "tweet") {
    return location.pathname.replace(/.*\/status\/(\d+)/, "$1")
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
 * @param tweetDetailResponse the response from timeline request
 */
export function saveTweetDetailData(tweetDetailResponse: TwitterApi.Graphql.TweetDetailResponse): void {
  tweetDetailResponse.data.threaded_conversation_with_injections_v2.instructions
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
 * Helper function for `saveTweetDetailData`.
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
  if (unsafeWindow.tweetData.hasOwnProperty(tweetId)) {
    callback(unsafeWindow.tweetData[tweetId])
  }

  else {
    logger.warn(`Tweet with id "${tweetId} not found in index, requesting it manually`)
    requestTweet(tweetId, callback)
  }
}

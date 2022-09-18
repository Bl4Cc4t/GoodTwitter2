import { TwitterApi } from "../types"
import { logger } from "./logger"
import { requestTweet } from "./request"


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

export function saveTweetDetailData(tweetDetailResponse: TwitterApi.Graphql.TweetDetailResponse) {
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

function saveTweetResults(tweetResults?: TwitterApi.TweetResults) {
  if ("result" in tweetResults && tweetResults.result.__typename == "Tweet") {
    unsafeWindow.tweetData = unsafeWindow.tweetData || {}
    unsafeWindow.tweetData[tweetResults.result.rest_id] = tweetResults.result.legacy
  }
}

export function getTweetData(id: string, callback: (result: TwitterApi.TweetLegacy) => void): void {
  if (unsafeWindow.tweetData.hasOwnProperty(id)) {
    callback(unsafeWindow.tweetData[id])
  }

  else {
    logger.warn(`Tweet with id "${id} not found in index, requesting it manually`)
    requestTweet(id, callback)
  }
}

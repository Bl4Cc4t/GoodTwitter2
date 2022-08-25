import { PUBLIC_BEARER } from "../constants"
import { getLanguage } from "./util"
import { TwitterApi } from "../types"
import { logger } from "./logger"

/**
 * Get default request headers
 * @param  additionalHeaders additional header to add
 * @return                   request headers
 */
export function getRequestHeaders(
  additionalHeaders?: {[header: string]: string}
): {[header: string]: string} {
  let csrf = document.cookie.match(/ct0=([^;]+)(;|$)/)[1]

  return Object.assign({
    authorization: `Bearer ${PUBLIC_BEARER}`,
    origin: "https://twitter.com",
    referer: location.href,
    "x-twitter-client-language": getLanguage(),
    "x-csrf-token": csrf,
    "x-twitter-active-user": "yes",
    // "x-twitter-auth-type": "OAuth2Session"
  }, additionalHeaders)
}


/**
 * Get url with search params added (can be objects too)
 * @param  base_url the url
 * @param  params   the search parameters to add
 * @return          url with search params added
 */
function getRequestURL(base_url: string, params: {[key: string]: any}): string {
  let out = base_url
  for (let [key, val] of Object.entries(params)) {
    if (typeof val === "object") val = encodeURIComponent(JSON.stringify(val))
    out += `&${key}=${val}`
  }
  return `${out.replace("&", "?")}`
}



/**
 * Request a tweet.
 * @param  id       id of the tweet
 * @param  callback function to call on success
 */
export function requestTweet(
  id: string,
  callback: (result: TwitterApi.v1_1.statuses.show) => void
): void {
  GM_xmlhttpRequest({
    method: "GET",
    url: getRequestURL("https://twitter.com/i/api/1.1/statuses/show.json", {
      id,
      tweet_mode: "extended",
      trim_user: true,
      include_cards: 1
    }),
    headers: getRequestHeaders(),
    onload: function(res) {
      if (res.status == 200) {
        callback(JSON.parse(res.response))
      } else {
        console.warn(res)
      }
    }
  })
}

/**
 * Request a tweet with content warnings.
 * The results from this api call are sometimes missing the url entities, so the old function is still used.
 * @param  id       id of the tweet
 * @param  callback function to call on success
 */
export function requestTweetCW(
  id: string,
  callback: (result: TwitterApi.TweetLegacy) => void
): void {
  GM_xmlhttpRequest({
    method: "GET",
    url: getRequestURL("https://twitter.com/i/api/graphql/_iJccJ-mHcyaV0nq_odmBA/TweetDetail", {
      variables: {
        focalTweetId: id,
        includePromotedContent: false,
        withBirdwatchNotes: false,
        withDownvotePerspective: false,
        withReactionsMetadata: false,
        withReactionsPerspective: false,
        withSuperFollowsTweetFields: false,
        withSuperFollowsUserFields: false,
        withVoice: false,
        with_rux_injections: false,
        withCommunity: false,
        withQuickPromoteEligibilityTweetFields: true,
        withV2Timeline: false
      }
    }),
    headers: getRequestHeaders(),
    onload: function(res) {
      if (res.status == 200) {
        let _res = JSON.parse(res.response) as TwitterApi.Graphql.TweetDetailResponse
        let tweet_results = _res?.data?.threaded_conversation_with_injections?.instructions
        .find((e): e is TwitterApi.Graphql.TweetDetailTimelineAddEntries => e.type == "TimelineAddEntries")
        ?.entries
        .find((e): e is TwitterApi.Graphql.TimelineTweetItemEntries => e.sortIndex == id)
        ?.content?.itemContent?.tweet_results

        if (tweet_results && "result" in tweet_results && tweet_results.result.__typename == "Tweet") {
          callback(tweet_results.result.legacy)
        } else console.warn(res)
      } else console.warn(res)
    }
  })
}


/**
 * Get a twitter user from the screen_name
 * @param  screenName the screen_name of the user (@user)
 * @param  callback    function to call on success
 */
export function requestUser(
  screenName: string,
  callback: (result: TwitterApi.UserResult) => void
): void {
  GM_xmlhttpRequest({
    method: "GET",
    url: getRequestURL(`https://twitter.com/i/api/graphql/jMaTS-_Ea8vh9rpKggJbCQ/UserByScreenName`, {
      variables: {
        screen_name: screenName,
        withHighlightedLabel: true
      }
    }),
    headers: getRequestHeaders(),
    onload: function(res) {
      if (res.status == 200) {
        let _res = JSON.parse(res.response) as TwitterApi.Graphql.UserByScreenNameResponse
        if (_res?.data?.user.result.__typename == "User") {
          callback(_res.data.user.result)
        } else console.warn(res)
      } else console.warn(res)
    }
  })
}


/**
 * Block a user
 * @param  userId  the user to block
 * @param  doBlock if true, block the user. else unblock.
 * @param  callback function to call on success
 */
export function blockUser(
  userId: string,
  doBlock: boolean,
  callback: () => void
): void {
  GM_xmlhttpRequest({
    method: "POST",
    url: getRequestURL(`https://api.twitter.com/1.1/blocks/${doBlock ? "create" : "destroy"}.json`, {
      user_id: userId,
      skip_status: true
    }),
    headers: getRequestHeaders(),
    onload: function(res) {
      if (res.status == 200) {
        callback()
      } else {
        console.warn(res)
      }
    }
  })
}


export function getTweetTranslation(
  tweetId: string,
  callback: (result: TwitterApi.v1_1.translateTweet) => void
): void {

  let urlEnd = Object.entries({
    tweetId: tweetId,
    destinationLanguage: "None",
    translationSource: "Some(Google)",
    feature: "None",
    timeout: "None",
    onlyCached: "None/translation/service/translateTweet"
  }).map((k, v) => `${k}=${v}`).join(",")

  GM_xmlhttpRequest({
    method: "GET",
    url: `https://twitter.com/i/api/1.1/strato/column/None/${urlEnd}`,
    headers: getRequestHeaders({
      referer: `https://twitter.com/i/status/${tweetId}`
    }),
    onload: function(res) {
      if (res.status == 200) {
        callback(JSON.parse(res.response) as TwitterApi.v1_1.translateTweet)
      } else {
        logger.error("Error occurred while translating.", res)
      }
    }
  })
}

export function getProfileTranslation(
  userId: string,
  callback: (result: TwitterApi.v1_1.translateProfile) => void
): void {

  let urlEnd = Object.entries({
    profileUserId: userId,
    destinationLanguage: "None",
    translationSource: "Some(Google)",
    feature: "None",
    timeout: "None",
    onlyCached: "None/translation/service/translateProfile"
  }).map((k, v) => `${k}=${v}`).join(",")

  GM_xmlhttpRequest({
    method: "GET",
    url: `https://twitter.com/i/api/1.1/strato/column/None/${urlEnd}`,
    headers: getRequestHeaders(),
    onload: function(res) {
      if (res.status == 200) {
        callback(JSON.parse(res.response) as TwitterApi.v1_1.translateProfile)
      } else {
        logger.error("Error occurred while translating.", res)
      }
    }
  })
}

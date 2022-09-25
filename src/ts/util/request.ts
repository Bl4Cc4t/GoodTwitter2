import { PUBLIC_BEARER } from "../constants"
import { getLanguage } from "./util"
import { TwitterApi } from "../types"
import { Logger } from "./logger"


const logger = new Logger("request")


/**
 * Gets the default request headers.
 * @param additionalHeaders additional headers to add
 * @returns valid request headers object, to be used for API calls
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
 * Get an url with search params added
 * @param baseUrl the url to change
 * @param params  the search parameters to add (can be objects too)
 * @return url with search params added
 */
function getRequestURL(baseUrl: string, params: {[key: string]: any}): string {
  let out = baseUrl
  for (let [key, val] of Object.entries(params)) {
    if (typeof val === "object") val = encodeURIComponent(JSON.stringify(val))
    out += `&${key}=${val}`
  }
  return `${out.replace("&", "?")}`
}


/**
 * Request information of a tweet.
 * @param id id of the tweet
 * @param callback function to call on success
 */
export function requestTweet(
  id: string,
  callback: (result: TwitterApi.v1_1.statuses.show) => void
): void {
  if (typeof id != "string" || id == "") {
    logger.error(`requestTweet: given id "${id}" is invalid.`)
    return
  }
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
 * Gets information about a twitter user by their screen_name.
 * @param  screenName the screen_name of the user (@user)
 * @param  callback function to call on success
 */
export function requestUser(screenName: string, callback: (result: TwitterApi.UserResult) => void): void {
  if (typeof screenName != "string" || screenName == "") {
    logger.error(`requestUser: given screenName "${screenName}" is invalid.`)
    return
  }
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
 * Blocks a user by their id.
 * @param userId the if of the user
 * @param doBlock if true, blocks the user. else unblocks
 * @param callback function to call on success
 */
export function blockUser(userId: string, doBlock: boolean, callback: () => void): void {
  if (typeof userId != "string" || userId == "") {
    logger.error(`blockUser: given userId "${userId}" is invalid.`)
    return
  }

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


/**
 * Gets the translation of tweet.
 * @param tweetId the id of the tweet
 * @param callback the function to execute on success
 */
export function getTweetTranslation(tweetId: string, callback: (result: TwitterApi.v1_1.translateTweet) => void): void {
  if (typeof tweetId != "string" || tweetId == "") {
    logger.error(`getTweetTranslation: given tweetId "${tweetId}" is invalid.`)
    return
  }

  let urlEnd = Object.entries({
    tweetId: tweetId,
    destinationLanguage: "None",
    translationSource: "Some(Google)",
    feature: "None",
    timeout: "None",
    onlyCached: "None/translation/service/translateTweet"
  }).map(e => `${e[0]}=${e[1]}`).join(",")


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


/**
 * Gets the translation of a profile description
 * @param userId the id of the user profile
 * @param callback the function execute on success
 */
export function getProfileTranslation(userId: string, callback: (result: TwitterApi.v1_1.translateProfile) => void): void {
  if (typeof userId != "string" || userId == "") {
    logger.error(`getProfileTranslation: given userId "${userId}" is invalid.`)
    return
  }

  let urlEnd = Object.entries({
    profileUserId: userId,
    destinationLanguage: "None",
    translationSource: "Some(Google)",
    feature: "None",
    timeout: "None",
    onlyCached: "None/translation/service/translateProfile"
  }).map(e => `${e[0]}=${e[1]}`).join(",")

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

import { getLanguage, getLocalizedReplacableString, getLocalizedString, getSvg, waitForKeyElements } from "../util/util"
import { settings } from "../util/settings"
import { getProfileTranslation, getTweetTranslation } from "../util/request"
import { Logger } from "../util/logger"
import { getTweetData } from "../util/tweet"


const _logger = new Logger("component", "translation")


/**
 * Entry function for the inline translation component.
 */
export function initializeInlineTranslation(): void {
  // @option hideTranslateTweetButton
  if (!settings.get("hideTranslateTweetButton"))
    addInlineTranslateTweetButton()


  // translate quoted tweet
  document.body.addEventListener("click", translateTweetHandler, true)
  // translate LPL profile
  document.body.addEventListener("click", translateProfileHandler, true)
  // hide translation
  document.body.addEventListener("click", hideTranslationHandler, true)
}


/**
 * Adds a "Translate Tweet" button to all tweets
 * in languages that differ from the current display
 * language.
 */
function addInlineTranslateTweetButton(): void {
  waitForKeyElements(`[data-testid=tweet] [lang]`, e => {
    // ignore tweets that already have a translate button
    if (e.parentElement.querySelectorAll(":scope > [role=button]").length)
      return

    let tweetLang = e.getAttribute("lang")
    if (tweetLang != getLanguage() && tweetLang != "und") {
      e.insertAdjacentHTML("afterend", `
        <div class="gt2-translate-tweet">
          ${getLocalizedString("translateTweet")}
        </div>
      `)
      _logger.debug("added translate button to element: ", e)
    }
  }, false)
}


/**
 * Handler for clicking the "Translated from <language> by <provider>"
 * button to hide it again.
 * @param event the mouse event
 */
function hideTranslationHandler(event: MouseEvent): void {
  let target = event.target as Element
  if (!target.matches(".gt2-translated-tweet-info"))
    return

  event.preventDefault()

  target.parentElement
    .querySelectorAll(".gt2-translated-tweet, .gt2-translated-tweet-info")
    .forEach(e => e.classList.add("gt2-hidden"))

  let prev = target
  while ((prev = prev.previousElementSibling) != null) {
    if (prev.matches(".gt2-translate-tweet, [role=button]"))
      prev.classList.remove("gt2-hidden")
  }
  _logger.debug("translation hidden", target)
}


/**
 * Handler for clicking a "Translate tweet" button.
 * @param event the mouse event
 */
function translateTweetHandler(event: MouseEvent): void {
  let target = event.target as Element
  if (!target.matches(".gt2-translate-tweet"))
    return

  event.preventDefault()

  // already translated
  if (target.parentElement.querySelector(".gt2-translated-tweet")) {
    target.classList.add("gt2-hidden")
    target.parentElement
      .querySelectorAll(".gt2-translated-tweet, .gt2-translated-tweet-info")
      .forEach(e => e.classList.remove("gt2-hidden"))
    _logger.debug("translation shown", target)
    return
  }

  let isQuotedTweet = target
    ?.closest("div[aria-labelledby]")
    ?.closest("article[data-testid=tweet]") != null

  // get id (potential parent tweet)
  const tweet = getTweetData(target.closest("article[data-testid=tweet]"))
  if (!tweet)
    return

  // quoted tweet
  if (isQuotedTweet) {
    _logger.debug("translating quoted tweet...")

    getTweetTranslation(tweet.quoted_status.id_str, response => onTweetTranslationRequest(target, response))
  }

  // normal tweet
  else {
    _logger.debug("translating normal tweet...")
    getTweetTranslation(tweet.id_str, response => onTweetTranslationRequest(target, response))
  }
}


/**
 * Callback function for tweet translation requests.
 * @param target the target element
 * @param response the API response
 */
function onTweetTranslationRequest(target: Element, response: TwitterApi.v1_1.translateTweet) {
  _logger.debug("got translation response", response)

  let html = response.translationState == "Success"
    ? getTranslationHtml(response)
    : `
      <div class="gt2-translated-tweet-info">Tweet translation</div>
      <div class="gt2-translated-tweet">API error translating tweet (status: ${response.translationState})</div>`

  target.classList.add("gt2-hidden")
  target.insertAdjacentHTML("afterend", html)
}


// TODO
function translateProfileHandler(event: MouseEvent): void {
  let target = event.target as Element
  if (!target.matches(".gt2-translate-profile")) return
  event.preventDefault()

  _logger.debug("translating profile...")
  _logger.error("NOT IMPLEMENTED")

  let userId

  getProfileTranslation(userId, res => {
    _logger.debug("got translation response", res)

    let html = getTranslationHtml(res.profileTranslation)
    target.classList.add("gt2-hidden")
    target.insertAdjacentHTML("afterend", html)
  })
}


/**
 * Gets a translated tweet DOM object from a translation object.
 * @param translation tweet translation object
 * @returns a translated tweet DOM object
 */
function getTranslationHtml(translation: TwitterApi.Translation): string {
  let tl = translation.translation

  if (translation.entities) {
    _logger.debug("adding entities to translation...")
    tl = tl.populateWithEntities(translation.entities)
  }

  _logger.debug("replacing emojis...")
  tl = tl.replaceEmojis()

  let info = getLocalizedReplacableString("translatedTweetInfo", {
    lang: translation.localizedSourceLanguage,
    source: translation.translationSource == "Google"
      ? `<a href="https://translate.google.com">
           ${getSvg("google")}
         </a>`
      : translation.translationSource
  })

  return `
    <div class="gt2-translated-tweet-info">${info}</div>
    <div class="gt2-translated-tweet">${tl}</div>`
}

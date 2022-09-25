import { getLanguage, getLocalizedReplacableString, getLocalizedString, getSvg, waitForKeyElements } from "../util/util"
import { settings } from "../util/settings"
import { getProfileTranslation, getTweetTranslation } from "../util/request"
import { Logger } from "../util/logger"
import { TwitterApi } from "types"
import { getTweetData, getTweetId } from "../util/tweet"


const logger = new Logger("component", "translation")


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
 * in a language that differs from the current display
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
      logger.debug("added translate button to element: ", e)
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
  logger.debug("translation hidden", target)
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
    logger.debug("translation shown", target)
    return
  }

  let isQuotedTweet = target
    ?.closest("div[aria-labelledby]")
    ?.closest("article[data-testid=tweet]") != null

  // get id (potential parent tweet)
  let id = getTweetId(target.closest("article[data-testid=tweet]"))

  // quoted tweet
  if (isQuotedTweet) {
    logger.debug("translating quoted tweet...")

    getTweetData(id, res => {
      if (!res.hasOwnProperty("quoted_status_id_str")) {
        logger.error(`error with requested tweet (id: ${id}): `, res)
        return
      }

      getTweetTranslation(res.quoted_status_id_str, tlRes => {
        logger.debug("got translation response", tlRes)

        let html = getTranslationHtml(tlRes)
        target.classList.add("gt2-hidden")
        target.insertAdjacentHTML("afterend", html)
      })
    })
  }

  // normal tweet
  else {
    logger.debug("translating normal tweet...")
    getTweetTranslation(id, tlRes => {
      logger.debug("got translation response", tlRes)

      let html = getTranslationHtml(tlRes)
      target.classList.add("gt2-hidden")
      target.insertAdjacentHTML("afterend", html)
    })
  }

}


// TODO
function translateProfileHandler(event: MouseEvent): void {
  let target = event.target as Element
  if (!target.matches(".gt2-translate-profile")) return
  event.preventDefault()

  logger.debug("translating profile...")
  logger.error("NOT IMPLEMENTED")

  let userId

  getProfileTranslation(userId, res => {
    logger.debug("got translation response", res)

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
    logger.debug("adding entities to translation...")
    tl = tl.populateWithEntities(translation.entities)
  }

  logger.debug("replacing emojis...")
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

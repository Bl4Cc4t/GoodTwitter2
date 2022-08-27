import { getLanguage, getLocalizedReplacableString, getLocalizedString, getSvg, waitForKeyElements } from "../util/util"
import { settings } from "../util/settings"
import { requestTweet, getProfileTranslation, getTweetTranslation } from "../util/request"
import { logger } from "../util/logger"
import { TwitterApi } from "types"


export function initializeInlineTranslation(): void {
  // @option hideTranslateTweetButton
  if (!settings.get("hideTranslateTweetButton"))
    addInlineTranslateTweetButton()


  // translate tweet or LPL bio
  document.body.addEventListener("click", translateTweetOrProfileHandler, true)
  // hide translation
  document.body.addEventListener("click", hideTranslationHandler, true)
}


function addInlineTranslateTweetButton(): void {
  waitForKeyElements(`[data-testid=tweet] [lang]`, e => {
    // ignore tweets that already have a translate button
    if (e.parentElement.childElementCount > 1) return

    let tweetLang = e.getAttribute("lang")
    if (tweetLang != getLanguage() && tweetLang != "und") {
      e.insertAdjacentHTML("afterend", `
        <div class="gt2-translate-tweet">
          ${getLocalizedString("translateTweet")}
        </div>
      `)
      logger.debug("added translate button to element: ", e)
    }
  })
}


function hideTranslationHandler(event: MouseEvent): void {
  if (event.target instanceof Element) {
    if (!event.target.matches(".gt2-translated-tweet-info")) return

    event.preventDefault()
    event.target.parentElement
      .querySelectorAll(".gt2-translated-tweet, .gt2-translated-tweet-info")
      .forEach(e => e.classList.add("gt2-hidden"))

    let prev = event.target
    while ((prev = prev.previousElementSibling) != null) {
      if (prev.matches(".gt2-translate-tweet, [role=button]"))
        prev.classList.remove("gt2-hidden")
    }
  }
}


function translateTweetOrProfileHandler(event: MouseEvent): void {
  if (event.target instanceof Element) {
    if (!event.target.matches(".gt2-translate-tweet, .gt2-legacy-profile-info [data-testid=UserDescription] + [role=button] span")) return

    event.preventDefault()

    let target = event.target.matches(".gt2-translate-tweet")
      ? event.target
      : event.target.closest("[role=button]")

    if (target == null) return

    // already translated
    if (target.parentElement.querySelector(".gt2-translated-tweet")) {
      target.classList.add("gt2-hidden")
      target.parentElement.querySelectorAll(".gt2-translated-tweet, .gt2-translated-tweet-info")
        .forEach(e => e.classList.remove("gt2-hidden"))
      return
    }

    let id = target
      .closest("article[data-testid=tweet]")
      ?.querySelector(`:scope > div > div > div > div > div > div:nth-child(1) a[href*='/status/'],
                       div[data-testid=tweet] + div > div:nth-child(3) a[href*='/status/']`)
      ?.getAttribute("href").split("/")[3]

    // embedded tweet
    if (target.closest("[role=link]")?.closest("article[data-testid=tweet]")) {
      logger.debug("translating embedded tweet...")
      requestTweet(id, res => translateTweet(target, res.quoted_status_id_str))
    }

    // normal tweet with embedded one
    else if (target.closest("article[data-testid=tweet]")?.querySelector("[role=link] [lang]")) {
      logger.debug("translating normal tweet containing an embedded one...")
      requestTweet(id, res => translateTweet(target, id, res.quoted_status_id_str))
    }

    // normal tweet
    else if (target.matches(".gt2-translate-tweet")) {
      logger.debug("translating tweet...")
      translateTweet(target, id)
    }

    // profile
    else {
      logger.debug("translating profile...")
      translateProfile(target, id)
    }
  }
}


function translateTweet(targetElement: Element, tweetId: string, quoteTweetId?: string) {
  getTweetTranslation(tweetId, res => {
    logger.debug("got translation response", res)

    // remove embedded url if applicable
    if (quoteTweetId && res.entities?.urls) {
      let tco = res.entities.urls.find(x => x.expanded_url.endsWith(quoteTweetId))
      if (tco) {
        res.translation = res.translation.replace(` ${tco.url}`, "")
        res.entities.urls = res.entities.urls.filter(x => !x.expanded_url.endsWith(quoteTweetId))
      }
    }

    let html = getTranslationHtml(res)
    targetElement.classList.add("gt2-hidden")
    targetElement.insertAdjacentHTML("afterend", html)
  })
}

function translateProfile(targetElement: Element, userId: string) {
  getProfileTranslation(userId, res => {
    logger.debug("got translation response", res)

    let html = getTranslationHtml(res.profileTranslation)
    targetElement.classList.add("gt2-hidden")
    targetElement.insertAdjacentHTML("afterend", html)
  })
}

function getTranslationHtml(translation: TwitterApi.Translation) {
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
    <div class="gt2-translated-tweet">${tl}</div>
  `
}

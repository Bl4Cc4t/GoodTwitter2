import { getLanguage, getLocalizedString, getSvg, waitForKeyElements } from "../util/util"
import { settings } from "../util/settings"
import { requestTweet, getProfileTranslation, getTweetTranslation } from "../util/request"
import { logger } from "util/logger"


export function initializeInlineTranslation() {
  // @option hideTranslateTweetButton
  if (!settings.get("hideTranslateTweetButton"))
    addInlineTranslateTweetButton()


  // translate tweet or LPL bio
  document.body.addEventListener("click", translateTweetProfileHandler, true)
  // hide translation
  document.body.addEventListener("click", hideTranslationHandler, true)
}


function addInlineTranslateTweetButton() {
  waitForKeyElements(`[data-testid=tweet] [lang],
                      [data-testid=tweet] + div > div:nth-child(2) [role=link] [lang]`, e => {
    if (e.parentElement.childElementCount > 1) return
    let tweetLang = e.getAttribute("lang")
    let userLang = getLanguage()
    if (tweetLang != userLang && tweetLang != "und") {
      e.firstElementChild.insertAdjacentHTML("afterend", `
        <div class="gt2-translate-tweet">
          ${getLocalizedString("translateTweet")}
        </div>
      `)
    }
  })

}


function hideTranslationHandler(event: MouseEvent) {
  if (event.target instanceof Element) {
    if (!event.target.matches("gt2-translated-tweet-info")) return

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


function translateTweetProfileHandler(event: MouseEvent) {
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
      ?.querySelector(`> div > div > div > div > div > div:nth-child(1) a[href*='/status/'],
                       div[data-testid=tweet] + div > div:nth-child(3) a[href*='/status/']`)
      ?.getAttribute("href").split("/")[3]

    // embedded tweet
    if (target.closest("[role=link]")?.closest("article[data-testid=tweet]"))
      requestTweet(id, res => translateTweet(target, res.quoted_status_id_str))

    // normal tweet with embedded one
    else if (target.closest("article[data-testid=tweet]")?.querySelector("[role=link] [lang]"))
      requestTweet(id, res => translateTweet(target, id, res.quoted_status_id_str))

    // normal tweet
    else if (target.matches(".gt2-translate-tweet"))
      translateTweet(target, id)

    // profile
    else
      translateProfile(target, id)
  }
}


function translateTweet(targetElement: Element, tweetId: string, quoteTweetId?: string) {
  getTweetTranslation(tweetId, res => {
    let tl = res.translation

    // handle entities in tweet
    if (res.entities) {
      // remove embedded url if applicable
      if (quoteTweetId && res.entities.urls) {
        let tco = res.entities.urls.find(x => x.expanded_url.endsWith(quoteTweetId))
        if (tco) {
          tl = tl.replace(` ${tco.url}`, "")
          res.entities.urls = res.entities.urls.filter(x => !x.expanded_url.endsWith(quoteTweetId))
        }
      }
      tl = tl.populateWithEntities(res.entities)
    }

    targetElement.classList.add("gt2-hidden")

    targetElement.insertAdjacentHTML("afterend", `
      <div class="gt2-translated-tweet-info">
        ${getLocalizedString("translatedTweetInfo")
          .replace("$lang$", res.localizedSourceLanguage)
          .replace("$source$", `
            <a href="https://translate.google.com">
              ${getSvg("google")}
            </a>
          `)
        }
      </div>
      <div class="gt2-translated-tweet">
        ${tl.replaceEmojis()}
      </div>
    `)
  })
}

function translateProfile(targetElement: Element, userId: string) {
  getProfileTranslation(userId, res => {
    let ptl = res.profileTranslation
    let tl = ptl.translation

    if (ptl.entities) {
      tl = tl.populateWithEntities(ptl.entities)
    }

    targetElement.classList.add("gt2-hidden")

    targetElement.insertAdjacentHTML("afterend", `
      <div class="gt2-translated-tweet-info">
        ${getLocalizedString("translatedTweetInfo")
          .replace("$lang$", ptl.localizedSourceLanguage)
          .replace("$source$", `
            <a href="https://translate.google.com">
              ${getSvg("google")}
            </a>
          `)
        }
      </div>
      <div class="gt2-translated-tweet">
        ${tl.replaceEmojis()}
      </div>
    `)
  })
}

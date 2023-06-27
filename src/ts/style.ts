import { waitForKeyElements, watchForChanges, isLoggedIn } from "./util/util"
import { getTweetData } from "./util/tweet"
import { BG_COLOR_TO_THEME, GM_KEYS, RESOURCE_CSS, TEXT_COLOR_TO_THEME } from "./constants"
import { settings } from "./util/settings"
import { Logger } from "./util/logger"


const _logger = new Logger("style")


/**
 * Entry function for all style adjustments.
 */
export function initializeStyle(): void {
    // user color
    waitForKeyElements(`header [href="/compose/tweet"]`, e => {
        let bgColor = getComputedStyle(e).backgroundColor.replace(/rgb\((.*)\)/, "$1")
        document.documentElement.style.setProperty("--color-raw-accent-normal", bgColor)
        _logger.debug(`set --color-raw-accent-normal to "${bgColor}"`)
    }, false)

    // font size
    watchForChanges(`html[style*="font-size"]`, e => {
        let fontSize = e.style.fontSize
        let fontSizeCurrent = document.documentElement.style.getPropertyValue("--font-size")
        if (fontSize != fontSizeCurrent) {
            document.documentElement.style.setProperty("--font-size", fontSize)
            _logger.debug(`set --font-size to "${fontSize}"`)
        }
    })

    // theme from last time
    setTheme(GM_getValue(GM_KEYS.THEME, "dim"))

    // theme current
    if (isLoggedIn()) {
        waitForKeyElements(`[data-testid="DMDrawerHeader"] h2 span`, homeSpan => {
            let textColor = getComputedStyle(homeSpan).color
            let bgColor = getComputedStyle(document.body).backgroundColor

            // white, white-hc, dim & lightsout have a unique text color
            if (TEXT_COLOR_TO_THEME.hasOwnProperty(textColor))
                setTheme(TEXT_COLOR_TO_THEME[textColor])

            // lightout-hc has a unique background color
            else if (BG_COLOR_TO_THEME.hasOwnProperty(bgColor))
                setTheme(BG_COLOR_TO_THEME[bgColor])

            // assume dim-hc
            else setTheme("dim-hc")
        }, false)
    }

    // not logged in
    else {
        if (document.cookie.match(/night_mode=1/)) setTheme("dim")
        else if (document.cookie.match(/night_mode=2/)) setTheme("lightsout")
        else                                            setTheme("white")
    }

    // scrollbar width
    let scrollbarWidth = getScrollbarWidth()
    document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`)
    _logger.debug(`set --scrollbar-width to "${scrollbarWidth}px"`)


    // @option fontOverride
    if (settings.get("fontOverride")) {
        let fontOverride = settings.get("fontOverrideValue")
        document.documentElement.style.setProperty("--font-family-override", fontOverride)
        _logger.debug(`set --font-family-override to "${fontOverride}"`)
    }

    // @option colorOverride
    if (settings.get("colorOverride")) {
        let colorOverride = settings.get("colorOverrideValue")
        document.documentElement.style.setProperty("--color-raw-accent-override", colorOverride)
        _logger.debug(`set --color-raw-accent-override to "${colorOverride}"`)
    }

    // add stylesheet
    GM_addStyle(GM_getResourceText(RESOURCE_CSS)).classList.add("gt2-style")
    _logger.debug("added stylesheet")

    // additional rules
    setAdditionalStyleRules()
}


/**
 * Get the current scrollbar width.
 * Reference: https://stackoverflow.com/q/8079187
 * @returns the width of the scrollbar
 */
function getScrollbarWidth(): number {
    if (document.documentElement.dataset.hasOwnProperty("minimalscrollbar")) {
        return 0
    }

    let div = document.createElement("div")
    div.style.setProperty("overflow-x", "hidden")
    div.style.setProperty("overflow-y", "scroll")
    div.style.setProperty("position", "absolute")
    div.style.setProperty("top", "-100px")
    document.body.appendChild(div)
    let out = div.offsetWidth - div.clientWidth
    document.body.removeChild(div)
    return out
}

/**
 * Sets a theme.
 * @param theme theme to set
 */
function setTheme(theme: Theme): void {
    document.documentElement.dataset.theme = theme
    _logger.debug(`set theme to ${theme}`)
    GM_setValue(GM_KEYS.THEME, theme)
}


/**
 * Hides follow suggestions.
 * @option hideFollowSuggestions
 */
function hideFollowSuggestions(): void {
    // helper function
    function hideFromTimeline(div: Element) {
        if (!div) return div
        if (div.previousElementSibling) {
            div = div.previousElementSibling

            if (div.querySelector("article")) return
            div.classList.add("gt2-hidden")

        } else {
            // if (window.scrollY < 500) return
            setTimeout(() => {
                div = hideFromTimeline(div)
            }, 100)
        }
        return div
    }

    let selector = ["connect_people", "topics/picker", "lists/suggested"]
        .filter((_e, i) => {
            return (settings.get("hideFollowSuggestionsTimelineSel") & Math.pow(2, i)) == Math.pow(2, i)
        })
        .map(e => `[data-testid=primaryColumn] section [href^="/i/${e}"]`)
        .join(", ")

    waitForKeyElements(selector, e => {
        let div = e.closest(`[data-testid=cellInnerDiv]`)

        div?.classList?.add("gt2-hidden")
        if (div?.nextElementSibling?.querySelector("div > div:empty")) {
            div.nextElementSibling.classList.add("gt2-hidden")
        }

        for (let i = 0; i < 6; i++) {
            div = hideFromTimeline(div)
        }
    })

    // profile page (Who to follow / Suggested)
    if ((settings.get("hideFollowSuggestionsProfileSel") & 1) == 1) {
        waitForKeyElements(`a[href$="/header_photo"] ~ [style=""] aside [data-testid=UserCell]:nth-child(1)`, e => {
            e.closest(`[style=""]`).classList.add("gt2-hidden")
        })
    }
}


/**
 * Shows media with content warnings.
 * @option showMediaWithContentWarnings
 */
function showMediaWithContentWarnings(): void {
    const selector = `
        [data-testid=tweet] [href^="/"][href*="/photo/1"] [data-testid=tweetPhoto],
        [data-testid=tweet] [data-testid=previewInterstitial]`
    waitForKeyElements(selector, e => {
        let tweetArticle = e.closest("[data-testid=tweet]")
        let opt = settings.get("showMediaWithContentWarningsSel")

        if (tweetArticle.querySelector(`[d^="M3.693 21.707l-1.414-1.414 2.429-2.429c-2.479-2.421-3.606-5.376-3.658-5.513l-.131-."]`)) {
            const tweet = getTweetData(tweetArticle)
            if (!tweet)
                return

            let score = tweet.extended_entities.media.filter(e => e.hasOwnProperty("sensitive_media_warning")).map(m => {
                return ["adult_content", "graphic_violence", "other"].reduce((p, c, i) => {
                    return p + (m.sensitive_media_warning[c] ? Math.pow(2, i) : 0)
                }, 0)
            }).reduce((p, c) => p | c)

            _logger.debug(`got content warning. tweet id: ${tweet.id_str}, opt: ${opt} score: ${score}`)
            if ((score & opt) == score) {
                tweetArticle.setAttribute("data-gt2-show-media", "1")
            }
        }
    }, false)
}


/**
 * Sets additional style rules.
 * Mostly based on user specified options.
 */
function setAdditionalStyleRules(): void {
    // @option hideMessageBox: minimize DMDrawer
    if (settings.get("hideMessageBox")) {
        waitForKeyElements(`[data-testid=DMDrawer] path[d^="M12 19.344l-8.72"]`, e => {
            let button = e.closest("[role=button]") as HTMLElement
            if (button) {
                button.click()
                _logger.debug("minimized DMDrawer")
            }
        })
    }

    // @option disableHexagonAvatars
    if (settings.get("disableHexagonAvatars")) {
        waitForKeyElements("#hex-hw-shapeclip-clipconfig path", e => {
            let parent = e.parentElement
            parent.innerHTML = settings.get("squareAvatars")
                ? `<rect cx="100" cy="100" ry="10" rx="10" width="200" height="200"></rect>`
                : `<circle cx="100" cy="100" r="100" />`
            parent.setAttribute("transform", "scale(0.005 0.005)")
        })
    }

    // @option hideFollowSuggestions
    if (settings.get("hideFollowSuggestions")) {
        hideFollowSuggestions()
    }

    // @option showMediaWithContentWarnings
    if (settings.get("showMediaWithContentWarnings")
        && settings.get("showMediaWithContentWarningsSel") < 7) {
        showMediaWithContentWarnings()
    }

    // @option colorOverride: ignore reply/like/retweet/share on tweets
    waitForKeyElements(`[data-testid=tweet] [role=group] [role=button] *`, e => {
        e.setAttribute("data-gt2-color-override-ignore", "")
    })

    // @option colorOverride: ignore verified badge
    waitForKeyElements(`path[d^="M22.5 12.5c0-1.58-.875"]`, e => {
        e.closest("svg").setAttribute("data-gt2-color-override-ignore", "")
    })

    // @option colorOverride: ignore pickers at display settings page
    waitForKeyElements(`[data-gt2-path="i/display"] div:nth-last-child(2) > div > [role=radiogroup],
                      [data-gt2-path="settings/display"] div:nth-last-child(2) > div > [role=radiogroup]`, e => {
        let aria = e.closest("[aria-labelledby]")

        // font size
        aria?.querySelectorAll("[dir]:nth-child(3) + div:not([dir]) > div > div > div[dir] + div *")
            .forEach(e => e.setAttribute("data-gt2-color-override-ignore", ""))

        // color picker
        aria?.querySelectorAll("[name*=COLOR_PICKER]").forEach(e => {
            e.closest("label")
                ?.querySelectorAll("*")
                .forEach(e => e.setAttribute("data-gt2-color-override-ignore", ""))
        })
    })

    // do not add dividers to tweet inline threads
    waitForKeyElements(`[data-testid=cellInnerDiv] article,
                      [data-testid=cellInnerDiv] a[href^="/i/status/"]`, e => {
        Array.from(e.closest(`[data-testid=cellInnerDiv]`)?.children || [])
            .forEach(e => e.setAttribute("data-gt2-divider-add-ignore", ""))
    })

    // color notifications bell (activated)
    waitForKeyElements(`path[d^="M23.61.15c-.375"]`, e => {
        e.closest(`[role=button]`)?.setAttribute("data-gt2-bell-full-color", "")
    })

    // color notifications bell (deactivated)
    waitForKeyElements(`path[d^="M23.24 3.26h-2.425V"]`, e => {
        e.closest(`[role=button]`)?.removeAttribute("data-gt2-bell-full-color")
    })
}

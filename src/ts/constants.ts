import { globalLogger } from "./util/logger"


export const RESOURCE = {
    /**
     * Userscript resource: emojiRegex
     */
    EMOJI_REGEX: "emojiRegex",
    /**
     * Userscript resource: stylesheet
     */
    CSS: "css"
}


/**
 * Url of the default avatar.
 */
export const DEFAULT_AVATAR_URL = "https://abs.twimg.com/sticky/default_profile_images/default_profile.png"


/**
 * RegExp constants
 */
export const REGEX = {
    AVATAR_SUFFIX: /_(bigger|normal|(reasonably_)?small|\d*x\d+)/,
    /**
     * The RegExp for emojis.
     */
    EMOJI: (() => {
        let text = GM_getResourceText(RESOURCE.EMOJI_REGEX)
        if (!text || text.length == 0) {
            globalLogger.error(`error getting resource ${RESOURCE.EMOJI_REGEX}`)
            return null
        }
        return new RegExp(`(${text})`, "gu")
    })()
}


/**
 * Public bearer token, used for API requests.
 *
 * Found in https://abs.twimg.com/responsive-web/web/main.5c0baa34.js
 */
export const PUBLIC_BEARER = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA"


/**
 * Known modal pages.
 */
export const MODAL_PAGES: Path = {
    "account": [
        "add",
        "switch"
    ],
    "compose": [
        "tweet",
        "post"
    ],
    "i": [
        "display",
        "keyboard_shortcuts",
        "flow",
        {
            "lists": ["add_member", "create"]
        },
        "report",
        "twitter_blue_sign_up"
    ],
    "intent": [],
    "search_advanced": [],
    "settings": [
        "trends",
        "profile"
    ]
}


/**
 * Array of available themes.
 */
export const THEMES = [
    "white",
    "dim",
    "lightsout",
    "white-hc",
    "dim-hc",
    "lightsout-hc"
] as const


/**
 * Text color to theme mapping.
 */
export const TEXT_COLOR_TO_THEME: {[key: string]: Theme} = {
    "rgb(15, 20, 25)":    "white",
    "rgb(20, 29, 38)":    "white-hc",
    "rgb(247, 249, 249)": "dim",
    "rgb(231, 233, 234)": "lightsout"
}


/**
 * Background color to theme mapping.
 */
export const BG_COLOR_TO_THEME: {[key: string]: Theme} = {
    "rgb(5, 5, 5)": "lightsout-hc"
}


/**
 * Array of title adjustments.
 */
export const TITLE_ADJUSTMENTS = [
    {
        location: "/settings/gt2",
        title: "GoodTwitter2"
    }
]


/**
 * Keys for GM_getValue / GM_setValue functions.
 */
export const GM_KEYS = {
    THEME: "theme",
    DISMISSED_SIDEBAR_NOTICES: "dismissedSidebarNotices",
    SETTINGS: "opt_gt2",
    LEGACY_PROFILE_BANNER_HEIGHT: "legacyProfile.bannerHeight"
}


/**
 * Breakpoints for the layout.
 *
 * Breakpoints overview:
 *
 * name | left sb.  | right sb. | small sb. | dimensions        | note
 * -----|-----------|-----------|-----------|-------------------|-----
 * xxl  | yes       | yes       |           | > 1350px          |
 * xl   | yes       | yes       | yes       | > 1230px          |
 * lg   |           | yes       |           | 1095px - 1350px   |
 * md   |           | yes       | yes       | 1095px - 1230px   |
 * md   |           | yes       |           | 1005px - 1095px   | small sidebars auto applied
 * sm   |           |           |           | < 1005px          |
 * xs   |           |           |           | < 705px           |
 */
export const BREAKPOINTS = {
    EXTRA_EXTRA_LARGE: 1350,
    EXTRA_LARGE: 1230,
    LARGE: 1095,
    MEDIUM: 1005,
    SMALL: 0
}

/**
 * Sidebar visibility enum.
 */
export enum ESidebar {
    None = 1 << 0,
    Left = 1 << 1,
    Right = 1 << 2,
    Both = 1 << 1 | 1 << 2
}

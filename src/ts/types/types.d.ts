/**
 * The path type. Used for the onPage function.
 * @see onPage
 */
declare type Path = {
    [key: string]: Path
} | Array<Path | string>


/**
 * Available themes.
 */
declare type Theme = (typeof import("../constants").THEMES)[number]


/**
 * Replaceable i18n strings.
 */
declare interface I18nReplaceable {
    bornDate: {
        date: string
    }
    bornYear: {
        year: string
    }
    followedBy1: {
        p1: string
    }
    followedBy2: {
        p1: string
        p2: string
    }
    followedBy3: {
        p1: string
        p2: string
        p3: string
    }
    followedBy4Plus: {
        p1: string
        p2: string
        nr: number
    }
    translatedTweetInfo: {
        lang: string
        source: string
    }
    updatedInfo: {
        version: string
    }
    hideFollowSuggestionsBox: {
        type: string
        location: string
    }
}


/**
 * Info object for a user.
 */
declare interface UserInfo {
    bannerUrl: string
    avatarUrl: string
    screenName: string
    name: string
    id: string
    stats: {
        tweets: number
        followers: number
        following: number
    }
}


/**
 * Options for the waitForElements function
 */
interface WaitForElementOptions {
    /**
     * An optional element to apply the querySelectorAll on
     */
    parentElement?: Element,
    /**
     * Execute the callback only once or continue to search for new elements even after the first match is found. The default is true.
     */
    waitOnce?: boolean,
    /**
     * An optional abort signal for the operation.
     */
    signal?: AbortSignal,
    /**
     * Optional options for the mutation observer.
     */
    mutationObserverOptions?: MutationObserverInit
}

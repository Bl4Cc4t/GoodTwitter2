import { Logger } from "../util/logger"
import { getReactPropByName } from "../util/react-util"
import {
    addClickHandlerToMockElement,
    expandTcoShortlink,
    getLocalizedString,
    waitForElements,
    watchForElementChanges,
    watchForMultipleElementChanges
} from "../util/util"
import { REGEX } from "../constants"
import { Settings } from "../util/settings"
import { addLinkClickHandler } from "../util/location.page"

const _logger = new Logger("component", "profile")


export function initializeProfile(): void {
    _logger.debug("initializing profile page")
    addLegacyProfileHeaderSkeleton()

    if (Settings.get("legacyProfile"))
        rebuildLegacyProfilePage()
    else if (Settings.get("expandTcoShortlinks"))
        expandProfileTcoShortlinks()
}

/**
 * Checks for t.co shortlinks in the normal profile page and expands them.
 */
function expandProfileTcoShortlinks() {
    let urls = []

    watchForElementChanges(`[data-testid=UserName]`, userNameElement => {
        const userInfo = getReactPropByName<User>(userNameElement, "user", true)
        if (!userInfo)
            return

        urls = (userInfo.entities.url?.urls ?? []).concat(userInfo.entities.description?.urls ?? [])
    })

    waitForElements(`[data-testid=UserName] ~ * a`, anchor => {
        expandTcoShortlink(anchor, urls)
    })
}

/**
 * Adds the skeleton HTML of the legacy profile layout to the DOM.
 */
function addLegacyProfileHeaderSkeleton(): void {
    waitForElements("header", header => {
        if (document.querySelector(".gt2-legacy-profile-banner"))
            return

        header.insertAdjacentHTML("afterend", /*html*/`
            <div class="gt2-legacy-profile-banner">
                <img src="" alt="" />
            </div>
            <div class="gt2-legacy-profile-nav">
                <div class="gt2-legacy-profile-nav-left">
                    <div class="gt2-legacy-profile-nav-avatar">
                        <img src="" alt="" />
                    </div>
                    <div>
                        <div class="gt2-legacy-profile-name"></div>
                        <div class="gt2-legacy-profile-screen-name-wrap">
                            <span class="gt2-legacy-profile-screen-name"></span>
                            <span class="gt2-legacy-profile-follows-you"></span>
                        </div>
                    </div>
                </div>
                <div class="gt2-legacy-profile-nav-center">
                    <a class="gt2-legacy-profile-stats-tweets" href="" title="">
                        <div>${getLocalizedString("statsTweets")}</div>
                        <div data-gt2-stat-content></div>
                    </a>
                    <a class="gt2-legacy-profile-stats-following" href="" title="">
                        <div>${getLocalizedString("statsFollowing")}</div>
                        <div data-gt2-stat-content></div>
                    </a>
                    <a class="gt2-legacy-profile-stats-followers" href="" title="">
                        <div>${getLocalizedString("statsFollowers")}</div>
                        <div data-gt2-stat-content></div>
                    </a>
                    <a class="gt2-legacy-profile-stats-likes" href="" title="">
                        <div>${getLocalizedString("statsLikes")}</div>
                        <div data-gt2-stat-content></div>
                    </a>
                </div>
                <div class="gt2-legacy-profile-nav-right"></div>
            </div>`)
    })
}

/**
 * Adds data to the legacy profile page skeleton.
 */
function rebuildLegacyProfilePage(): void {
    _logger.debug("rebuilding legacy profile page")
    let userInfo: User

    watchForMultipleElementChanges(
        `[data-testid=UserName]`,
        `.gt2-legacy-profile-info`,
        userNameElement =>
    {
        userInfo = getReactPropByName<User>(userNameElement, "user", true)
        if (!userInfo)
            return
        _logger.debug("found changed userName element", userInfo)

        // avatar
        const avatarElement = document.querySelector<HTMLElement>(".gt2-legacy-profile-nav-avatar")
        avatarElement.dataset.gt2AvatarHex = String(userInfo.profile_image_shape == "Hexagon")
        avatarElement.querySelector("img")
            .setAttribute("src", userInfo.profile_image_url_https.replace(REGEX.AVATAR_SUFFIX, "_400x400"))

        // banner
        document.querySelector(".gt2-legacy-profile-banner img")
            .setAttribute("src", userInfo.profile_banner_url ?? "")

        // name
        const nameElement = userNameElement.querySelector(":scope > div:nth-child(1) > div > div:nth-child(1) > div")
        document.querySelectorAll(".gt2-legacy-profile-name")
            .forEach(e => e.replaceChildren(nameElement.cloneNode(true)))

        // screenName
        document.querySelectorAll(".gt2-legacy-profile-screen-name")
            .forEach(e => e.replaceChildren(userInfo.screen_name))

        // follows you
        const followsYouElement = userNameElement.querySelector("[data-testid=userFollowIndicator]")
        document.querySelectorAll(".gt2-legacy-profile-follows-you")
            .forEach(e => e.replaceChildren(followsYouElement?.cloneNode(true) ?? ""))

        // stats
        const statData: {
            selector: string
            href: string
            count: number
        }[] = [
            {
                selector: ".gt2-legacy-profile-stats-tweets",
                href: `/${userInfo.screen_name}`,
                count: userInfo.statuses_count
            }, {
                selector: ".gt2-legacy-profile-stats-following",
                href: `/${userInfo.screen_name}/following`,
                count: userInfo.friends_count
            }, {
                selector: ".gt2-legacy-profile-stats-followers",
                href: `/${userInfo.screen_name}/followers`,
                count: userInfo.followers_count
            }, {
                selector: ".gt2-legacy-profile-stats-likes",
                href: `/${userInfo.screen_name}/likes`,
                count: userInfo.favourites_count
            }
        ]

        for (const { selector, href, count } of statData) {
            const anchor = document.querySelector(selector)
            anchor.setAttribute("href", href)
            anchor.setAttribute("title", count.humanize())
            anchor.querySelector(`[data-gt2-stat-content]`)
                .replaceChildren(count.humanizeShort())
            addLinkClickHandler(anchor)
        }

        // description (empty)
        if (!userInfo.description || userInfo.description == "") {
            document.querySelector(".gt2-legacy-profile-description")?.replaceChildren("")
        }

        // buttons
        const buttons = userNameElement.previousElementSibling.querySelector(`:scope > :not([data-testid])`)
        if (buttons) {
            document.querySelector(".gt2-legacy-profile-nav-right").replaceChildren(buttons)
        }
    }, {
        waitOnce: false,
        mutationObserverOptions: {
            subtree: true
        }
    })

    // items
    watchForMultipleElementChanges(
        `[data-testid=primaryColumn] [data-testid=UserProfileHeader_Items]`,
        `.gt2-legacy-profile-items`,
        (source, destination) =>
    {
        _logger.debug("found items element")
        destination.replaceChildren(source.cloneNode(true))

        // go over all links
        destination.querySelectorAll(`a`).forEach(a => {
            if (Settings.get("expandTcoShortlinks")) {
                expandTcoShortlink(a, userInfo.entities.url?.urls ?? [])
            }
        })

        // mocked click handlers
        const professionalCategory = destination.querySelector(`[data-testid=UserProfessionalCategory]`)
        if (professionalCategory) {
            addClickHandlerToMockElement(
                professionalCategory,
                source.querySelector(`[data-testid=UserProfessionalCategory] [role=button]`))
        }
    }, {
        waitOnce: false,
        mutationObserverOptions: {
            subtree: true
        }
    })

    // description
    watchForMultipleElementChanges(
        `[data-testid=primaryColumn] [data-testid=UserDescription]`,
        `.gt2-legacy-profile-description`,
        (source, destination) =>
    {
        _logger.debug("found description element", source, destination)
        destination.replaceChildren(source.cloneNode(true))

        // go over all links
        destination.querySelectorAll(`a`).forEach(a => {
            // expand t.co links
            if (Settings.get("expandTcoShortlinks")) {
                expandTcoShortlink(a, userInfo.entities.description?.urls ?? [])
            }

            // clicking @user
            if (a.textContent.trimStart().startsWith("@")) {
                const href = a.getAttribute("href")
                const sourceA = source.querySelector(`[href="${href}"]`)
                const onClick = getReactPropByName<(e: MouseEvent) => void>(sourceA, "onClick")
                a.addEventListener("click", onClick)
            }
        })
    }, {
        waitOnce: false,
        mutationObserverOptions: {
            subtree: true
        }
    })

    // followers you follow
    document.querySelector(".gt2-legacy-profile-followers-you-follow")
        ?.replaceChildren("")
    watchForMultipleElementChanges(
        `[data-testid=primaryColumn] [href$="/followers_you_follow"]`,
        `.gt2-legacy-profile-followers-you-follow`,
        (source, destination) =>
    {
        _logger.debug("found followers you follow element")
        destination.replaceChildren(source.cloneNode(true))
    }, {
        waitOnce: false,
        mutationObserverOptions: {
            subtree: true
        }
    })
}

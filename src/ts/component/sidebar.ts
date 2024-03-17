import { Logger } from "../util/logger"
import { reactPropExists } from "../util/react-util"
import { Settings } from "../util/settings"
import {
    addClickHandlerToMockElement,
    dismissSidebarNotice,
    getCurrentUserInfo,
    getLocalizedString,
    getSidebarType,
    isLoggedIn,
    isSet,
    isSidebarNoticeDismissed,
    waitForElements
} from "../util/util"
import { ESidebar } from "../constants"
import CloseSvg from "@icon/2022/close.svg"
import MoreHoriz from "@icon/2022/more-horiz.svg"
import MoonSvg from "@icon/other/moon.svg"
import CheckSvg from "@icon/2022/check.svg"
import { addLinkClickHandler } from "../util/location.page"


const _logger = new Logger("component/sidebar")


/**
 * Initializes the sidebars by adding them and watching the elements for changes.
 */
export function initializeSidebar(): void {
    _logger.debug("initializing sidebar")
    addLeftSidebar()
    addRightSidebar()
    addSidebarElements()
    handleTrends()
    handleProfileMedia()
    handleListenLiveInSpaces()
    handleGetVerified()

    // @option hideFollowSuggestions
    if (Settings.get("hideFollowSuggestions")) {
        let sel = Settings.get("hideFollowSuggestionsSidebarSel")

        // user suggestions (Who to follow, You might like)
        if ((sel & 1) == 1) {
            waitForElements(`div[data-testid=sidebarColumn] aside [data-testid=UserCell]`, e => {
                e.closest("aside").parentElement.remove()
            }, { waitOnce: false })
        }

        // topic suggestions
        if ((sel & 2) == 2) {
            waitForElements(`div[data-testid=sidebarColumn] section [href^="/i/topics/"]`, e => {
                e.closest("section").parentElement.parentElement.remove()
            }, { waitOnce: false })
        }
    }

    waitForElements(".gt2-sidebar-notice-close > *", e => e.addEventListener("click", event => {
        let container = (event.target as HTMLElement).closest(".gt2-sidebar-notice") as HTMLElement
        console.log(container.dataset.noticeId)
        dismissSidebarNotice(container.dataset.noticeId)
        container.remove()
    }), { waitOnce: false })

    waitForElements(".gt2-toggle-acc-switcher-dropdown", button => {
        const original = document.querySelector<HTMLElement>(`[data-testid=SideNav_AccountSwitcher_Button]`)
        addClickHandlerToMockElement(button, original, () => {
            const position = button.getBoundingClientRect()
            const style = /*html*/`
                <style>
                    [data-testid=hoverCardParent] {
                        left: ${Math.round(position.left) - 274}px !important;
                        top: ${Math.round(position.top) + 35}px !important;
                    }
                    [data-testid=HoverCard] > svg {
                        display: none;
                    }
                </style>`
            waitForElements(`#layers [data-testid=hoverCardParent]`, card => {
                card.insertAdjacentHTML("beforebegin", style)
            })
        })
    }, { waitOnce: false })
}


/**
 * Adds the left sidebar to the DOM.
 */
function addLeftSidebar(): void {
    waitForElements("main > div > div > div", mainView => {
        if (document.querySelector(".gt2-left-sidebar"))
            return

        mainView.insertAdjacentHTML("afterbegin", /*html*/`
            <div class="gt2-left-sidebar-container">
                <div class="gt2-left-sidebar"></div>
            </div>`)
        _logger.debug("added left sidebar")
    }, { waitOnce: false })
}


/**
 * Adds the right helper sidebar to the DOM
 */
function addRightSidebar(): void {
    waitForElements("div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div", container => {
        if (document.querySelector(".gt2-right-sidebar") || container.matches(`[role=progressbar]`))
            return

        container.insertAdjacentHTML("afterbegin", /*html*/`<div class="gt2-right-sidebar"></div>`)
        _logger.debug("added right sidebar")
    }, { waitOnce: false })
}


/**
 * Adds the actual elements to the left sidebar.
 *
 * If the there isn't enough screen space available, they get added to the one on the right.
 */
function addSidebarElements(): void {
    let insertAt = isSet(getSidebarType(), ESidebar.Left) ? ".gt2-left-sidebar" : ".gt2-right-sidebar"

    waitForElements(insertAt, sidebar => {
        if (sidebar.querySelector(".gt2-dashboard-profile"))
            return

        sidebar.replaceChildren()
        sidebar.insertAdjacentHTML("afterbegin", /*html*/`
            ${getUpdateNoticeHtml()}
            ${getDashboardProfileHtml()}
            ${getLegacyProfileInfoHtml()}`)
        _logger.debug("added static elements to", insertAt)

        addClickHandlersToDashboardProfile()
    }, { waitOnce: false })
}


/**
 * Gets the HTML of the current GT2 update notice.
 * @returns the HTML of the current GT2 update notice
 */
function getUpdateNoticeHtml(): string {
    let version = GM_info.script.version
    const key = `gt2-update-${version}`
    // check if update notice needs to be shown
    if (!Settings.get("updateNotifications") || isSidebarNoticeDismissed(key)) {
        return ""
    }

    return /*html*/`
        <div
          class="gt2-sidebar-notice gt2-update-notice gt2-left-sidebar-element"
          data-notice-id="gt2-update-${version}"
        >
            <div class="gt2-sidebar-notice-header">
                <span>GoodTwitter2</span>
                <div class="gt2-sidebar-notice-close">
                    <div class="gt2-icon-hover-dummy"></div>
                    ${CloseSvg}
                </div>
            </div>
            <div class="gt2-sidebar-notice-content">
                ${CheckSvg} ${getLocalizedString("updatedInfo").replace("$version$", `v${version}`)}<br />
                <a
                    href="https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/changelog.md#${version.replace(/\./g, "")}"
                    target="_blank"
                >
                    ${getLocalizedString("updatedInfoChangelog")}
                </a>
            </div>
        </div>`
}


/**
 * Gets the HTML of the dashboard profile.
 * @returns the HTML of the dashboard profile
 */
function getDashboardProfileHtml(): string {
    let i = getCurrentUserInfo()
    let href = isLoggedIn() ? "href" : "data-href"
    return /*html*/`
        <div class="gt2-dashboard-profile gt2-left-sidebar-element">
            <a ${href}="/${i.screenName}" class="gt2-banner" style="background-image: ${i.bannerUrl ? `url(${i.bannerUrl}/600x200)` : "unset"};"></a>
                <div>
                    <a ${href}="/${i.screenName}" class="gt2-avatar">
                        <img src="${i.avatarUrl}" alt="" />
                    </a>
                <div class="gt2-user">
                    <a ${href}="/${i.screenName}" class="gt2-name">${i.name.replaceEmojis()}</a>
                    <a ${href}="/${i.screenName}" class="gt2-screenname">
                        @<span >${i.screenName}</span>
                    </a>
                </div>
                ${isLoggedIn() ? `
                    <div class="gt2-toggle-acc-switcher-dropdown">
                        <div class="gt2-icon-hover-dummy"></div>
                        ${MoreHoriz}
                    </div>` : `
                    <div class="gt2-toggle-lo-nightmode">
                        <div class="gt2-icon-hover-dummy"></div>
                        ${MoonSvg}
                    </div>`}
                <div class="gt2-stats">
                    <ul>
                        <li>
                            <a ${href}="/${i.screenName}">
                                <span>${getLocalizedString("statsTweets")}</span>
                                <span>${i.stats.tweets.humanize()}</span>
                            </a>
                        </li>
                        <li>
                            <a ${href}="/${i.screenName}/following">
                                <span>${getLocalizedString("statsFollowing")}</span>
                                <span>${i.stats.following.humanize()}</span>
                            </a>
                        </li>
                        <li>
                            <a ${href}="/${i.screenName}/followers">
                                <span>${getLocalizedString("statsFollowers")}</span>
                                <span>${i.stats.followers.humanize()}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>`
}


/**
 * Adds click handlers to the dshboard profile for soft links.
 */
function addClickHandlersToDashboardProfile() {
    _logger.debug("adding click handlers to dashboard profile")
    document.querySelectorAll(".gt2-dashboard-profile a")
        .forEach(e => addLinkClickHandler(e))
}


/**
 * Gets the HTML for the legacy profile layout sidebar component
 * @returns the HTML of the legacy profile layout sidebar component
 */
function getLegacyProfileInfoHtml(): string {
    const element = document.querySelector(".gt2-legacy-profile-info")
    if (element)
        return element.outerHTML

    return /*html*/`
        <div class="gt2-legacy-profile-info gt2-left-sidebar-element">
            <div class="gt2-legacy-profile-name"></div>
            <div class="gt2-legacy-profile-screen-name-wrap">
                <span class="gt2-legacy-profile-screen-name"></span>
                <span class="gt2-legacy-profile-follows-you"></span>
            </div>
            <div class="gt2-legacy-profile-automated"></div>
            <div class="gt2-legacy-profile-description"></div>
            <div class="gt2-legacy-profile-items"></div>
            <div class="gt2-legacy-profile-followers-you-follow"></div>
        </div>`
}


/**
 * Handles trends in the sidebar (hiding, moving, wrapping as links).
 */
function handleTrends(): void {
    let trendsSelector =
        `section:not(.gt2-trends-handled) div[data-testid=trend]:not(.gt2-trend-wrapped),
     section[aria-labelledby^=accessible-list]:not(.gt2-trends-handled) a[href="/explore/tabs/for-you"] > div > span:not(.gt2-trend-wrapped)`

    waitForElements(trendsSelector, trends => {
        let trendSection = trends.closest("section")
        let trendContainer = trendSection.parentElement.parentElement

        // actions for the whole container
        if (!trendSection.classList.contains("gt2-trends-handled")
            && trends.closest("div[data-testid=sidebarColumn]")) {

            // hide trends
            if (Settings.get("hideTrends")) {
                trendContainer.remove()
                _logger.debug("removed trends")
                return
            }

            trendSection.classList.add("gt2-trends-handled")
            trendContainer.classList.add("gt2-sidebar-element-trends")

            // move trends
            if (Settings.get("leftTrends")) {
                trendContainer.classList.add("gt2-left-sidebar-element")

                if (isSet(getSidebarType(), ESidebar.Left)) {
                    let leftSidebarTrends = document.querySelector(".gt2-left-sidebar .gt2-sidebar-element-trends")

                    // replace existing trends
                    if (leftSidebarTrends) {
                        leftSidebarTrends.replaceWith(trendContainer)
                        _logger.debug("replaced existing trends in left sidebar")
                    }

                    // move trends
                    else {
                        document.querySelector(".gt2-left-sidebar")
                            ?.append(trendContainer)
                        _logger.debug("moved trends to left sidebar")
                    }
                }
            }
        }

        // wrap trends in anchors
        // TODO handle non-hashtags, reprocess on update
        let toWrap = trends.querySelector<HTMLElement>(":scope > div > div:nth-child(2) > span [dir]")
        if (toWrap) {
            trends.classList.add("gt2-trend-wrapped")
            let text = toWrap.innerText
            let query = encodeURIComponent(text.replace(/%/g, "%25"))
                .replace(/'/g, "%27")
                .replace(/(^"|"$)/g, "")

            toWrap.innerHTML = /*html*/`<a class="gt2-trend" href="/search?q=${text.includes("#") ? query : `%22${query}%22`}">${text}</a>`
            addLinkClickHandler(toWrap.querySelector(".gt2-trend"))
        }
    }, { waitOnce: false })
}


/**
 * Moves sidebar elements to the specified side(bar).
 * @param targetSide where to move the sidebar elements to
 */
export function moveSidebarElements(targetSide: "left" | "right"): void {
    // check if there are elements to move
    let opposite = targetSide == "left" ? "right" : "left"
    if (document.querySelectorAll(`.gt2-${opposite}-sidebar > *`).length == 0)
        return

    let sidebar = document.querySelector(`.gt2-${targetSide}-sidebar`)
    if (!sidebar) {
        _logger.error(`${targetSide} sidebar not found while trying to move elements.`)
        return
    }

    let elements = document.querySelectorAll(".gt2-left-sidebar-element")
    sidebar.append(...Array.from(elements))

    _logger.debug(`moved ${elements.length} elements to the ${targetSide} sidebar`)
}


/**
 * Handles the profile page media element.
 */
function handleProfileMedia(): void {
    let mediaSelector = `
        [data-testid=sidebarColumn] div:nth-child(1) > a[href*="/photo/"],
        [data-testid=sidebarColumn] div:nth-child(1) > a[href*="/video/"]`
    waitForElements(mediaSelector, media => {
        let container = document.querySelector(".gt2-sidebar-element-profile-media")
        let placeLeft = Settings.get("leftMedia")

        // add container element if it does not exist
        if (!container) {
            let sidebar = document.querySelector(`.gt2-${placeLeft && isSet(getSidebarType(), ESidebar.Left) ? "left" : "right"}-sidebar`)

            if (!sidebar) {
                _logger.error("sidebar not found")
                return
            }
            sidebar.insertAdjacentHTML("beforeend", /*html*/`
                <div class="gt2-sidebar-element-profile-media ${placeLeft ? "gt2-left-sidebar-element" : ""}"></div>`)
            container = document.querySelector(".gt2-sidebar-element-profile-media")
        }

        let containerIsLeft = container.classList.contains("gt2-left-sidebar-element")

        // move container to left sidebar if needed
        if (placeLeft && !containerIsLeft) {
            _logger.debug("moving profile media to left sidebar")
            document.querySelector(".gt2-left-sidebar")
                .append(container)
        }

        // move container to right sidebar if needed
        else if (!placeLeft && containerIsLeft) {
            _logger.debug("moving profile media to right sidebar")
            document.querySelector(".gt2-right-sidebar")
                .append(container)
        }

        // replace content
        let mediaElement = media
            .parentElement
            .parentElement
            .parentElement
            .parentElement
            .parentElement
            .parentElement
            .parentElement
        container.replaceChildren(mediaElement)
    }, { waitOnce: false })
}


function handleListenLiveInSpaces() {
    const key = "listen-live-in-spaces"
    waitForElements(`[data-testid=placementTracking]`, e => {
        const propExists = reactPropExists(e, "socialProof")
        if (!propExists || !e.querySelector("[data-testid=pill-contents-container]"))
            return

        handleSidebarNotice(e.parentElement, key)
    }, { waitOnce: false })
}


function handleGetVerified() {
    const key = "get-verified"
    waitForElements(`[data-testid=sidebarColumn] [href="/i/verified-choose"]`, e => {
        const container = e?.closest("aside")?.parentElement
        if (!container)
            return

        handleSidebarNotice(container, key)
    }, { waitOnce: false })
}


function handleSidebarNotice(container: HTMLElement, key: string) {
    container.classList.add(`gt2-sidebar-element-${key}`, `gt2-sidebar-notice`)
    container.dataset.noticeId = key

    if (isSidebarNoticeDismissed(key)) {
        _logger.debug(`removing sidebar notice with key "${key}"`)
        container.remove()
        return
    }

    // add close button
    container.insertAdjacentHTML("beforeend", /*html*/`
        <div class="gt2-sidebar-notice-close">
            <div class="gt2-icon-hover-dummy"></div>
            ${CloseSvg}
        </div>`)
}

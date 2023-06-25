import { Logger } from "../util/logger"
import { getReactPropByName } from "../util/react-util"
import { settings } from "../util/settings"
import { dismissSidebarNotice, getCurrentUserInfo, getLocalizedString, getSvg, isLoggedIn, isOnSingleSidebarLayout, isSidebarNoticeDismissed, waitForKeyElements } from "../util/util"


const logger = new Logger("component/sidebar")


/**
 * Initializes the sidebars by adding them and watching the elements for changes.
 */
export function initializeSidebar():void {
  logger.debug("initializing sidebar")
  addLeftSidebar()
  addRightSidebar()
  addSidebarElements()
  handleTrends()
  handleProfileMedia()
  handleListenLiveInSpaces()
  handleGetVerified()

  // @option hideFollowSuggestions
  if (settings.get("hideFollowSuggestions")) {
    let sel = settings.get("hideFollowSuggestionsSidebarSel")

    // user suggestions (Who to follow, You might like)
    if ((sel & 1) == 1) {
      waitForKeyElements(`div[data-testid=sidebarColumn] aside [data-testid=UserCell]`, e => {
        e.closest("aside").parentElement.remove()
      }, false)
    }

    // topic suggestions
    if ((sel & 2) == 2) {
      waitForKeyElements(`div[data-testid=sidebarColumn] section [href^="/i/topics/"]`, e => {
        e.closest("section").parentElement.parentElement.remove()
      }, false)
    }
  }

  window.addEventListener("resize", () => {
    if (isOnSingleSidebarLayout())
      moveSidebarElements("right")
    else
      moveSidebarElements("left")
  })

  waitForKeyElements(".gt2-sidebar-notice-close", e => e?.addEventListener("click", event => {
    let container = (event.target as HTMLElement).closest(".gt2-sidebar-notice") as HTMLElement
    console.log(container.dataset.noticeId)
    dismissSidebarNotice(container.dataset.noticeId)
    container.remove()
  }))
}


/**
 * Adds the left sidebar to the DOM.
 */
function addLeftSidebar(): void {
  waitForKeyElements("main > div > div > div", mainView => {
    if (!mainView.querySelector(".gt2-left-sidebar")) {
      mainView.insertAdjacentHTML("afterbegin", `
      <div class="gt2-left-sidebar-container">
        <div class="gt2-left-sidebar"></div>
      </div>
      `)
      logger.debug("added left sidebar")
    }
  }, false)
}


/**
 * Adds the right helper sidebar to the DOM
 */
function addRightSidebar(): void {
  waitForKeyElements("div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div", rightSidebar => {
    if (!rightSidebar.querySelector(".gt2-right-sidebar")) {
      rightSidebar.insertAdjacentHTML("afterbegin", `<div class="gt2-right-sidebar"></div>`)
      logger.debug("added right sidebar")
    }
  }, false)
}


/**
 * Adds the actual elements to the left sidebar.
 *
 * If the there isn't enough screen space available, they get added to the one on the right.
 */
function addSidebarElements(): void {
  let insertAt = isOnSingleSidebarLayout() ? ".gt2-right-sidebar" : ".gt2-left-sidebar"

  waitForKeyElements(insertAt, sidebar => {
    sidebar.replaceChildren()
    sidebar.insertAdjacentHTML("afterbegin", `
      ${getUpdateNoticeHtml()}
      ${getDashboardProfileHtml()}
      <div class="gt2-legacy-profile-info gt2-left-sidebar-element"></div>
    `)
    logger.debug("added static elements")
  }, false)
}


/**
 * Gets the HTML of the dashboard profile.
 * @returns the HTML of the dashboard profile
 */
function getDashboardProfileHtml(): string {
  let i = getCurrentUserInfo()
  let href = isLoggedIn() ? "href" : "data-href"
  return `
    <div class="gt2-dashboard-profile gt2-left-sidebar-element">
      <a ${href}="/${i.screenName}" class="gt2-banner" style="background-image: ${i.bannerUrl ? `url(${i.bannerUrl}/600x200)` : "unset"};"></a>
      <div>
        <a ${href}="/${i.screenName}" class="gt2-avatar">
          <img src="${i.avatarUrl}"/>
        </a>
        <div class="gt2-user">
          <a ${href}="/${i.screenName}" class="gt2-name">${i.name.replaceEmojis()}</a>
          <a ${href}="/${i.screenName}" class="gt2-screenname">
            @<span >${i.screenName}</span>
          </a>
        </div>
        <div class="gt2-toggle-${isLoggedIn() ? "acc-switcher-dropdown" : "lo-nightmode" }">
          <div></div>
          ${getSvg(isLoggedIn() ? "caret" : "moon")}
        </div>
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
    </div>
  `
}


/**
 * Gets the HTML of the current GT2 update notice.
 * @returns the HTML of the current GT2 update notice
 */
function getUpdateNoticeHtml(): string {
  let version = GM_info.script.version
  const key = `gt2-update-${version}`
  // check if update notice needs to be shown
  if (!settings.get("updateNotifications") || isSidebarNoticeDismissed(key)) {
    return ""
  }

  return `
    <div
      class="gt2-sidebar-notice gt2-update-notice gt2-left-sidebar-element"
      data-notice-id="gt2-update-${version}"
    >
      <div class="gt2-sidebar-notice-header">
        GoodTwitter2
        <div class="gt2-sidebar-notice-close">
          <div></div>
          ${getSvg("x")}
        </div>
      </div>
      <div class="gt2-sidebar-notice-content">
        ${getSvg("tick")} ${getLocalizedString("updatedInfo").replace("$version$", `v${version}`)}<br />
        <a
          href="https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/changelog.md#${version.replace(/\./g, "")}"
          target="_blank">
          ${getLocalizedString("updatedInfoChangelog")}
        </a>
      </div>
    </div>
  `
}


/**
 * Handles trends in the sidebar (hiding, moving, wrapping as links).
 */
function handleTrends(): void {
  let trendsSelector =
    `section:not(.gt2-trends-handled) div[data-testid=trend]:not(.gt2-trend-wrapped),
     section[aria-labelledby^=accessible-list]:not(.gt2-trends-handled) a[href="/explore/tabs/for-you"] > div > span:not(.gt2-trend-wrapped)`

  waitForKeyElements(trendsSelector, trends => {
    let trendSection = trends.closest("section")
    let trendContainer = trendSection.parentElement.parentElement

    // actions for the whole container
    if (!trendSection.classList.contains("gt2-trends-handled")
      && trends.closest("div[data-testid=sidebarColumn]")) {

      // hide trends
      if (settings.get("hideTrends")) {
        trendContainer.remove()
        logger.debug("removed trends")
        return
      }

      trendSection.classList.add("gt2-trends-handled")
      trendContainer.classList.add("gt2-sidebar-element-trends")

      // move trends
      if (settings.get("leftTrends")) {
        trendContainer.classList.add("gt2-left-sidebar-element")

        if (!isOnSingleSidebarLayout()) {
          let leftSidebarTrends = document.querySelector(".gt2-left-sidebar .gt2-sidebar-element-trends")

          // replace existing trends
          if (leftSidebarTrends) {
            leftSidebarTrends.replaceWith(trendContainer)
            logger.debug("replace existing trends in left sidebar")
          }

          // move trends
          else {
            document.querySelector(".gt2-left-sidebar")
              ?.append(trendContainer)
            logger.debug("moved trends to left sidebar")
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
        .replace(/(^\"|\"$)/g, "")

      toWrap.innerHTML = `<a class="gt2-trend" href="/search?q=${text.includes("#") ? query : `%22${query}%22`}">${text}</a>`
    }
  }, false)
}


/**
 * Moves sidebar elements to the specified side(bar).
 * @param targetSide where to move the sidebar elements to
 */
function moveSidebarElements(targetSide: "left" | "right"): void {
  // check if there are elements to move
  let opposite = targetSide == "left" ? "right" : "left"
  if (document.querySelectorAll(`.gt2-${opposite}-sidebar > *`).length == 0)
    return

  let sidebar = document.querySelector(`.gt2-${targetSide}-sidebar`)
  if (!sidebar) {
    logger.error(`${targetSide} sidebar not found while trying to move elements.`)
    return
  }

  let elements = document.querySelectorAll(".gt2-left-sidebar-element")
  sidebar.append(...Array.from(elements))

  logger.debug(`moved ${elements.length} elements to the ${targetSide} sidebar`)
}


/**
 * Handles the profile page media element.
 */
function handleProfileMedia(): void {
  let mediaSelector =
    `[data-testid=sidebarColumn] div:nth-child(1) > a[href*="/photo/"],
     [data-testid=sidebarColumn] div:nth-child(1) > a[href*="/video/"]`
  waitForKeyElements(mediaSelector, media => {
    let container = document.querySelector(".gt2-sidebar-element-profile-media")
    let placeLeft = settings.get("leftMedia")

    // add container element if it does not exist
    if (!container) {
      let sidebar = document.querySelector(`.gt2-${placeLeft ? "left" : "right"}-sidebar`)

      if (!sidebar) {
        logger.error("sidebar not found")
        return
      }
      sidebar.insertAdjacentHTML("beforeend", `
        <div class="gt2-sidebar-element-profile-media ${placeLeft ? "gt2-left-sidebar-element" : ""}"></div>
      `)
      container = document.querySelector(".gt2-sidebar-element-profile-media")
    }

    let containerIsLeft = container.classList.contains("gt2-left-sidebar-element")

    // move container to left sidebar if needed
    if (placeLeft && !containerIsLeft) {
      logger.debug("moving profile media to left sidebar")
      document.querySelector(".gt2-left-sidebar")
        .append(container)
    }

    // move container to right sidebar if needed
    else if (!placeLeft && containerIsLeft) {
      logger.debug("moving profile media to right sidebar")
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
  }, false)
}


function handleListenLiveInSpaces() {
  const key = "listen-live-in-spaces"
  waitForKeyElements(`[data-testid=placementTracking]`, e => {
    const props = getReactPropByName<SocialProof>(e, "socialProof", true)
    if (isNaN(props?.user?.start))
      return

    handleSidebarNotice(e.parentElement, key)
  }, false)
}


function handleGetVerified() {
  const key = "get-verified"
  waitForKeyElements(`[data-testid=sidebarColumn] [href="/i/verified-choose"]`, e => {
    const container = e?.closest("aside")?.parentElement
    if (!container)
      return

    handleSidebarNotice(container, key)
  }, false)
}


function handleSidebarNotice(container: HTMLElement, key: string) {
  container.classList.add(`gt2-sidebar-element-${key}`, `gt2-sidebar-notice`)
  container.dataset.noticeId = key

  if (isSidebarNoticeDismissed(key)) {
    logger.debug("removing sidebar notice with key: ", key)
    container.remove()
    return
  }

  // add close button
  container.insertAdjacentHTML("beforeend", `
    <div class="gt2-sidebar-notice-close">
      <div></div>
      ${getSvg("x")}
    </div>
  `)
}

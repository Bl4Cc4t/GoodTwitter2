import { TranslateableTestid } from "../types"
import { Logger } from "../util/logger"
import { getCurrentUserInfo, getLocalizedString, getLocalizedStringByTestid, waitForKeyElements, watchForChanges } from "../util/util"


const logger = new Logger("component", "navbar")


export function initializeNavbar() {
  addNavbar()
  addSearch()
}

// add navbar
function addNavbar() {
  waitForKeyElements(`nav > a[href="/home"]`, () => {
    if (document.querySelector(".gt2-nav")) return

    document.querySelector("main")
      .insertAdjacentHTML("beforebegin", `
        <nav class="gt2-nav">
          <div class="gt2-nav-left"></div>
          <div class="gt2-nav-center">
            <a href="/home"></a>
          </div>
          <div class="gt2-nav-right">
            <div class="gt2-search"></div>
            <div class="gt2-toggle-navbar-dropdown">
              <img src="${getCurrentUserInfo().avatarUrl}" />
            </div>
            <div class="gt2-compose">${getLocalizedString("composeNewTweet")}</div>
          </div>
        </nav>
        <div class="gt2-search-overflow-hider"></div>`)

    logger.debug(`added navbar`)

    // home, notifications, messages (and explore on smaller screens)
    let navbarElementsToAdd: TranslateableTestid[] = [
      "AppTabBar_Home_Link",
      "AppTabBar_Notifications_Link",
      "AppTabBar_DirectMessage_Link"
    ]
    if (window.innerWidth < 1005) navbarElementsToAdd.push("AppTabBar_Explore_Link")

    for (let testid of navbarElementsToAdd) {
      // check for updates
      watchForChanges(`header [data-testid=${testid}]`, () => {
        addOrUpdateNavbarElement(testid)
        highlightNavbarLocation()
      }, true)
    }

    // twitter logo
    let bird = document.querySelector("header h1 a[href='/home'] svg")
    if (!bird) {
      logger.error("couldn't find twitter bird")
    } else {
      document.querySelector(".gt2-nav-center a").insertAdjacentHTML("beforeend", bird.outerHTML)
      logger.debug("added twitter bird to navbar")
    }

  })
}


// highlight current location in navbar
export function highlightNavbarLocation() {
  document.querySelectorAll(`.gt2-nav-left > a`)
    ?.forEach(e => e.classList.remove("active"))
  let elem = document.querySelector(`.gt2-nav a[href^='/${location.pathname.split("/")[1]}']`)
  if (elem) {
    elem.classList.add("active")
    logger.debug("highlighted location on navbar element:", elem)
  }
}


export function addOrUpdateNavbarElement(testid: TranslateableTestid) {
  let origElem = document.querySelector(`header [data-testid=${testid}]`) as HTMLElement
  if (!origElem) {
    logger.error(`Error finding navbar element with testid ${testid}`)
    return
  }

  let mockElem = document.querySelector(`.gt2-nav [data-testid=${testid}]`)

  // mock element does not exist
  if (!mockElem) {
    document.querySelector(".gt2-nav-left")
    .insertAdjacentHTML("beforeend", origElem.outerHTML)
    logger.debug(`added navbar element with testid ${testid}`)
    mockElem = document.querySelector(`.gt2-nav [data-testid=${testid}]`)

    // click handler
    mockElem.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault()
      origElem.click()
    })
  }

  // mock element already exists
  else {
    mockElem.innerHTML = origElem.innerHTML
    logger.debug(`updated navbar element with testid ${testid}`)
  }

  mockElem.firstElementChild.setAttribute("data-gt2-color-override-ignore", "")
  mockElem.firstElementChild.insertAdjacentHTML("beforeend", `
    <div class="gt2-nav-header">
      ${getLocalizedStringByTestid(testid)}
    </div>
  `)
}


// add search
function addSearch() {
  let search = "div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div > div:nth-child(1)"
  watchForChanges(`${search} [data-testid=SearchBox_Search_Input]`, () => {
    logger.info("search")
    document.querySelector(".gt2-search")
      .replaceChildren(document.querySelector(search))
    logger.debug("added search")
  }, true)
}

import { Logger } from "../util/logger"
import {
    addClickHandlerToMockElement,
    getCurrentUserInfo,
    getLocalizedString,
    isLoggedIn,
    waitForElements,
    watchForElementChanges
} from "../util/util"


const _logger = new Logger("component", "navbar")


/**
 * Entry function for adding the navbar component.
 */
export function initializeNavbar() {
    _logger.debug("initializing navbar")
    addNavbar()
    addSearch()
}


/**
 * Adds the navbar to the page.
 */
function addNavbar(): void {
    _logger.debug("waiting for header to appear")
    waitForElements(`nav > [data-testid]`, () => {
        if (document.querySelector(".gt2-nav")) return

        let loggedIn = isLoggedIn()

        document.querySelector("main")
            .insertAdjacentHTML("beforebegin", /*html*/`
        <nav class="gt2-nav">
          <div class="gt2-nav-left"></div>
          <div class="gt2-nav-center">
            <a class="gt2-nav-bird" href="${loggedIn ? "/home" : "/"}"></a>
          </div>
          <div class="gt2-nav-right">
            <div class="gt2-search"></div>
            ${loggedIn ? `
            <div class="gt2-toggle-navbar-dropdown">
              <img src="${getCurrentUserInfo().avatarUrl}" />
            </div>
            <div class="gt2-compose">${getLocalizedString("composeNewTweet")}</div>` : ""}
          </div>
        </nav>
        <div class="gt2-search-overflow-hider"></div>`)

        _logger.debug(`added navbar`)


        let navbarElementsToAdd: {
            selector: string
            localizedString: string
        }[] = []

        // home, notifications, messages (and explore on smaller screens)
        if (loggedIn) {
            navbarElementsToAdd = [
                {
                    selector: "[data-testid=AppTabBar_Home_Link]",
                    localizedString: getLocalizedString("navHome")
                }, {
                    selector: "[data-testid=AppTabBar_Notifications_Link]",
                    localizedString: getLocalizedString("navNotifications")
                }, {
                    selector: "[data-testid=AppTabBar_DirectMessage_Link]",
                    localizedString: getLocalizedString("navMessages")
                }
            ]

            if (window.innerWidth < 1005) navbarElementsToAdd.push({
                selector: "[data-testid=AppTabBar_Explore_Link]",
                localizedString: getLocalizedString("navExplore")
            })
        }

        // not logged in
        else {
            navbarElementsToAdd = [
                {
                    selector: "[data-testid=AppTabBar_Explore_Link]",
                    localizedString: getLocalizedString("navExplore")
                }, {
                    selector: `a[href="/settings"]`,
                    localizedString: getLocalizedString("navSettings")
                }
            ]
        }

        for (let elem of navbarElementsToAdd) {
            // check for updates
            watchForElementChanges(`header ${elem.selector}`, () => {
                addOrUpdateNavbarElement(elem.selector, elem.localizedString)
                highlightNavbarLocation()
            }, {
                mutationObserverOptions: {
                    subtree: true
                }
            })
        }

        // add bird
        addBird()

        // handler for compose tweet button
        let composeTweetOrig = document.querySelector<HTMLElement>("header a[href*='/compose/']")
        let composeTweetMock = document.querySelector<HTMLElement>(".gt2-nav .gt2-compose")
        addClickHandlerToMockElement(composeTweetMock, composeTweetOrig)

        // handler for dropdown button
        document.querySelector(".gt2-toggle-navbar-dropdown")
            .addEventListener("click", dropdownToggledHandler)
    }, { waitOnce: false })
}


/**
 * Highlights the current location in the navbar.
 */
function highlightNavbarLocation(): void {
    document.querySelectorAll(`.gt2-nav-left > a`)
        ?.forEach(e => e.classList.remove("active"))
    let elem = document.querySelector(`.gt2-nav a[href^='/${location.pathname.split("/")[1]}']`)
    if (elem) {
        elem.classList.add("active")
        _logger.debug("highlighted location on navbar element:", elem)
    }
}


/**
 * Adds or updates a navbar element by a given selector.
 * @param selector Selector string of the navbar element to add
 * @param localizedString localized string of the text
 */
function addOrUpdateNavbarElement(selector: string, localizedString: string): void {
    let origElem = document.querySelector(`header ${selector}`) as HTMLElement
    if (!origElem) {
        _logger.error(`Error finding navbar element with selector "${selector}"`)
        return
    }

    let mockElem = document.querySelector(`.gt2-nav ${selector}`)

    // mock element does not exist
    if (!mockElem) {
        document.querySelector(".gt2-nav-left")
            .insertAdjacentHTML("beforeend", origElem.outerHTML)
        _logger.debug(`added navbar element with selector "${selector}"`)
        mockElem = document.querySelector(`.gt2-nav ${selector}`)

        // click handler
        addClickHandlerToMockElement(mockElem, origElem)
    }

    // mock element already exists
    else {
        mockElem.innerHTML = origElem.innerHTML
        _logger.debug(`updated navbar element with selector "${selector}"`)
    }

    mockElem.firstElementChild.setAttribute("data-gt2-color-override-ignore", "")
    mockElem.firstElementChild.insertAdjacentHTML("beforeend", /*html*/`
        <div class="gt2-nav-header">${localizedString}</div>`)
}


/**
 * Adds the search box to the navbar.
 */
function addSearch(): void {
    _logger.debug("waiting for search to appear")
    waitForElements(".gt2-search", mockSearch => {
        waitForElements(`[data-testid=sidebarColumn] [data-testid=SearchBox_Search_Input]`, search => {
            let searchContainer = search.closest("form")
                ?.parentElement?.parentElement?.parentElement?.parentElement

            if (!searchContainer) {
                _logger.error("search container not found")
                return
            }

            // replace mock search
            let hadInput = mockSearch.querySelector("input") != null
            mockSearch.replaceChildren(searchContainer)
            _logger.debug(hadInput ? "updated search in navbar" : "added search to navbar")
        }, { waitOnce: false })
    }, { waitOnce: false })
}


/**
 * Removes the search from the navbar.
 */
export function removeSearch(): void {
    let search = document.querySelector(".gt2-search")
    if (search) {
        search.replaceChildren()
        _logger.debug("removed search")
    }
}


/**
 * Adds the twitter bird to the navbar.
 */
function addBird(): void {
    let bird = document.querySelector<HTMLElement>("header h1 svg")
    if (!bird) {
        _logger.error("couldn't find twitter bird")
    } else {
        let mockBird = document.querySelector(".gt2-nav-bird")

        mockBird.insertAdjacentHTML("beforeend", bird.outerHTML)
        addClickHandlerToMockElement(mockBird, bird)
        _logger.debug("added twitter bird to navbar")
    }
}


/**
 * Handler for the dropdown button in the navbar.
 */
function dropdownToggledHandler(): void {
    let info = getCurrentUserInfo()
    _logger.debug("dropdown menu toggled")

    // open "more menu"
    let moreMenuButton = document.querySelector<HTMLElement>("header [data-testid=AppTabBar_More_Menu]")
    moreMenuButton.click()

    // add elements to navbar dropdown menu
    waitForElements("#layers [data-testid=Dropdown]", moreMenu => {
        // separator line
        let separatorHtml = moreMenu.querySelector("[role=separator]")
            ?.parentElement?.outerHTML ?? ""

        // items from left menu to attach
        let toAttach: {
            selector: string
            localizedString: string
        }[] = [
            {
                selector: `a[href="/${info.screenName}"]`,
                localizedString: getLocalizedString("navProfile")
            }, {
                selector: `a[href$="/lists"]`,
                localizedString: getLocalizedString("navLists")
            }, {
                selector: `a[href$="/bookmarks"]`,
                localizedString: getLocalizedString("navBookmarks")
            }, {
                selector: `a[href$="/communities"]`,
                localizedString: getLocalizedString("navCommunities")
            }, {
                selector: `a[href="/explore"]`,
                localizedString: getLocalizedString("navExplore")
            }
        ]

        for (let elem of toAttach.reverse()) {
            let origElem = document.querySelector<HTMLElement>(`header nav ${elem.selector}`)
            if (!origElem)
                continue

            moreMenu.insertAdjacentHTML("afterbegin", origElem.outerHTML)
            let mockElem = moreMenu.querySelector(elem.selector)
            mockElem.firstElementChild.insertAdjacentHTML("beforeend", /*html*/`<span>${elem.localizedString}</span>`)
            addClickHandlerToMockElement(mockElem, origElem, () => moreMenuButton.click())
            _logger.debug(`added dropdown element with selector "${elem.selector}"`)
        }

        // expand sections
        moreMenu.querySelectorAll<HTMLElement>(`[aria-expanded=false]`)
            .forEach(e => {
                e.click()
                e.nextElementSibling.insertAdjacentHTML("afterend", separatorHtml)
            })

        moreMenu.insertAdjacentHTML("beforeend", /*html*/`<a href="/logout" class="gt2-toggle-logout">Logout</a>`)

        moreMenu.classList.add("gt2-navbar-dropdown-buttons-added")

        // add ability to middle mouse click all items
        moreMenu.addEventListener("mouseup", event => {
            event.preventDefault()
            let target = event.target as HTMLElement
            if (target.closest("a") && event.button == 1) {
                target.dispatchEvent(new MouseEvent("click", { ctrlKey: true }))
                _logger.debug("middle clicked dropdown element", target.closest("a"))
            }
        })
    })
}

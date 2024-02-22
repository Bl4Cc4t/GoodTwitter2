import { Settings, SettingsKey } from "../util/settings"
import { getLocalizedString, hasLocalizedString, waitForElements } from "../util/util"
import Pickr from "@simonwep/pickr"
import { Logger } from "../util/logger"
import CheckSvg from "@icon/2022/check.svg"
import ChevronRightSvg from "@icon/2022/chevron-right.svg"
import WestSvg from "@icon/2022/west.svg"


const _logger = new Logger("component", "page-settings")

/**
 * Inserts the GT2 settings menu item into the list of subsettings.
 */
export function addSettingsMenuEntry(): void {
    const selector = `
        main section[aria-labelledby=root-header] div[role=tablist],
        main > div > div > div > div:last-child > div[role=tablist],
        main div[data-testid=loggedOutPrivacySection]`
    waitForElements(selector, e => {
        if (!document.querySelector(".gt2-toggle-settings")) {
            e.insertAdjacentHTML("beforeend", /*html*/`
                <a class="gt2-toggle-settings" href="/settings/gt2">
                    <div>
                        <span>GoodTwitter2</span>
                        ${ChevronRightSvg}
                    </div>
                </a>`)

            _logger.debug("added gt2 settings menu entry")

            e.addEventListener("click", event => {
            let target = event.target as Element
            let menuElement = target.closest(".gt2-toggle-settings")

            // toggle settings display
            if (menuElement) {
                event.preventDefault()
                window.history.pushState({}, "", menuElement.getAttribute("href"))
                addSettings()
            }

            // disable settings display again when clicking on another menu item
            else
                hideSettings()
            })
        }
    }, { waitOnce: false })
}


/**
 * Gets the HTML of a toggle setting.
 * @param name the name of the setting
 * @param additionalHtml additional HTML to add between the toggle and the description
 * @returns the HTML of the toggle setting
 */
function getSettingToggleHtml(name: SettingsKey, additionalHtml=""): string {
    let description = `${name}Desc`
    return /*html*/`
        <div class="gt2-setting">
            <div>
                <span>${getLocalizedString(name)}</span>
                <div class="gt2-setting-toggle ${Settings.get(name) ? "gt2-active" : ""}" data-setting-name="${name}">
                    <div class="gt2-icon-hover-dummy"></div>
                    <div>${CheckSvg}</div>
              </div>
            </div>
            ${additionalHtml}
            ${hasLocalizedString(description) ? /*html*/`<span>${getLocalizedString(description)}</span>` : ""}
        </div>`
}


/**
 * Gets the HTML of a selection setting.
 * @param settingName the name of the setting
 * @param options the options of the setting
 * @returns the HTML of the selection setting
 */
function getSettingSelectionHtml(settingName: SettingsKey, options: string[]): string {
    let html = ""
    for (let [index, option] of options.entries()) {
        let sel = Math.pow(2, index)
        let isActive = ((Settings.get(settingName) as number) & sel) == sel
        html += /*html*/`
            <div>
                <span>${getLocalizedString(option)}</span>
                <div class="gt2-setting-toggle ${isActive ? "gt2-active" : ""}" data-sel="${sel}">
                    <div class="gt2-icon-hover-dummy"></div>
                    <div>${CheckSvg}</div>
                </div>
            </div>`
    }

    return /*html*/`<div data-setting-name="${settingName}">${html}</div>`
}


/**
 * Gets the HTML of the GT2 settings page.
 * @returns the HTML of the settings page
 */
function getSettingsHtml(): string {
    return /*html*/`
        <div class="gt2-settings-header">
            <div class="gt2-settings-back">
                <div class="gt2-icon-hover-dummy"></div>
                ${WestSvg}
            </div>
            GoodTwitter2 v${GM_info.script.version}
        </div>
        <div class="gt2-settings">
            <div class="gt2-settings-sub-header">${getLocalizedString("settingsHeaderTimeline")}</div>
            ${getSettingToggleHtml("forceLatest")}
            ${getSettingToggleHtml("biggerPreviews")}
            <div class="gt2-settings-separator"></div>

            <div class="gt2-settings-sub-header">${getLocalizedString("statsTweets")}</div>
            ${getSettingToggleHtml("hideTranslateTweetButton")}
            ${getSettingToggleHtml("tweetIconsPullLeft")}
            ${getSettingToggleHtml("hidePromoteTweetButton")}
            ${getSettingToggleHtml("showMediaWithContentWarnings", /*html*/`
                <div
                    data-multi-selection-name="showMediaWithContentWarningsBox"
                    class="gt2-settings-multi-selection ${Settings.get("showMediaWithContentWarnings") ? "" : "gt2-hidden"}"
                >
                    ${getSettingSelectionHtml("showMediaWithContentWarningsSel", [
                        "contentWarningNudity",
                        "contentWarningViolence",
                        "contentWarningSensitiveContent"
                    ])}
                </div>`)}
            ${getSettingToggleHtml("hideMoreTweets")}
            <div class="gt2-settings-separator"></div>

            <div class="gt2-settings-sub-header">${getLocalizedString("settingsHeaderSidebars")}</div>
            ${getSettingToggleHtml("stickySidebars")}
            ${getSettingToggleHtml("smallSidebars")}
            ${getSettingToggleHtml("hideTrends")}
            ${getSettingToggleHtml("leftTrends")}
            ${getSettingToggleHtml("show5Trends")}
            <div class="gt2-settings-separator"></div>

            <div class="gt2-settings-sub-header">${getLocalizedString("navProfile")}</div>
            ${getSettingToggleHtml("legacyProfile")}
            ${getSettingToggleHtml("squareAvatars")}
            ${getSettingToggleHtml("disableHexagonAvatars")}
            ${getSettingToggleHtml("leftMedia")}
            ${getSettingToggleHtml("profileMediaRedirect")}
            <div class="gt2-settings-separator"></div>

            <div class="gt2-settings-sub-header">
                ${getLocalizedString("settingsHeaderGlobalLook")}
            </div>
            ${getSettingToggleHtml("hideFollowSuggestions", /*html*/`
                <div
                    data-multi-selection-name="hideFollowSuggestionsBox"
                    class="gt2-settings-multi-selection ${Settings.get("hideFollowSuggestions") ? "" : "gt2-hidden"}"
                >
                <div>
                    <div class="gt2-settings-selection-header">
                        ${getLocalizedString("settingsHeaderTimeline")}
                    </div>
                    ${getSettingSelectionHtml("hideFollowSuggestionsTimelineSel", [
                        "users",
                        "topics",
                        "navLists"
                    ])}
                </div>

                <div>
                    <div class="gt2-settings-selection-header">
                        ${getLocalizedString("settingsHeaderSidebars")}
                    </div>
                    ${getSettingSelectionHtml("hideFollowSuggestionsSidebarSel", [
                        "users",
                        "topics"
                    ])}
                </div>

                <div>
                    <div class="gt2-settings-selection-header">
                        ${getLocalizedString("navProfile")}
                    </div>
                    ${getSettingSelectionHtml("hideFollowSuggestionsProfileSel", [
                        "users",
                    ])}
                </div>
            </div>`)}
            ${getSettingToggleHtml("fontOverride", /*html*/`
                <div class="gt2-setting-input" data-setting-name="fontOverrideValue">
                    <input type="text" value="${Settings.get("fontOverrideValue")}">
                </div>`)}
            ${getSettingToggleHtml("colorOverride", `<div class="gt2-pickr"></div>`)}
            ${getSettingToggleHtml("hideMessageBox")}
            ${getSettingToggleHtml("rosettaIcons")}
            ${getSettingToggleHtml("favoriteLikes")}
            ${getSettingToggleHtml("birdIcon")}
            <div class="gt2-settings-separator"></div>

            <div class="gt2-settings-sub-header">${getLocalizedString("settingsHeaderOther")}</div>
            ${getSettingToggleHtml("updateNotifications")}
            ${getSettingToggleHtml("expandTcoShortlinks")}
            ${getSettingToggleHtml("mobileRedirect")}
        </div>`
}


/**
 * Adds the GT2 settings.
 * TODO (does not yet work on screens smaller than 1050px)
 */
export function addSettings(): void {
    if (document.querySelector(".gt2-settings")) {
        document.querySelectorAll(".gt2-settings-header, .gt2-settings")
            .forEach(e => e.classList.remove("gt2-hidden"))
        return
    }

    waitForElements(`main a[href="/settings/about"]`, () => {
        let settingsHtml = getSettingsHtml()

        // add gt2 settings html to page
        let settingsContainer = document.querySelector("main section[aria-labelledby=detail-header]")
        if (settingsContainer) {
            settingsContainer.insertAdjacentHTML("afterbegin", settingsHtml)
        } else {
            settingsContainer = document.querySelector("main > div > div > div")
            settingsContainer.insertAdjacentHTML("beforeend", /*html*/`<section>${settingsHtml}</section>`)
        }
        _logger.debug(`added gt2 settings to `, settingsContainer)


        // add color pickr
        initializeColorPickr()

        // disable toggles
        disableTogglesIfNeeded()


        // event handlers

        // click on the back button
        document.querySelector(".gt2-settings-back")
            ?.addEventListener("click", () => window.history.back())

        // handler for the toggles
        document.querySelectorAll(".gt2-setting-toggle")
            .forEach(e => e.addEventListener("click", toggleClickHandler))

        // handler for inputs
        document.querySelectorAll(".gt2-setting-input input")
            .forEach(e => e.addEventListener("keyup", inputKeyupHandler))
    })
}


/**
 * Hides the GT2 settings.
 */
export function hideSettings(): void {
    document.querySelectorAll(".gt2-settings-header, .gt2-settings")
        .forEach(e => e.classList.add("gt2-hidden"))
}


/**
 * Initializes the color pickr.
 */
function initializeColorPickr(): void {
    Pickr.create({
        el: ".gt2-pickr",
        theme: "classic",
        lockOpacity: true,
        useAsButton: true,
        appClass: "gt2-color-override-pickr",
        inline: true,
        default: `rgb(${Settings.get("colorOverrideValue")})`,
        components: {
            preview: true,
            hue: true,
            interaction: {
                hex: true,
                rgba: true,
                hsla: true,
                hsva: true,
                cmyk: true,
                input: true
            }
        }
    })
        .on("change", (color: Pickr.HSVaColor) => {
            let val = color.toRGBA().toString(0).slice(5, -4)
            Settings.set("colorOverrideValue", val)
            _logger.debug(`color picked: ${val}`)
        })

    _logger.debug("color pickr initialized.")
}


/**
 * Disables toggles and elements if they are not needed.
 */
function disableTogglesIfNeeded(): void {
    // other trend related toggles are not needed when the trends are disabled
    document.querySelectorAll("div[data-setting-name=leftTrends], div[data-setting-name=show5Trends]")
        .forEach(e => {
            let isDisabled = e.classList.contains("gt2-disabled")

            if (Settings.get("hideTrends") && !isDisabled) {
                e.classList.add("gt2-disabled")
                _logger.debug(`disabled component `, e)
            } else if (!Settings.get("hideTrends") && isDisabled) {
                e.classList.remove("gt2-disabled")
                _logger.debug(`enabled component `, e)
            }
        })

    // @option fontOverride: hide font input if fontOverride is disabled
    hideBasedOnToggle("fontOverride", "[data-setting-name=fontOverrideValue]")

    // @option colorOverride: hide color input if colorOverride is disabled
    hideBasedOnToggle("colorOverride", ".gt2-color-override-pickr")

    // @option hideFollowSuggestions
    hideBasedOnToggle("hideFollowSuggestions", "[data-multi-selection-name=hideFollowSuggestionsBox]")

    // @option showMediaWithContentWarnings
    hideBasedOnToggle("showMediaWithContentWarnings", "[data-multi-selection-name=showMediaWithContentWarningsBox]")
}


/**
 * Hides elements based on the state of a toggle.
 * @param toggle the name of the toggle
 * @param selector the selector of the element to hide
 */
function hideBasedOnToggle(toggle: SettingsKey, selector: string): void {
    let target = document.querySelector(selector)

    if (!target) {
        _logger.warn(`Element with selector "${selector}" does not exist (yet)`)
        return
    }

    let isHidden = target.classList.contains("gt2-hidden")

    if (Settings.get(toggle) && isHidden) {
        target.classList.remove("gt2-hidden")
        _logger.debug(`revealed component `, target)
    } else if (!Settings.get(toggle) && !isHidden) {
        target.classList.add("gt2-hidden")
        _logger.debug(`hid component `, target)
    }
}


/**
 * Handler for click events on a toggle.
 * @param event the mouse event
 */
function toggleClickHandler(event: MouseEvent): void {
    let toggle = event.target as Element
    toggle = toggle.closest(".gt2-setting-toggle")

    // disabled
    if (toggle.classList.contains("gt2-disabled"))
        return

    // ui
    toggle.classList.toggle("gt2-active")

    let settingName = toggle.closest("[data-setting-name]").getAttribute("data-setting-name") as SettingsKey
    let settingSel = toggle.getAttribute("data-sel")

    // multi selection
    if (settingSel) {
        Settings.xor(settingName, parseInt(settingSel))
        _logger.debug(`setting selection changed: ${settingName} = ${Settings.get(settingName)}`)
    }

    // normal toggle
    else {
        Settings.toggle(settingName as SettingsKey)
        _logger.debug(`setting toggled: ${settingName}`)
    }

    // disable toggles if needed
    disableTogglesIfNeeded()
}


/**
 * Handler for input events on text fields.
 * @param event the event
 */
function inputKeyupHandler(event: InputEvent): void {
    let target = event.target as HTMLInputElement
    let settingName = target.closest("[data-setting-name]").getAttribute("data-setting-name")
    Settings.set(settingName as SettingsKey, target.value)
    _logger.debug(`setting value changed: ${settingName} = ${target.value}`)
}

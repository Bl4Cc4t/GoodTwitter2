import { settings, SettingsKey } from "../util/settings"
import { getLocalizedReplacableString, getLocalizedString, getSvg, hasLocalizedString, waitForKeyElements } from "../util/util"
import Pickr from "@simonwep/pickr"
import { Logger } from "../util/logger"
import { changeTitle, revertTitle } from "../util/location"

const logger = new Logger("component", "page-settings")


// insert the menu item
export function addSettingsMenuEntry(): void {
  waitForKeyElements(`
    main section[aria-labelledby=root-header] div[role=tablist],
    main > div > div > div > div:last-child > div[role=tablist],
    main div[data-testid=loggedOutPrivacySection]`, e => {
    if (!document.querySelector(".gt2-toggle-settings")) {
      e.insertAdjacentHTML("beforeend", `
        <a class="gt2-toggle-settings" href="/settings/gt2">
          <div>
            <span>GoodTwitter2</span>
            ${getSvg("caret")}
          </div>
        </a>
      `)

      logger.debug("added gt2 settings menu entry")

      e.addEventListener("click", event => {
        let target = event.target as Element
        let menuElement = target.closest(".gt2-toggle-settings")

        // toggle settings display
        if (menuElement) {
          event.preventDefault()
          window.history.pushState({}, "", menuElement.getAttribute("href"))
          changeTitle("GoodTwitter2")
          addSettings()
        }

        // disable settings display again when clicking on another menu item
        else {
          revertTitle()
          removeSettings()
        }
      })
    }
  })
}


// get html for a gt2 toggle (checkbox)
function getSettingToggleHtml(name: SettingsKey, additionalHTML=""): string {
  let description = `${name}Desc`
  return `
    <div class="gt2-setting">
      <div>
        <span>${getLocalizedString(name)}</span>
        <div class="gt2-setting-toggle ${settings.get(name) ? "gt2-active" : ""}" data-setting-name="${name}">
          <div></div>
          <div>${getSvg("tick")}</div>
        </div>
      </div>
      ${additionalHTML}
      ${hasLocalizedString(description) ? `<span>${getLocalizedString(description)}</span>` : ""}
    </div>`
}


function getSettingSelectionHtml(settingName: SettingsKey, options: string[]): string {
  let html = ""
  for (let [index, option] of options.entries()) {
    let sel = Math.pow(2, index)
    let isActive = ((settings.get(settingName) as number) & sel) == sel
    html += `
      <div>
        <span>${getLocalizedString(option)}</span>
        <div class="gt2-setting-toggle ${isActive ? "gt2-active" : ""}" data-sel="${sel}">
          <div></div>
          <div>${getSvg("tick")}</div>
        </div>
      </div>`
  }
  return `<div data-setting-name="${settingName}">${html}</div>`
}


function getSettingsHtml(): string {
  return `
    <div class="gt2-settings-header">
      <div class="gt2-settings-back">
        <div></div>
        ${getSvg("arrow")}
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
      ${getSettingToggleHtml("showMediaWithContentWarnings", `
        <div
          data-multi-selection-name="showMediaWithContentWarningsBox"
          class="gt2-settings-multi-selection ${settings.get("showMediaWithContentWarnings") ? "" : "gt2-hidden"}"
        >
          ${getSettingSelectionHtml("showMediaWithContentWarningsSel", [
            "contentWarningNudity",
            "contentWarningViolence",
            "contentWarningSensitiveContent"
          ])}
        </div>
      `)}
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
      ${getSettingToggleHtml("enableQuickBlock")}
      ${getSettingToggleHtml("leftMedia")}
      ${getSettingToggleHtml("profileMediaRedirect")}
      <div class="gt2-settings-separator"></div>

      <div class="gt2-settings-sub-header">${getLocalizedString("settingsHeaderGlobalLook")}</div>
      ${getSettingToggleHtml("hideFollowSuggestions", `
        <div
          data-multi-selection-name="hideFollowSuggestionsBox"
          class="gt2-settings-multi-selection ${settings.get("hideFollowSuggestions") ? "" : "gt2-hidden"}"
        >
          ${getLocalizedReplacableString("hideFollowSuggestionsBox", {
            type: getSettingSelectionHtml("hideFollowSuggestionsSel", [
              "topics", "users", "navLists"
            ]),
            location: getSettingSelectionHtml("hideFollowSuggestionsLocSel", [
              "settingsHeaderTimeline", "settingsHeaderSidebars"
            ])
          })}
        </div>
      `)}
      ${getSettingToggleHtml("fontOverride", `
        <div class="gt2-setting-input" data-setting-name="fontOverrideValue">
          <input type="text" value="${settings.get("fontOverrideValue")}">
        </div>
      `)}
      ${getSettingToggleHtml("colorOverride", `<div class="gt2-pickr"></div>`)}
      ${getSettingToggleHtml("hideMessageBox")}
      ${getSettingToggleHtml("rosettaIcons")}
      ${getSettingToggleHtml("favoriteLikes")}
      <div class="gt2-settings-separator"></div>

      <div class="gt2-settings-sub-header">${getLocalizedString("settingsHeaderOther")}</div>
      ${getSettingToggleHtml("updateNotifications")}
      ${getSettingToggleHtml("expandTcoShortlinks")}
      ${getSettingToggleHtml("mobileRedirect")}
    </div>
  `
}


// add the settings to the display (does not yet work on screens smaller than 1050px)
export function addSettings(): void {
  if (document.querySelector(".gt2-settings")) {
    document.querySelectorAll(".gt2-settings-header, .gt2-settings")
      .forEach(e => e.classList.remove("gt2-hidden"))
    return
  }

  waitForKeyElements(`main a[href="/settings/about"]`, () => {
    let settingsHtml = getSettingsHtml()

    // add gt2 settings html to page
    let settingsContainer = document.querySelector("main section[aria-labelledby=detail-header]")
    if (settingsContainer) {
      settingsContainer.insertAdjacentHTML("afterbegin", settingsHtml)
    } else {
      settingsContainer = document.querySelector("main > div > div > div")
      settingsContainer.insertAdjacentHTML("beforeend", `<section>${settingsHtml}</section>`)
    }
    logger.debug(`added gt2 settings to `, settingsContainer)


    // add color pickr
    initializeColorPickr()

    // disable toggles
    disableTogglesIfNeeded()


    // event handlers

    // click on the back button
    document.querySelector(".gt2-settings-back")
      ?.addEventListener("click",  () => window.history.back())

    // handler for the toggles
    document.querySelectorAll(".gt2-setting-toggle")
      .forEach(e => e.addEventListener("click", toggleClickHandler))

    // handler for inputs
    document.querySelectorAll(".gt2-setting-input input")
      .forEach(e => e.addEventListener("keyup", inputKeyupHandler))
  })
}


export function removeSettings(): void {
  document.querySelectorAll(".gt2-settings-header, .gt2-settings")
    .forEach(e => e.classList.add("gt2-hidden"))
}


function initializeColorPickr(): void {
  Pickr.create({
    el: ".gt2-pickr",
    theme: "classic",
    lockOpacity: true,
    useAsButton: true,
    appClass: "gt2-color-override-pickr",
    inline: true,
    default: `rgb(${settings.get("colorOverrideValue")})`,
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
    settings.set("colorOverrideValue", val)
    logger.debug(`color picked: ${val}`)
  })

  logger.debug("color pickr initialized.")
}


function disableTogglesIfNeeded(): void {
  // other trend related toggles are not needed when the trends are disabled
  document.querySelectorAll("div[data-setting-name=leftTrends], div[data-setting-name=show5Trends]")
    .forEach(e => {
      let isDisabled = e.classList.contains("gt2-disabled")

      if (settings.get("hideTrends") && !isDisabled) {
        e.classList.add("gt2-disabled")
        logger.debug(`disabled component `, e)
      } else if (!settings.get("hideTrends") && isDisabled) {
        e.classList.remove("gt2-disabled")
        logger.debug(`enabled component `, e)
      }
    })

  // hide font input if fontOverride is disabled
  hideBasedOnToggle("fontOverride", "[data-setting-name=fontOverrideValue]")

  // hide color input if colorOverride is disabled
  hideBasedOnToggle("colorOverride", ".gt2-color-override-pickr")

  // @option hideFollowSuggestions
  hideBasedOnToggle("hideFollowSuggestions", "[data-multi-selection-name=hideFollowSuggestionsBox]")

  // @option showMediaWithContentWarnings
  hideBasedOnToggle("showMediaWithContentWarnings", "[data-multi-selection-name=showMediaWithContentWarningsBox]")
}


function hideBasedOnToggle(toggle: SettingsKey, selector: string): void {
  let target = document.querySelector(selector)

  if (!target) {
    logger.warn(`Element with selector "${selector}" does not exist (yet)`)
    return
  }

  let isHidden = target.classList.contains("gt2-hidden")

  if (settings.get(toggle) && isHidden) {
    target.classList.remove("gt2-hidden")
    logger.debug(`revealed component `, target)
  } else if (!settings.get(toggle) && !isHidden) {
    target.classList.add("gt2-hidden")
    logger.debug(`hid component `, target)
  }
}


function toggleClickHandler(event: MouseEvent): void {
  let toggle = event.target as Element
  toggle = toggle.closest(".gt2-setting-toggle")

  // disabled
  if (toggle.classList.contains("gt2-disabled")) return

  // ui
  toggle.classList.toggle("gt2-active")

  let settingName = toggle.closest("[data-setting-name]").getAttribute("data-setting-name") as SettingsKey
  let settingSel = toggle.getAttribute("data-sel")

  // multi selection
  if (settingSel) {
    settings.xor(settingName, parseInt(settingSel))
    logger.debug(`setting selection changed: ${settingName} = ${settings.get(settingName)}`)
  }

  // normal toggle
  else {
    settings.toggle(settingName as SettingsKey)
    logger.debug(`setting toggled: ${settingName}`)
  }



  disableTogglesIfNeeded()
}


function inputKeyupHandler(event: InputEvent): void {
  let target = event.target as HTMLInputElement
  let settingName = target.closest("[data-setting-name]").getAttribute("data-setting-name")
  settings.set(settingName as SettingsKey, target.value)
  logger.debug(`setting value changed: ${settingName} = ${target.value}`)
}
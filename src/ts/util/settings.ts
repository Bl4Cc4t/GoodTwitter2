const SETTINGS_KEY = "opt_gt2"


const INITIAL_SETTINGS = {
  // timeline
  forceLatest: false,
  biggerPreviews: false,

  // tweets
  hideTranslateTweetButton: false,
  tweetIconsPullLeft: false,
  hidePromoteTweetButton: false,
  showMediaWithContentWarnings: false,
  showMediaWithContentWarningsSel:  7,

  // sidebars
  stickySidebars: true,
  smallSidebars: false,
  hideTrends: false,
  leftTrends: true,
  show5Trends: false,

  // profile
  legacyProfile: false,
  squareAvatars: false,
  disableHexagonAvatars: false,
  enableQuickBlock: false,
  leftMedia: false,
  profileMediaRedirect: false,

  // global look
  hideFollowSuggestions: false,
  hideFollowSuggestionsSel: 7,
  hideFollowSuggestionsLocSel: 3,
  fontOverride: false,
  fontOverrideValue: "Arial",
  colorOverride: false,
  colorOverrideValue: "85, 102, 68",
  hideMessageBox: true,
  rosettaIcons: false,
  favoriteLikes: false,

  // other
  updateNotifications: true,
  expandTcoShortlinks: true,
  mobileRedirect: true,
}

type SettingsType = typeof INITIAL_SETTINGS
export type SettingsKey = keyof SettingsType


/**
 * Settings helper class.
 */
class Settings {
  private data: SettingsType


  /**
   * Create a new Settings instance.
   */
  constructor() {
    this.data = INITIAL_SETTINGS
    Object.assign(this.data, this.getAll())
    this.setAll()
  }


  /**
   * Gets all settings.
   * @return all settings
   */
  getAll(): SettingsType {
    return GM_getValue(SETTINGS_KEY)
  }


  /**
   * Sets all currently active settings.
   */
  setAll(): void {
    return GM_setValue(SETTINGS_KEY, this.data)
  }


  /**
   * Sets all currently active settings in the DOM.
   */
  setAllInDom(): void {
    let key: SettingsKey
    for (key in this.data) {
      this.setInDom(key, this.data[key])
    }
  }


  /**
   * Sets a settings value by key
   * @param key the key of the setting
   * @param value the new value
   */
  set<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
    // set in DOM
    this.setInDom(key, value)

    // internal
    this.data[key] = value
    this.setAll()

    // @option colorOverride
    if (key == "colorOverride" || key == "colorOverrideValue") {
      if (this.get("colorOverride")) {
        document.documentElement.style.setProperty("--color-raw-accent-override", this.get("colorOverrideValue"))
      } else {
        document.documentElement.style.removeProperty("--color-raw-accent-override")
      }
    }

    // @option fontOverride
    if (key == "fontOverride" || key == "fontOverrideValue") {
      if (this.get("fontOverride")) {
        document.documentElement.style.setProperty("--font-family-override", this.get("fontOverrideValue"))
      } else {
        document.documentElement.style.removeProperty("--font-family-override")
      }
    }
  }


  /**
   * Sets a settings value in the DOM by
   * adding a new class to the body element.
   * @param key the key of the settings
   * @param value the new value
   */
  private setInDom<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
    const className = this.getClassName(key, value)

    if (value) document.body.classList.add(className)
    else document.body.classList.remove(className)
  }


  /**
   * Gets a single value
   * @param key the key of the setting
   * @returns the current value
   */
  get<K extends SettingsKey>(key: K): SettingsType[K] {
    this.data = this.getAll()
    return this.data[key]
  }


  /**
   * Toggles a boolean settings value.
   * @param key the key of the setting
   */
  toggle(key: SettingsKey): void {
    if (typeof this.data[key] == "boolean") {
      this.set(key, !this.get(key))
    }
  }


  /**
   * XORs a numeric settings value with a given number.
   * @param key the key of the setting
   * @param value the value to XOR with
   */
  xor(key: SettingsKey, value: number): void {
    let current = this.get(key)
    if (typeof current == "number") {
      this.set(key, current ^ value)
    }
  }


  /**
   * Gets a valid className string from a setting.
   * @param key the key of the setting
   * @param value the value of the setting. Only important for numeric settings
   * @returns a className string
   */
  private getClassName<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): string {
    return `gt2-opt-${key.camelCaseToKebabCase()}${typeof value === "number" ? `-${value}` : ""}`
  }
}


export let settings = new Settings()

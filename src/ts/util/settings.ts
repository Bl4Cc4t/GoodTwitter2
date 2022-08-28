const SETTINGS_KEY = "gt2_opt"


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


class Settings {
  private data: SettingsType

  /**
   * Create a new Settings instance
   */
  constructor() {
    this.data = INITIAL_SETTINGS
    Object.assign(this.data, this.getAll())
    this.setAll()
  }

  /**
   * Get all settings
   * @return all settings
   */
  getAll(): SettingsType {
    return GM_getValue(SETTINGS_KEY)
  }

  /**
   * Set the currently set settings
   */
  setAll(): void {
    return GM_setValue(SETTINGS_KEY, this.data)
  }

  setAllInDom(): void {
    let key: SettingsKey
    for (key in this.data) {
      this.setInDom(key, this.data[key])
    }
  }

  /**
   * Set a value by key
   * @param key   the key of the setting
   * @param value the new value
   */
  set<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
    // set in DOM
    this.setInDom(key, value)

    // internal
    this.data[key] = value
    this.setAll()
  }

  private setInDom<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
    const className = this.getClassName(key, value)

    if (value) document.body.classList.add(className)
    else document.body.classList.remove(className)
  }

  /**
   * Get a single value
   * @param key   the key of the setting to get
   * @returns the current value
   */
  get<K extends SettingsKey>(key: K): SettingsType[K] {
    this.data = this.getAll()
    return this.data[key]
  }

  /**
   * Toggle a boolean settings value
   * @param  key the key of the setting
   */
  toggle(key: SettingsKey): void {
    if (typeof this.data[key] == "boolean") {
      this.set(key, !this.get(key))
    }
  }

  xor(key: SettingsKey, value: number): void {
    let current = this.get(key)
    if (typeof current == "number") {
      this.set(key, current ^ value)
    }
  }

  getClassName<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): string {
    return `gt2-opt-${key.toKebabCase()}${typeof value === "number" ? `-${value}` : ""}`
  }
}

export let settings = new Settings()

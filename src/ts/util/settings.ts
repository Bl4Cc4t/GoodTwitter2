import { GM_KEYS } from "../constants"

const INITIAL_SETTINGS = {
    // timeline
    forceLatest: false,
    biggerPreviews: false,

    // tweets
    hideTranslateTweetButton: false,
    tweetIconsPullLeft: false,
    hidePromoteTweetButton: false,
    showMediaWithContentWarnings: false,
    showMediaWithContentWarningsSel: 7,
    hideMoreTweets: false,

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
    leftMedia: false,
    profileMediaRedirect: false,

    // global look
    hideFollowSuggestions: false,
    hideFollowSuggestionsTimelineSel: 7,
    hideFollowSuggestionsSidebarSel: 3,
    hideFollowSuggestionsProfileSel: 1,
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
export class Settings {
    private static get data(): SettingsType {
        let value = INITIAL_SETTINGS
        Object.assign(value, GM_getValue(GM_KEYS.SETTINGS, {}))
        return new Proxy(value, {
            set(target: SettingsType, prop, value): boolean {
                target[prop] = value
                GM_setValue(GM_KEYS.SETTINGS, target)
                return true
            }
        })
    }

    /**
     * Sets all currently active settings in the DOM.
     */
    static setAllInDom(): void {
        let key: SettingsKey
        for (key in Settings.data) {
            Settings.setInDom(key, Settings.data[key])
        }
    }


    /**
     * Sets a settings value by key
     * @param key the key of the setting
     * @param value the new value
     */
    static set<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
        // set in DOM
        Settings.setInDom(key, value)

        // internal
        Settings.data[key] = value

        // @option colorOverride
        if (key == "colorOverride" || key == "colorOverrideValue") {
            if (Settings.get("colorOverride")) {
                document.documentElement.style.setProperty("--color-raw-accent-override", Settings.get("colorOverrideValue"))
            } else {
                document.documentElement.style.removeProperty("--color-raw-accent-override")
            }
        }

        // @option fontOverride
        if (key == "fontOverride" || key == "fontOverrideValue") {
            if (Settings.get("fontOverride")) {
                document.documentElement.style.setProperty("--font-family-override", Settings.get("fontOverrideValue"))
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
    private static setInDom<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): void {
        const className = Settings.getClassName(key, value)

        if (value) document.body.classList.add(className)
        else document.body.classList.remove(className)
    }


    /**
     * Gets a single value
     * @param key the key of the setting
     * @returns the current value
     */
    static get<K extends SettingsKey>(key: K): SettingsType[K] {
        return Settings.data[key]
    }


    /**
     * Toggles a boolean settings value.
     * @param key the key of the setting
     */
    static toggle(key: SettingsKey): void {
        if (typeof Settings.data[key] == "boolean") {
            Settings.set(key, !Settings.get(key))
        }
    }


    /**
     * XORs a numeric settings value with a given number.
     * @param key the key of the setting
     * @param value the value to XOR with
     */
    static xor(key: SettingsKey, value: number): void {
        let current = Settings.get(key)
        if (typeof current == "number") {
            Settings.set(key, current ^ value)
        }
    }


    /**
     * Gets a valid className string from a setting.
     * @param key the key of the setting
     * @param value the value of the setting. Only important for numeric settings
     * @returns a className string
     */
    private static getClassName<K extends SettingsKey, V extends SettingsType[K]>(key: K, value: V): string {
        return `gt2-opt-${key.camelCaseToKebabCase()}${typeof value === "number" ? `-${value}` : ""}`
    }
}

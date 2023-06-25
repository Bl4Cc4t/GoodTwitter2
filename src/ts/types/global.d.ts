export {}

// type additions to the global namespace
declare global {
  /**
   * Global helper variable that contains the i18n strings.
   */
  const i18n: {
    [lang: string]: {
      [key: string]: string
    }
  }[]

  interface Window {
    /**
     * Helper variable for waitForKeyElements.
     * @see waitForKeyElements
     */
    controlObj: any

    /**
     * Temporary user data.
     *
     * Use `getCurrentUserInfo` to get this info.
     * @see getCurrentUserInfo
     */
    userInfo: UserInfo
  }

  interface Node {
    /**
     * Helper attribute for waitForKeyElements.
     * @see waitForKeyElements
     */
    alreadyFound: boolean
  }
}

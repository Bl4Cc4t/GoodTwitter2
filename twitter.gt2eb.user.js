// ==UserScript==
// @name          GoodTwitter 2 - Electric Boogaloo
// @version       0.0.22.3
// @description   A try to make Twitter look good again
// @author        schwarzkatz
// @match         https://twitter.com/*
// @exclude       https://twitter.com/i/cards/*
// @grant         GM_getResourceText
// @grant         GM_getResourceURL
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_info
// @grant         GM_xmlhttpRequest
// @connect       abs.twimg.com
// @connect       api.twitter.com
// @resource      css https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.style.css
// @require       https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.i18n.js
// @require       https://code.jquery.com/jquery-3.5.1.min.js
// @require       https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL     https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// @downloadURL   https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// ==/UserScript==

(function($, waitForKeyElements) {
  "use strict"

  // do not execute on these pages
  if (["login"].includes(getPath().split("/")[0])
    || (!isLoggedIn() && [""].includes(getPath().split("/")[0]))) {
    return
  }


  // window.setInterval(() => {
  //   console.log("test");
  //   window.scroll(0, 700)
  //   window.setTimeout(() => {
  //     window.scroll(0, 0)
  //   }, 100)
  // }, 5000)


  // ###########################
  // #  convenience functions  #
  // ###########################


  // seperate number with commas
  Number.prototype.humanize = function() {
    let t = this.toString().split("")
    let out = ""
    let c = 1
    for (let i=t.length-1; i>=0; i--) {
      out = `${t[i]}${out}`
      if (c++ % 3 == 0 && i-1 >= 0) {
        out = `,${out}`
      }
    }
    return out
  }


  // shorter version: 1.4M, 23.4K, etc
  Number.prototype.humanizeShort = function() {
    let t = this.toString()
    if (this >= 1000000) {
      t = t.slice(0, -5)
      return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}M`
    } else if (this >= 10000) {
      t = t.slice(0, -2)
      return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}K`
    } else return this.humanize()
  }


  // get kebab case (thisIsAString -> this-is-a-string)
  String.prototype.toKebab = function() {
    let out = ""
    for (let e of this.toString().split("")) {
      if (e == e.toUpperCase()) out += `-${e.toLowerCase()}`
      else out += e
    }
    return out
  }

  String.prototype.insertAt = function(index, text) {
    return `${this.toString().slice(0, index)}${text}${this.toString().slice(index)}`
  }


  // get account information
  function getInfo() {
    let sel = "#react-root ~ script"
    let infoScript = $(sel).text()
    function x(reg, defaultVal="") {
      let m = infoScript.match(reg)
      return m ? m[1] : defaultVal
    }
    return {
      bannerUrl:  x(/profile_banner_url\":\"(.+?)\",/),
      avatarUrl:  x(/profile_image_url_https\":\"(.+?)\",/, "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"),
      screenName: x(/screen_name\":\"(.+?)\",/, "youarenotloggedin"),
      name:       x(/name\":\"(.+?)\",/, "Anonymous"),
      id:         x(/id_str\":\"(\d+)\"/, "0"),
      stats: {
        tweets:    parseInt(x(/statuses_count\":(\d+),/, "0")),
        followers: parseInt(x(/\"followers_count\":(\d+),/, "0")),
        following: parseInt(x(/friends_count\":(\d+),/, "0")),
      }
    }
  }


  // check if the user is logged in
  function isLoggedIn() {
    return document.cookie.match(/ twid=/)
  }


  // save the contents of the internal i18n-rweb script in a variable
  function setI18nInternalRweb() {
    GM_xmlhttpRequest({
      type: "GET",
      url: $("script[src^='https://abs.twimg.com/responsive-web/web/i18n-rweb/']").attr("src"),
      headers: {
        referer: window.location.href
      },
      onload: function(res) {
        GM_setValue("i18n_internal_rweb", res.responseText)
        window.location.reload()
      }
    })
  }

  // get localized version of a string.
  // defaults to english version.
  function locStr(key) {
    if (Object.keys(i18n.internal).includes(key)) {
      let re = new RegExp(`\"${i18n.internal[key]}\","([^\"]+)\"`)
      if (GM_getValue("i18n_internal_rweb") == undefined) {
        setI18nInternalRweb()
        return i18n.internal.fallback[key]
      } else {
        return GM_getValue("i18n_internal_rweb").match(re)[1]
      }
    } else {
      let lang = $("html").attr("lang")
      lang = Object.keys(i18n).includes(lang) ? lang : "en"
      if (Object.keys(i18n[lang]).includes(key) && !i18n[lang][key].startsWith("*NEW*")) {
        return i18n[lang][key]
      } else {
        return i18n.en[key]
      }
    }
  }


  // current path
  function getPath() {
    return window.location.href.slice(20).split("?")[0]
  }


  // svg convenience
  function getSvg(key) {
    let svgs = {
      lightning: `<g><path d="M8.98 22.698c-.103 0-.205-.02-.302-.063-.31-.135-.49-.46-.44-.794l1.228-8.527H6.542c-.22 0-.43-.098-.573-.266-.144-.17-.204-.393-.167-.61L7.49 2.5c.062-.36.373-.625.74-.625h6.81c.23 0 .447.105.59.285.142.18.194.415.14.64l-1.446 6.075H19c.29 0 .553.166.678.428.124.262.087.57-.096.796L9.562 22.42c-.146.18-.362.276-.583.276zM7.43 11.812h2.903c.218 0 .425.095.567.26.142.164.206.382.175.598l-.966 6.7 7.313-8.995h-4.05c-.228 0-.445-.105-.588-.285-.142-.18-.194-.415-.14-.64l1.446-6.075H8.864L7.43 11.812z"></path></g>`,
      caret: `<g><path d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z"></path></g>`,
      tick: `<g><path d="M9 20c-.264 0-.52-.104-.707-.293l-4.785-4.785c-.39-.39-.39-1.023 0-1.414s1.023-.39 1.414 0l3.946 3.945L18.075 4.41c.32-.45.94-.558 1.395-.24.45.318.56.942.24 1.394L9.817 19.577c-.17.24-.438.395-.732.42-.028.002-.057.003-.085.003z"></path></g>`,
      moon: `<g><path d="M 13.277344 24 C 16.976562 24 20.355469 22.316406 22.597656 19.554688 C 22.929688 19.148438 22.566406 18.550781 22.054688 18.648438 C 16.234375 19.757812 10.886719 15.292969 10.886719 9.417969 C 10.886719 6.03125 12.699219 2.917969 15.644531 1.242188 C 16.097656 0.984375 15.984375 0.296875 15.46875 0.199219 C 14.746094 0.0664062 14.011719 0 13.277344 0 C 6.652344 0 1.277344 5.367188 1.277344 12 C 1.277344 18.625 6.644531 24 13.277344 24 Z M 13.277344 24 "/></g>`,
      x: `<g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g>`,
      google: `<g><path d="M9.827 17.667c-4.82 0-8.873-3.927-8.873-8.747S5.007.173 9.827.173c2.667 0 4.567 1.047 5.993 2.413l-1.687 1.687c-1.027-.96-2.413-1.707-4.307-1.707-3.52 0-6.273 2.84-6.273 6.36s2.753 6.36 6.273 6.36c2.28 0 3.587-.92 4.413-1.747.68-.68 1.132-1.668 1.3-3.008H10v-2.4h7.873c.087.428.127.935.127 1.495 0 1.793-.493 4.013-2.067 5.587-1.54 1.6-3.5 2.453-6.106 2.453zm20.806-5.627c0 3.24-2.533 5.633-5.633 5.633-3.107 0-5.633-2.387-5.633-5.633 0-3.267 2.527-5.633 5.633-5.633 3.1.006 5.633 2.373 5.633 5.633zm-2.466 0c0-2.027-1.467-3.413-3.167-3.413-1.7 0-3.167 1.387-3.167 3.413 0 2.007 1.467 3.413 3.167 3.413 1.7 0 3.167-1.406 3.167-3.413zm15.133-.007c0 3.24-2.527 5.633-5.633 5.633s-5.633-2.387-5.633-5.633c0-3.267 2.527-5.633 5.633-5.633S43.3 8.773 43.3 12.033zm-2.467 0c0-2.027-1.467-3.413-3.167-3.413S34.5 10.007 34.5 12.033c0 2.007 1.467 3.413 3.167 3.413s3.166-1.406 3.166-3.413zm14.5-5.286V16.86c0 4.16-2.453 5.867-5.353 5.867-2.733 0-4.373-1.833-4.993-3.327l2.153-.893c.387.92 1.32 2.007 2.84 2.007 1.853 0 3.007-1.153 3.007-3.307v-.813H52.9c-.553.68-1.62 1.28-2.967 1.28-2.813 0-5.267-2.453-5.267-5.613 0-3.18 2.453-5.652 5.267-5.652 1.347 0 2.413.6 2.967 1.26h.087v-.92h2.346zm-2.173 5.306c0-1.987-1.32-3.433-3.007-3.433-1.707 0-3.007 1.453-3.007 3.433 0 1.96 1.3 3.393 3.007 3.393 1.68 0 3.007-1.426 3.007-3.393zM59.807.78v16.553h-2.473V.78h2.473zm9.886 13.113l1.92 1.28c-.62.92-2.113 2.493-4.693 2.493-3.2 0-5.587-2.473-5.587-5.633 0-3.347 2.413-5.633 5.313-5.633 2.92 0 4.353 2.327 4.82 3.587l.253.64-7.534 3.113c.573 1.133 1.473 1.707 2.733 1.707s2.133-.62 2.773-1.554zm-5.906-2.026l5.033-2.093c-.28-.707-1.107-1.193-2.093-1.193-1.254 0-3.007 1.107-2.94 3.287z"></path></g>`,
      arrow: `<g><path d="M20 11H7.414l4.293-4.293c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0l-6 6c-.39.39-.39 1.023 0 1.414l6 6c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L7.414 13H20c.553 0 1-.447 1-1s-.447-1-1-1z"></path></g>`
    }
    return `
      <svg class="gt2-svg" viewBox="0 0 ${key == "google" ? 74 : 24} 24">
        ${svgs[key]}
      </svg>`
  }


  // request headers
  function getRequestHeaders(additionalHeaders) {
    // found in https://abs.twimg.com/responsive-web/web/main.5c0baa34.js
    let publicBearer = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA"
    let csrf = window.document.cookie.match(/ct0=([^;]+)(;|$)/)[1]

    let out = {
      authorization: `Bearer ${publicBearer}`,
      origin: "https://twitter.com",
      "x-twitter-client-language": $("html").attr("lang"),
      "x-csrf-token": csrf,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session"
    }
    Object.assign(out, additionalHeaders)
    return out
  }



  // ###################
  // #  GT2 settings   #
  // ###################


  // custom options and their default values
  const opt_gt2 = {
    disableAutoRefresh:       false,
    forceLatest:              false,
    keepTweetsInTL:           true,
    smallSidebars:            false,
    stickySidebars:           true,
    leftTrends:               true,
    squareAvatars:            false,
    biggerPreviews:           false,
    show10Trends:             false,
    updateNotifications:      true,
    hideTrends:               false,
    hideWhoToFollow:          false,
    hideTranslateTweetButton: false,
    hideMessageBox:           true
  }

  // set default options
  if (GM_getValue("opt_gt2") == undefined) GM_setValue("opt_gt2", opt_gt2)

  // add previously non existant options
  if (JSON.stringify(Object.keys(GM_getValue("opt_gt2"))) != JSON.stringify(Object.keys(opt_gt2))) {
    let old = GM_getValue("opt_gt2")

    // remove default options that are modified
    for (let k of Object.keys(opt_gt2)) {
      if (Object.keys(old).includes(k)) delete opt_gt2[k]
    }

    // remove old options
    for (let k of Object.keys(old))  {
      if (Object.keys(opt_gt2).includes(k)) delete old[k]
    }

    Object.assign(old, opt_gt2)
    console.log(old);
    GM_setValue("opt_gt2", old)
  }
  console.log(GM_getValue("opt_gt2"));

  // toggle opt_gt2 value
  function toggleGt2Opt(key) {
    let x = GM_getValue("opt_gt2")
    x[key] = !x[key]
    GM_setValue("opt_gt2", x)
  }


  // insert the menu item
  function addSettingsToggle() {
    if (!$(".gt2-toggle-settings").length) {
      $("main div[role=tablist], main div[data-testid=loggedOutPrivacySection]").append(`
        <a class="gt2-toggle-settings" href="/settings/gt2">
          <div>
            <span>GoodTwitter2</span>
            ${getSvg("caret")}
          </div>
        </a>
      `)
    }
  }


  // toggle settings display
  $("body").on("click", ".gt2-toggle-settings", function(event) {
    event.preventDefault()
    window.history.pushState({}, "", $(this).attr("href"))
    addSettings()
    changeSettingsTitle()
  })


  // disable settings display again when clicking on another menu item
  $("body").on("click", `main section:nth-last-child(2) div[role=tablist] a:not(.gt2-toggle-settings),
                         main section:nth-last-child(2) div[data-testid=loggedOutPrivacySection] a:not(.gt2-toggle-settings)`, () => {
    $(".gt2-page-settings-active").removeClass("gt2-page-settings-active")
    $(".gt2-settings-header, .gt2-settings").remove()
  })


  // get html for a gt2 toggle (checkbox)
  function getSettingTogglePart(name) {
    let d = `${name}Desc`
    return `
      <div class="gt2-setting">
        <div>
          <span>${locStr(name)}</span>
          <div class="gt2-setting-toggle ${GM_getValue("opt_gt2")[name] ? "gt2-active" : ""}" data-toggleid="${name}">
            <div></div>
            <div>
              ${getSvg("tick")}
            </div>
          </div>
        </div>
        ${locStr(d) ? `<span>${locStr(d)}</span>` : ""}
      </div>`
  }


  // add the settings to the display (does not yet work on screens smaller than 1050px)
  function addSettings() {
    if (!$(".gt2-settings").length) {
      let elem = `
        <div class="gt2-settings-header">
          <div class="gt2-settings-back">
            <div></div>
            ${getSvg("arrow")}
          </div>
          GoodTwitter2 v${GM_info.script.version}
        </div>
        <div class="gt2-settings">
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderTimeline")}</div>
          ${getSettingTogglePart("forceLatest")}
          ${getSettingTogglePart("disableAutoRefresh")}
          ${getSettingTogglePart("keepTweetsInTL")}
          <div class="gt2-settings-seperator"></div>
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderSidebars")}</div>
          ${getSettingTogglePart("stickySidebars")}
          ${getSettingTogglePart("smallSidebars")}
          ${getSettingTogglePart("hideWhoToFollow")}
          ${getSettingTogglePart("hideTrends")}
          ${getSettingTogglePart("leftTrends")}
          ${getSettingTogglePart("show10Trends")}
          <div class="gt2-settings-seperator"></div>
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderOther")}</div>
          ${getSettingTogglePart("squareAvatars")}
          ${getSettingTogglePart("biggerPreviews")}
          ${getSettingTogglePart("updateNotifications")}
          ${getSettingTogglePart("hideTranslateTweetButton")}
          ${getSettingTogglePart("hideMessageBox")}
        </div>
      `
      if ($("main section").length) {
        $("main section:nth-last-child(1)").prepend(elem)
      } else {
        $("main > div > div > div").append(`
          <section>${elem}</section>
        `)
      }
      disableTogglesIfNeeded()
    }
  }


  // change the title to display GoodTwitter2
  function changeSettingsTitle() {
    let t = $("title").html()
    $("title").html(`${t.startsWith("(") ? `${t.split(" ")[0]} ` : ""}GoodTwitter2 / Twitter`)
  }


  // observe title changes when on the gt2 page
  let settingsTitleMut = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (getPath().startsWith("settings/gt2") && $(m.addedNodes[0]).prop("tagName") == "META") {
        changeSettingsTitle()
      }
    })
  })
  settingsTitleMut.observe($("head")[0], {
    subtree: true,
    childList: true
  })


  // handler for the toggles
  $("body").on("click", ".gt2-setting-toggle:not(.gt2-disabled)", function() {
    $(this).toggleClass("gt2-active")
    let name = $(this).attr("data-toggleid").trim()
    toggleGt2Opt(name)
    $("body").toggleClass(`gt2-opt-${name.toKebab()}`)
    disableTogglesIfNeeded()
  })


  function disableTogglesIfNeeded() {
    // when autoRefresh is on, keepTweetsInTL must also be on and can not be deactivated (it is disabled)
    let $t = $("div[data-toggleid=keepTweetsInTL]")
    if (GM_getValue("opt_gt2").disableAutoRefresh) {
      if (!GM_getValue("opt_gt2").keepTweetsInTL) {
        $t.click()
      }
      $t.addClass("gt2-disabled")
    } else {
      $t.removeClass("gt2-disabled")
    }

    // other trend related toggles are not needed when the trends are disabled
    $t = $("div[data-toggleid=leftTrends], div[data-toggleid=show10Trends]")
    if (GM_getValue("opt_gt2").hideTrends) {
      $t.addClass("gt2-disabled")
    } else {
      $t.removeClass("gt2-disabled")
    }

  }


  // click on the back button
  $("body").on("click", ".gt2-settings-back", () => window.history.back())



  // #######################
  // #  various functions  #
  // #######################


  // add navbar
  function addNavbar() {
    waitForKeyElements("nav > a[data-testid=AppTabBar_Home_Link]", () => {
      if ($("body").hasClass("gt2-navbar-added")) return

      $("body").prepend(`
        <nav class="gt2-nav">
          <div class="gt2-nav-left"></div>
          <div class="gt2-nav-center">
            <a href="/home"></a>
          </div>
          <div class="gt2-nav-right">
            <div class="gt2-search"></div>
            <div class="gt2-toggle-navbar-dropdown">
              <img src="${getInfo().avatarUrl.replace("normal.", "bigger.")}" />
            </div>
            <div class="gt2-compose">${locStr("composeNewTweet")}</div>
          </div>
        </nav>
        <div class="gt2-search-overflow-hider"></div>
      `)

      // home, notifications, messages
      for (let e of [
        "Home",
        "Notifications",
        "DirectMessage"
      ]) {
        $(`nav > a[data-testid=AppTabBar_${e}_Link]`)
        .appendTo(".gt2-nav-left")
        $(`.gt2-nav a[data-testid=AppTabBar_${e}_Link] > div`)
        .append(`
          <div class="gt2-nav-header">
            ${locStr(`nav${e}`)}
          </div>
        `)
      }

      // twitter logo
      $("h1 a[href='/home'] svg")
      .appendTo(".gt2-nav-center a")

      $("body").addClass("gt2-navbar-added")
    })
  }


  // add search
  function addSearch() {
    let search = "div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div > div:nth-child(1)"
    waitForKeyElements(`${search} input[data-testid=SearchBox_Search_Input]`, () => {
      // remove if added previously
      $(".gt2-search").empty()
      // add search
      $(search)
      .prependTo(".gt2-search")
      $("body").addClass("gt2-search-added")
    })
  }


  // add element to sidebar
  function addToSidebar(elements) {
    let w = window.innerWidth
    let insertAt = ".gt2-left-sidebar"

    // insert into the right sidebar
    if ((!GM_getValue("opt_gt2").smallSidebars && w <= 1350) ||
        ( GM_getValue("opt_gt2").smallSidebars && w <= 1230)) {
      insertAt = "div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div"
    }

    waitForKeyElements(`${insertAt}`, () => {
      for (let elem of elements) {
        if (insertAt.startsWith(".gt2")) {
          $(insertAt).prepend(elem)
        } else {
          $(`${insertAt} > div:empty:nth-child(2)`).after(elem)
        }
      }
    })
  }


  // profile view left sidebar
  function getDashboardProfile() {
    let i = getInfo()
    // console.log(`userInformation:\n${JSON.stringify(i, null, 2)}`)
    let href = isLoggedIn() ? "href" : "data-href"
    return `
      <div class="gt2-dashboard-profile">
        <a ${href}="/${i.screenName}" class="gt2-banner" style="background-image: ${i.bannerUrl ? `url(${i.bannerUrl}/600x200)` : "unset"};"></a>
        <div>
          <a ${href}="/${i.screenName}" class="gt2-avatar">
            <img src="${i.avatarUrl.replace("normal.", "bigger.")}"/>
          </a>
          <div class="gt2-user">
            <a ${href}="/${i.screenName}" class="gt2-name">${i.name}</a>
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
                  <span>${locStr("statsTweets")}</span>
                  <span>${i.stats.tweets.humanize()}</span>
                </a>
              </li>
              <li>
                <a ${href}="/${i.screenName}/following">
                  <span>${locStr("statsFollowing")}</span>
                  <span>${i.stats.following.humanize()}</span>
                </a>
              </li>
              <li>
                <a ${href}="/${i.screenName}/followers">
                  <span>${locStr("statsFollowers")}</span>
                  <span>${i.stats.followers.humanize()}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `
  }


  // gt2 update notice
  function getUpdateNotice() {
    let v = GM_info.script.version
    return `
      <div class="gt2-sidebar-notice gt2-update-notice">
        <div class="gt2-sidebar-notice-header">
          GoodTwitter 2
          <div class="gt2-sidebar-notice-close">
            <div></div>
            ${getSvg("x")}
          </div>
        </div>
        <div class="gt2-sidebar-notice-content">
          ${getSvg("tick")} ${locStr("updatedInfo").replace("$version$", `v${v}`)}<br />
          <a
            href="https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/changelog.md#${v.replace(/\./g, "")}"
            target="_blank">
            ${locStr("updatedInfoChangelog")}
          </a>
        </div>
      </div>
    `
  }


  // recreate the legacy profile layout
  function rebuildOldProfile() {
    let banner = `a[href$='/header_photo'] img`
    waitForKeyElements(banner, () => {
      // insert banner
      let bannerUrl = `${$(banner).attr("src").match(/(\S+)\/\d+x\d+/)[1]}/1500x500`
      $("header").before(`
        <img src="${bannerUrl}" class="gt2-profile-banner" />
      `)
    })
  }


  // force latest tweets view.
  function forceLatest() {
    let sparkOptToggle  = "div[data-testid=primaryColumn] > div > div:nth-child(1) > div:nth-child(1) > div > div > div > div > div:nth-child(2) > div[aria-haspopup=true]"
    let sparkOpt        = "#react-root > div > div > div:nth-of-type(1) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(3) > div > div > div"

    GM_setValue("hasRun_forceLatest", false)
    waitForKeyElements(sparkOptToggle, () => {
      if (!GM_getValue("hasRun_forceLatest")) {
        $(sparkOptToggle).click()
        $("body").addClass("gt2-hide-spark-opt")
      }

      waitForKeyElements(`${sparkOpt} a[href='/settings/content_preferences']`, () => {
        if (!GM_getValue("hasRun_forceLatest")) {
          GM_setValue("hasRun_forceLatest", true)
          if ($(sparkOpt).find("> div:nth-child(1) path").length == 3) {
            $(sparkOpt).children().eq(1).click()
          } else {
            $(sparkOptToggle).click()
          }
          $("body").removeClass("gt2-hide-spark-opt")
        }
      })
    })
  }


  // handle trends (wrap, move and show10)
  function handleTrends() {
    let w = window.innerWidth
    let trends = `div[data-testid=trend]:not(.gt2-trend-wrapped)`

    waitForKeyElements(trends, () => {

      // actions for the whole container
      if (!$(trends).parents("section").hasClass("gt2-trends-handled")
        && $(trends).parents("div[data-testid=sidebarColumn]").length
      ) {
        $(trends).parents("section").addClass("gt2-trends-handled")

        // hide trends
        if (GM_getValue("opt_gt2").hideTrends) {
          $(trends).parents("section").parent().parent().parent().remove()
          return
        }

        // move trends
        if (GM_getValue("opt_gt2").leftTrends
            && ((!GM_getValue("opt_gt2").smallSidebars && w > 1350)
              || (GM_getValue("opt_gt2").smallSidebars && w > 1230))) {
          if ($(".gt2-trends").length) $(".gt2-trends").remove()

          $(trends).parents("section").parent().parent().parent()
          .detach().addClass("gt2-trends")
          .appendTo(".gt2-left-sidebar")
        }

        // show 10 trends
        if (GM_getValue("opt_gt2").show10Trends) {
          if ($(trends).parent().parent().find("> div").length == 7) {
            $(trends).parent().parent().find("> div[role=button]").click()
          }
        }
      }

      // wrap trends in anchors
      $(trends).each(function() {
        let $toWrap = $(this).find("> div > div:nth-child(2) > span")
        if ($toWrap.length) {
          $(this).addClass("gt2-trend-wrapped")
          let txt = $toWrap.text()
          let query = encodeURIComponent($toWrap.text().replace(/%/g, "%25"))
          .replace(/'/g, "%27")
          .replace(/(^\"|\"$)/g, "")

          $toWrap.html(`<a class="gt2-trend" href="/search?q=${txt.includes("#") ? query : `%22${query}%22` }">${txt}</a>`)
        }
      })
    })
  }


  // handle who to follow (hide)
  function handleWhoToFollow() {
    let wtf = "div[data-testid=sidebarColumn] div[data-testid=UserCell]"

    waitForKeyElements(wtf, () => {
      // actions for the whole container
      if (!$(wtf).parents("aside").hasClass("gt2-wtf-handled")) {
        $(wtf).parents("aside").addClass("gt2-wtf-handled")

        // hide who to follow
        if (GM_getValue("opt_gt2").hideWhoToFollow) {
          $(wtf).parents("aside").parent().remove()
        }
      }
    })
  }


  // removeChild interception
  Element.prototype.removeChild = (function(fun) {
    return function(child) {
      // if ([
      //   "a[data-testid=AppTabBar_Home_Link]",
      //   "a[data-testid=AppTabBar_Notifications_Link]",
      //   "a[data-testid=AppTabBar_DirectMessage_Link]"
      // ].some(e => $(child).parent().parent().is(e))) {
      //   return child
      // }

      return fun.apply(this, arguments)
    }
  }(Element.prototype.removeChild))



  // ##################################
  // #  translate tweets in timelime  #
  // ##################################


  // add translate button
  if (!GM_getValue("opt_gt2").hideTranslateTweetButton) {
    waitForKeyElements("div:not([data-testid=placementTracking]) > div > div > div > article div[data-testid=tweet]", function(e) {
      let tweetLang = $(e).find("div[lang]").attr("lang")
      let userLang  = $("html").attr("lang").trim()
          userLang  = userLang == "en-GB" ? "en" : userLang
      if (tweetLang != userLang && tweetLang != "und") {
        $(e).find("div[lang]").first().after(`
          <div class="gt2-translate-tweet">
            ${locStr("translateTweet")}
          </div>
        `)
      }
    })
  }


  // translate a tweet
  $("body").on("click", ".gt2-translate-tweet", function(event) {
    event.preventDefault()

    // already translated
    if ($(this).parent().find(".gt2-translated-tweet").length) {
      $(this).addClass("gt2-hidden")
      $(this).parent().find(".gt2-translated-tweet, .gt2-translated-tweet-info").removeClass("gt2-hidden")
      return
    }

    let _this = this
    GM_setValue("tmp_translatedTweetInfo", locStr("translatedTweetInfo"))

    let statusUrl = $(this).parents("div[data-testid=tweet]").find("> div:nth-child(2) > div:nth-child(1) a[href*='/status/']").attr("href")

    GM_xmlhttpRequest({
      method: "GET",
      url:    `https://api.twitter.com/1.1/strato/column/None/tweetId=${statusUrl.split("/")[3]},destinationLanguage=None,translationSource=Some(Google),feature=None,timeout=None,onlyCached=None/translation/service/translateTweet`,
      headers: getRequestHeaders({
        referer: statusUrl
      }),
      onload: function(res) {
        if (res.status == "200") {
          let o = JSON.parse(res.response)
          console.log(o);
          let out = o.translation


          // handle entities in tweet

          if (o.entities) {
            // add to output helper function
            let offset = 0
            function addToOut(index, text) {
              out = out.insertAt(index + offset, text)
              offset += text.length
            }

            // urls
            for (let url of o.entities.urls) {
              addToOut(url.indices[0], `<a href="`)
              addToOut(url.indices[1], `" target="_blank">${url.display_url}</a> `)
            }

            // users
            for (let user of o.entities.user_mentions) {
              addToOut(user.indices[0], `<a href="/${user.screen_name}">`)
              addToOut(user.indices[1], `</a> `)
            }

            // hashtags
            for (let hashtag of o.entities.hashtags) {
              console.log(offset);
              addToOut(hashtag.indices[0], `<a href="/hashtag/${hashtag.text}">`)
              addToOut(hashtag.indices[1], `</a> `)
            }

          }

          $(_this).addClass("gt2-hidden")
          $(_this).after(`
            <div class="gt2-translated-tweet-info">
              ${GM_getValue("tmp_translatedTweetInfo")
                .replace("$lang$", o.localizedSourceLanguage)
                .replace("$source$", `
                  <a href="https://translate.google.com">
                    ${getSvg("google")}
                  </a>
                `)
              }
            </div>
            <div class="gt2-translated-tweet">
              ${out}
            </div>
          `)
        } else {
          console.error("Error occurred while translating.")
        }
      }
    })
  })


  // hide translation
  $("body").on("click", ".gt2-translated-tweet-info", function(event) {
    event.preventDefault()

    $(this).parent().find(".gt2-translated-tweet, .gt2-translated-tweet-info").addClass("gt2-hidden")
    $(this).parent().find(".gt2-translate-tweet").removeClass("gt2-hidden")
  })



  // ########################
  // #  disableAutoRefresh  #
  // ########################


  // russian numbering
  function getRusShowNew(nr) {
    let end
    let t1 = nr.toString().slice(-1)
    let t2 = nr.toString().slice(-2)

    if (t1 == 1)                          end = "новый твит"
    if (t1 >= 2 && t1 <= 4)               end = "новых твита"
    if (t1 == 0 || (t1 >= 5 && t1 <= 9))  end = "новых твитов"
    if (t2 >= 11 && t2 <= 14)             end = "новый твит"
    return `Посмотреть ${nr} ${end}`
  }

  // add counter for new tweets
  function updateNewTweetDisplay() {
    let nr = $(".gt2-hidden-tweet").length
    let text = nr == 1 ? locStr("showNewSingle") : locStr("showNewMulti").replace("$", nr)

    // exception for russian
    if ($("html").attr("lang") == "ru") {
      text = getRusShowNew(nr)
    }

    if (nr) {
      // add button
      if ($(".gt2-show-hidden-tweets").length == 0) {
        if (window.location.href.split("/")[3].startsWith("home")) {
          $("div[data-testid=primaryColumn] > div > div:nth-child(3)").addClass("gt2-show-hidden-tweets")
        } else {
          $("div[data-testid='primaryColumn'] section > div > div > div > div:nth-child(1)").append(`
            <div class="gt2-show-hidden-tweets"></div>
          `)
        }
      }
      $(".gt2-show-hidden-tweets").html(text)
      let t = $("title").text()
      $("title").text(`[${nr}] ${t.startsWith("(") ? t.split(") ")[1] : t.startsWith("[") ? t.split("] ")[1] : t}`)
    } else {
      $(".gt2-show-hidden-tweets").empty().removeClass("gt2-show-hidden-tweets")
      resetTitle()
    }
  }


  // show new tweets
  $("body").on("click", ".gt2-show-hidden-tweets", () => {
    let topTweet = $("div[data-testid=tweet]").eq(0).find("> div:nth-child(2) > div:nth-child(1) > div > div > div:nth-child(1) > a").attr("href")
    GM_setValue("topTweet", topTweet)
    $(".gt2-hidden-tweet").removeClass("gt2-hidden-tweet")
    $(".gt2-hidden-tweet-part").removeClass("gt2-hidden-tweet-part")
    console.log(`topTweet: ${topTweet}`)
    updateNewTweetDisplay()
  })


  // change title to display X new tweets
  function resetTitle() {
    let t = $("title").text()
    let notifications = ".gt2-nav-left a[href='/notifications'] > div > div:nth-child(1) > div:nth-child(2)"
    let messages      = ".gt2-nav-left a[href='/messages'] > div > div:nth-child(1) > div:nth-child(2)"
    let nr = 0
    if ($(notifications).length) nr += parseInt($(notifications).text())
    if ($(messages).length)      nr += parseInt($(messages).text())
    $("title").text(`${nr > 0 ? `(${nr}) ` : ""}${t.startsWith("[") ? t.split("] ")[1] : t}`)
  }


  // observe and hide auto refreshed tweets
  function hideTweetsOnAutoRefresh() {
    let obsTL = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.addedNodes.length == 1) {
          let $t = $(m.addedNodes[0])
          if ($t.find("div > div > div > div > article div[data-testid=tweet]").length && $t.nextAll().find(`a[href='${GM_getValue("topTweet")}']`).length) {
            if ($t.find("div[data-testid=tweet] > div:nth-child(1) > div:nth-child(2)").length && (!$("> div > div > div > a[href^='/i/status/']").length || $t.next().find("> div > div > div > a[href^='/i/status/']").length)) {
              $t.addClass("gt2-hidden-tweet-part")
            } else {
              console.log($t);
              $t.addClass("gt2-hidden-tweet")
              updateNewTweetDisplay()
            }
          } else if ($t.find("> div > div > div > a[href^='/i/status/']").length) {
            console.log($t);
            $t.addClass("gt2-hidden-tweet-part")
          }
        }
      })
    })
    let tlSel = `div[data-testid=primaryColumn] > div > div:nth-child(4) section > div > div > div,
                 div[data-testid=primaryColumn] > div > div:nth-child(2) section > div > div > div`
    waitForKeyElements(tlSel, () => {
      // memorize last tweet
      let topTweet = $(tlSel).find("> div:nth-child(1) div[data-testid=tweet] > div:nth-child(2) > div:nth-child(1) > div > div > div:nth-child(1) > a").attr("href")
      GM_setValue("topTweet", topTweet)
      console.log(`topTweet: ${topTweet}`)
      obsTL.observe($(tlSel)[0], {
        childList: true,
        subtree: true
      })
    })
  }


  // keep the site from removing tweets (not working)
  function keepTweetsInTL() {
    let o = Element.prototype.removeChild
    Element.prototype.removeChild = function(child) {
      // check if element is a tweet
      if ($(child).not("[class]") && $(child).find("> div > div > div > div > article > div > div[data-testid=tweet]").length) {
        console.log($(child)[0])
        return child
      } else {
        return o.apply(this, arguments)
      }
    }
  }



  // #####################
  // #  click handlers   #
  // #####################


  // compose tweet button
  $("body").on("click", ".gt2-nav .gt2-compose", () => {
    $("header a[href='/compose/tweet'] > div").click()
  })


  // add elements to navbar dropdow menu
  $("body").on("click", ".gt2-toggle-navbar-dropdown", () => {
    console.log("navbar toggled");
    let i = getInfo()
    $("header nav > div[data-testid=AppTabBar_More_Menu]").click()
    let more = "div[role=menu][style^='max-height: calc'] > div > div > div"

    waitForKeyElements(`${more} `, () => {
      if ($(more).find("a[href='/explore']").length) return
      let $hr = $(more).find("> div").eq(-4)  // seperator line
      $hr.clone().prependTo(more)
      // items from left menu to attach
      let toAttach = [
        {
          sel:  `a[href='/explore']`,
          name: "Explore"
        }, {
          sel:  `a[href='/i/bookmarks']`,
          name: "Bookmarks"
        }, {
          sel:  `a[href='/${i.screenName}/lists']`,
          name: "Lists"
        }, {
          sel:  `a[href='/${i.screenName}']`,
          name: "Profile"
        }
      ]
      for (let e of toAttach) {
        let $tmp = $("header nav").find(e.sel).clone()
        $tmp.children().append(`<span>${locStr(`nav${e.name}`)}</span>`)
        $tmp.prependTo(more)
      }
    })

  })


  // acc switcher dropdown
  $("body").on("click", ".gt2-toggle-acc-switcher-dropdown", function() {
    $("body").addClass("gt2-acc-switcher-active")
    $("div[data-testid=SideNav_AccountSwitcher_Button]").click()

    // change dropdown position
    $(".gt2-style-acc-switcher-dropdown").remove()
    let pos = $(".gt2-toggle-acc-switcher-dropdown").offset()
    $("html").prepend(`
      <style class="gt2-style-acc-switcher-dropdown">
        #react-root > div > div > h2 + div > div:nth-child(2) > div:nth-child(2) {
          top: ${Math.round(pos.top) + 29}px !important;
          left: ${Math.round(pos.left) - 274}px !important;
        }
      </style>
    `)
  })


  // remove class on next click
  $("body").on("click", ":not(.gt2-toggle-acc-switcher-dropdown), :not(div[data-testid=SideNav_AccountSwitcher_Button])", function() {
    setTimeout(function () {
      if (!$("a[href='/account/add']").length) {
        $("body").removeClass("gt2-acc-switcher-active")
      }
    }, 2000)
  })


  // expand the “What’s happening?” tweet field (minimized by default)
  $("body").on("click", "div[data-testid=primaryColumn] > div > div:nth-child(2)", e => $(e.currentTarget).addClass("gt2-compose-large"))


  // loggedOut nightmode
  $("body").on("click", ".gt2-toggle-lo-nightmode", () => {
    let nm = document.cookie.match(/night_mode=1/) ? 0 : 1
    // delete old cookie
    document.cookie = "night_mode=; Max-Age=0;"
    // create new cookie
    let d = new Date()
    d.setDate(d.getDate() + 500)
    document.cookie = `night_mode=${nm}; expires=${d.toUTCString()}; path=/; domain=.twitter.com`
    window.location.reload()
  })


  // close sidebar notice
  $("body").on("click", ".gt2-sidebar-notice-close", function() {
    if ($(this).parents(".gt2-sidebar-notice").hasClass("gt2-update-notice")) {
      GM_setValue(`sb_notice_ack_update_${GM_info.script.version}`, true)
    }
    $(this).parents(".gt2-sidebar-notice").remove()
  })


  // reload i18n_internal_rweb
  $("body").on("click", "div[data-testid=settingsDetailSave]", function() {
    if ($(this).parent().parent().find("div[data-testid=languageSelector]").length) {
      GM_deleteValue("i18n_internal_rweb")
    }
  })



  // ########################
  // #   display settings   #
  // ########################


  // display settings
  let displaySettings = "main > div > div > div > section:nth-last-child(1) > div:nth-child(2)"
  let displaySettingsModal = "#react-root > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div"


  // user color
  $("body").on("click", `${displaySettings} > div:nth-child(8) > div > div[role=radiogroup] > div > label,
                         ${displaySettingsModal} > div:nth-child(6) > div > div[role=radiogroup] > div > label`, function() {
    GM_setValue("opt_display_userColor", $(this).find("svg").css("color"))
    updateCSS()
  })


  // background color
  let bgColorObserver = new MutationObserver(mut => {
    mut.forEach(m => {
      let bgc = m.target[m.attributeName]["background-color"]
      if (m.oldValue && bgc != "" && bgc != m.oldValue.match(/background-color: (rgb\([\d, ]+\));/)[1]) {
        GM_setValue("opt_display_bgColor", bgc)
        console.log(`New background-color: ${bgc}`)
        updateCSS()
      }
    })
  })
  bgColorObserver.observe($("body")[0], {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["style"]
  })


  // font increment
  let globalFontSizeObserver = new MutationObserver(mut => {
    mut.forEach(m => {
      let fs = m.target[m.attributeName]["font-size"]
      if (m.oldValue && fs != "" && fs != m.oldValue.match(/font-size: (\d+px);/)[1]) {
        GM_setValue("opt_display_fontSize", fs)
        updateCSS()
      }
    })
  })
  globalFontSizeObserver.observe($("html")[0], {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["style"]
  })



  // ################
  // #  Update CSS  #
  // ################


  // get scrollbar width (https://stackoverflow.com/q/8079187)
  function getScrollbarWidth() {
    if ($("html").is("[data-minimalscrollbar]")) {
      return 0
    }
    let $t = $("<div/>").css({
      position: "absolute",
      top: "-100px",
      overflowX: "hidden",
      overflowY: "scroll"
    }).prependTo("body")
    let out = $t[0].offsetWidth - $t[0].clientWidth
    $t.remove()
    return out
  }


  // update inserted CSS
  function updateCSS() {
    // bgColor schemes
    let bgColors = {
      // default (white)
      "rgb(255, 255, 255)":
        `--color-bg:          #e6ecf0;
         --color-elem:        #ffffff;
         --color-elem-sel:    rgb(245, 248, 255);
         --color-gray:        #8899a6;
         --color-gray-dark:   #e6ecf0;
         --color-gray-light:  rgb(101, 119, 134);
         --color-navbar:      #ffffff;
         --color-text:        rgb(20, 23, 26);
         --color-shadow:      rgb(204, 214, 221);
         --color-seperator:   rgb(230, 236, 240);`,
      // dim
      "rgb(21, 32, 43)":
        `--color-bg:          #10171e;
         --color-elem:        rgb(21, 32, 43);
         --color-elem-sel:    rgb(25, 39, 52);
         --color-gray:        rgb(101, 119, 134);
         --color-gray-dark:   #38444d;
         --color-gray-light:  rgb(136, 153, 166);
         --color-navbar:      #1c2938;
         --color-text:        rgb(255, 255, 255);
         --color-shadow:      rgb(61, 84, 102);
         --color-seperator:   rgb(37, 51, 65);`,
      // lightsOut
      "rgb(0, 0, 0)":
        `--color-bg:          #000000;
         --color-elem:        #000000;
         --color-elem-sel:    rgb(21, 24, 28);
         --color-gray:        #657786;
         --color-gray-dark:   #38444d;
         --color-gray-light:  rgb(110, 118, 125);
         --color-navbar:      #15181c;
         --color-text:        rgb(217, 217, 217);
         --color-shadow:      rgb(47, 51, 54);
         --color-seperator:   rgb(32, 35, 39);`
    }

    // initialize with the current settings
    if (GM_getValue("gt2_initialized") == undefined && isLoggedIn()) {
      waitForKeyElements("a[href='/i/keyboard_shortcuts']", () => {
        GM_setValue("opt_display_userColor",  $("a[href='/i/keyboard_shortcuts']").css("color"))
        GM_setValue("opt_display_bgColor",    $("body").css("background-color"))
        GM_setValue("opt_display_fontSize",   $("html").css("font-size"))

        GM_setValue("gt2_initialized",        true)
        window.location.reload()
      })

    } else {
      // add gt2-options to body for the css to take effect
      for (let [key, val] of Object.entries(GM_getValue("opt_gt2"))) {
        if (val) $("body").addClass(`gt2-opt-${key.toKebab()}`)
      }

      // remove unneeded classes
      $("body").removeClass("gt2-acc-switcher-active")

      // delete old stylesheet
      if ($(".gt2-style").length) {
        $(".gt2-style").remove()
      }

      // options to set if not logged in
      let opt_display_bgColor   = GM_getValue("opt_display_bgColor")
      let opt_display_fontSize  = GM_getValue("opt_display_fontSize")
      let opt_display_userColor = GM_getValue("opt_display_userColor")
      if (!isLoggedIn()) {
        // get bgColor from cookie
        opt_display_bgColor   = document.cookie.match(/night_mode=1/) ? "rgb(21, 32, 43)" : "rgb(255, 255, 255)"
        opt_display_fontSize  = "15px"
        opt_display_userColor = "rgb(29, 161, 242)"
      }

      // insert new stylesheet
      $("html").prepend(`
        <style class="gt2-style">
          ${GM_getResourceText("css")
          .replace("--bgColors:$;",   bgColors[opt_display_bgColor])
          .replace("$userColor",      opt_display_userColor)
          .replace("$globalFontSize", opt_display_fontSize)
          .replace("$scrollbarWidth", `${getScrollbarWidth()}px`)}
        </style>`
      )
    }
  }



  // ##############
  // #  resizing  #
  // ##############


  // things to do when resizing the window
  $(window).on("resize", () => {
    let w = window.innerWidth
    if ((!GM_getValue("opt_gt2").smallSidebars && w <= 1350) ||
        ( GM_getValue("opt_gt2").smallSidebars && w <= 1230)) {
      // move dash profile to right sidebar
      $(".gt2-dashboard-profile")
      .prependTo("div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div")
      // remove trends
      $(".gt2-trends").remove()
    } else {
      $(".gt2-dashboard-profile").prependTo(".gt2-left-sidebar")
    }
  })



  // ###############
  // #  scrolling  #
  // ###############


  // things to do when scrolling
  ;(function() {
    let prev = window.pageYOffset
    $(window).on("scroll", () => {
      let curr = window.pageYOffset
      if (prev < curr) {
        $("body").addClass("gt2-scrolled-down")
      } else {
        $("body").removeClass("gt2-scrolled-down")
      }
      prev = curr
    })
  }())



  // ################
  // #  URL change  #
  // ################


  // stuff to do when url changes
  function urlChange() {
    let path  = getPath()
    console.log(`Current path: ${path}`)


    // do a reload on these pages
    if (["login"].includes(path.split("/")[0])
      || (!isLoggedIn() && [""].includes(path.split("/")[0]))) {
      window.location.reload()
    }


    // update css
    if (!$("body").hasClass("gt2-css-inserted")) {
      updateCSS()
      $("body").addClass("gt2-css-inserted")
    }


    let mainView = "main > div > div > div"
    waitForKeyElements(mainView, function() {
      // insert left sidebar
      if (!$(".gt2-left-sidebar").length) {
        $(mainView).prepend(`<div class="gt2-left-sidebar"></div>`)
      }

      // on error page
      if ($(mainView).find("h1[data-testid=error-detail]").length
       && !path.startsWith("settings/gt2")) {
        $("body").addClass("gt2-page-error")
      } else {
        $("body").removeClass("gt2-page-error")
      }

      // settings
      if (path.split("/")[0] == "settings") {
        waitForKeyElements("main section a[href='/settings/about']", addSettingsToggle)
        if (path.startsWith("settings/gt2")) {
          addSettings()
        }
      }
    })


    // sidebar
    let sidebarContent = []

    // insert dashboard profile on all pages for now
    sidebarContent.push(getDashboardProfile())
    // update changelog
    if (!GM_getValue(`sb_notice_ack_update_${GM_info.script.version}`)
     && GM_getValue("opt_gt2").updateNotifications
    ) {
      sidebarContent.push(getUpdateNotice())
    }
    addToSidebar(sidebarContent)


    if (isLoggedIn()) {

      // add navbar
      if (!$("body").hasClass("gt2-navbar-added")) {
        addNavbar()
      }


      // highlight current location in left bar
      $(`.gt2-nav-left > a`).removeClass("active")
      $(`.gt2-nav-left > a[href^='/${path.split("/")[0]}']`).addClass("active")


      // hide/add search
      if (["explore", "search"].some(e => e == path.split("/")[0])) {
        $(".gt2-search").empty()
        $("body").removeClass("gt2-search-added")
        $("body").addClass("gt2-page-search")
      } else {
        $("body").removeClass("gt2-page-search")
        addSearch()
      }

    } else {
      $("body").addClass("gt2-not-logged-in")
    }


    // handle stuff in sidebars
    handleTrends()
    handleWhoToFollow()


    // settings
    if (path.split("/")[0] == "settings") {
      $("body").addClass("gt2-page-settings")
      if (path.startsWith("settings/gt2")) {
        $("body").addClass("gt2-page-settings-active")
      } else {
        if (window.innerWidth < 1005) {
          $("main section").remove()
        }
        $("body").removeClass("gt2-page-settings-active")
        $(".gt2-settings-header, .gt2-settings").remove()
      }
    } else {
      $("body").removeClass(["gt2-page-settings", "gt2-page-settings-active"])
      $(".gt2-settings-header, .gt2-settings").remove()
    }


    // messages
    if (path.split("/")[0] == "messages") {
      $("body").addClass("gt2-page-messages")
    } else {
      $("body").removeClass("gt2-page-messages")
    }


    // disableAutoRefresh
    if (GM_getValue("opt_gt2").disableAutoRefresh &&
        (path.split("/")[0] == "home" || path.match(/^[^\/]+\/lists/)) ) {
      hideTweetsOnAutoRefresh()
    }

    // force latest
    if (GM_getValue("opt_gt2").forceLatest && path.split("/")[0] == "home") {
      forceLatest()
    }

  }
  urlChange()


  // run urlChange() when history changes
  // https://github.com/Bl4Cc4t/GoodTwitter2/issues/96
  const exportFunc = typeof exportFunction === "function" ? exportFunction : (fn => fn)
  const pageWindow = unsafeWindow.wrappedJSObject || unsafeWindow
  const pageHistory = pageWindow.History.prototype

  const origPush = exportFunc(pageHistory.pushState, pageWindow)
  pageHistory.pushState = exportFunc(function () {
    origPush.apply(this, arguments)
    urlChange()
  }, pageWindow)

  const origRepl = exportFunc(pageHistory.replaceState, pageWindow)
  pageHistory.replaceState = exportFunc(function () {
    origRepl.apply(this, arguments)
    urlChange()
  }, pageWindow)

  window.addEventListener("popstate", function() {
    urlChange()
  })

})(jQuery, waitForKeyElements)

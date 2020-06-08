// ==UserScript==
// @name          GoodTwitter 2 - Electric Boogaloo
// @version       0.0.21
// @description   A try to make Twitter look good again
// @author        schwarzkatz
// @match         https://twitter.com/*
// @grant         GM_getResourceText
// @grant         GM_getResourceURL
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_info
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


  // get localized version of a string.
  // defaults to english version.
  function locStr(key) {
    let lang = $("html").attr("lang")
        lang = Object.keys(i18n).includes(lang) ? lang : "en"
    if (Object.keys(i18n[lang]).includes(key)) {
      return i18n[lang][key]
    } else {
      return i18n.en[key]
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
      arrow: `<g><path d="M20.207 8.147c-.39-.39-1.023-.39-1.414 0L12 14.94 5.207 8.147c-.39-.39-1.023-.39-1.414 0-.39.39-.39 1.023 0 1.414l7.5 7.5c.195.196.45.294.707.294s.512-.098.707-.293l7.5-7.5c.39-.39.39-1.022 0-1.413z"></path></g>`,
      tick: `<g><path d="M9 20c-.264 0-.52-.104-.707-.293l-4.785-4.785c-.39-.39-.39-1.023 0-1.414s1.023-.39 1.414 0l3.946 3.945L18.075 4.41c.32-.45.94-.558 1.395-.24.45.318.56.942.24 1.394L9.817 19.577c-.17.24-.438.395-.732.42-.028.002-.057.003-.085.003z"></path></g>`,
      moon: `<g><path d="M 13.277344 24 C 16.976562 24 20.355469 22.316406 22.597656 19.554688 C 22.929688 19.148438 22.566406 18.550781 22.054688 18.648438 C 16.234375 19.757812 10.886719 15.292969 10.886719 9.417969 C 10.886719 6.03125 12.699219 2.917969 15.644531 1.242188 C 16.097656 0.984375 15.984375 0.296875 15.46875 0.199219 C 14.746094 0.0664062 14.011719 0 13.277344 0 C 6.652344 0 1.277344 5.367188 1.277344 12 C 1.277344 18.625 6.644531 24 13.277344 24 Z M 13.277344 24 "/></g>`,
      x: `<g><path d="M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z"></path></g>`
    }
    return `
      <svg class="gt2-svg" viewBox="0 0 24 24">
        ${svgs[key]}
      </svg>`
  }



  // #######################
  // #  various functions  #
  // #######################


  // add navbar
  function addNavbar() {
    let navHome = `nav > a[href='/home'],
                   nav > a[href='/notifications'],
                   nav > a[href='/messages']`

    waitForKeyElements(navHome, () => {
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
              <img src="${getInfo().avatarUrl.replace("normal", "bigger")}" />
            </div>
            <div class="gt2-compose">${locStr("composeNewTweet")}</div>
          </div>
        </nav>
      `)

      // home, notifications, messages
      $(navHome)
      .appendTo(".gt2-nav-left")
      urlChange()

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


  // profile view left sidebar
  function addDashboardProfile() {
    let w = window.innerWidth
    let insertAt = ".gt2-left-sidebar"

    // insert into the right sidebar
    if ((!GM_getValue("opt_gt2").smallSidebars && w <= 1350) ||
        ( GM_getValue("opt_gt2").smallSidebars && w <= 1230)) {
      insertAt = "div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div"
    }

    if ($(insertAt).find(".gt2-dashboard-profile").length == 0) {
      let i = getInfo()
      // console.log(`userInformation:\n${JSON.stringify(i, null, 2)}`)
      let href = isLoggedIn() ? "href" : "data-href"
      let dashPro = `
        <div class="gt2-dashboard-profile ${w <= 1095 ? "gt2-small": ""}">
          <a ${href}="/${i.screenName}" class="gt2-banner" style="background-image: ${i.bannerUrl ? `url(${i.bannerUrl}/600x200)` : "unset"};"></a>
          <div>
            <a ${href}="/${i.screenName}" class="gt2-avatar">
              <img src="${i.avatarUrl.replace("normal", "bigger")}"/>
            </a>
            <div class="gt2-user">
              <a ${href}="/${i.screenName}" class="gt2-name">${i.name}</a>
              <a ${href}="/${i.screenName}" class="gt2-screenname">
                @<span >${i.screenName}</span>
              </a>
            </div>
            <div class="gt2-toggle-${isLoggedIn() ? "acc-switcher-dropdown" : "lo-nightmode" }">
              <div></div>
              ${getSvg(isLoggedIn() ? "arrow" : "moon")}
            </div>
            <div class="gt2-stats">
              <ul>
                <li>
                  <a ${href}="/${i.screenName}">
                    <span>${locStr("tweets")}</span>
                    <span>${i.stats.tweets.humanize()}</span>
                  </a>
                </li>
                <li>
                  <a ${href}="/${i.screenName}/following">
                    <span>${locStr("following")}</span>
                    <span>${i.stats.following.humanize()}</span>
                  </a>
                </li>
                <li>
                  <a ${href}="/${i.screenName}/followers">
                    <span>${locStr("followers")}</span>
                    <span>${i.stats.followers.humanize()}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `

      waitForKeyElements(`${insertAt}`, () => {
        if (insertAt.startsWith(".gt2")) {
          $(insertAt).prepend(dashPro)
        } else {
          $(dashPro).insertAfter(`${insertAt} > div:empty:nth-child(2)`)
        }
      })
    }
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


  // handle trends (move and show10)
  function handleTrends() {
    let w = window.innerWidth
    let trends = `div[data-testid=sidebarColumn] div:nth-child(4) > div[data-testid=trend],
                  .gt2-left-sidebar div:nth-child(4) > div[data-testid=trend]`

    waitForKeyElements(trends, function() {
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
    })
  }


  // wrap trending stuff in anchors
  function wrapTrends() {
    $("div > div > div[data-testid=trend] > div > div:nth-child(2) > span").each(function() {
      let ht = $(this).text()
      $(this).html(`<a class="gt2-trend" href="/search?q=${ht.includes("#") ? encodeURIComponent(ht).replace(/'/g, "%27") : `%22${ht}%22` }">${ht}</a>`)
    })
  }



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
      let $lm = $("header > div > div > div:last-child > div:first-child > div:nth-child(2) > nav") // left sidebar
      console.log("fmrpe");
      $hr.clone().prependTo(more)
      // items from left menu to attach
      let toAttach = [
        {
          sel: `a[href='/explore']`,
          name: "explore"
        }, {
          sel: `a[href='/i/bookmarks']`,
          name: "bookmarks"
        }, {
          sel: `a[href='/${i.screenName}/lists']`,
          name: "lists"
        }, {
          sel: `a[href='/${i.screenName}']`,
          name: "profile"
        }
      ]
      for (let e of toAttach) {
        let $tmp = $lm.find(e.sel).clone()
        // if the width is too low, the text disappears
        if (window.innerWidth < 1282) {
          $tmp.children().append(`<span>${locStr(e.name)}</span>`)
        }
        $tmp.prependTo(more)
      }
    })

  })


  // acc switcher dropdown
  $("body").on("click", ".gt2-toggle-acc-switcher-dropdown", () => {
    $("body").addClass("gt2-acc-switcher-active")
    $("div[data-testid=SideNav_AccountSwitcher_Button]").click()
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



  // ###################
  // #  GT2 settings   #
  // ###################


  // custom options and their default values
  const opt_gt2 = {
    disableAutoRefresh: false,
    forceLatest:        false,
    keepTweetsInTL:     true,
    smallSidebars:      false,
    stickySidebars:     true,
    leftTrends:         true,
    squareAvatars:      false,
    biggerPreviews:     false,
    show10Trends:       false,
  }

  // set default options
  if (GM_getValue("opt_gt2") == undefined) GM_setValue("opt_gt2", opt_gt2)

  // add previously non existant options
  if (Object.keys(GM_getValue("opt_gt2")).length != Object.keys(opt_gt2).length) {
    let old = GM_getValue("opt_gt2")
    for (let k of Object.keys(opt_gt2)) {
      if (Object.keys(old).includes(k)) delete opt_gt2[k]
    }
    Object.apply(old, opt_gt2)
    GM_setValue("opt_gt2", old)
  }

  // toggles opt_gt2 values
  function toggleGt2Opt(key) {
    let x = GM_getValue("opt_gt2")
    x[key] = !x[key]
    GM_setValue("opt_gt2", x)
  }


  // insert the menu item
  function addSettingsToggle() {
    waitForKeyElements("main a[href='/settings/about']", () => {
      if (!$(".gt2-toggle-settings").length) {
        $("main div[role=tablist], main div[data-testid=loggedOutPrivacySection]").append(`
          <a class="gt2-toggle-settings" href="/settings/gt2">
            <div>
              <span>GoodTwitter2</span>
              ${getSvg("arrow")}
            </div>
          </a>
        `)
      }
    })
  }


  // toggle settings display
  $("body").on("click", ".gt2-toggle-settings", function(event) {
    event.preventDefault()
    window.history.pushState({}, "", $(this).attr("href"))
    addSettings()
    $("body").addClass("gt2-settings-active")
    changeSettingsTitle()
  })


  // disable settings display again when clicking on another menu item
  $("body").on("click", `main section:nth-last-child(2) div[role=tablist] a:not(.gt2-toggle-settings),
                         main section:nth-last-child(2) div[data-testid=loggedOutPrivacySection] a:not(.gt2-toggle-settings)`, () => {
    $(".gt2-settings-active").removeClass("gt2-settings-active")
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
      $("main section:nth-last-child(1)").prepend(`
        <div class="gt2-settings-header">GoodTwitter2</div>
        <div class="gt2-settings">
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderTimeline")}</div>
          ${getSettingTogglePart("forceLatest")}
          ${getSettingTogglePart("disableAutoRefresh")}
          ${getSettingTogglePart("keepTweetsInTL")}
          <div class="gt2-settings-seperator"></div>
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderSidebars")}</div>
          ${getSettingTogglePart("stickySidebars")}
          ${getSettingTogglePart("smallSidebars")}
          ${getSettingTogglePart("leftTrends")}
          ${getSettingTogglePart("show10Trends")}
          <div class="gt2-settings-seperator"></div>
          <div class="gt2-settings-sub-header">${locStr("settingsHeaderOther")}</div>
          ${getSettingTogglePart("squareAvatars")}
          ${getSettingTogglePart("biggerPreviews")}
        </div>
      `)

      handleKTILOpt()
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
    handleKTILOpt()
  })


  // when autoRefresh is on, keepTweetsInTL must also be on and can not be deactivated (it is disabled)
  function handleKTILOpt() {
    let $t = $("div[data-toggleid=keepTweetsInTL]")
    if (GM_getValue("opt_gt2").autoRefresh) {
      if (!GM_getValue("opt_gt2").keepTweetsInTL) {
        $t.click()
      }
      $t.addClass("gt2-disabled")
    } else {
      $t.removeClass("gt2-disabled")
    }
  }



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
    let $t = jQuery("<div/>").css({
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
  async function updateCSS() {
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

    if (w <= 1095) {
      $(".gt2-dashboard-profile").addClass("gt2-small")
    } else {
      $(".gt2-dashboard-profile").removeClass("gt2-small")
    }
  })



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


    // insert left sidebar
    if (!$(".gt2-left-sidebar").length) {
      let insertAt = "main > div > div > div"
      waitForKeyElements(insertAt, function() {
        $(insertAt).prepend(`<div class="gt2-left-sidebar"></div>`)
      })
    }


    // insert dashboard profile on all pages for now
    addDashboardProfile()


    if (isLoggedIn()) {

      // add navbar
      if (!$("body").hasClass("gt2-navbar-added")) {
        addNavbar()
      }


      // highlight current location in left bar
      $(`.gt2-nav-left > a`).removeClass("active")
      $(`.gt2-nav-left > a[href='/${path.split("/")[0]}']`).addClass("active")


      // hide/add search
      if (["explore", "search"].some(e => path.startsWith(e))) {
        $(".gt2-search").empty()
        $("body").removeClass("gt2-search-added")
      } else {
        addSearch()
      }

    } else {
      $("body").addClass("gt2-not-logged-in")
    }


    // firefox csp notice
    if (!$(".gt2-sidebar-notice").length
      && typeof InstallTrigger !== "undefined"  // on firefox
      && GM_info.scriptHandler == "Tampermonkey"
      && parseInt(GM_info.version.replace(/\./g, "")) < 4116114
      && !GM_getValue("ff_csp_acknowledged")
    ) {
      $(".gt2-left-sidebar").prepend(`
        <div class="gt2-sidebar-notice" id="ff-csp-notice">
          <div class="gt2-sidebar-notice-header">
            GoodTwitter 2 Notice
            <div class="gt2-sidebar-notice-close">
              <div></div>
              ${getSvg("x")}
            </div>
          </div>
          <div class="gt2-sidebar-notice-content">
            It looks like you’re on Firefox and do not use the latest Tampermonkey version! <br />
            <a href="https://github.com/Tampermonkey/tampermonkey/issues/952#issuecomment-639909754">Since TM Beta 4.11.6114</a>, you do not have to disable the <code>security.csp.enable</code> flag anymore. <br />
            It is highly recommended to reenable the flag and reinstall the Script with TM Beta >= 4.11.6114! <br />
            <a href="https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/firefox-csp.md">Click here to learn more.</a>
          </div>
        </div>
      `)
      $("body").on("click", "#ff-csp-notice .gt2-sidebar-notice-close", function() {
        GM_setValue("ff_csp_acknowledged", true)
        $(this).parents(".gt2-sidebar-notice").remove()
      })
    }


    // handle trends
    handleTrends()


    // add gt2 settings on /settings
    if (path.split("/")[0] == "settings") {
      addSettingsToggle()
      if (path.startsWith("settings/gt2")) {
        addSettings()
        $("body").addClass("gt2-settings-active")
      }
    } else {
      $("body").removeClass("gt2-settings-active")
    }


    // sectionated pages need special attention on some properties
    if (path.split("/")[0] == "messages" ||
        (path.split("/")[0] == "settings" && !["trends", "profile"].includes(path.split("/")[1])) ) {
      $("body").addClass("gt2-page-with-sections")
    } else if (!path.startsWith("i/")) {
      $("body").removeClass("gt2-page-with-sections")
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

    // wrap trends
    waitForKeyElements("div[data-testid=trend]", wrapTrends)


  }
  urlChange()

  // run urlChange() when history changes
  let origPush = window.history.pushState
  window.history.pushState = function() {
    origPush.apply(window.history, arguments)
    urlChange()
  }

  let origRepl = window.history.replaceState
  window.history.replaceState = function() {
    origRepl.apply(window.history, arguments)
    urlChange()
  }

  window.addEventListener("popstate", function(event) {
    urlChange()
  })

})(jQuery, waitForKeyElements)

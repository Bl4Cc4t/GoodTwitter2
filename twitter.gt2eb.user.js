// ==UserScript==
// @name          GoodTwitter 2 - Electric Boogaloo
// @version       0.0.8
// @description   A try to make Twitter look good again
// @author        schwarzkatz
// @match         https://twitter.com/*
// @grant         GM_addStyle
// @grant         GM_getResourceText
// @grant         GM_getValue
// @grant         GM_setValue
// @resource      css https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.style.css
// @require       https://code.jquery.com/jquery-3.5.1.min.js
// @require       https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL     https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// @downloadURL   https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// ==/UserScript==

(function($, waitForKeyElements) {
  "use strict"

  // seperate number with commas
  function humanizeNumber(n) {
    let t = n.toString().split("")
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
  function humanizeNumberShort(n) {
    let t = n.toString()
    if (n >= 1000000) {
      t = t.slice(0, -5)
      return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}M`
    } else if (n >= 10000) {
      t = t.slice(0, -2)
      return `${t.slice(0, -1)}${t.slice(-1) != 0 ? `.${t.slice(-1)}` : ""}K`
    } else return humanizeNumber(n)
  }

  // get account information
  function getInfo() {
    let sel = "#react-root + script"
    let infoScript = $(sel).text()
    return {
      bannerUrl:  infoScript.match(/profile_banner_url\":\"(.+?)\",/)[1],
      avatarUrl:  infoScript.match(/profile_image_url_https\":\"(.+?)\",/)[1],
      screenName: infoScript.match(/screen_name\":\"(.+?)\",/)[1],
      name:       infoScript.match(/name\":\"(.+?)\",/)[1],
      stats: {
        tweets:    infoScript.match(/statuses_count\":(\d+),/)[1],
        followers: infoScript.match(/\"followers_count\":(\d+),/)[1],
        following: infoScript.match(/friends_count\":(\d+),/)[1],
      }
    }
  }

  // default values
  if (!GM_getValue("userColor"))                   GM_setValue("userColor",       "rgba(29,161,242,1.00)")
  if (!GM_getValue("bgColor"))                     GM_setValue("bgColor",         "dim")
  if (!GM_getValue("scrollbarWidth"))              GM_setValue("scrollbarWidth",  window.innerWidth - $("html")[0].clientWidth)
  if (GM_getValue("opt_autoRefresh") == undefined) GM_setValue("opt_autoRefresh", false)
  if (GM_getValue("opt_forceLatest") == undefined) GM_setValue("opt_forceLatest", false)

  // insert navbar
  $("body").prepend(`
    <nav class="gt2-nav">
      <div class="gt2-nav-left"></div>
      <div class="gt2-nav-center">
        <a href="/home"></a>
      </div>
      <div class="gt2-nav-right">
        <div class="gt2-search"></div>
        <div class="gt2-user-dropdown"></div>
      </div>
    </nav>
  `)

  let navHome = `nav > a[href='/home'],
                 nav > a[href='/notifications'],
                 nav > a[href='/messages']`

  GM_setValue("hasRun_insertIntoNavbar", false)
  waitForKeyElements(navHome, () => {
    if (GM_getValue("hasRun_insertIntoNavbar") == true) return
    else GM_setValue("hasRun_insertIntoNavbar", true)

    // home, notifications, messages
    $(navHome)
    .appendTo(".gt2-nav-left")
    urlChange()

    // twitter logo
    $("h1 a[href='/home'] svg")
    .appendTo(".gt2-nav-center a")

    // tweet button
    $("a[href='/compose/tweet']")
    .appendTo(".gt2-nav-right")

    // user dropdown
    $("nav > div[data-testid=AppTabBar_More_Menu]")
    .addClass("gt2-more")
    .appendTo(".gt2-user-dropdown")
    $(".gt2-more").append(`<img src="" />`)

    $(".gt2-user-dropdown img").attr("src", getInfo().avatarUrl.replace("normal", "bigger"))

    updateCSS()
  })


  // add search
  function addSearch() {
    // remove moved search bar
    function rem() {
      if ($(".gt2-search").length) {
        $(".gt2-search").empty()
      }
    }

    // on /search is already a search bar in the center
    if (window.location.href.split("/")[3].split("?")[0] == "search") {
      rem()
    } else {
      let search = "div[data-testid=sidebarColumn] > div > div:eq(1) > div > div > div > div:eq(0)"
      waitForKeyElements(`${search} input[data-testid=SearchBox_Search_Input]`, () => {

        // remove if added previously
        rem()

        // add search
        $(search)
        .prependTo(".gt2-search")
      })
    }
  }


  // profile view left sidebar
  function addDashboardProfile() {
    let insertAt = "header > div > div"
    if ($(insertAt).find(".gt2-dashboard-profile").length == 0) {
      let i = getInfo()
      GM_setValue("banner", `url(${i.bannerUrl}/600x200)`)
      $(insertAt).prepend(`
        <div class="gt2-dashboard-profile">
          <a href="/${i.screenName}" class="gt2-banner"></a>
          <div>
            <a class="gt2-avatar" href="/${i.screenName}">
              <img src="${i.avatarUrl.replace("normal", "bigger")}"/>
            </a>
            <div class="gt2-user">
              <a href="/${i.screenName}" class="gt2-name">${i.name}</a>
              <a href="/${i.screenName}" class="gt2-screenname">
                @<span >${i.screenName}</span>
              </a>
            </div>
            <div class="gt2-stats">
              <ul>
                <li>
                  <a href="/${i.screenName}">
                    <span>Tweets</span>
                    <span>${humanizeNumberShort(i.stats.tweets)}</span>
                  </a>
                </li>
                <li>
                  <a href="/${i.screenName}/following">
                    <span>Following</span>
                    <span>${humanizeNumberShort(i.stats.following)}</span>
                  </a>
                </li>
                <li>
                  <a href="/${i.screenName}/followers">
                    <span>Followers</span>
                    <span>${humanizeNumberShort(i.stats.followers)}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `)

      updateCSS()
    }
  }


  // hide navbar on modal
  let obsModal = new MutationObserver(() => {
    if ($("body").css("overflow-y") == "hidden") {
      $(".gt2-nav").addClass("not-focused")

    } else {
      $(".gt2-nav").removeClass("not-focused")
    }
  })
  obsModal.observe($("body")[0], {
    attributes: true,
    attributeFilter: [ "style" ]
  })


  // add elements to dropdow menu
  $(".gt2-user-dropdown").click(() => {
    let i = getInfo()
    $("header nav > div[data-testid=AppTabBar_More_Menu]").click()
    let more = "div[role=menu][style^='max-height: calc(100vh - 0px);'] > div > div > div, div[role=menu][style^='max-height: calc(0px + 100vh);'] > div > div > div"

    waitForKeyElements(more, () => {
      let $hr = $(more).find("> div:eq(-4)")
      let $lm = $("header > div > div > div:eq(-1) > div:eq(0) > div:eq(1) > nav")

      $hr.clone().prependTo(more)
      $lm.find(`a[href='/explore']`)              .clone().prependTo(more) // explore
      $lm.find(`a[href='/i/bookmarks']`)          .clone().prependTo(more) // bookmarks
      $lm.find(`a[href='/${i.screenName}/lists']`).clone().prependTo(more) // lists
      $lm.find(`a[href='/${i.screenName}']`)      .clone().prependTo(more) // profile
      $hr.clone().appendTo(more)
      $(more).append(`
        <a class="gt2-acc-opt" href="/account/add">Add an existing account</a>
        <a class="gt2-acc-opt" href="/logout">Logout @${i.screenName}</a>
      `)

    })
  })


  // ########################
  // #   display settings   #
  // ########################


  // display settings
  let displaySettings = "main > div > div > div > section:nth-child(2) > div:nth-child(2)"
  let displaySettingsModal = "#react-root > div > div > div:nth-child(2) > div:nth-child(2) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div"
  $("body").on("click", `${displaySettings} > div:nth-child(8) > div > div[role=radiogroup] > div > label,
                         ${displaySettingsModal} > div:nth-child(6) > div > div[role=radiogroup] > div > label`, function() {
    let userColor = $(this).find("svg").css("color")
    GM_setValue("userColor", userColor)
    updateCSS()
  })
  $("body").on("click", `${displaySettings} > div:nth-child(11) > div > div[role=radiogroup] > div,
                         ${displaySettingsModal} > div:nth-child(8) > div > div[role=radiogroup] > div`, function() {
    let bgColor = {
      "rgb(255, 255, 255)": "default",
      "rgb(21, 32, 43)":    "dim",
      "rgb(0, 0, 0)":       "lightsOut"
    }[$(this).css("background-color")]
    GM_setValue("bgColor", bgColor)
    updateCSS()
  })


  // ######################
  // #   spark settings   #
  // ######################

  let sparkOptToggle  = "div[data-testid=primaryColumn] > div > div:nth-child(1) > div:nth-child(1) > div > div > div > div > div:nth-child(2) > div"
  let sparkOpt        = "#react-root > div > div > div:nth-of-type(1) > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(3) > div > div > div"
  // add custom toggles to the spark settings
  $("body").on("click", sparkOptToggle, () => {
    waitForKeyElements(sparkOpt, () => {
      let lightningSvg = `
        <svg viewBox="0 0 24 24">
          <g>
            <path d="M8.98 22.698c-.103 0-.205-.02-.302-.063-.31-.135-.49-.46-.44-.794l1.228-8.527H6.542c-.22 0-.43-.098-.573-.266-.144-.17-.204-.393-.167-.61L7.49 2.5c.062-.36.373-.625.74-.625h6.81c.23 0 .447.105.59.285.142.18.194.415.14.64l-1.446 6.075H19c.29 0 .553.166.678.428.124.262.087.57-.096.796L9.562 22.42c-.146.18-.362.276-.583.276zM7.43 11.812h2.903c.218 0 .425.095.567.26.142.164.206.382.175.598l-.966 6.7 7.313-8.995h-4.05c-.228 0-.445-.105-.588-.285-.142-.18-.194-.415-.14-.64l1.446-6.075H8.864L7.43 11.812z"></path>
          </g>
        </svg>`

      $(sparkOpt).append(`
        <div class="gt2-spark-toggle gt2-toggle-auto-refresh">
          ${lightningSvg}
          <div>${GM_getValue("opt_autoRefresh") ? "Dis" : "En"}able Auto Refresh</div>
        </div>
        <div class="gt2-spark-toggle gt2-toggle-force-latest">
          ${lightningSvg}
          <div>${GM_getValue("opt_forceLatest") ? "Dis" : "En"}able Force Latest</div>
        </div>
      `)
    })
  })


  // toggle autoRefresh
  $("body").on("click", ".gt2-toggle-auto-refresh", () => {
    GM_setValue("opt_autoRefresh", !GM_getValue("opt_autoRefresh"))
    window.location.reload()
  })

  // toggle forceLatest
  $("body").on("click", ".gt2-toggle-force-latest", () => {
    GM_setValue("opt_forceLatest", !GM_getValue("opt_forceLatest"))
    window.location.reload()
  })


  // ##########
  // #  rest  #
  // ##########


  // add counter for new tweets
  function updateNewTweetDisplay() {
    let nr = $(".gt2-hidden-tweet").length
    let text = `Show ${nr} new Tweet${nr > 1 ? "s" : ""}`
    if (nr) {
      // add button
      if ($(".gt2-show-hidden-tweets").length == 0) {
        $("div[data-testid=primaryColumn] > div > div:nth-child(3)").addClass("gt2-show-hidden-tweets")
      }
      $(".gt2-show-hidden-tweets").html(text)
    } else {
      $(".gt2-show-hidden-tweets").empty().removeClass("gt2-show-hidden-tweets")
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


  // observe and hide auto refreshed tweets
  function hideTweetsOnAutoRefresh() {
    let obsTL = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.addedNodes.length == 1) {
          let $t = $(m.addedNodes[0])
          if ($t.find("div > div > div > div > article div[data-testid=tweet]").length && $t.nextAll().find(`a[href='${GM_getValue("topTweet")}']`).length) {
            if ($t.find("div[data-testid=tweet] > div:nth-child(1) > div:nth-child(2)").length && $t.next().find("> div > div > div > a[href^='/i/status/']").length) {
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
    let tlSel = "div[data-testid=primaryColumn] > div > div:nth-child(4) section > div > div > div"
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
  if (!GM_getValue("opt_autoRefresh")) hideTweetsOnAutoRefresh()


  // force latest tweets view.
  function forceLatest() {
    let tmp = GM_addStyle(`
      ${sparkOpt} {
        display: none;
      }
    `)

    GM_setValue("hasRun_forceLatest", false)
    waitForKeyElements(sparkOptToggle, () => {
      $(sparkOptToggle).click()

      waitForKeyElements(sparkOpt+" a[href='/settings/content_preferences']", () => {
        if (!GM_getValue("hasRun_forceLatest")) {
          GM_setValue("hasRun_forceLatest", true)
          if ($(sparkOpt).find("> div:nth-child(1) path").length == 3) {
            $(sparkOpt).children().eq(1).click()
          } else {
            $(sparkOptToggle).click()
          }
          $(tmp).remove()
        }
      })
    })
  }
  if (GM_getValue("opt_forceLatest")) forceLatest()


  // wrap trending stuff in anchors
  function wrapTrends() {
    $("div > div > div[data-testid=trend] > div > div:nth-child(2) > span").each(function() {
      let ht = $(this).text()
      $(this).html(`<a class="gt2-trend" href='/search?q=${ht.includes("#") ? encodeURIComponent(ht) : `"${ht}"` }'>${ht}</a>`)
    })
  }
  waitForKeyElements("div[data-testid=trend]", wrapTrends)


  // minimize the “What’s happening?” field by default
  $("body").on("click", "div[data-testid=primaryColumn] > div > div:nth-child(2)", e => $(e.currentTarget).addClass("gt2-compose-large"))


  // ################
  // #  Update CSS  #
  // ################


  // update inserted CSS
  function updateCSS() {
    // delete old stylesheet
    let id = GM_getValue("styleId")
    if ($(`#${id}`).length) {
      $(`#${id}`).remove()
    }

    // bgColor schemes
    let bgColors = {
      default:   `--color-bg:         #e6ecf0;
                  --color-elem:       #ffffff;
                  --color-elem-dark:  #ffffff;
                  --color-elem-sel:   rgb(245, 248, 255);
                  --color-gray:       #8899a6;
                  --color-gray-dark:  #e6ecf0;
                  --color-text:       #14171a;`,

      dim:       `--color-bg:         #10171e;
                  --color-elem:       #1c2938;
                  --color-elem-dark:  #15202b;
                  --color-elem-sel:   rgb(25, 39, 52);
                  --color-gray:       #657786;
                  --color-gray-dark:  #38444d;
                  --color-gray-icons: rgb(136, 153, 166);
                  --color-text:       #ffffff;`,

      lightsOut: `--color-bg:         #000000;
                  --color-elem:       #15181c;
                  --color-elem-dark:  #15181c;
                  --color-elem-sel:   rgb(21, 24, 28);
                  --color-gray:       #657786;
                  --color-gray-dark:  #38444d;
                  --color-gray-icons: rgb(110, 118, 125);
                  --color-text:       rgb(217, 217, 217);`
    }

    // insert new stylesheet
    let a = GM_addStyle(
      GM_getResourceText("css")
      .replace("--bgColors:$;",   bgColors[GM_getValue("bgColor")])
      .replace("$userColor",      GM_getValue("userColor"))
      .replace("$banner",         GM_getValue("banner"))
      .replace("$scrollbarWidth", `${GM_getValue("scrollbarWidth")}px`)
    )

    GM_setValue("styleId", $(a).attr("id"))
  }


  // ################
  // #  URL change  #
  // ################


  // stuff to do when url changes
  function urlChange() {
    // highlight current location in left bar
    let url = window.location.href.split("/")
    let path  = url.length > 3 ? url[3].split("?")[0] : ""
    let path2 = url.length > 4 ? url[4].split("?")[0] : ""
    console.log(path);
    $(`.gt2-nav-left > a`).removeClass("active")
    $(`.gt2-nav-left > a[href='/${path}']`).addClass("active")

    // insert dashboard profile only on these pages
    if ([
      "compose",
      "home",
      "i",
      "messages",
      "notifications",
      "search",
      "settings",
    ].includes(path) || [
      "bookmarks",
      "lists",
      "moments",
      "status",
      "topics",
    ].includes(path2)) {
      addDashboardProfile()
    } else {
      $(".gt2-dashboard-profile").remove()
    }

    // readd search
    addSearch()
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

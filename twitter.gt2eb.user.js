// ==UserScript==
// @name          GoodTwitter 2 - Electric Boogaloo
// @version       0.0.6
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
  if (!GM_getValue("userColor"))      GM_setValue("userColor",      "rgba(29,161,242,1.00)")
  if (!GM_getValue("bgColor"))        GM_setValue("bgColor",        "dim")
  if (!GM_getValue("scrollbarWidth")) GM_setValue("scrollbarWidth", window.innerWidth - $("html")[0].clientWidth)

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

  GM_setValue("hasRun", false)
  waitForKeyElements(navHome, () => {
    if (GM_getValue("hasRun") == true) return
    else GM_setValue("hasRun", true)

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
  let obs = new MutationObserver(() => {
    if ($("body").css("overflow-y") == "hidden") {
      $(".gt2-nav").addClass("not-focused")

    } else {
      $(".gt2-nav").removeClass("not-focused")
    }
  })
  obs.observe($("body")[0], {
    attributes: true,
    attributeFilter: [ "style" ]
  })


  // add elements to dropdown
  $(".gt2-user-dropdown").click(function() {
    console.log("dropdown button");
    let i = getInfo()
    $("header nav > div[data-testid=AppTabBar_More_Menu]").click()
    let more = "div[role=menu][style^='max-height: calc(100vh - 0px);'] > div > div > div, div[role=menu][style^='max-height: calc(0px + 100vh);'] > div > div > div"

    waitForKeyElements(more, () => {
      let $hr = $(more).find("> div:eq(-4)")
      let $lm = $("header > div > div > div:eq(-1) > div:eq(0) > div:eq(1) > nav")

      $hr.clone().prependTo(more)
      $lm.find(`a[href='/explore']`).clone().prependTo(more)                  // explore
      $lm.find(`a[href='/i/bookmarks']`).clone().prependTo(more)              // bookmarks
      $lm.find(`a[href='/${i.screenName}/lists']`).clone().prependTo(more)    // lists
      $lm.find(`a[href='/${i.screenName}']`).clone().prependTo(more)          // profile
      $hr.clone().appendTo(more)
      $(more).append(`
        <a class="gt2-acc-opt" href="/account/add">Add an existing account</a>
        <a class="gt2-acc-opt" href="/logout">Logout @${i.screenName}</a>
      `)

    })
  })


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


  // wrap trends in anchors
  function wrapTrends() {
    $("div > div > div[data-testid=trend]").each(function() {
      let ht = $(this).find("> div > div:nth-child(2) > span").text()
      $(this).parent().wrap(`<a class="gt2-trend" href='/search?q=${ht.includes("#") ? encodeURIComponent(ht) : `"${ht}"` }'></a>`)
    })
  }
  waitForKeyElements("div[data-testid=trend]", wrapTrends)
  // $("body").on("click", "")


  // update inserted CSS
  function updateCSS() {
    // delete old stylesheet
    let id = GM_getValue("styleId")
    if ($(`#${id}`).length) {
      $(`#${id}`).remove()
    }

    // bgColor schemes
    let bgColors = {
      default:   `--color-bg:        #e6ecf0;
                  --color-elem:      #ffffff;
                  --color-elem-dark: #ffffff;
                  --color-gray:      #8899a6;
                  --color-gray-dark: #e6ecf0;
                  --color-text:      #14171a;`,
      dim:       `--color-bg:        #10171e;
                  --color-elem:      #1c2938;
                  --color-elem-dark: #15202b;
                  --color-gray:      #657786;
                  --color-gray-dark: #38444d;
                  --color-text:      #ffffff;`,
      lightsOut: `--color-bg:        #000000;
                  --color-elem:      #15181c;
                  --color-elem-dark: #15181c;
                  --color-gray:      #657786;
                  --color-gray-dark: #38444d;
                  --color-text:      #ffffff;`
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

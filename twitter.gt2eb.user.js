// ==UserScript==
// @name          GoodTwitter 2 - Electric Boogaloo
// @version       0.0.43
// @description   A try to make Twitter look good again.
// @author        schwarzkatz
// @license       MIT
// @match         https://twitter.com/*
// @match         https://mobile.twitter.com/*
// @exclude       https://twitter.com/i/cards/*
// @exclude       https://twitter.com/i/release_notes
// @exclude       https://twitter.com/*/privacy
// @exclude       https://twitter.com/*/tos
// @exclude       https://twitter.com/account/access
// @grant         GM_deleteValue
// @grant         GM_getResourceText
// @grant         GM_getResourceURL
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_info
// @grant         GM_xmlhttpRequest
// @connect       api.twitter.com
// @resource      css https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.style.css
// @resource      emojiRegex https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/data/emoji-regex.txt
// @resource      pickrCss https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css
// @require       https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.i18n.js
// @require       https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.polyfills.js
// @require       https://code.jquery.com/jquery-3.5.1.min.js
// @require       https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require       https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.es5.min.js
// @updateURL     https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// @downloadURL   https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js
// ==/UserScript==

(function($, waitForKeyElements) {
  "use strict"

  // do not execute on these pages
  if (getPath().match(/^login(\?.*)?$/) || (!isLoggedIn() && getPath().match(/^(\?.*)?$/))) {
    return
  }

  // redirect for mobile urls
  if (window.location.host == "mobile.twitter.com") {
    if (GM_getValue("opt_gt2").mobileRedirect) {
      window.location.href = window.location.href.replace("//mobile.twitter.com", "//twitter.com")
    } else return
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
    let arr = this.toString().split("")
    return arr.map((e, i) => {
      let add_dash = i > 0
        && ((!isNaN(e) && isNaN(arr[i-1]))
         || (isNaN(e) && !isNaN(arr[i-1]))
         || (isNaN(e) && e == e.toUpperCase()))
      return `${add_dash ? "-" : ""}${e.toLowerCase()}`
    }).join("")
  }

  String.prototype.replaceAt = function(index, length, text) {
    return `${this.toString().slice(0, index)}${text}${this.toString().slice(index + length)}`
  }

  String.prototype.insertAt = function(index, text) {
    return this.toString().replaceAt(index, 0, text)
  }

  const defaultAvatarUrl = "https://abs.twimg.com/sticky/default_profile_images/default_profile.png"
  const emojiRegexp = new RegExp(`(${GM_getResourceText("emojiRegex")})`, "gu")


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
      avatarUrl:  x(/profile_image_url_https\":\"(.+?)\",/, defaultAvatarUrl),
      screenName: x(/screen_name\":\"(.+?)\",/, "youarenotloggedin"),
      name:       x(/(?:true|false),\"name\":\"(.+?)\",/, x(/screen_name\":\"(.+?)\",/, "Anonymous")),
      id:         x(/id_str\":\"(\d+)\"/, "0"),
      stats: {
        tweets:    parseInt(x(/statuses_count\":(\d+),/, "0")),
        followers: parseInt(x(/\"followers_count\":(\d+),/, "0")),
        following: parseInt(x(/friends_count\":(\d+),/, "0")),
      }
    }
  }


  // get current display language
  function getLang() {
    return $("html").attr("lang").trim()
  }


  // check if the user is logged in
  function isLoggedIn() {
    return document.cookie.match(/twid=u/)
  }


  // get localized version of a string.
  // defaults to english version.
  function getLocStr(key) {
    let lang = getLang()
    lang = Object.keys(i18n).includes(lang) ? lang : "en"
    return i18n[Object.keys(i18n[lang]).includes(key) ? lang : "en"][key]
  }


  // current path
  function getPath() {
    return window.location.href.replace(/.*?twitter\.com\//, "")
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
      arrow: `<g><path d="M20 11H7.414l4.293-4.293c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0l-6 6c-.39.39-.39 1.023 0 1.414l6 6c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L7.414 13H20c.553 0 1-.447 1-1s-.447-1-1-1z"></path></g>`,
      location: `<g><path d="M12 14.315c-2.088 0-3.787-1.698-3.787-3.786S9.913 6.74 12 6.74s3.787 1.7 3.787 3.787-1.7 3.785-3.787 3.785zm0-6.073c-1.26 0-2.287 1.026-2.287 2.287S10.74 12.814 12 12.814s2.287-1.025 2.287-2.286S13.26 8.24 12 8.24z"></path><path d="M20.692 10.69C20.692 5.9 16.792 2 12 2s-8.692 3.9-8.692 8.69c0 1.902.603 3.708 1.743 5.223l.003-.002.007.015c1.628 2.07 6.278 5.757 6.475 5.912.138.11.302.163.465.163.163 0 .327-.053.465-.162.197-.155 4.847-3.84 6.475-5.912l.007-.014.002.002c1.14-1.516 1.742-3.32 1.742-5.223zM12 20.29c-1.224-.99-4.52-3.715-5.756-5.285-.94-1.25-1.436-2.742-1.436-4.312C4.808 6.727 8.035 3.5 12 3.5s7.192 3.226 7.192 7.19c0 1.57-.497 3.062-1.436 4.313-1.236 1.57-4.532 4.294-5.756 5.285z"></path></g>`,
      url: `<g><path d="M11.96 14.945c-.067 0-.136-.01-.203-.027-1.13-.318-2.097-.986-2.795-1.932-.832-1.125-1.176-2.508-.968-3.893s.942-2.605 2.068-3.438l3.53-2.608c2.322-1.716 5.61-1.224 7.33 1.1.83 1.127 1.175 2.51.967 3.895s-.943 2.605-2.07 3.438l-1.48 1.094c-.333.246-.804.175-1.05-.158-.246-.334-.176-.804.158-1.05l1.48-1.095c.803-.592 1.327-1.463 1.476-2.45.148-.988-.098-1.975-.69-2.778-1.225-1.656-3.572-2.01-5.23-.784l-3.53 2.608c-.802.593-1.326 1.464-1.475 2.45-.15.99.097 1.975.69 2.778.498.675 1.187 1.15 1.992 1.377.4.114.633.528.52.928-.092.33-.394.547-.722.547z"></path><path d="M7.27 22.054c-1.61 0-3.197-.735-4.225-2.125-.832-1.127-1.176-2.51-.968-3.894s.943-2.605 2.07-3.438l1.478-1.094c.334-.245.805-.175 1.05.158s.177.804-.157 1.05l-1.48 1.095c-.803.593-1.326 1.464-1.475 2.45-.148.99.097 1.975.69 2.778 1.225 1.657 3.57 2.01 5.23.785l3.528-2.608c1.658-1.225 2.01-3.57.785-5.23-.498-.674-1.187-1.15-1.992-1.376-.4-.113-.633-.527-.52-.927.112-.4.528-.63.926-.522 1.13.318 2.096.986 2.794 1.932 1.717 2.324 1.224 5.612-1.1 7.33l-3.53 2.608c-.933.693-2.023 1.026-3.105 1.026z"></path></g>`,
      calendar: `<g><path d="M19.708 2H4.292C3.028 2 2 3.028 2 4.292v15.416C2 20.972 3.028 22 4.292 22h15.416C20.972 22 22 20.972 22 19.708V4.292C22 3.028 20.972 2 19.708 2zm.792 17.708c0 .437-.355.792-.792.792H4.292c-.437 0-.792-.355-.792-.792V6.418c0-.437.354-.79.79-.792h15.42c.436 0 .79.355.79.79V19.71z"></path><circle cx="7.032" cy="8.75" r="1.285"></circle><circle cx="7.032" cy="13.156" r="1.285"></circle><circle cx="16.968" cy="8.75" r="1.285"></circle><circle cx="16.968" cy="13.156" r="1.285"></circle><circle cx="12" cy="8.75" r="1.285"></circle><circle cx="12" cy="13.156" r="1.285"></circle><circle cx="7.032" cy="17.486" r="1.285"></circle><circle cx="12" cy="17.486" r="1.285"></circle></g>`,
      balloon: `<g><path d="M7.75 11.083c-.414 0-.75-.336-.75-.75C7 7.393 9.243 5 12 5c.414 0 .75.336.75.75s-.336.75-.75.75c-1.93 0-3.5 1.72-3.5 3.833 0 .414-.336.75-.75.75z"></path><path d="M20.75 10.333c0-5.01-3.925-9.083-8.75-9.083s-8.75 4.074-8.75 9.083c0 4.605 3.32 8.412 7.605 8.997l-1.7 1.83c-.137.145-.173.357-.093.54.08.182.26.3.46.3h4.957c.198 0 .378-.118.457-.3.08-.183.044-.395-.092-.54l-1.7-1.83c4.285-.585 7.605-4.392 7.605-8.997zM12 17.917c-3.998 0-7.25-3.402-7.25-7.584S8.002 2.75 12 2.75s7.25 3.4 7.25 7.583-3.252 7.584-7.25 7.584z"></path></g>`,
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
      referer: window.location.href,
      "x-twitter-client-language": getLang(),
      "x-csrf-token": csrf,
      "x-twitter-active-user": "yes",
      // "x-twitter-auth-type": "OAuth2Session"
    }
    Object.assign(out, additionalHeaders)
    return out
  }


  function getRequestURL(base, param) {
    let out = base
    for (let [key, val] of Object.entries(param)) {
      if (typeof val === "object") val = encodeURIComponent(JSON.stringify(val))
      out += `&${key}=${val}`
    }
    return `${out.replace("&", "?")}`
  }

  // request a tweet
  function requestTweet(id, cb) {
    GM_xmlhttpRequest({
      method: "GET",
      url: getRequestURL("https://twitter.com/i/api/1.1/statuses/show.json", {
        id,
        tweet_mode: "extended",
        trim_user: true,
        include_cards: 1
      }),
      headers: getRequestHeaders(),
      onload: function(res) {
        if (res.status == "200") {
          cb(JSON.parse(res.response))
        } else {
          console.warn(res)
        }
      }
    })
  }

  // request tweet with content warnings
  // the results from this api sometimes are missing the url entities, hence the new function.
  function requestTweetCW(id, cb) {
    GM_xmlhttpRequest({
      method: "GET",
      url: getRequestURL("https://twitter.com/i/api/graphql/bRL1YYMraLIBpo1PGLeFcw/TweetDetail", {
        variables: {
          focalTweetId: id,
          includePromotedContent: false,
          withBirdwatchNotes: false,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withSuperFollowsUserFields: false,
          withVoice: false
        }
      }),
      headers: getRequestHeaders(),
      onload: function(res) {
        if (res.status == "200") {
          cb(
            JSON.parse(res.response)
            .data.threaded_conversation_with_injections.instructions
            .find(e => e.type == "TimelineAddEntries").entries
            .find(e => e.entryId.startsWith("tweet-"))
            .content.itemContent.tweet_results.result.legacy
          )
        } else {
          console.warn(res)
        }
      }
    })
  }


  function requestUser(screenName, cb) {
    GM_xmlhttpRequest({
      method: "GET",
      url: getRequestURL(`https://twitter.com/i/api/graphql/jMaTS-_Ea8vh9rpKggJbCQ/UserByScreenName`, {
        variables: {
          screen_name: screenName,
          withHighlightedLabel: true
        }
      }),
      headers: getRequestHeaders(),
      onload: function(res) {
        if (res.status == "200") {
          cb(JSON.parse(res.response))
        } else {
          console.warn(res)
        }
      }
    })
  }


  function blockUser(user_id, block, cb) {
    GM_xmlhttpRequest({
      method: "POST",
      url: getRequestURL(`https://api.twitter.com/1.1/blocks/${block ? "create" : "destroy"}.json`, {
        user_id,
        skip_status: true
      }),
      headers: getRequestHeaders(),
      onload: function(res) {
        if (res.status == "200") {
          cb()
        } else {
          console.warn(res)
        }
      }
    })
  }


  // adds links from an entities object to a text
  String.prototype.populateWithEntities = function(entities) {
    let text = this.toString()
    let out = text

    let toReplace = []

    // urls
    if (entities.urls) {
      for (let url of entities.urls) {
        toReplace.push({
          [url.indices[0]]: `<a href="`,
          [url.indices[1]]: `" target="_blank">${url.display_url}</a> `
        })
      }
    }

    // users
    if (entities.user_mentions) {
      for (let user of entities.user_mentions) {
        let x = text.slice(user.indices[0], user.indices[0]+1) == "@" ? 0 : 1
        toReplace.push({
          [user.indices[0]+x]: `<a href="/${user.screen_name}">`,
          [user.indices[1]+x]: `</a> `
        })
      }
    }

    // hashtags
    if (entities.hashtags) {
      for (let hashtag of entities.hashtags) {
        let x = text.slice(hashtag.indices[0], hashtag.indices[0]+1) == "#" ? 0 : 1
        toReplace.push({
          [hashtag.indices[0]+x]: `<a href="/hashtag/${hashtag.text}">`,
          [hashtag.indices[1]+x]: `</a> `
        })
      }
    }

    // change indices if emoji(s) appear before the entity
    // reason: multiple > 0xFFFF codepoint emojis are counted wrong: all but the first emoji have their length reduced by 1.
    // also, if any emoji > 0xFFFF precedes a url, the indices of the url are misaligned by -1.
    let match
    let counter = 0
    while ((match = emojiRegexp.exec(text)) != null) {
      let e = match[1]
      if (e.codePointAt(0) < 0xFFFF) continue
      counter++
      for (let i in toReplace) {
        let tmp = Object.entries(toReplace[i])
        // skip if not url and first element
        if (tmp[0][1] != `<a href="` && counter == 1) continue
        if (tmp[0][0] >= match.index) {
          toReplace[i] = {
            [parseInt(tmp[0][0]) + 1]: tmp[0][1],
            [parseInt(tmp[1][0]) + 1]: tmp[1][1]
          }
        }
      }
    }

    // sort array
    toReplace = toReplace.sort((a, b) => parseInt(Object.keys(a)[0]) - parseInt(Object.keys(b)[0]))

    // replace values
    let offset = 0
    for (let e of toReplace) {
      for (let [index, value] of Object.entries(e)) {
        out = out.insertAt(parseInt(index) + offset, value)
        offset += value.length
      }
    }

    if (GM_getValue("opt_gt2").expandTcoShortlinks) {
      let re = /href="(https:\/\/t\.co\/[^"]+)"/
      let match
      while ((match = re.exec(out)) != null) {
        out = out.replace(new RegExp(`href="${match[1]}"`), `href="${entities.urls.find(e => e.url == match[1]).expanded_url}"`)
      }
    }

    return out
  }


  // replace emojis with the twitter svgs
  String.prototype.replaceEmojis = function() {
    let text = this.toString()
    .replace(/([\*#0-9])\s\u20E3/ug, "$1\u20E3")
    .replace(/([\*#0-9])\uFE0F/ug, "$1")

    let out = text
    let match
    let offset = 0
    while ((match = emojiRegexp.exec(text)) != null) {
      let e = match[1]
      // get unicode of emoji
      let uni = []
      for (let i = 0; i < e.length; i++) {
        uni.push(e.codePointAt(i).toString(16))
        if (e.codePointAt(i) > 0xFFFF) i++
      }

      // remove fe0f from non joined emojis
      if (uni.length > 1 && uni[1].match(/^FE0F$/i)) uni.pop()

      // replace with image
      // https://abs-0.twimg.com/emoji/v2/svg/1f647.svg
      // https://abs-0.twimg.com/emoji/v2/svg/1f647-200d-2640-fe0f.svg
      let img = `<img src="https://abs-0.twimg.com/emoji/v2/svg/${uni.join("-")}.svg" alt="${e}" class="gt2-emoji" />`
      out = out.replaceAt(match.index + offset, e.length, img)

      offset += img.length - e.length
    }

    return out
  }



  // ###################
  // #  GT2 settings   #
  // ###################


  // custom options and their default values
  const opt_gt2 = {
    // timeline
    forceLatest: false,
    biggerPreviews: false,

    // tweets
    hideTranslateTweetButton: false,
    tweetIconsPullLeft: false,
    hidePromoteTweetButton: false,
    showMediaWithContentWarnings: false,
    showMediaWithContentWarningsSel: 7,
    hideTweetAnalytics: false,

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
    GM_setValue("opt_gt2", old)
  }


  // toggle opt_gt2 value
  function toggleGt2Opt(key) {
    let x = GM_getValue("opt_gt2")
    x[key] = !x[key]
    GM_setValue("opt_gt2", x)
  }


  // insert the menu item
  function addSettingsToggle() {
    if (!$(".gt2-toggle-settings").length) {
      $(`main section[aria-labelledby=root-header] div[role=tablist],
         main > div > div > div > div:last-child > div[role=tablist],
         main div[data-testid=loggedOutPrivacySection]`).append(`
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
  $("body").on("click", `main section[aria-labelledby=root-header] div[role=tablist] a:not(.gt2-toggle-settings),
                         main section[aria-labelledby=root-header] div[data-testid=loggedOutPrivacySection] a:not(.gt2-toggle-settings)`, () => {
    $(".gt2-settings-header, .gt2-settings").remove()
  })


  // get html for a gt2 toggle (checkbox)
  function getSettingTogglePart(name, additionalHTML="") {
    let d = `${name}Desc`
    return `
      <div class="gt2-setting">
        <div>
          <span>${getLocStr(name)}</span>
          <div class="gt2-setting-toggle ${GM_getValue("opt_gt2")[name] ? "gt2-active" : ""}" data-setting-name="${name}">
            <div></div>
            <div>
              ${getSvg("tick")}
            </div>
          </div>
        </div>
        ${additionalHTML}
        ${getLocStr(d) ? `<span>${getLocStr(d)}</span>` : ""}
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
          <div class="gt2-settings-sub-header">${getLocStr("settingsHeaderTimeline")}</div>
          ${getSettingTogglePart("forceLatest")}
          ${getSettingTogglePart("biggerPreviews")}
          <div class="gt2-settings-separator"></div>

          <div class="gt2-settings-sub-header">${getLocStr("statsTweets")}</div>
          ${getSettingTogglePart("hideTranslateTweetButton")}
          ${getSettingTogglePart("tweetIconsPullLeft")}
          ${getSettingTogglePart("hidePromoteTweetButton")}
          ${getSettingTogglePart("showMediaWithContentWarnings", `
            <div data-setting-name="showMediaWithContentWarningsBox" class="gt2-settings-multi-selection ${GM_getValue("opt_gt2").showMediaWithContentWarnings ? "" : "gt2-hidden"}">
              <div data-setting-name="showMediaWithContentWarningsSel">
                ${["Nudity", "Violence", "SensitiveContent"].map((e, i) => {
                  let x = Math.pow(2, i)
                  return `
                    <div>
                      <span>${getLocStr(`contentWarning${e}`)}</span>
                      <div class="gt2-setting-toggle ${(GM_getValue("opt_gt2").showMediaWithContentWarningsSel & x) == x ? "gt2-active" : ""}" data-sel="${x}">
                        <div></div>
                        <div>${getSvg("tick")}</div>
                      </div>
                    </div>`
                }).join("")}
              </div>
            </div>
          `)}
          ${getSettingTogglePart("hideTweetAnalytics")}
          <div class="gt2-settings-separator"></div>

          <div class="gt2-settings-sub-header">${getLocStr("settingsHeaderSidebars")}</div>
          ${getSettingTogglePart("stickySidebars")}
          ${getSettingTogglePart("smallSidebars")}
          ${getSettingTogglePart("hideTrends")}
          ${getSettingTogglePart("leftTrends")}
          ${getSettingTogglePart("show5Trends")}
          <div class="gt2-settings-separator"></div>

          <div class="gt2-settings-sub-header">${getLocStr("navProfile")}</div>
          ${getSettingTogglePart("legacyProfile")}
          ${getSettingTogglePart("squareAvatars")}
          ${getSettingTogglePart("disableHexagonAvatars")}
          ${getSettingTogglePart("enableQuickBlock")}
          ${getSettingTogglePart("leftMedia")}
          ${getSettingTogglePart("profileMediaRedirect")}
          <div class="gt2-settings-separator"></div>

          <div class="gt2-settings-sub-header">${getLocStr("settingsHeaderGlobalLook")}</div>
          ${getSettingTogglePart("hideFollowSuggestions", `
            <div data-setting-name="hideFollowSuggestionsBox" class="gt2-settings-multi-selection ${GM_getValue("opt_gt2").hideFollowSuggestions ? "" : "gt2-hidden"}">
              ${getLocStr("hideFollowSuggestionsBox").replace("$type$", `
                <div data-setting-name="hideFollowSuggestionsSel">
                  ${["topics", "users", "navLists"].map((e, i) => {
                    let x = Math.pow(2, i)
                    return `<div>
                      <span>${getLocStr(e)}</span>
                      <div class="gt2-setting-toggle ${(GM_getValue("opt_gt2").hideFollowSuggestionsSel & x) == x ? "gt2-active" : ""}" data-sel="${x}">
                        <div></div>
                        <div>${getSvg("tick")}</div>
                      </div>
                    </div>
                  `}).join("")}
                </div>
              `).replace("$location$", `
                <div data-setting-name="hideFollowSuggestionsLocSel">
                  ${["Timeline", "Sidebars"].map((e, i) => {
                    let x = Math.pow(2, i)
                    return `<div>
                      <span>${getLocStr(`settingsHeader${e}`)}</span>
                      <div class="gt2-setting-toggle ${(GM_getValue("opt_gt2").hideFollowSuggestionsLocSel & x) == x ? "gt2-active" : ""}" data-sel="${x}">
                        <div></div>
                        <div>${getSvg("tick")}</div>
                      </div>
                    </div>
                  `}).join("")}
                </div>
              `)}
            </div>
          `)}
          ${getSettingTogglePart("fontOverride", `
            <div class="gt2-setting-input" data-setting-name="fontOverrideValue">
              <input type="text" value="${GM_getValue("opt_gt2").fontOverrideValue}">
            </div>
          `)}
          ${getSettingTogglePart("colorOverride", `<div class="gt2-pickr"></div>`)}
          ${getSettingTogglePart("hideMessageBox")}
          ${getSettingTogglePart("rosettaIcons")}
          ${getSettingTogglePart("favoriteLikes")}
          <div class="gt2-settings-separator"></div>

          <div class="gt2-settings-sub-header">${getLocStr("settingsHeaderOther")}</div>
          ${getSettingTogglePart("updateNotifications")}
          ${getSettingTogglePart("expandTcoShortlinks")}
          ${getSettingTogglePart("mobileRedirect")}
        </div>
      `
      let $s = $("main section[aria-labelledby=detail-header]")
      if ($s.length) {
        $s.prepend(elem)
      } else {
        $("main > div > div > div").append(`
          <section>${elem}</section>
        `)
      }
      // add color pickr
      Pickr.create({
        el: ".gt2-pickr",
        theme: "classic",
        lockOpacity: true,
        useAsButton: true,
        appClass: "gt2-color-override-pickr",
        inline: true,
        default: `rgb(${GM_getValue("opt_gt2").colorOverrideValue})`,
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
      .on("change", e => {
        let val = e.toRGBA().toString(0).slice(5, -4)
        GM_setValue("opt_gt2", Object.assign(GM_getValue("opt_gt2"), { colorOverrideValue: val}))
        document.documentElement.style.setProperty("--color-override", val)
      })
      disableTogglesIfNeeded()
    }
  }


  // change the title to display GoodTwitter2
  function changeSettingsTitle() {
    let t = $("title").html()
    $("title").html(`${t.startsWith("(") ? `${t.split(" ")[0]} ` : ""}GoodTwitter2 / Twitter`)
  }


  // handler for the toggles
  $("body").on("click", ".gt2-setting-toggle:not(.gt2-disabled)", function() {
    $(this).toggleClass("gt2-active")
    if ($(this).is("[data-setting-name]")) {
      let name = $(this).attr("data-setting-name").trim()
      toggleGt2Opt(name)
      $("body").toggleClass(`gt2-opt-${name.toKebab()}`)
    }

    // handle selector settings (hideFollowSuggestions, showMediaWithContentWarnings)
    if ($(this).is("[data-sel]")) {
      let sName = $(this).closest("[data-setting-name]").attr("data-setting-name")
      let opt = GM_getValue("opt_gt2")
      GM_setValue("opt_gt2", Object.assign(opt, { [sName]: opt[sName] ^ parseInt($(this).attr("data-sel")) }))
    }
    disableTogglesIfNeeded()
  })

  // handler for inputs
  $("body").on("keyup", ".gt2-setting-input input", function() {
    let name = $(this).parent().attr("data-setting-name").trim()
    let val = $(this).val().trim()

    GM_setValue("opt_gt2", Object.assign(GM_getValue("opt_gt2"), { [name]: val}))
    document.documentElement.style.setProperty(`--${name.replace("Value", "").toKebab()}`, val)
  })


  function disableTogglesIfNeeded() {
    // other trend related toggles are not needed when the trends are disabled
    $("div[data-setting-name=leftTrends], div[data-setting-name=show5Trends]")
    [GM_getValue("opt_gt2").hideTrends ? "addClass" : "removeClass"]("gt2-disabled")

    // hide font input if fontOverride is disabled
    $("[data-setting-name=fontOverrideValue]")
    [GM_getValue("opt_gt2").fontOverride ? "removeClass" : "addClass"]("gt2-hidden")

    // hide color input if colorOverride is disabled
    $(".gt2-color-override-pickr")
    [GM_getValue("opt_gt2").colorOverride ? "removeClass" : "addClass"]("gt2-hidden")

    // hide follow suggestions
    $("[data-setting-name=hideFollowSuggestionsBox]")
    [GM_getValue("opt_gt2").hideFollowSuggestions ? "removeClass" : "addClass"]("gt2-hidden")

    // showMediaWithContentWarnings
    $("[data-setting-name=showMediaWithContentWarningsBox]")
    [GM_getValue("opt_gt2").showMediaWithContentWarnings ? "removeClass" : "addClass"]("gt2-hidden")
  }


  // click on the back button
  $("body").on("click", ".gt2-settings-back", () => window.history.back())



  // #######################
  // #  various functions  #
  // #######################


  // add navbar
  function addNavbar() {
    waitForKeyElements(`nav > a[href="/home"]`, () => {
      if ($(".gt2-nav").length) return

      $("main").before(`
        <nav class="gt2-nav">
          <div class="gt2-nav-left"></div>
          <div class="gt2-nav-center">
            <a href="/home"></a>
          </div>
          <div class="gt2-nav-right">
            <div class="gt2-search"></div>
            <div class="gt2-toggle-navbar-dropdown">
              <img src="${getInfo().avatarUrl.replace(/_(bigger|normal|(reasonably_)?small|\d*x\d+)/, "_bigger")}" />
            </div>
            <div class="gt2-compose">${getLocStr("composeNewTweet")}</div>
          </div>
        </nav>
        <div class="gt2-search-overflow-hider"></div>
      `)

      // home, notifications, messages
      for (let type of [
        "Home",
        "Notifications",
        "Messages",
        window.innerWidth < 1005 ? "Explore" : null
      ]) {
        if (!type) continue
        let origElemSel = `nav > a[href^="/${type.toLowerCase()}"]:not([data-testid=AppTabBar_Profile_Link]):not([href$="/lists"])`
        let $e = document.querySelector(origElemSel)
        if (!$e) continue
        document.querySelector(".gt2-nav-left").insertAdjacentHTML("beforeend", $e.outerHTML)

        document.querySelectorAll(`.gt2-nav-left [data-testid]`)
          .forEach(e => {
            e.addEventListener("click", event => {
              if (!event.ctrlKey) {
                event.preventDefault()
                let testid = event.target.closest("[data-testid]").dataset.testid
                document.querySelector(`nav [data-testid=${testid}]`).click()
              }
            })
          })

        watchForChanges(origElemSel, e => {
          let navbarElem = document.querySelector(`.gt2-nav-left [data-testid=${e.dataset.testid}]`)
          if (!navbarElem) return
          navbarElem.innerHTML = e.innerHTML
          navbarElem.firstElementChild.setAttribute("data-gt2-color-override-ignore", "")
          navbarElem.firstElementChild.insertAdjacentHTML("beforeend", `
            <div class="gt2-nav-header">
              ${getLocStr(`nav${type}`)}
            </div>
          `)
        })

        // $e.appendTo(".gt2-nav-left")
        $(`.gt2-nav a[href^="/${type.toLowerCase()}"] > div`)
        .append(`
          <div class="gt2-nav-header">
            ${getLocStr(`nav${type}`)}
          </div>
        `)
        .attr("data-gt2-color-override-ignore", "")
      }

      // highlight current location
      $(`.gt2-nav a[href^='/${getPath().split("/")[0]}']`).addClass("active")

      // twitter logo
      $("h1 a[href='/home'] svg")
      .appendTo(".gt2-nav-center a")
    })
  }

  function watchForChanges(selector, callback) {
    waitForKeyElements(selector, $element => {
      let element = $element[0]
      if (element) {
        new MutationObserver(mut => {
          mut.forEach(() => callback(element))
        }).observe(element, {
          attributes: true,
          subtree: true,
          childList: true
        })
      }
    })
  }

  // add navbar
  function addNavbarLoggedOut() {
    waitForKeyElements("nav > a[data-testid=AppTabBar_Explore_Link]", () => {
      if ($(".gt2-nav").length) return

      $("body").prepend(`
        <nav class="gt2-nav">
          <div class="gt2-nav-left"></div>
          <div class="gt2-nav-center">
            <a href="/"></a>
          </div>
          <div class="gt2-nav-right">
            <div class="gt2-search"></div>
          </div>
        </nav>
        <div class="gt2-search-overflow-hider"></div>
      `)

      // explore and settings
      $(`nav > a[data-testid=AppTabBar_Explore_Link],
         nav > a[href="/settings"]`)
      .appendTo(".gt2-nav-left")
      $(`.gt2-nav a[data-testid=AppTabBar_Explore_Link] > div`)
      .append(`
        <div class="gt2-nav-header">
          ${getLocStr(`navExplore`)}
        </div>
      `)
      $(`.gt2-nav a[href="/settings"] > div`)
      .append(`
        <div class="gt2-nav-header">
          ${$(`.gt2-nav a[href="/settings"]`).attr("aria-label")}
        </div>
      `)

      // highlight current location
      $(`.gt2-nav a[href^='/${getPath().split("/")[0]}']`).addClass("active")

      // twitter logo
      $("header h1 a[href='/'] svg")
      .appendTo(".gt2-nav-center a")
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

    elements.unshift(`<div class="gt2-legacy-profile-info"></div>`)
    waitForKeyElements(insertAt, () => {
      if (!$(insertAt).find(".gt2-legacy-profile-info").length) {
        for (let elem of elements.slice().reverse()) {
          if (insertAt.startsWith(".gt2")) {
            $(insertAt).prepend(elem)
          } else {
            $(`${insertAt} > div:empty:not(.gt2-legacy-profile-info)`).after(elem)
          }
        }
      }
      if ($(".gt2-dashboard-profile").length > 1) {
        $(".gt2-dashboard-profile").last().remove()
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
            <img src="${i.avatarUrl.replace(/_(bigger|normal|(reasonably_)?small|\d*x\d+)/, "_bigger")}"/>
          </a>
          <div class="gt2-user">
            <a ${href}="/${i.screenName}" class="gt2-name">${i.name.replaceEmojis()}</a>
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
                  <span>${getLocStr("statsTweets")}</span>
                  <span>${i.stats.tweets.humanize()}</span>
                </a>
              </li>
              <li>
                <a ${href}="/${i.screenName}/following">
                  <span>${getLocStr("statsFollowing")}</span>
                  <span>${i.stats.following.humanize()}</span>
                </a>
              </li>
              <li>
                <a ${href}="/${i.screenName}/followers">
                  <span>${getLocStr("statsFollowers")}</span>
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
          ${getSvg("tick")} ${getLocStr("updatedInfo").replace("$version$", `v${v}`)}<br />
          <a
            href="https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/changelog.md#${v.replace(/\./g, "")}"
            target="_blank">
            ${getLocStr("updatedInfoChangelog")}
          </a>
        </div>
      </div>
    `
  }


  // recreate the legacy profile layout
  function rebuildLegacyProfile() {
    let currentScreenName = getPath().match(/^intent\/(user|follow)/)
      ? getPath().match(/screen_name=(\w+)/)[1]
      : getPath().split("/")[0].split("?")[0].split("#")[0]
    console.log(`rebuild: ${currentScreenName}`)


    let profileSel = "div[data-testid=primaryColumn] > div > div:nth-last-child(1) > div > div > div:nth-child(1) > div:nth-child(2)"

    waitForKeyElements([
      `a[href="/${currentScreenName}/photo" i] img`,
      `a[href="/${currentScreenName}/nft" i] img`,
      `${profileSel} [data-testid=UserDescription] [href="https://support.twitter.com/articles/20169222"]`, // withheld in country
      `${profileSel} [data-testid=UserDescription] [href="https://support.twitter.com/articles/20169199"]`  // temporarily unavailable (Media Policy Violation)
    ].join(", "), (e) => {
      // remove previously added profile
      if ($(".gt2-legacy-profile-nav").length) {
        $(".gt2-legacy-profile-banner, .gt2-legacy-profile-nav").remove()
        $(".gt2-legacy-profile-info").empty()
      }


      // profile information
      const i = {
        banner:         () => $("a[href$='/header_photo'] img"),
        avatar:         () => $(profileSel).find("a[href$='/photo'] img, a[href$='/nft'] img").first(),
        screenName:     () => $(profileSel).find("> [data-testid=UserName] > div:nth-child(1) > div [dir] > span:contains(@):not(:has(> *))").text().slice(1),
        followsYou:     () => $(profileSel).find("> [data-testid=UserName] > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2)"),
        name:       () => $(profileSel).find("> [data-testid=UserName] > div:nth-child(1) > div > div:nth-child(1) > div"),
        automated:      () => $(profileSel).find("> [data-testid=UserName] > div:nth-child(2)"),
        joinDateHTML:   () => $(profileSel).find("div[data-testid=UserProfileHeader_Items] > span:last-child").html(),
        followingRnd:   () => $(profileSel).find(`a[href$="/following"] > span:first-child, > div:not(:first-child) div:nth-child(1) > [role=button]:first-child:last-child > span:first-child`).first().text().trim(),
        followersRnd:   () => $(profileSel).find(`a[href$="/followers"] > span:first-child, > div:not(:first-child) div:nth-child(2) > [role=button]:first-child:last-child > span:first-child`).first().text().trim(),

        // booleans
        hasOnlyScreenName:  () => $(profileSel).find("> [data-testid=UserName] > div:nth-child(1) > div > div").length == 1,
        avatarIsHex:        () => $(profileSel).find("a[href$='/nft']").length > 0,

        // sidebar elements
        description: () => $(profileSel).find("div[data-testid=UserDescription]"),
        items:       () => $(profileSel).find("div[data-testid=UserProfileHeader_Items]"),
        fyk:         () => $(profileSel).find("> div:last-child:not(:nth-child(2)) > div:last-child:first-child")
      }


      if (!$(".gt2-legacy-profile-banner").length) {
        $("header").before(`
          <div class="gt2-legacy-profile-banner">
            ${i.banner().length ? `<img src="${i.banner().attr("src").match(/(\S+)\/\d+x\d+/)[1]}/1500x500" />` : ""}
          </div>
          <div class="gt2-legacy-profile-nav">
            <div class="gt2-legacy-profile-nav-left">
              <div class="gt2-legacy-profile-nav-avatar ${i.avatarIsHex() ? "gt2-avatar-hex" : ""}">
                <img src="${i.avatar().length ? i.avatar().attr("src").replace(/_(bigger|normal|(reasonably_)?small|\d*x\d+)/, "_400x400") : defaultAvatarUrl}" />
              </div>
              <div>
                <div class="gt2-legacy-profile-name">${i.name().html()}</div>
                <div class="gt2-legacy-profile-screen-name-wrap">
                  ${i.hasOnlyScreenName() ? "" : `
                    <div class="gt2-legacy-profile-screen-name">
                      @<span>${i.screenName()}</span>
                    </div>
                  `}
                  ${i.followsYou().length ? i.followsYou().prop("outerHTML") : ""}
                </div>
              </div>
            </div>
            <div class="gt2-legacy-profile-nav-center">
              <a href="/${i.screenName()}" title="">
                <div>${getLocStr("statsTweets")}</div>
                <div>0</div>
              </a>
              <a href="/${i.screenName()}/following" title="">
                <div>${getLocStr("statsFollowing")}</div>
                <div>${i.followingRnd() || 0}</div>
              </a>
              <a href="/${i.screenName()}/followers" title="">
                <div>${getLocStr("statsFollowers")}</div>
                <div>${i.followersRnd() || 0}</div>
              </a>
              <a href="/${i.screenName()}/likes" title="">
                <div>${getLocStr("statsLikes")}</div>
                <div>0</div>
              </a>
              <!--
                <a href="/${i.screenName()}/lists" title="">
                  <div>${getLocStr("navLists")}</div>
                  <div></div>
                </a>
                <a href="/${i.screenName()}/moments" title="">
                  <div>${getLocStr("statsMoments")}</div>
                  <div></div>
                </a>
              -->
            </div>
            <div class="gt2-legacy-profile-nav-right"></div>
          </div>
        `)
      }

      // add like and tweet count
      requestUser(i.screenName(), res => {
        let profileData = res.data.user
        let pleg = profileData.legacy

        // profile id
        waitForKeyElements(".gt2-legacy-profile-info > :first", e => $(e).parent().attr("data-profile-id", profileData.rest_id))

        // change stats
        for (let tmp of [
          [i.screenName(), "statuses_count"],
          ["following", "friends_count"],
          ["followers", "followers_count"],
          ["likes", "favourites_count"]
        ]) {
          $(`.gt2-legacy-profile-nav-center a[href$="/${tmp[0]}"]`)
          .attr("title", pleg[tmp[1]].humanize())
          .find("div:nth-child(2)").html(pleg[tmp[1]].humanizeShort())
        }

        // expand t.co links
        if (GM_getValue("opt_gt2").expandTcoShortlinks) {
          let urls = pleg.entities.description.urls.concat(pleg.entities.url ? pleg.entities.url.urls : [])
          $(`.gt2-legacy-profile-info a[href^="https://t.co"]`).each(function() {
            $(this).attr("href", urls.find(e => e.url == $(this).attr("href").split("?")[0]).expanded_url)
          })
        }
      })

      // sidebar profile information
      waitForKeyElements(`[href="/${
        getPath().match(/^intent\/(user|follow)/)
          ? getPath().match(/screen_name=(\w+)/)[1]
          : getPath().split("/")[0].split("?")[0].split("#")[0]
        }/following" i]`, () => {
        $(".gt2-legacy-profile-info").data("alreadyFound", false)
        waitForKeyElements(".gt2-legacy-profile-info", () => {
          if (!$(".gt2-legacy-profile-info .gt2-legacy-profile-screen-name").length) {
            $(".gt2-legacy-profile-info").append(`
              <div class="gt2-legacy-profile-name"></div>
              <div class="gt2-legacy-profile-screen-name-wrap">
                ${i.hasOnlyScreenName() ? "" : `
                  <div class="gt2-legacy-profile-screen-name">
                    @<span>${i.screenName()}</span>
                  </div>
                `}
                ${i.followsYou().length ? i.followsYou().prop("outerHTML") : ""}
              </div>
              ${i.automated().length ? `<div class="gt2-legacy-profile-automated">${i.automated().prop("outerHTML")}</div>` : ""}
              ${i.description().length ? `<div class="gt2-legacy-profile-description">${i.description().parent().html()}</div>` : ""}
              <div class="gt2-legacy-profile-items">
                ${i.items().length ? i.items().html() : ""}
              </div>
              ${i.fyk().length ? `<div class="gt2-legacy-profile-fyk">${i.fyk().prop("outerHTML")}</div>` : ""}
            `)

            document.querySelector(".gt2-legacy-profile-info .gt2-legacy-profile-name")
              .insertAdjacentHTML("afterbegin", i.name()[0].innerHTML)

              document.querySelector(`.gt2-legacy-profile-info .gt2-legacy-profile-name [d^="M22.25 12c0-1.43-.88"]`)
                ?.parentElement?.parentElement?.parentElement
                ?.addEventListener("click", e => {
                  document.querySelector(`${profileSel} [d^="M22.25 12c0-1.43-.88"]`)
                    ?.parentElement?.parentElement?.parentElement?.dispatchEvent(new MouseEvent("click", {bubbles: true}))

                  // calculate position of the box
                  waitForKeyElements(`#layers > div:nth-child(2) > div > div > div:nth-child(2)`, $floatingBox => {
                    let floatingBox = $floatingBox[0]
                    let boxBcr = floatingBox.getBoundingClientRect()
                    let buttonBcr = e.target.getBoundingClientRect()

                    const pad = 20
                    let left = Math.max(pad, (buttonBcr.left + buttonBcr.width / 2 - boxBcr.width / 2))
                    let leftMax = innerWidth - pad
                    let topBoxBelow = buttonBcr.bottom + 10
                    let topBoxAbove = Math.max(pad, buttonBcr.top - 10 - boxBcr.height)
                    let topBoxBelowMax = innerHeight - pad

                    document.querySelector(".gt2-style-verification")?.remove()
                    document.head.insertAdjacentHTML("beforebegin", `
                      <style class="gt2-style-verification">
                        #layers > div:nth-child(2) > div > div > div:nth-child(2) {
                          left: ${Math.round((left + boxBcr.width < leftMax) ? left : leftMax)}px !important;
                          top: ${Math.round((topBoxBelow + boxBcr.height < topBoxBelowMax) ? topBoxBelow : topBoxAbove)}px !important;
                          position: fixed !important;
                        }
                      </style>
                    `)
                  })
                })

            GM_setValue("hasRun_InsertFYK", false)
            waitForKeyElements(`a[href$="/followers_you_follow"] div[style*=background-image] + img`, e => {
              if (!GM_getValue("hasRun_InsertFYK")) {
                $(".gt2-legacy-profile-fyk").html($(e).parents(`a[href$="/followers_you_follow"]`).prop("outerHTML"))
                GM_setValue("hasRun_InsertFYK", true)
              }
            })
          }
        })
      })

      // buttons
      if (!$(".gt2-legacy-profile-nav-right > div").length) {
        $(profileSel).find("> div:nth-child(1) > div:last-child").detach().appendTo(".gt2-legacy-profile-nav-right")
      }

    })

    // profile suspended / not found
    waitForKeyElements([
      `body:not([data-gt2-path^="messages"]) [data-testid=empty_state_body_text] > *:not(a):first-child:last-child`, // not found
      `[data-testid=emptyState] [href="https://help.twitter.com/rules-and-policies/twitter-rules"]`           // suspended
    ].join(", "), () => {
      let $tmp = $(profileSel).find("> div:nth-child(2) > div > div")
      let i = {
        screenName: () => $tmp.find("> div:nth-last-child(1)").text().trim().slice(1),
        nameHTML:   () => $tmp.find("> div").length > 1 ? $tmp.find("> div:nth-child(1)").html() : null
      }
      $("body").addClass("gt2-profile-not-found")
      $("header").before(`
        <div class="gt2-legacy-profile-banner">
          <img />
        </div>
        <div class="gt2-legacy-profile-nav">
          <div class="gt2-legacy-profile-nav-left">
            <div class="gt2-legacy-profile-nav-avatar">
              <img src="${defaultAvatarUrl}" />
            </div>
            <div>
              <a href="/${i.screenName()}" class="gt2-legacy-profile-name">${i.nameHTML() ? i.nameHTML() : `@${i.screenName()}`}</a>
              ${i.nameHTML() ? `
                <div class="gt2-legacy-profile-screen-name-wrap">
                  <a href="/${i.screenName()}" class="gt2-legacy-profile-screen-name">
                  @<span>${i.screenName()}</span>
                  </a>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="gt2-legacy-profile-nav-center">
            <a href="/${i.screenName()}">
              <div>${getLocStr("statsTweets")}</div>
              <div>0</div>
            </a>
            <a href="/${i.screenName()}/following">
              <div>${getLocStr("statsFollowing")}</div>
              <div>0</div>
            </a>
            <a href="/${i.screenName()}/followers">
              <div>${getLocStr("statsFollowers")}</div>
              <div>0</div>
            </a>
            <a href="/${i.screenName()}/likes">
              <div>${getLocStr("statsLikes")}</div>
              <div>0</div>
            </a>
          </div>
          <div class="gt2-legacy-profile-nav-right"></div>
        </div>
      `)
      waitForKeyElements(".gt2-legacy-profile-info", () => {
        $(".gt2-legacy-profile-info").append(`
          <a href="/${i.screenName()}" class="gt2-legacy-profile-name">${i.nameHTML() ? i.nameHTML() : `@${i.screenName()}`}</a>
          ${i.nameHTML() ? `
            <div class="gt2-legacy-profile-screen-name-wrap">
              <a href="/${i.screenName()}" class="gt2-legacy-profile-screen-name">
                @<span>${i.screenName()}</span>
              </a>
            </div>
          ` : ""}
        `)
      })
    })
  }


  // force latest tweets view.
  function forceLatest() {
    waitForKeyElements(`[data-gt2-path=home]:not([data-switched-to-latest]) [data-testid=ScrollSnap-List] > div:nth-child(2) > [aria-selected=false]`, e => {
      e[0].click()
      document.body.setAttribute("data-switched-to-latest", "")
    })
  }


  // handle trends (hide, move, wrap)
  function handleTrends() {
    let w = window.innerWidth
    let trends = `section:not(.gt2-trends-handled) div[data-testid=trend]:not(.gt2-trend-wrapped),
                  section[aria-labelledby^=accessible-list]:not(.gt2-trends-handled) a[href="/explore/tabs/for-you"] > div > span:not(.gt2-trend-wrapped)`

    waitForKeyElements(trends, e => {
      // actions for the whole container
      if (!$(trends).parents("section").hasClass("gt2-trends-handled")
        && $(trends).parents("div[data-testid=sidebarColumn]").length
      ) {

        // hide trends
        if (GM_getValue("opt_gt2").hideTrends) {
          $(trends).parents("section").parent().parent().remove()
          return
        }

        // move trends
        if (GM_getValue("opt_gt2").leftTrends
            && ((!GM_getValue("opt_gt2").smallSidebars && w > 1350)
              || (GM_getValue("opt_gt2").smallSidebars && w > 1230))) {
          if ($(".gt2-trends").length) $(".gt2-trends").remove()

          $(trends).parents("section").parent().parent()
          .detach().addClass("gt2-trends")
          .appendTo(".gt2-left-sidebar")
        }

        $(trends).parents("section").addClass("gt2-trends-handled")
      }


      // wrap trends in anchors
      $(e).each(function() {
        let $toWrap = $(this).find("> div > div:nth-child(2) > span [dir]")
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


  function getFollowersYouKnowHTML(screenName, profileID, callback) {
    GM_xmlhttpRequest({
      method: "GET",
      url: getRequestURL("https://twitter.com/i/api/1.1/friends/following/list.json", {
        include_profile_interstitial_type: 1,
        include_blocking: 1,
        include_blocked_by: 1,
        include_followed_by: 1,
        include_want_retweets: 1,
        include_mute_edge: 1,
        include_can_dm: 1,
        include_can_media_tag: 1,
        skip_status: 1,
        cursor: -1,
        user_id: profileID,
        count: 3,
        with_total_count: true
      }),
      headers: getRequestHeaders(),
      onload: res => {
        if (res.status == 200) {

          // followers you know
          let fyk = JSON.parse(res.response)

          let fykText
          if (fyk.total_count < 4) {
            fykText = getLocStr(`followedBy${fyk.total_count}`)
            .replace("$p1$", fyk.users.length > 0 ? fyk.users[0].name : "")
            .replace("$p2$", fyk.users.length > 1 ? fyk.users[1].name : "")
            .replace("$p3$", fyk.users.length > 2 ? fyk.users[2].name : "")
          } else {
            fykText = getLocStr("followedBy4Plus")
            .replace("$p1$", fyk.users[0].name)
            .replace("$p2$", fyk.users[1].name)
            .replace("$nr$", fyk.total_count - 2)
          }

          let fykImg = ""
          for (let u of fyk.users) {
            fykImg += `<img src="${u.profile_image_url_https}" alt="${u.name}" />`
          }

          callback(`
            <a class="gt2-blocked-profile-followers-you-know" href="/${screenName}/followers_you_follow">
              ${fykImg}
              <span>
                ${fykText.replaceEmojis()}
              </span>
            </a>
          `)
        } else if (res.status == 401) {
          callback("")
        }
      }
    })
  }

  // display standard information for blocked profile
  function displayBlockedProfileData() {
    let screenName = getPath().split("/")[0].split("?")[0].split("#")[0]
    $("body").addClass("gt2-page-profile-youre-blocked")

    requestUser(screenName, res => {
      let profileData = res.data.user

      // get “x persons you follow follow this account” stuff
      getFollowersYouKnowHTML(screenName, profileData.rest_id, fykHTML => {

        let pleg = profileData.legacy

        // join date
        let joinDate = new Date(pleg.created_at)

        let p = {
          description:  pleg.description
                        .populateWithEntities(pleg.entities.description)
                        .replaceEmojis(),
          location:     pleg.location != "" ? `
                          <div class="gt2-blocked-profile-location">
                            ${getSvg("location")}
                            <span>${pleg.location.replaceEmojis()}</span>
                          </div>` : null,
          url:          pleg.url ? `
                          <a href="${pleg.entities.url.urls[0][GM_getValue("opt_gt2").expandTcoShortlinks ? "expanded_url" : "url"]}" class="gt2-blocked-profile-url">
                            ${getSvg("url")}
                            <span>${pleg.entities.url.urls[0].display_url}</span>
                          </a>` : null,
          joinDate:     `<div class="gt2-blocked-profile-joined-at">
                          ${getSvg("calendar")}
                          <span>
                            ${
                              getLocStr("joinDate")
                              .replace("$date$", joinDate.toLocaleDateString(getLang(), { month: "long", year: "numeric" }))
                            }
                          </span>
                        </div>`,
          birthday:     profileData.legacy_extended_profile && profileData.legacy_extended_profile.birthdate ? (() => {
                          let bd = profileData.legacy_extended_profile.birthdate
                          let bdText
                          let date = new Date(Date.UTC(bd.year || 1970, bd.month || 1, bd.day || 1))
                          if (bd.year && !bd.month && !bd.day) {
                            bdText = getLocStr("bornYear").replace("$year$", date.toLocaleDateString(getLang(), { year: "numeric"}))
                          } else {
                            let opt = {}
                            if (bd.year)  opt.year  = "numeric"
                            if (bd.month) opt.month = "long"
                            if (bd.day)   opt.day   = "numeric"
                            bdText = getLocStr("bornDate").replace("$date$", date.toLocaleDateString(getLang(), opt))
                          }

                          return `
                            <div class="gt2-blocked-profile-birthday">
                            ${getSvg("balloon")}
                              <span>${bdText}</span>
                            </div>`
                        })() : null

        }

        // description: add links for mentioned users
        for (let m of p.description.match(/(@[0-9A-Za-z_]+)/g) || []) {
          p.description = p.description.replace(m, `<a href="/${m.slice(1)}">${m}</a>`)
        }

        // add profile info
        $("a[href$='/header_photo'] + div > div:nth-child(2)").after(`
          <div class="gt2-blocked-profile-description">${p.description}</div>
          <div class="gt2-blocked-profile-items">
            ${p.location ? p.location : ""}
            ${p.url      ? p.url      : ""}
            ${p.birthday ? p.birthday : ""}
            ${p.joinDate}
          </div>
        `)

        // add followers/following count
        if (!$(`.gt2-blocked-profile-items + div [href$="/following"]`).length) {
          $(".gt2-blocked-profile-items").after(`
            <div class="gt2-blocked-profile-ff">
              <a href="/${screenName}/following">
                <span>${pleg.friends_count.humanizeShort()}</span> ${getLocStr("statsFollowing")}
              </a>
              <a href="/${screenName}/followers">
                <span>${pleg.followers_count.humanizeShort()}</span> ${getLocStr("statsFollowers")}
              </a>
            </div>
          `)
        }

        // followersYouKnow
        $(".gt2-blocked-profile-items + div").after(fykHTML)


        // add legacy sidebar profile information
        waitForKeyElements(".gt2-legacy-profile-name", () => {
          if (!$(".gt2-legacy-profile-info .gt2-legacy-profile-fyk").length) {
            $(".gt2-legacy-profile-info .gt2-legacy-profile-items").append(`
              ${p.description ? `<div class="gt2-legacy-profile-description">${p.description}</div>` : ""}
              ${p.location    ? `<div class="gt2-legacy-profile-item">${p.location}</div>`           : ""}
              ${p.url         ? `<div class="gt2-legacy-profile-item">${p.url}</div>`                : ""}
              ${p.birthday    ? `<div class="gt2-legacy-profile-item">${p.birthday}</div>`           : ""}
              <div class="gt2-legacy-profile-item">${p.joinDate}</div>
              <div class="gt2-legacy-profile-fyk">${fykHTML}</div>
            `)
          }
        })

        // profile id
        waitForKeyElements(".gt2-legacy-profile-info > :first", e => $(e).parent().attr("data-profile-id", profileData.rest_id))
      })
    })
  }




  // ##################################
  // #  translate tweets in timelime  #
  // ##################################


  // add translate button
  if (!GM_getValue("opt_gt2").hideTranslateTweetButton) {
    waitForKeyElements(`[data-testid=tweet] [lang],
                        [data-testid=tweet] + div > div:nth-child(2) [role=link] [lang]`, function(e) {
      let $e = $(e)
      if ($e.siblings().length) return
      let tweetLang = $e.attr("lang")
      let userLang  = getLang()
          userLang  = userLang == "en-GB" ? "en" : userLang
      if (tweetLang != userLang && tweetLang != "und") {
        $e.first().after(`
          <div class="gt2-translate-tweet">
            ${getLocStr("translateTweet")}
          </div>
        `)
      }
    })
  }


  // translate a tweet or LPL bio
  $("body")[0].addEventListener("click", function(event) {
    if (!$(event.target).is(".gt2-translate-tweet, .gt2-legacy-profile-info [data-testid=UserDescription] + [role=button] span")) return
    event.preventDefault()
    console.log("translating tweet");

    let target = $(event.target).is(".gt2-translate-tweet") ? event.target : $(event.target).parents("[role=button]")[0]

    // already translated
    if ($(target).parent().find(".gt2-translated-tweet").length) {
      $(target).addClass("gt2-hidden")
      $(target).parent().find(".gt2-translated-tweet, .gt2-translated-tweet-info").removeClass("gt2-hidden")
      return
    }

    let id = $(target).parents("article[data-testid=tweet]").length
      ? $(target).parents("article[data-testid=tweet]")
        .find(`> div > div > div > div > div > div:nth-child(1) a[href*='/status/'],
               div[data-testid=tweet] + div > div:nth-child(3) a[href*='/status/']`).attr("href").split("/")[3]
      : null

    // embedded tweet
    if ($(target).parents("[role=link]").parents("article[data-testid=tweet]").length) {
      requestTweet(id, res => translateTweet(target, res.quoted_status_id_str))

    // normal tweet with embedded one
    } else if ($(target).parents("article[data-testid=tweet]").find("[role=link] [lang]").length) {
      requestTweet(id, res => translateTweet(target, id, res.quoted_status_id_str))

    // normal tweet or bio
    } else {
      translateTweet(target, id)
    }
  }, true)


  function translateTweet(e, id, quoteId) {
    let isTweet = $(e).is(".gt2-translate-tweet")
    GM_setValue("tmp_translatedTweetInfo", getLocStr("translatedTweetInfo"))
    let url = `https://twitter.com/i/api/1.1/strato/column/None/${isTweet ? `tweetId=${id}` : `profileUserId=${$(".gt2-legacy-profile-info").data("profile-id")}`},destinationLanguage=None,translationSource=Some(Google),feature=None,timeout=None,onlyCached=None/translation/service/translate${isTweet ? "Tweet" : "Profile"}`

    GM_xmlhttpRequest({
      method: "GET",
      url,
      headers: getRequestHeaders(isTweet ? {
        referer: `https://twitter.com/i/status/${id}`
      } : {}),
      onload: function(res) {
        if (res.status == "200") {
          let o = JSON.parse(res.response)
          if (!isTweet) o = o.profileTranslation
          console.log(o)
          let out = o.translation

          // handle entities in tweet
          if (o.entities) {
            // remove embedded url if applicable
            if (quoteId && o.entities.urls) {
              let tco = o.entities.urls.find(x => x.expanded_url.endsWith(quoteId))
              if (tco) {
                out = out.replace(` ${tco.url}`, "")
                o.entities.urls = o.entities.urls.filter(x => !x.expanded_url.endsWith(quoteId))
              }
            }
            out = out.populateWithEntities(o.entities)
          }

          $(e).addClass("gt2-hidden")
          $(e).after(`
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
              ${out.replaceEmojis()}
            </div>
          `)
        } else {
          console.error("Error occurred while translating.")
          console.error(url)
          console.error(res)
        }
      }
    })
  }


  // hide translation
  $("body")[0].addEventListener("click", function(event) {
    if (!$(event.target).is(".gt2-translated-tweet-info")) return
    event.preventDefault()

    $(event.target).parent().find(".gt2-translated-tweet, .gt2-translated-tweet-info").addClass("gt2-hidden")
    $(event.target).prevAll(".gt2-translate-tweet, [role=button]").removeClass("gt2-hidden")
  }, true)



  // ##########################
  // #  misc event handlers   #
  // ##########################


  // compose tweet button
  $("body").on("click", ".gt2-nav .gt2-compose", () => {
    $("header a[href='/compose/tweet'] > div").click()
  })


  // add elements to navbar dropdow menu
  $("body").on("click", ".gt2-toggle-navbar-dropdown", () => {
    console.log("navbar toggled");
    let i = getInfo()
    $("header nav > div[data-testid=AppTabBar_More_Menu]").click()
    let more = "div[role=menu][style^='max-height: calc'].r-ipm5af > div > div > div"

    waitForKeyElements(`${more} `, e => {
      if ($(more).find("a[href='/explore']").length) return

      // separator line
      let separatorHtml = e[0].querySelector("[role=separator]").parentElement.outerHTML
      e[0].insertAdjacentHTML("afterbegin", separatorHtml)
      // items from left menu to attach
      let toAttach = [
        {
          sel:  `a[href='/${i.screenName}']`,
          name: "Profile"
        }, {
          sel:  `a[href$='/lists']`,
          name: "Lists"
        }, {
          sel:  `a[href$='/bookmarks']`,
          name: "Bookmarks"
        }, {
          sel:  `a[href$='/communities']`,
          name: "Communities"
        }, {
          sel:  `a[href='/explore']`,
          name: "Explore"
        }
      ]
      for (let e of toAttach.reverse()) {
        if (!$("header nav").find(e.sel).length) continue
        let $tmp = $("header nav").find(e.sel).clone()
        $tmp.children().append(`<span>${getLocStr(`nav${e.name}`)}</span>`)
        $tmp.prependTo(more)
      }

      // expand sections
      document.querySelectorAll(`${more} [aria-expanded=false]`)
        .forEach(e => {
          e.click()
          e.nextElementSibling.insertAdjacentHTML("afterend", separatorHtml)
        })

      $(`<a href="/logout" class="gt2-toggle-logout">Logout</a>`).appendTo(more)
    })

  })


  // acc switcher dropdown
  $("body").on("click", ".gt2-toggle-acc-switcher-dropdown", function() {
    $("body").addClass("gt2-acc-switcher-active")
    $("div[data-testid=SideNav_AccountSwitcher_Button]").click()

    // change dropdown position
    $(".gt2-style-acc-switcher-dropdown").remove()
    let pos = $(".gt2-toggle-acc-switcher-dropdown")[0].getBoundingClientRect()
    $("html").prepend(`
      <style class="gt2-style-acc-switcher-dropdown">
        #layers > div:nth-child(2) > div > div > div:nth-child(2) {
          left: ${Math.round(pos.left) - 274}px !important;
          top: ${Math.round(pos.top) + 35}px !important;
        }
      </style>
    `)
  })


  // remove class on next click
  $("body").on("click", `:not(.gt2-toggle-acc-switcher-dropdown):not(div[data-testid=SideNav_AccountSwitcher_Button])`, function(e) {
    if (e.target.closest(`[d^="M22.25 12c0-1.43-.88"]`))
      return

    setTimeout(function () {
      if (!$("a[href='/i/flow/login']").length) {
        $("body").removeClass("gt2-acc-switcher-active")
        document.querySelector(".gt2-style-verification")?.remove()
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


  // remove blocked profile stuff on unblock
  $("body").on("click", `div[data-testid=placementTracking] div[data-testid$="-unblock"]`, () => $("[class^=gt2-blocked-profile]").remove())


  // [LPL] unusual activity button: make elements clickable again
  $(document).on("click", `.gt2-profile-not-found [data-testid=primaryColumn] > div > div:nth-child(2) > div > div > div:nth-child(2) > div[role=button]`, () => $("body").removeClass("gt2-profile-not-found"))


  // expand t.co shortlinks (tweets)
  $(document).on("mouseover", `.gt2-opt-expand-tco-shortlinks div:not([data-testid=placementTracking]) > div > article[data-testid=tweet]:not(.gt2-tco-expanded),
  .gt2-opt-expand-tco-shortlinks.gt2-page-tweet [data-testid=primaryColumn] section > h1 + div > div > div:nth-child(1) article:not(.gt2-tco-expanded)`, function() {
    let $tweet = $(this)
    $tweet.addClass("gt2-tco-expanded")

    // exit if tweet has no links
    if (!$tweet.find(`a[href^="http://t.co"], a[href^="https://t.co"], [data-testid="card.wrapper"]`).length) return

    let id = !$tweet.find(`time`).length && $("body").is(".gt2-page-tweet")
      ? getPath().split("/")[2].split("?")[0].split("#")[0]
      : $tweet.find(`time`).parent().attr("href").split("/status/")[1]

    requestTweet(id, res => {
      $tweet.find(`a[href^="http://t.co"], a[href^="https://t.co"]`).each(function() {
        $(this).attr("href", res.entities.urls.find(e => e.url == $(this).attr("href").split("?")[0]).expanded_url)
      })
      $tweet.find(`[data-testid="card.layoutSmall.media"] + *:not(a)`).each(function() {
        $(this).wrap(`<a href="${res.entities.urls.find(e => e.url == res.cards.players.find(p => Object.values(p.images)[0].image_url.match($(this).prev().find("img[src*=card_img]").attr("src").match(/card_img\/(\d+)/)[1])).url).expanded_url}"></a>`)
      })
    })
  })


  // expand t.co shortlinks (profile, not legacy)
  $(document).on("mouseover", `.gt2-opt-expand-tco-shortlinks.gt2-page-profile:not(.gt2-opt-legacy-profile) [data-testid=primaryColumn] > div > div:nth-child(2) > div > div > div:nth-child(1):not(.gt2-tco-expanded), .gt2-opt-expand-tco-shortlinks [data-testid=UserCell]`, function() {
    let $profile = $(this)
    $profile.addClass("gt2-tco-expanded")
    // exit if profile has no links
    if (!$profile.find(`a[href^="http://t.co"], a[href^="https://t.co"]`).length) return

    let screenName = $profile.is("[data-testid=UserCell]")
      ? $profile.find("> div > div:nth-child(2) > div:nth-child(1) a").attr("href").slice(1)
      : getPath().split("/")[0].split("?")[0].split("#")[0]

    requestUser(screenName, res => {
      let ent = res.data.user.legacy.entities
      let urls = []
      if (ent.description) urls.push(...ent.description.urls)
      if (ent.url)         urls.push(...ent.url.urls)
      $profile.find(`a[href^="http://t.co"], a[href^="https://t.co"]`).each(function() {
        $(this).attr("href", urls.find(e => e.url == $(this).attr("href").split("?")[0].split("#")[0]).expanded_url)
      })
    })
  })


  // block/unblock account on holding follow button for 3 seconds
  if (GM_getValue("opt_gt2").enableQuickBlock) {
	  let qbOffer
	  $("body").on("mouseover", `[data-testid$="-follow"]:not([data-gt2-qb-state])`, e => {
  		let $b = $(e.target).parents(`[data-testid$="-follow"]`)
  		$b.attr("data-gt2-qb-state", "offer-pending")
  		qbOffer = setTimeout(() => {
  		  $b.attr("data-gt2-qb-state", "offer")
  		  $b.find("> div > span").append(`
    			<span class="gt2-qb-block">${getLocStr("qbBlock")}</span>
    			<span class="gt2-qb-blocked">${getLocStr("qbBlocked")}</span>
    			<span class="gt2-qb-unblock">${getLocStr("qbUnblock")}</span>
  		  `)
  		}, 3e3)
	  })
	  $("body").on("click", `[data-testid$="-follow"][data-gt2-qb-state=offer]`, e => {
  		e.stopImmediatePropagation()
  		let $b = $(e.target).parents(`[data-testid$="-follow"]`)
  		let user_id = $b.attr("data-testid").slice(0, -7)
  		blockUser(user_id, true, () => {
  		  console.log(`quickblock: ${user_id}`)
  		  $b.attr("data-gt2-qb-state", "blocked")
  		})
	  })
	  $("body").on("click", `[data-testid$="-follow"][data-gt2-qb-state=blocked]`, e => {
  		e.stopImmediatePropagation()
  		let $b = $(e.target).parents(`[data-testid$="-follow"]`)
  		let user_id = $b.attr("data-testid").slice(0, -7)
  		blockUser(user_id, false, () => {
  		  console.log(`quickunblock: ${user_id}`)
  		  $b.removeAttr("data-gt2-qb-state")
  		  $b.find("[class^=gt2-qb]").remove()
  		})
	  })
	  $("body").on("mouseleave", `[data-testid$="-follow"][data-gt2-qb-state^=offer],
								  [data-testid$="-unfollow"][data-gt2-qb-state^=offer]`, e => {
  		let $b = $(e.target).parents(`[data-testid$="-follow"]`)
  		$b.removeAttr("data-gt2-qb-state")
  		$b.find("[class^=gt2-qb]").remove()
  		clearTimeout(qbOffer)
	  })
  }


  // fix coloring on clicking the follow button
  $("body").on("click", `[data-testid$="-follow"]`, e => $(e.target).parents(`[data-testid$="-follow"]`).attr("data-gt2-just-clicked-follow", 1))
  $("body").on("mouseleave", `[data-testid$="-unfollow"][data-gt2-just-clicked-follow]`, e => $(e.target).parents(`[data-testid$="-unfollow"]`).removeAttr("data-gt2-just-clicked-follow"))


  // [LPL] enlarge profile image when clicking on it
  $("body").on("click", ".gt2-legacy-profile-nav-avatar", () => $(`div[data-testid=primaryColumn] > div > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(2)`).find(`a[href$="/photo"] img, a[href$="/nft"] img`).first().click())



  // ########################
  // #        tweets        #
  // ########################

  waitForKeyElements(`[data-testid=tweet] [href^="/"][href*="/photo/1"] [data-testid=tweetPhoto],
                      [data-testid=tweet] [data-testid=previewInterstitial]`, e => {
    // showMediaWithContentWarnings
    if (GM_getValue("opt_gt2").showMediaWithContentWarnings && GM_getValue("opt_gt2").showMediaWithContentWarningsSel < 7) {
      let $tweet = $(e).closest("[data-testid=tweet]")

      if ($(e).closest("[aria-labelledby]").find("> div > div > div > div:nth-child(2)").length) {
        let id = $("body").is(".gt2-page-tweet")
          ? getPath().split("/")[2].split("?")[0].split("#")[0]
          : $tweet.find("time").parent().attr("href").split("/status/")[1]
        requestTweetCW(id, res => {
          let score = res.extended_entities.media.filter(e => e.hasOwnProperty("sensitive_media_warning")).map(m => {
            return ["adult_content", "graphic_violence", "other"].reduce((p, c, i) => {
              return p + (m.sensitive_media_warning[c] ? Math.pow(2, i) : 0)
            }, 0)
          }).reduce((p, c) => p | c)

          console.log(`cw id: ${id}, opt: ${GM_getValue("opt_gt2").showMediaWithContentWarningsSel} score: ${score}`)
          if ((score & GM_getValue("opt_gt2").showMediaWithContentWarningsSel) == score) {
            $tweet.attr("data-gt2-show-media", 1)
          }
        })
      }
    }
  })

  if (GM_getValue("opt_gt2").hideTweetAnalytics) {
    waitForKeyElements(`[data-testid=tweet] [href$="/analytics"]`, e => e[0].parentElement.classList.add("gt2-hidden"))
  }



  // ########################
  // #   display settings   #
  // ########################


  // high contrast
  $("body").on("click", `[data-testid="accessibilityScreen"] > div:nth-child(3) label [aria-labelledby]`, function() {
    GM_setValue("opt_display_highContrast", !$(this).find("input").is("[checked]"))
    updateCSS()
  })


  // user color
  waitForKeyElements(`body:not(.gt2-opt-color-override) [data-testid=SideNav_NewTweet_Button]`, e => {
    let userColor = $(e).css("background-color")
    if (userColor != GM_getValue("opt_display_userColor")) {
      GM_setValue("opt_display_userColor", userColor)
      updateCSS()
    }
  })

  // background color
  new MutationObserver(mut => {
    mut.forEach(m => {
      let bgColor = m.target[m.attributeName]["background-color"]
      if (m.oldValue && bgColor != "") {
        GM_setValue("opt_display_bgColor", bgColor)
        updateCSS()
      }
    })
  }).observe($("body")[0], {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["style"]
  })


  // font increment
  new MutationObserver(mut => {
    mut.forEach(m => {
      let fs = m.target[m.attributeName]["font-size"]
      let fsOld = m.oldValue.match(/font-size: (\d+px);/)
      if (fsOld && fs != "" && fs != fsOld[1]) {
        GM_setValue("opt_display_fontSize", fs)
        updateCSS()
      }
    })
  }).observe($("html")[0], {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["style"]
  })


  // minimize DMDrawer if hideMessageBox is set
  if (GM_getValue("opt_gt2").hideMessageBox) {
    waitForKeyElements(`.gt2-opt-hide-message-box [data-testid=DMDrawer] path[d^="M12 19.344l-8.72"]`, e => {
      console.log("Minimized DMDrawer")
      $(e).parents("[role=button]").click()
    })
  }


  // hide timeline follow suggestions
  if (GM_getValue("opt_gt2").hideFollowSuggestions) {
    function hideTLFS($p) {
      if (!$p) return $p
      if ($p.prev().length) {
        $p = $p.prev()
        if ($p.find("article").length) return
        $p.addClass("gt2-hidden")
      } else {
        // if (window.scrollY < 500) return
        setTimeout(() => {
          $p = hideTLFS($p)
        }, 100)
      }
      return $p
    }

    // big follow boxes
    waitForKeyElements(
      ["topics/picker", "connect_people", "lists/suggested"]
      .filter((e, i) => (GM_getValue("opt_gt2").hideFollowSuggestionsSel & Math.pow(2, i)) == Math.pow(2, i))
      .map(e => `[data-testid=primaryColumn] section [href^="/i/${e}"]`)
      .join(", "), e => {

      let $p = $(e).parents("[data-testid=cellInnerDiv]").addClass("gt2-hidden")
      if ($p.next().find("div > div:empty").length) $p.next().addClass("gt2-hidden")
      for (let i=0; i < 6; i++) {
        $p = hideTLFS($p)
      }
    })
  }


  // do not colorOverride these elements (reply/like/retweet/share on tweets and verified badge)
  waitForKeyElements(`[data-testid=tweet] [role=group]`, e => $(e).find("[role=button] *").attr("data-gt2-color-override-ignore", ""))
  waitForKeyElements(`path[d^="M22.5 12.5c0-1.58-.875"]`, e => $(e).parents("svg").attr("data-gt2-color-override-ignore", ""))
  waitForKeyElements(`[data-gt2-path-modal="i/display"] div:nth-last-child(2) > div > [role=radiogroup],
                      [data-gt2-path="settings/display"] div:nth-last-child(2) > div > [role=radiogroup]`, e => {
    let $e = $(e).parents("[aria-labelledby]")
    $e.find("[name*=COLOR_PICKER]").parents("label").parent().find("*").attr("data-gt2-color-override-ignore", "")
    $e.find("[dir]:nth-child(3) + div:not([dir]) > div > div > div[dir] + div *").attr("data-gt2-color-override-ignore", "")
  })

  // do not add dividers to tweet inline threads
  waitForKeyElements(`[data-testid=cellInnerDiv] article,
                      [data-testid=cellInnerDiv] a[href^="/i/status/"]`, e => $(e).parents(`[data-testid=cellInnerDiv]`).children().attr("data-gt2-divider-add-ignore", ""))

  // color notifications bell
  waitForKeyElements(`path[d^="M23.61.15c-.375"]`, e => $(e).parents("[role=button]").attr("data-gt2-bell-full-color", ""))
  waitForKeyElements(`path[d^="M23.24 3.26h-2.425V"]`, e => $(e).parents("[role=button]").removeAttr("data-gt2-bell-full-color", ""))


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
      "rgb(255, 255, 255)": {
        bg:           "#e6ecf0",
        elem:         "rgb(255, 255, 255)",
        elemSel:      "rgb(247, 249, 250)",
        gray:         "rgb(91, 112, 131)",
        grayDark:     "#e6ecf0",
        grayDark2:    "rgb(196, 207, 214)",
        grayLight:    "rgb(101, 119, 134)",
        navbar:       "#ffffff",
        text:         "rgb(20, 23, 26)",
        text2:        "white",
        shadow:       "rgba(101, 119, 134, 0.15)",
        backdrop:     "rgba(0, 0, 0, 0.4)"
      },
      // dim
      "rgb(21, 32, 43)": {
        bg:           "#10171e",
        elem:         "rgb(21, 32, 43)",
        elemSel:      "rgb(25, 39, 52)",
        gray:         "rgb(101, 119, 134)",
        grayDark:     "#38444d",
        grayDark2:    "rgb(61, 84, 102)",
        grayLight:    "rgb(136, 153, 166)",
        navbar:       "#1c2938",
        text:         "rgb(255, 255, 255)",
        text2:        "white",
        shadow:       "rgba(136, 153, 166, 0.15)",
        backdrop:     "rgba(91, 112, 131, 0.4)"
      },
      // lightsOut
      "rgb(0, 0, 0)": {
        bg:           "#000000",
        elem:         "#000000",
        elemSel:      "rgb(21, 24, 28)",
        gray:         "#657786",
        grayDark:     "#38444d",
        grayDark2:    "rgb(47, 51, 54)",
        grayLight:    "rgb(110, 118, 125)",
        navbar:       "rgb(21, 24, 28)",
        text:         "rgb(217, 217, 217)",
        text2:        "white",
        shadow:       "rgba(255, 255, 255, 0.15)",
        backdrop:     "rgba(91, 112, 131, 0.4)"
      }
    }

    // high contrast color overrides
    let bgColorsHC = {
      // default (white)
      "rgb(255, 255, 255)": {
        gray:         "rgb(59, 76, 92)",
        grayDark:     "rgb(170, 184, 194)",
        grayLight:    "rgb(59, 76, 92)",
        text:         "rgb(20, 29, 38)"
      },
      // dim
      "rgb(21, 32, 43)": {
        elemSel:      "rgb(24, 36, 48)",
        gray:         "rgb(184, 203, 217)",
        grayDark:     "rgb(56, 68, 88)",
        grayLight:    "rgb(184, 203, 217)",
        text2:        "rgb(15, 20, 25)"
      },
      // lightsOut
      "rgb(0, 0, 0)": {
        bg:           "rgb(5, 5, 5)",
        elem:         "rgb(5, 5, 5)",
        elemSel:      "rgb(14, 16, 18)",
        gray:         "rgb(146, 156, 166)",
        grayDark:     "rgb(61, 65, 69)",
        grayLight:    "rgb(146, 156, 166)",
        text:         "rgb(255, 255, 255)",
        text2:        "rgb(15, 20, 25)"
      }
    }

    let baseColors = {
      //        normal            white hc          // dim/lo hc
      blue:     ["29, 161, 242",  "38, 74, 157",    "112, 200, 255"],
      green:    ["23, 191, 99",   "9, 102, 51",     "102, 211, 151"],
      red:      ["224, 36, 94",   "159, 12, 58",    "240, 152, 179"],
      redDark:  ["202, 32, 85",   "169, 36, 78",    "216, 137, 161"],
      yellow:   ["255, 173, 31",  "121, 80, 11",    "255, 203, 112"]
    }

    // initialize with the current settings
    if (GM_getValue("gt2_initialized") == undefined && isLoggedIn()) {
      waitForKeyElements(`h2 > a[href="/i/keyboard_shortcuts"] span`, () => {
        GM_setValue("opt_display_userColor",  $(`a[href="/i/keyboard_shortcuts"]`).css("color"))
        GM_setValue("opt_display_bgColor",    $("body").css("background-color"))
        GM_setValue("opt_display_highContrast", false)
        GM_setValue("opt_display_fontSize",   $("html").css("font-size"))
        GM_setValue("gt2_initialized",        true)
        window.location.reload()
      })

    } else {
      // add gt2-options to body for the css to take effect
      for (let [key, val] of Object.entries(GM_getValue("opt_gt2"))) {
        if (val) $("body").addClass(`gt2-opt-${key.toKebab()}${typeof val === "number" ? `-${val}` : ""}`)
      }

      // remove unneeded classes
      $("body").removeClass("gt2-acc-switcher-active")

      // delete old stylesheet
      if ($(".gt2-style").length) {
        $(".gt2-style, .gt2-style-pickr").remove()
      }

      let opt_display_bgColor      = GM_getValue("opt_display_bgColor")
      let opt_display_highContrast = GM_getValue("opt_display_highContrast")
      let opt_display_fontSize     = GM_getValue("opt_display_fontSize")
      let opt_display_userColor    = GM_getValue("opt_display_userColor")

      // options to set if not logged in
      if (!isLoggedIn()) {
        // get bgColor from cookie
        opt_display_bgColor      = document.cookie.match(/night_mode=1/)
                                   ? "rgb(21, 32, 43)"
                                   : document.cookie.match(/night_mode=2/)
                                     ? "rgb(0, 0, 0)"
                                     : "rgb(255, 255, 255)"
        opt_display_highContrast = false
        opt_display_fontSize     = "15px"
        opt_display_userColor    = "rgb(29, 161, 242)"
      }

      // highContrast lightsOut
      if (opt_display_bgColor == "rgb(5, 5, 5)") opt_display_bgColor = "rgb(0, 0, 0)"

      // squareAvatars
      if (GM_getValue("opt_gt2").disableHexagonAvatars) {
        waitForKeyElements("#hex-hw-shapeclip-clipconfig path", e => $(e).parent().html(
          GM_getValue("opt_gt2").squareAvatars
          ? `<rect cx="100" cy="100" ry="10" rx="10" width="200" height="200"></rect>`
          : `<circle cx="100" cy="100" r="100" />`
        ).attr("transform", "scale(0.005 0.005)"))
      }

      // insert new stylesheet
      $("html").prepend(`
        <style class="gt2-style">
          ${GM_getResourceText("css")
          .replace("--bgColors:$;",
            Object.entries(Object.assign(
              {},
              bgColors[opt_display_bgColor],
              opt_display_highContrast ? bgColorsHC[opt_display_bgColor] : {}
            )).map(e => `--color-${e[0].toKebab()}: ${e[1]};`).join(" ")
          )
          .replace("--baseColors:$;",
            Object.entries(baseColors)
            .map(e => [e[0].toKebab(), e[1][opt_display_highContrast ? opt_display_bgColor == "rgb(255, 255, 255)" ? 1 : 2 : 0]])
            .map(e => `--color-raw-${e[0]}: ${e[1]}; --color-${e[0]}: rgb(${e[1]});`)
            .join(" ")
          )
          .replace("$userColor",      opt_display_userColor.slice(4, -1))
          .replace("$globalFontSize", opt_display_fontSize)
          .replace("$fontOverride",   GM_getValue("opt_gt2").fontOverrideValue)
          .replace("$colorOverride",  GM_getValue("opt_gt2").colorOverrideValue)
          .replace("$scrollbarWidth", `${getScrollbarWidth()}px`)}
        </style>
        <style class="gt2-style-pickr">${GM_getResourceText("pickrCss")}</style>`
      )
    }

    // add navbar
    if (!$("gt2-nav").length) {
      if (isLoggedIn()) {
        addNavbar()
      } else {
        addNavbarLoggedOut()
      }
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
      $(".gt2-left-sidebar > *").each(function() {
        $(this).attr("data-gt2-detached-from-left-sidebar", 1)
        .detach().insertBefore("div[data-testid=sidebarColumn] > div > div:nth-child(2) > div > div > div > :last-child")
      })
    } else {
      $("[data-gt2-detached-from-left-sidebar]").each(function() {
        $(this).removeAttr("data-gt2-detached-from-left-sidebar")
        .detach().appendTo(".gt2-left-sidebar")
      })
    }
  })



  // ###############
  // #  scrolling  #
  // ###############


  // things to do when scrolling
  ;(function() {
    let prev = window.pageYOffset
    let bannerHeight = (window.innerWidth - getScrollbarWidth()) / 3 - 15

    $(window).on("scroll", () => {
      let curr = window.pageYOffset

      // prevent auto scroll to top on /search and /explore
      if (prev > 1500 && curr == 0 && getPath().match(/^(?:search\?|explore\/?$)/)) {
        window.scroll(0, prev)
        return
      }

      if (prev < curr) {
        $("body").addClass("gt2-scrolled-down")
      } else {
        $("body").removeClass("gt2-scrolled-down")
      }
      prev = curr

      // legacy profile banner parallax
      if (curr > bannerHeight) {
        $("body").addClass("gt2-scrolled-down-banner")
      } else {
        $("body").removeClass("gt2-scrolled-down-banner")
        $(".gt2-legacy-profile-banner img").css("transform", `translate3d(0px, ${curr / bannerHeight * 42}%, 0px)`)
      }
    })
  }())



  // ################
  // #  URL change  #
  // ################


  function beforeUrlChange(path) {
    path = path.split("?")[0].split("#")[0]
    // [LPL] reattach buttons to original position
    if (!_isModal(path)) {
      let $b = $("div[data-testid=primaryColumn] > div > div:nth-last-child(1) > div > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)")
      if (!$b.find("> div:last-child:not(:first-child)").length && $("body").attr("data-gt2-prev-path") != path) {
        $(".gt2-legacy-profile-nav-right > div").appendTo($b)
      }
    }
  }


  // path helper functions
  function _onPage(path, ...top) {
    return top.some(e => e == path.split("/")[0])
  }
  function _onSubPage(path, top, sub) {
    return (top == null ? true : _onPage(path, top)) && path.includes("/") && sub.some(e => e == (e.includes("/") ? path.split("/").slice(1).join("/") : path.split("/")[1]))
  }
  function _isModal(path) {
    return _onSubPage(path, "i", ["display", "keyboard_shortcuts", "flow", "lists/add_member", "report"])
        || _onSubPage(path, "settings", ["trends", "profile"])
        || _onSubPage(path, "compose", ["tweet"])
        || _onSubPage(path, "account", ["add", "switch"])
        || _onPage(path, "search-advanced")
        || _onPage(path, "intent")
        || path.match(/\/(photo|video)\/\d\/?$/)
  }


  // stuff to do when url changes
  function urlChange(changeType, changePath) {
    let path      = ()          => (changePath || getPath()).split("?")[0].split("#")[0]
    let onPage    = (...top)       => _onPage(path(), ...top)
    let onSubPage = (top, sub)  => _onSubPage(path(), top, sub)
    let isModal = _isModal(path())

    console.log(`[${changeType}]${isModal ? " [modal]" : ""} ${path()}`)


    $("body").attr(`data-gt2-path${isModal ? "-modal" : ""}`, path())
    let $realPath = $("link[hreflang=default][data-rh=true]")
    if ($realPath.length) $("body").attr("data-gt2-path", $realPath.attr("href"))

    // do a reload on these pages
    if (onPage("login") || (!isLoggedIn() && onPage(""))) {
      window.location.reload()
    }


    // update css
    if (!$("body").hasClass("gt2-css-inserted")) {
      updateCSS()
      $("body").addClass("gt2-css-inserted")
    }


    let mainView = "main > div > div > div"
    waitForKeyElements(mainView, () => {
      // insert left sidebar
      if (!$(".gt2-left-sidebar").length) {
        $(mainView).prepend(`<div class="gt2-left-sidebar"></div>`)
      }

      // on error page
      if ($(mainView).find("h1[data-testid=error-detail]").length && !path().startsWith("settings/gt2")) {
        $("body").addClass("gt2-page-error")
      } else if (!isModal) {
        $("body").removeClass("gt2-page-error")
      }

      if (onPage("settings")) {
        waitForKeyElements(`main a[href="/settings/about"]`, addSettingsToggle)
        if (path().startsWith("settings/gt2")) {
          addSettings()
          changeSettingsTitle()
        }
      }
    })


    // add navbar
    if ($("body").attr("data-gt2-prev-path") == "i/moment_maker") $(".gt2-nav").remove()
    if (!$(".gt2-nav").length) {
      if (isLoggedIn()) {
        addNavbar()
      } else {
        addNavbarLoggedOut()
      }
    }

    // highlight current location in left bar
    if (!isModal) {
      $(`.gt2-nav-left > a`).removeClass("active")
      $(`.gt2-nav-left > a[href^='/${path().split("/")[0]}']`).addClass("active")
    }

    // hide/add search
    if (onPage("search", "explore")) {
      $(".gt2-search").empty()
      $("body").removeClass("gt2-search-added")
    } else if (!isModal) {
      addSearch()
    }

    if (!isLoggedIn()) {
      $("body").addClass("gt2-not-logged-in")
    }


    // handle stuff in sidebars
    handleTrends()
    if (GM_getValue("opt_gt2").hideFollowSuggestions && (GM_getValue("opt_gt2").hideFollowSuggestionsLocSel & 2) == 2) {
      let sel = GM_getValue("opt_gt2").hideFollowSuggestionsSel

      // topic suggestions
      if ((sel & 1) == 1) waitForKeyElements(`div[data-testid=sidebarColumn] section [href^="/i/topics/"]`, e => $(e).parents("section").parent().parent().remove())

      // user suggestions (Who to follow, You might like)
      if ((sel & 2) == 2) waitForKeyElements(`div[data-testid=sidebarColumn] aside [data-testid=UserCell]`, e => $(e).parents("aside").parent().remove())
    }


    // settings
    if (onPage("settings") && !isModal) {
      if (path().startsWith("settings/gt2")) {
      } else {
        if (window.innerWidth < 1005) {
          $("main section").remove()
        }
        $(".gt2-settings-header, .gt2-settings").remove()
      }
    } else if (!isModal) {
      $(".gt2-settings-header, .gt2-settings").remove()
    }


    // tweet
    if (onSubPage(null, ["status"]) || path().startsWith("i/web/status/")) {
      $("body").addClass("gt2-page-tweet")
      // scroll up on load
      waitForKeyElements("[data-testid=tweet][tabindex=-1] time", () =>  window.scroll(0, window.pageYOffset - 75))

      // add source
      let m = location.pathname.match(/\/status\/(\d+)/)
      if (m) {
        requestTweet(m[1], res => {
          if (!res.source)
            return
          waitForKeyElements(`[data-testid=tweet][tabindex="-1"] [href*="${m[1]}"] time`, e => {
            if (GM_getValue("opt_gt2").hideTweetAnalytics) {
              e[0].parentElement.parentElement.querySelectorAll(":scope > span").forEach(e => e.classList.add("gt2-hidden"))
            }
            e[0].parentElement.insertAdjacentHTML("afterend", `<span class="gt2-tweet-source">${res.source}</span>`)
          })
        })
      }
    } else if (!isModal) {
      $("body").removeClass("gt2-page-tweet")
    }


    // sidebar
    let sidebarContent = []

    // update changelog
    if (!GM_getValue(`sb_notice_ack_update_${GM_info.script.version}`)
      && GM_getValue("opt_gt2").updateNotifications) {
      sidebarContent.push(getUpdateNotice())
    }
    sidebarContent.push(getDashboardProfile())


    // assume profile page
    if (!isModal || onSubPage("intent", ["user", "follow"])) {
      if (!(onPage("", "explore", "home", "hashtag", "i", "messages", "notifications", "places", "search", "settings", "404")
            || onSubPage(null, ["communities", "followers", "followers_you_follow", "following", "lists", "moments", "status", "topics"]))
          || onSubPage("intent", ["user", "follow"])) {
        $("body").addClass("gt2-page-profile").removeClass("gt2-profile-not-found gt2-page-profile-youre-blocked")
        $("[class^=gt2-blocked-profile-]").remove()
        $(".gt2-tco-expanded").removeClass("gt2-tco-expanded")
        if (GM_getValue("opt_gt2").legacyProfile) {
          if ($("body").attr("data-gt2-prev-path") != path()) {
            $("a[href$='/photo'] img").data("alreadyFound", false)
          }
          rebuildLegacyProfile()
        }

        // redirect to /media on profiles (without /intent)
        if (GM_getValue("opt_gt2").profileMediaRedirect && path().split("/").length == 1 && (!document.body.dataset.hasOwnProperty("gt2PrevPath") || document.body.dataset.gt2PrevPath.split("/")[0] != path().split("/")[0])) {
          waitForKeyElements(`[href$="/media"][aria-selected=false]`, e => e[0].click())
          console.log("redirecting to /media")
        }

        // move left media
        if (GM_getValue("opt_gt2").leftMedia
          && ((!GM_getValue("opt_gt2").smallSidebars && window.innerWidth > 1350)
            || (GM_getValue("opt_gt2").smallSidebars && window.innerWidth > 1230))) {

          waitForKeyElements("[data-testid=sidebarColumn] a:nth-child(1) [data-testid=tweetPhoto]", e => {
            if ($(".gt2-profile-media").length) $(".gt2-profile-media").remove()
            let $mediaContainer = $(e).parents("a[role=link]").parent().parent().parent().parent().parent()
            if ($mediaContainer.parent().children().length == 1) $mediaContainer = $mediaContainer.parent()
            $mediaContainer.detach().addClass("gt2-profile-media")
            .appendTo(".gt2-left-sidebar")
          })
        }

      } else {
        $("body").removeClass("gt2-page-profile")
        $(`.gt2-legacy-profile-banner,
           .gt2-legacy-profile-nav,
           .gt2-legacy-profile-info`).remove()
      }
    }


    // add elements to sidebar
    addToSidebar(sidebarContent)


    // own account is blocked by profile page
    waitForKeyElements(`div[data-testid=placementTracking] div[data-testid$="-unblock"],
                        [data-testid=emptyState] [href="https://support.twitter.com/articles/20172060"]`, displayBlockedProfileData)


    // home page
    if (path().split("/")[0] == "home") {
      if (GM_getValue("opt_gt2").forceLatest)
        forceLatest()
    } else {
      document.body.removeAttribute("data-switched-to-latest")
    }


    if (!isModal) $("body").attr("data-gt2-prev-path", path())
  }
  urlChange("init")


  // run urlChange() when history changes
  // https://github.com/Bl4Cc4t/GoodTwitter2/issues/96
  const exportFunc = typeof exportFunction === "function" ? exportFunction : (fn => fn)
  const pageWindow = unsafeWindow.wrappedJSObject || unsafeWindow
  const pageHistory = pageWindow.History.prototype

  const origPush = exportFunc(pageHistory.pushState, pageWindow)
  pageHistory.pushState = exportFunc(function () {
    let path = arguments[2].slice(1)
    beforeUrlChange(path)
    origPush.apply(this, arguments)
    urlChange("push", path)
  }, pageWindow)

  const origRepl = exportFunc(pageHistory.replaceState, pageWindow)
  pageHistory.replaceState = exportFunc(function () {
    let path = arguments[2].slice(1)
    beforeUrlChange(path)
    origRepl.apply(this, arguments)
    urlChange("replace", path)
  }, pageWindow)

  window.addEventListener("popstate", function() {
    beforeUrlChange(getPath())
    urlChange("pop", getPath())
  })


  // remove "t" search parameter (probably used for tracking?)
  // https://twitter.com/Outrojules/status/1543220843995619328?s=20&t=fCFEatQ_iAtlyiHQCWCxoQ
  let _selectNodeContents = Range.prototype.selectNodeContents
  Range.prototype.selectNodeContents = function() {
    arguments[0].textContent = arguments[0].textContent.replace(/&t=.*$/, "")
    _selectNodeContents.apply(this, arguments)
  }

})(jQuery, waitForKeyElements)

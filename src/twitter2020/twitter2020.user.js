// ==UserScript==
// @name          Twitter 2020
// @version       0.1.0
// @description   Makes X look like Twitter from 2019-2022. Do not use together with GoodTwitter2.
// @match         https://x.com/*
// @match         https://twitter.com/*
// @exclude       https://x.com/i/tweetdeck*
// @exclude       https://twitter.com/i/tweetdeck*
// @grant         GM_addStyle
// @run-at        document-start
// ==/UserScript==

(function () {
    "use strict"

    // filled in by tools/build/twitter2020.build.ts
    const CSS = __CSS__
    const ICONS = __ICONS__

    // nav links to restyle, keyed by href
    const NAV = {
        "/home": { label: "Home", icon: "home", activeIcon: "home.fill" },
        "/explore": { label: "Explore", icon: "tag", activeIcon: "tag.fill" },
        "/i/chat": { label: "Messages", icon: "mail" },
        "/messages": { label: "Messages", icon: "mail" },
        "/i/history": { label: "Bookmarks", icon: "bookmark" },
        "/i/bookmarks": { label: "Bookmarks", icon: "bookmark" },
    }

    // exact text replacements for buttons, menus and headings
    const TEXT = {
        "Post": "Tweet",
        "Post all": "Tweet all",
        "Posts": "Tweets",
        "Repost": "Retweet",
        "Reposts": "Retweets",
        "Undo repost": "Undo Retweet",
        "Quote": "Quote Tweet",
        "Quotes": "Quote Tweets",
        "Reply": "Reply",
        "What’s happening": "Trends for you",
        "History": "Bookmarks",
        "Post your reply": "Tweet your reply",
        "See new posts": "See new Tweets",
        "Delete post?": "Delete Tweet?",
        "Your post was sent.": "Your Tweet was sent.",
    }

    GM_addStyle(CSS)


    // tweet action icons, keyed by button data-testid
    const ACTIONS = {
        "reply": "chat-bubble",
        "retweet": "sync",
        "unretweet": "sync",
        "like": "favorite",
        "unlike": "favorite.fill",
        "bookmark": "bookmark",
        "removeBookmark": "bookmark",
    }

    // react owns the original children, so they only get hidden (see css) and ours is added next to them
    function setIcon(svg, name) {
        const d = ICONS[name]
        if (!svg || !d)
            return

        const current = svg.querySelector(":scope > g[data-t20]")
        if (current?.dataset.t20 === name)
            return

        current?.remove()
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
        g.dataset.t20 = name
        g.innerHTML = d.map(e => `<path d="${e}"></path>`).join("")
        svg.append(g)
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.dataset.t20Icon = ""
    }

    function patchActions(root) {
        if (root.nodeType !== Node.ELEMENT_NODE)
            return

        // react swaps icons inside the buttons, so look from the whole action bar
        root = root.closest("[role=group], [data-testid=sendDMFromProfile]") ?? root

        // profile "message" button was an envelope
        for (const button of root.querySelectorAll("[data-testid=sendDMFromProfile]"))
            setIcon(button.querySelector("svg"), "mail")

        for (const button of root.querySelectorAll("[role=group] button[data-testid], [role=group] a[href$=analytics], [role=group] button[aria-label]")) {
            const name = ACTIONS[button.dataset.testid]
                ?? (button.matches("a[href$=analytics]") ? "bar-chart" : null)
                ?? (button.closest("[role=group] > div:last-child") && !button.dataset.testid ? "upload" : null)
            if (name)
                setIcon(button.querySelector("svg"), name)
        }
    }

    function setLabel(link, label) {
        link.setAttribute("aria-label", label)
        const span = link.querySelector("div[dir] > span")
        if (span && span.textContent !== label)
            span.textContent = label
    }

    function softNavigate(event, href) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0)
            return

        event.preventDefault()
        history.pushState(null, "", href)
        window.dispatchEvent(new PopStateEvent("popstate"))
    }

    function addListsLink(nav) {
        const profile = nav.querySelector("a[data-testid=AppTabBar_Profile_Link]")
        if (!profile)
            return

        // react restyles the real links (e.g. icon only on narrow pages) but not the clone,
        // so clone again whenever the profile link's layout changed
        const layout = profile.className + [...profile.querySelectorAll("div, span")].map(e => e.className).join("|")
        const existing = nav.querySelector("a[data-t20-lists]")
        if (existing?.dataset.t20Layout === layout)
            return

        existing?.remove()

        const href = `${profile.getAttribute("href")}/lists`
        const lists = profile.cloneNode(true)
        lists.dataset.t20Lists = ""
        lists.dataset.t20Layout = layout
        lists.removeAttribute("data-testid")
        lists.setAttribute("href", href)
        setLabel(lists, "Lists")
        setIcon(lists.querySelector("svg"), "list-alt")
        lists.addEventListener("click", event => softNavigate(event, href))
        profile.before(lists)
    }

    function patchNav() {
        const nav = document.querySelector("header nav[role=navigation]")
        if (!nav)
            return

        for (const link of nav.querySelectorAll("a[href]")) {
            const href = link.getAttribute("href")
            const entry = NAV[href]
            if (!entry)
                continue

            setLabel(link, entry.label)
            const active = location.pathname.startsWith(href)
            setIcon(link.querySelector("svg"), active && entry.activeIcon ? entry.activeIcon : entry.icon)
        }

        // old twitter highlighted the current page in blue
        for (const link of nav.querySelectorAll("a[href]")) {
            const active = location.pathname === link.getAttribute("href")
            if (active !== link.hasAttribute("data-t20-active"))
                link.toggleAttribute("data-t20-active", active)
        }

        addListsLink(nav)
    }

    function patchTextNode(node) {
        // never touch what people wrote
        if (node.parentElement?.closest("[data-testid=tweetText], [contenteditable=true]"))
            return

        const value = node.nodeValue
        let replacement = TEXT[value]

        // "Show 12 posts"
        if (!replacement && /^Show \d+ posts?$/.test(value))
            replacement = value.replace(/posts?$/, "Tweets")

        // footer
        if (!replacement && /^© \d{4} X Corp\.$/.test(value))
            replacement = value.replace("X Corp.", "Twitter, Inc.")

        if (replacement && replacement !== value)
            node.nodeValue = replacement
    }

    function patchText(root) {
        if (root.nodeType === Node.TEXT_NODE)
            return patchTextNode(root)

        if (root.nodeType !== Node.ELEMENT_NODE)
            return

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode()))
            patchTextNode(node)
    }

    function patchTitle() {
        const title = document.title
        const fixed = title.replace(/ \/ X$/, " / Twitter").replace(/^X$/, "Twitter").replace(/^History \//, "Bookmarks /")
        if (fixed !== title)
            document.title = fixed
    }

    function patchFavicon() {
        for (const icon of document.querySelectorAll('link[rel="shortcut icon"]')) {
            const href = icon.getAttribute("href")
            if (href && href.includes("twitter.3.ico"))
                icon.setAttribute("href", href.replace("twitter.3.ico", "twitter.2.ico"))
        }
    }

    function patchAll(roots) {
        patchNav()
        for (const root of roots) {
            patchText(root)
            patchActions(root)
        }
        patchTitle()
        patchFavicon()
    }

    // batch mutations into one patch per frame, only walking changed nodes
    const pending = new Set()
    let scheduled = false
    function schedule(mutations) {
        for (const mutation of mutations) {
            if (mutation.type === "characterData" || mutation.type === "attributes")
                pending.add(mutation.target.parentElement ?? mutation.target)
            else
                mutation.addedNodes.forEach(node => pending.add(node))
        }

        if (scheduled)
            return

        scheduled = true
        requestAnimationFrame(() => {
            scheduled = false
            const roots = [...pending].filter(node => node.isConnected)
            pending.clear()
            patchAll(roots)
        })
    }

    function start() {
        patchAll([document.body])
        new MutationObserver(schedule).observe(document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["data-testid"],
        })
    }

    if (document.body)
        start()
    else
        document.addEventListener("DOMContentLoaded", start)
})()

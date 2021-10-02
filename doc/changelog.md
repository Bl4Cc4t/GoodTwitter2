# Changelog

## [0.0.32](https://github.com/Bl4Cc4t/GoodTwitter2/pull/350)
*released 2021-10-02*
#### Changes
- lots of visual fixes (you can see more details if you click on the version number above)
- twemojis should be more stable now

#### Information
- color issues will probably adressed in the next update
- I accidentally already put out the option to switch to older icon sets like Rosetta & use favorites instead of likes...
  this feature is not yet complete, I'm not sure when I have it ready.


## [0.0.31.1](https://github.com/Bl4Cc4t/GoodTwitter2/pull/328)
*released 2021-08-13*
#### Changes
- reverted follow buttons recolor on white themes ([#327](https://github.com/Bl4Cc4t/GoodTwitter2/issues/327))
- fixed "XY retweeted/liked" not showing up in the timeline when having "Hide Follow Suggestions" enabled ([#315](https://github.com/Bl4Cc4t/GoodTwitter2/issues/315), [#320](https://github.com/Bl4Cc4t/GoodTwitter2/issues/320))
- changed h2 headings back to their pre-update, thicker display
- added space above media in tweets back

#### Information
This is a small fix for the last update.

I know I said I won't release another update this month, but it didn't took that long to make.

Unless I missed something again, I'll really be gone for about a month :)


## [0.0.31](https://github.com/Bl4Cc4t/GoodTwitter2/pull/326)
*released 2021-08-12*
#### Changes
- adjusted layout to revert several of the [UI changes from 2021-08-11 ("ChirpUpdate")](https://twitter.com/TwitterDesign/status/1425505308563099650) ([#325](https://github.com/Bl4Cc4t/GoodTwitter2/issues/325))
  - reverted follow buttons recolor
  - reverted some icon recolors
  - re-added vertical dividers
- fixed forceLatest mode

#### Important information
This project is currently paused until start/mid of September, you can expect more updates/fixes then!
See [#325](https://github.com/Bl4Cc4t/GoodTwitter2/issues/321) for more information.
These somewhat drastic UI changes required me to release a quick update though.
See you in about a month!


## [0.0.30](https://github.com/Bl4Cc4t/GoodTwitter2/pull/274)
*released 2021-05-26*
#### New
- **[Translation]** Romanian added (thanks [Andy9001](https://github.com/Andy9001)!)
- **[New Option]** Move media tab to the left side sidebar (#179)
- **[New Option]** Use custom accent color (#58)

  <img src="https://user-images.githubusercontent.com/6740726/119689673-556c8f00-be49-11eb-99dc-bf0087255349.png" width="500px" />

- **[New Option]** Bunch up Tweet Interaction Buttons to the Left (#278)

  <img src="https://user-images.githubusercontent.com/6740726/119239851-340b5a80-bb4c-11eb-9b3e-962ebab2ceea.png" width="500px" />

- Made "Show more tweets" more noticable (#271)
- Reintroduced full-width indicators under the current tablist navigation element

   Before | After
   ----|-----
   ![image](https://user-images.githubusercontent.com/6740726/119239648-cad71780-bb4a-11eb-879d-332858ef617b.png) | ![image](https://user-images.githubusercontent.com/6740726/119239604-7d5aaa80-bb4a-11eb-9948-855afa6c4fd0.png)

#### Changes
- Ordered the settings page and made it easier to find what you're looking for
- *Hide Who To Follow* now is *Hide Follow Suggestions*.

  You can choose what to hide: users, topics and/or lists (in the sidebar and the timeline).

  <img src="https://user-images.githubusercontent.com/6740726/119239367-d88b9d80-bb48-11eb-80f0-e3713017f3d8.png" width="500px" />
- ~~some more white follow buttons (lists and topics) changed back to the colored variant (#266, #272)~~
  This was reverted by Twitter itself after 2 months.
- Card embeds in tweets now also expand with *Expand t.co shortlinks* activated
- Like usual, many bugfixes

#### Removed
- *Show NSFW Media in Messages* sadly no longer works/isn't possible to do anymore, so I removed it.


## [0.0.29](https://github.com/Bl4Cc4t/GoodTwitter2/pull/244)
*released 2021-03-24*
- **[Translation]** Polish added (thanks [@mkljczk](https://github.com/mkljczk)!)
- **[New Feature]** Ability to change the font on the site ([#264](https://github.com/Bl4Cc4t/GoodTwitter2/issues/264))
- made the quickblock feature optional and disabled it by default
- reverted latest color changes on the follow buttons
- many bugfixes


## [0.0.28](https://github.com/Bl4Cc4t/GoodTwitter2/pull/233)
*released 2020-12-23*
- **[New Option]** automatic `t.co` shortlinks expansion (enabled by default)
- Clicking on the "home" button on`/home` returns to top again (scrolling issue, [#229](https://github.com/Bl4Cc4t/GoodTwitter2/issues/229))
- some emoji fixes/unification (small sidebar profile now uses the twemojis)
- fixed the navbar header showing up on modals, e.g. when viewing pictures ([#235](https://github.com/Bl4Cc4t/GoodTwitter2/issues/235))
- **[New Feature]** you can now quickblock people by hovering over the "Follow" button until it turns into "Block" ([#132](https://github.com/Bl4Cc4t/GoodTwitter2/issues/132))


## [0.0.27](https://github.com/Bl4Cc4t/GoodTwitter2/pull/221)
*released 2020-12-04*
- Lots of bugfixes
  - [Legacy profile] No broken layout anymore ([#226](https://github.com/Bl4Cc4t/GoodTwitter2/issues/226))
  - [Legacy profile] Buttons do not disappear anymore
![image](https://user-images.githubusercontent.com/6740726/101200391-8623f680-3666-11eb-9684-bfc75574c4b7.png)
  - [Legacy profile] It is less likely for wrong data to appear, but it still can happen (I'm not sure how to fix this)
  - autoscroll on the search page now disabled again (when clicking the text input and then clicking on the page again, it scrolled all the way up again)
- Twitter changed the way tooltips work. Since they are transparent now, they are not that great to read. I made them solid for now

Layout | Image
-|-
Previous | ![image](https://user-images.githubusercontent.com/6740726/101198352-a0a8a080-3663-11eb-8c6e-e52d3f339d89.png)
New | ![image](https://user-images.githubusercontent.com/6740726/101198184-5a534180-3663-11eb-8c36-25e750501399.png)
Fixed | ![image](https://user-images.githubusercontent.com/6740726/101198394-b0c08000-3663-11eb-8fb2-acb4332dd750.png)


#### 0.0.26.2
- reverted 488dff0 ([#215](https://github.com/Bl4Cc4t/GoodTwitter2/issues/215))

#### 0.0.26.1
- recompiled css

## [0.0.26](https://github.com/Bl4Cc4t/GoodTwitter2/pull/174)
*released 2020-10-24*
- Portuguese translation added (Thanks [@fr0r](https://github.com/fr0r)!)
- fixed tweet translation issues
- Legacy profile layout
  - works again! ([#212](https://github.com/Bl4Cc4t/GoodTwitter2/issues/212))
  - added bio translation button ([#213](https://github.com/Bl4Cc4t/GoodTwitter2/issues/213))
  - the verified icon now shows up ([#204](https://github.com/Bl4Cc4t/GoodTwitter2/issues/204))
- fixed new US news trends not moving ([#210](https://github.com/Bl4Cc4t/GoodTwitter2/issues/210))
- fixed NSFW media in messages not showing up ([#206](https://github.com/Bl4Cc4t/GoodTwitter2/issues/206))


## [0.0.25](https://github.com/Bl4Cc4t/GoodTwitter2/pull/174)
*released 2020-09-14*
- various bug fixes for the Legacy Profile Layout and other small tweaks


## [0.0.24](https://github.com/Bl4Cc4t/GoodTwitter2/pull/161)
*released 2020-07-25*
- Simplified Chinese translation added (Thanks [@Hewasshushed](https://github.com/Hewasshushed)!)
- many bug fixes
- legacy profile layout adjusted
- integration of blocked profiles in the legacy layout
- fixed annoying auto scroll to top ([#164](https://github.com/Bl4Cc4t/GoodTwitter2/issues/148))
- option to show NSFW media in messages ([#148](https://github.com/Bl4Cc4t/GoodTwitter2/issues/148))
  - the view gets a bit wonky when scrolling fast.
  - clicking on the image previews does not open a tweet modal, the tweet will be opened directly
  - gif/video playback uses your browsers default player and should work normally.


## [0.0.23](https://github.com/Bl4Cc4t/GoodTwitter2/pull/145)
*released 2020-07-03*
- Display profile information for blocked profiles
- Option to show legacy profile layout ([#8](https://github.com/Bl4Cc4t/GoodTwitter2/issues/8))
- Bugfixes


#### 0.0.22.3
- temporary fix for ajax issues on VM / Waterfox ([#135](https://github.com/Bl4Cc4t/GoodTwitter2/issues/135))


#### 0.0.22.2
- settings hotfix \# 2


#### 0.0.22.1
- settings hotfix


## [0.0.22](https://github.com/Bl4Cc4t/GoodTwitter2/pull/108)
*released 2020-06-20*
- trends fixed
- 404 page styling
- options to hide trends and “who to follow”
- settings and messages pages styled
- Traditional Chinese translation added (Thanks [@roy4801](https://github.com/roy4801)!)
- added option to hide the recently added message box ([#124](https://github.com/Bl4Cc4t/GoodTwitter2/issues/124))


#### 0.0.21.1
- inline translation cookie hotfix


## [0.0.21](https://github.com/Bl4Cc4t/GoodTwitter2/pull/92)
*released 2020-06-12*
- French translation added (Thanks [@Aridow](https://github.com/Aridow)!)
- Korean translation added (Thanks [@Lastorder-DC](https://github.com/Lastorder-DC)!)
- Violentmonkey support (be gone, CSP issues!) thanks to [@tophf](https://github.com/tophf) (see [#96](https://github.com/Bl4Cc4t/GoodTwitter2/issues/96#issuecomment-643209498))
- various cosmetic fixes
- added changelog
- added translation button for tweets in timeline ([#32](https://github.com/Bl4Cc4t/GoodTwitter2/issues/32))


## [0.0.20](https://github.com/Bl4Cc4t/GoodTwitter2/pull/79)
*released 2020-06-06*
- Japanese translation added (Thanks [@Gizel-jiz](https://github.com/Gizel-jiz)!)
- Russian translation added (Thanks [@BrandtnerKPW](https://github.com/BrandtnerKPW)!)
- better color theme detection (no need to adjust anything anymore when installing for the first time)
- fixed many display issues
- properly scrollable sidebars
- option to always show 10 trends
- site is now usable without being logged in
  - additional feature: you can toggle nightmode by clicking on the little moon in your dashboard profile :)
- added notice to enable CSP on Firefox again!


## [0.0.19](https://github.com/Bl4Cc4t/GoodTwitter2/pull/65)
*released 2020-06-04*
- Swedish translation added (Thanks [@krokerik](https://github.com/krokerik)!)
- Spanish translation added (Thanks [@granmacco](https://github.com/granmacco)!)
- readme overhaul
- added issue templates
- ~~support for different usercolors with multiple accounts (https://github.com/Bl4Cc4t/GoodTwitter2/commit/2eb8989ba5f0bbef3450731c6201b004dcc47c53)~~
  - now obsolete, twitter doesn’t even support this natively


## 0.0.18
*released 2020-06-02*
- reworked i18n


## 0.0.17
*released 2020-06-02*
- edited color palette
- fixed funky scroll glitch™ ([#34](https://github.com/Bl4Cc4t/GoodTwitter2/issues/34))
- add colors to image modals ([#36](https://github.com/Bl4Cc4t/GoodTwitter2/issues/36))


## 0.0.16
*released 2020-06-02*
- change title on `/settings/gt2`
- cosmetic fixes


## 0.0.15
*released 2020-06-02*
- refactoring
- added toggle for bigger image previews ([#23](https://github.com/Bl4Cc4t/GoodTwitter2/issues/23))
- removed CSS sourcemap


## 0.0.14
*released 2020-06-01*
- added default values for avatar/banner ([#21](https://github.com/Bl4Cc4t/GoodTwitter2/issues/21))
- added toggle for square avatars ([#22](https://github.com/Bl4Cc4t/GoodTwitter2/issues/22))


## 0.0.13
*released 2020-05-29*
- added toggle for left sidebar trends ([#16](https://github.com/Bl4Cc4t/GoodTwitter2/issues/16))
- sticky sidebar fixes ([#17](https://github.com/Bl4Cc4t/GoodTwitter2/issues/17))
- moved left sidebar to a better location in the DOM ([#19](https://github.com/Bl4Cc4t/GoodTwitter2/issues/19))


## 0.0.12
*released 2020-05-23*
- added GT2 settings panel
- `forceLatest` fixes
- added sticky/small sidebars option ([#12](https://github.com/Bl4Cc4t/GoodTwitter2/issues/12))


## 0.0.11
*released 2020-05-21*
- account switcher toggle added ([#9](https://github.com/Bl4Cc4t/GoodTwitter2/issues/9))
- feature list added to readme


## 0.0.10
*released 2020-05-20*
- i18n added
- provide CSS sourcemap
- support font adjustments via display settings ([#2](https://github.com/Bl4Cc4t/GoodTwitter2/issues/2))


## 0.0.9
*released 2020-05-20*
- responsive CSS redesign ([#7](https://github.com/Bl4Cc4t/GoodTwitter2/issues/7))
- fixed scaling issues


## 0.0.8
*released 2020-05-19*
- added option to force latest tweets mode ([#5](https://github.com/Bl4Cc4t/GoodTwitter2/issues/5))


## 0.0.7
*released 2020-05-19*
- address firefox CSP workaround in readme ([#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))
- display settings fix
- wrap trends in anchors ([#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))
- minimized “What’s happening?” field by default ([#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))
- color adjustments
- added option to disable auto refresh of tweets on `/home`


## 0.0.6
*released 2020-05-18*
- search bar issue fixed
- Firefox CSS added


## 0.0.5
*released 2020-05-17*
- updated jQuery to v3.5.1
- scrollbarWidth added


## 0.0.4
*released 2020-05-17*
- fixes search issue ([#1](https://github.com/Bl4Cc4t/GoodTwitter2/issues/1))


## 0.0.3
*released 2020-05-16*
- added support for other background modes (not only dim)


## 0.0.2
*released 2020-05-13*
- Initial public release

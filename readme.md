# GoodTwitter 2 - Electric Boogaloo

A try to make Twitter look good again.

## Content
- [Background](#background)
- [Disclaimers](#disclaimers)
- [Features](#features)
- [Installation](#installation)
- [FAQ](#faq)
- [Previews](#previews)
- [Translations](#translations)


## Background
Since Twitter disabled the 2014 layout on June 1st 2020 and therefore [GoodTwitter](https://github.com/ZusorCode/GoodTwitter) [stop working too](https://twitter.com/ZusorOW/status/1258885451055800320), I decided to create a somewhat fix for the site.

## Disclaimers
- Please keep in mind that a few things break from time to time so creating pull requests and/or issues is appreciated.
  - The disableAutoRefresh feature is extremely buggy atm, any help would be very nice
- This is by no means a full recreation of the old design, it is more like a hybrid between the two.
- **Do not use this script together with the GoodTwitter extension. Disable it first!**

## Features
- Legacy Navbar is back!
- Your profile appears on the left side for most pages
- All display settings are supported!
  - The default and dim theme use the color palette from legacy twitter

### Custom Settings
#### Timeline
- *Force Latest*: Forces the “You’re seeing latest tweets first” display option
- *Disable Auto Refresh*: Hides newly loaded tweets and creates a button to show them. This feature is not stable.
- *Keep Tweets in Timeline*: Tries to disable the automatic removal of tweets once they are out of viewing range. This does not yet work.
#### Display
- *Sticky Sidebars*: This lets the sidebars stick to the page, so you will see them even if you scroll down.
- *Small Sidebars*: Don’t like sidebars taking up precious space? Decrease their width by 60px with this toggle.
- *Left Sidebar Trends*: Shows Trends in the left sidebar, if there is one.
- *Square Avatars*: pre-2017 square avatars.
- *Bigger Image Previews*: Images that are tall get displayed in their full height.

## Installation
To use this script, you need a userscript manager.

- Install Tampermonkey (Greasemonkey is not supported at the moment)
  - [Chrome Webstore](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox Add-Ons](https://addons.mozilla.org/de/firefox/addon/tampermonkey/)
- Then, click on [this link](https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js) and a new tab should open, prompting you with an installation screen.
- Hit install and you’re (almost) good to go!
- [Firefox only] Disable CSP (See [#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))
  - **Important notes:**
    - This makes you vulnerable to potential XSS attacks! You can read more about that [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
    - This procedure is hopefully not required forever (See [Tampermonkey#952](https://github.com/Tampermonkey/tampermonkey/issues/952))
  - Navigate to `about:config` (that is a Firefox specific page, so type that into your address bar)
  - search for the `security.csp.enable` flag and set it to `false`

## FAQ
### The highlights color does not match my settings!
By default, the blue color is selected and used internally in this script.

To change that, navigate to the display settings and select your current color setting again.
Now it should look the way you want!

### I want to help!
That’s awesome! If you want to help with the translations, check out [Adding translations](#adding-translations).

If you want to help with coding, you can take a look at the issue tracker. There are a lot of things that do not work correctly and I certainly could use some help with that :)

## Previews
![](https://i.imgur.com/3xY7IIpr.png)
![](https://i.imgur.com/gxg8CUEr.png)
![](https://i.imgur.com/Z7rzilXr.png)

## Translations
Thanks to these awesome people, there are translations available for the following languages:
- Spanish (added by [@granmacco](https://github.com/granmacco))
- Swedish (added by [@krokerik](https://github.com/krokerik))
- English and German are natively supported.

### Adding translations
If your language is not yet supported, you can help by adding it!
Open the following box to learn more.

<details>
  <summary>Adding an UI Translation</summary>

  1. Switch to the dev branch.
  1. Go to the i18n folder.
  1. If a translation does not yet exist for your language:
    1. Fork the repo
    1. Duplicate the `en.json` file and change the file name accordingly (i.e. `ja.json` or `nl.json`).
      1. You can get the language id by pressing <kbd>Ctrl</kbd> + <kbd>U</kbd> on the twitter page and looking at the second line:
        ![](https://i.imgur.com/AarcTav.png)
    1. Then, translate all strings and create a pull request.
    1. You can also of course search for potential spelling mistakes or the likes and correct them for existing translations!

  No idea how git works and too proud to learn it? You can also create an new issue with your translation.

  Be sure to wrap the contents in backticks, like this:
  ````
  ```content```
  ````
</details>

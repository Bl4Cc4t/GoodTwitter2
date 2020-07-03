<div align="center">
  <h1>GoodTwitter 2 - Electric Boogaloo</h1>

  A try to make Twitter look good again.

  [Changelog](https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/changelog.md)

</div>

## Content
- [Background](#background)
- [Disclaimers](#disclaimers)
- [Features](#features)
- [Installation](#installation)
- [FAQ](#faq)
- [Translations](#translations)
- [Previews](#previews)


## Background
Since Twitter disabled the 2014 layout on June 1st 2020 and therefore [GoodTwitter](https://github.com/ZusorCode/GoodTwitter) [stop working too](https://twitter.com/ZusorOW/status/1258885451055800320), I decided to create a somewhat fix for the site.

## Disclaimers
- Please keep in mind that a few things break from time to time so creating pull requests and/or issues is appreciated.
  - The disableAutoRefresh feature is extremely buggy atm, any help would be very nice
- This is by no means a full recreation of the old design, it is more like a hybrid between the two.

## Features
- Legacy Navbar is back!
![](https://i.imgur.com/Q4Ss6vkr.png)
- Legacy Profile Layout Option!
- Your profile appears on the left side for most pages
- All display settings are supported!
  - The default and dim theme use the color palette from legacy twitter
- Added toggle for nightmode when not logged in
- Translate tweets directly in your timeline!
- Various custom settings, take a look at the [previews](#previews)

## Installation
To use this script, you need a userscript manager.

- Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/get-it/) (Greasemonkey is not supported at the moment)
- Then, click on [this link](https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js) and a new tab should open, prompting you with an installation screen.
- Hit install and you should be good to go!
- [Firefox] You do not need to disable CSP on anymore. If you disabled it previously, see [this guide](https://github.com/Bl4Cc4t/GoodTwitter2/blob/master/doc/firefox-csp.md) on how to enable it again.

**Do not use this script together with the GoodTwitter extension. Disable it first!**

## FAQ
### The highlights color does not match my settings!
Normally, the script should detect what colors you are using.
If it somehow does not, just navigate to the display settings, switch to another color and then select your desired color again.
Now it should look the way you want!

### I use a very old version of Firefox and the script does not work
For Firefox 56.0 and similar versions, please use Violentmonkey.
If that does not help, please open a new issue.

### I want to help!
That’s awesome! If you want to help with the translations, check out [Adding translations](#adding-translations).

If you want to help with coding, you can take a look at the issue tracker. There are a lot of things that do not work correctly and I certainly could use some help with that :)

## Translations
Thanks to these awesome people, there are translations available for the following languages:
- Dutch (added by [@gvmelle](https://github.com/gvmelle))
- French (added by [@Aridow](https://github.com/Aridow))
- Japanese (added by [@Gizel-jiz](https://github.com/Gizel-jiz))
- Korean (added by [@Lastorder-DC](https://github.com/Lastorder-DC))
- Russian (added by [@BrandtnerKPW](https://github.com/BrandtnerKPW))
- Spanish (added by [@granmacco](https://github.com/granmacco))
- Swedish (added by [@krokerik](https://github.com/krokerik))
- Traditional Chinese (added by [@roy4801](https://github.com/roy4801))
- English and German are natively supported.

### Adding translations
If your language is not yet supported, you can help by adding it!
Open the following box to learn more.

<details>
  <summary>Adding an UI Translation</summary>

  - Switch to the dev branch.
  - Go to the i18n folder.
  - If a translation does not yet exist for your language:
    - Fork the repo
    - Duplicate the `en.json` file and change the file name accordingly (i.e. `ja.json` or `nl.json`).
      - You can get the language id by pressing <kbd>Ctrl</kbd>+<kbd>U</kbd> on the twitter page and looking at the second line:
![](https://i.imgur.com/AarcTav.png)

    - Then, translate all strings and create a pull request.
      - For all the strings in the first paragraph (before the first empty line): Please use the official translations on twitter if you can.
    - You can also of course search for potential spelling mistakes or the likes and correct them for existing translations!

  No idea how git works and too proud to learn it? You can also create an new issue with your translation.

  Be sure to wrap the contents in backticks, like this:
  ````
  ```content```
  ````
</details>

## Previews
![](https://i.imgur.com/3xY7IIp.png)
![](https://i.imgur.com/gxg8CUE.png)
![](https://i.imgur.com/nBzwaOe.png)
![](https://i.imgur.com/VR8Le4u.png)

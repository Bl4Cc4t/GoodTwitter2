## GoodTwitter 2 - Electric Boogaloo

A try to make Twitter look good again.

### Content
- [Background](#background)
- [Disclaimers](#disclaimers)
- [Features](#features)
- [Installation](#installation)
- [Hints](#hints)
- [Previews](#previews)


### Background
Since [GoodTwitter](https://github.com/ZusorCode/GoodTwitter) will [stop working on June 1st 2020](https://twitter.com/ZusorOW/status/1258885451055800320), I decided to create a somewhat fix for the site.

### Disclaimers
- Please keep in mind that a few things break from time to time so creating pull requests and/or issues is appreciated.
  - The disableAutoRefresh feature is extremely buggy atm, any help would be very nice
- This is by no means a full recreation of the old design, it is more like a hybrid between the two.
- **Do not use this script together with the GoodTwitter extension. Disable it first!**

### Features
- Legacy Navbar is back!
- Your profile appears on the left side for most pages
- All display settings are supported!
  - The default and dim theme use the color palette from legacy twitter

#### These settings:
![](https://i.imgur.com/i3XeekK.png)

### Installation
To use this script, you need a userscript manager.

- Install Tampermonkey (Greasemonkey is not supported at the moment)
  - [Chrome Webstore](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox Add-Ons](https://addons.mozilla.org/de/firefox/addon/tampermonkey/)
- Then, click on [this link](https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js) and a new tab should open, prompting you with an installation screen.
- Hit install and you’re (almost) good to go!
- [Firefox only] Navigate to `about:config` (that is a Firefox specific page, so type that in the address bar) and change the `security.csp.enable` flag to `false` (see [#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))

### Hints
#### The highlights color does not match my settings!
By default, the blue color is selected and used internally in this script.

To change that, navigate to the display settings and select your current color setting again.
Now it should look the way you want!

### Helping
Any help is appreciated!
Adding translations for the UI or even for this readme is not that difficult.

<details>
  <summary>Adding an UI Translation</summary>

  1. Go to the i18n folder.
  1. If a translation does not yet exist for your language, duplicate the `en.json` file and change the file name accordingly (i.e. `ja.json` or `nl.json`).
    - You can get the language id by pressing <kbd>Ctrl</kbd> + <kbd>U</kbd> on the twitter page and looking at the second line:
      ![](https://i.imgur.com/AarcTav.png)

  1. Then, translate all strings and create a pull request.

  No idea how git works and too proud to learn it? You can also create an new issue with your translation.

  Be sure to wrap the contents in
  ````
  ```code```
  ````

</details>

### Previews
![](https://i.imgur.com/3xY7IIpr.png)
![](https://i.imgur.com/gxg8CUEr.png)

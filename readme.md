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

### Features
- Legacy Navbar is back!
- Your profile appears on the left side for most pages
- All display settings are supported!
  - The default and dim theme use the color palette from legacy twitter

#### These settings:
![](https://i.imgur.com/gaz4ddV.png)

### Installation
To use this script, you need a userscript manager.

- Install Tampermonkey (Greasemonkey is not supported at the moment)
  - [Chrome Webstore](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
  - [Firefox Add-Ons](https://addons.mozilla.org/de/firefox/addon/tampermonkey/)
- Then, click on [this link](https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js) and a new tab should open, prompting you with an installation screen.
- Hit install and you’re (almost) good to go!
- [Firefox only] Navigate to `about:config` and change the `security.csp.enable` flag to `false` (see [#4](https://github.com/Bl4Cc4t/GoodTwitter2/issues/4))

### Hints
#### The colors do not match my settings!
By default, the blue color and the dim theme are selected and used internally in this script.

To change that, navigate to the display settings and select your current color/background setting again.
Now it should look the way you want!

### Previews
![](https://i.imgur.com/3xY7IIpr.png)
![](https://i.imgur.com/gxg8CUEr.png)

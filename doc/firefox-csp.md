## Upgrading to the latest version on Firefox

Since Tampermonkey Beta 4.11.6114 [#952](https://github.com/Tampermonkey/tampermonkey/issues/952#issuecomment-639909754), you do not have to disable the `security.csp.enable` flag anymore.

Disabling the flag makes you vulnerable to potential XSS attacks (read more about that [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)), therefore it is recommended for everyone on Firefox to upgrade/reenable that flag.

Here is a guide on how to do that:

### Part 1: Upgrading Tampermonkey
- Open your Add-ons page by pressing <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>
- Find your current Tampermonkey installation and either disable or remove it
![](https://i.imgur.com/t9MiaAM.png)
  - If you already have Tampermonkey BETA installed but you are unable to update for some reason, just remove and reinstall it again.
- Go to [this page](https://www.tampermonkey.net/?ext=dhdg&browser=firefox) and install the BETA version for Firefox.
- Click [here](https://github.com/Bl4Cc4t/GoodTwitter2/raw/master/twitter.gt2eb.user.js) to install GoodTwitter 2.

### Part 2: Reenabling `security.csp.enable`
- Go to `about:config` (type that into your address bar)
- Accept the warning
- In the search bar, type `security.csp.enable`.
- Either double click on the first value or click the button on the right.
- It should now look like this:
![](https://i.imgur.com/BHWsG5Y.png)

### End
- Now you can restart your browser, that should remove any cached content.
- Everything should work now, without being exposed!

Thank you for using GoodTwitter 2!

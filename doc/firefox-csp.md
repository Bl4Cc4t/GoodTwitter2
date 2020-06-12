## Firefox CSP

Since Tampermonkey Beta 4.11.6114 ([#952](https://github.com/Tampermonkey/tampermonkey/issues/952#issuecomment-639909754)) / GoodTwitter 2 v0.0.21 ([#96](https://github.com/Bl4Cc4t/GoodTwitter2/issues/96#issuecomment-643209498)) you do not have to disable the `security.csp.enable` flag anymore.

Disabling the flag makes you vulnerable to potential XSS attacks (read more about that [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)), therefore it is recommended for everyone on Firefox to reenable that flag.

Here is a guide on how to do that:

### Reenabling `security.csp.enable`
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

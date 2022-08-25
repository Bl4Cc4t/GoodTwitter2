# rollup-plugin-add-userscript-header

Rollup plugin that adds the userscript header to a .js file.

By default, the plugin uses the following fields from the projects `package.json`:
- name
- version
- author
- description
- license
- homepage

The `@downloadURL` & `@updateURL` get populated via the `repository` combined with the `main` field: `<repo>/raw/master/<main>`


`@grant` directives do not need to be added!
The plugin checks the given code for occurrences and adds them automatically.
This includes `GM.*` & `GM_*` calls, as well as


## Options
You can specify more tags in `package.json` by adding a `userscriptMetadata` field:

```json
{
  "name": "goodtwitter2",
  "version": "0.1.0",
  "description": "A try to make Twitter look good again.",
  "author": "schwarzkatz",
  "license": "MIT",
  "homepage": "https://github.com/Bl4Cc4t/GoodTwitter2#readme",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Bl4Cc4t/GoodTwitter2.git"
  },
  "main": "dist/goodtwitter2.user.js",
  "userscriptMetadata": {
    "match": [
      "https://twitter.com/*",
      "https://mobile.twitter.com/*"
    ],
    "exclude": [
      "https://twitter.com/i/cards/*",
      "https://twitter.com/i/release_notes",
      "https://twitter.com/*/privacy",
      "https://twitter.com/*/tos",
      "https://twitter.com/account/access"
    ],
    "connect": [
      "api.twitter.com"
    ],
    "resource": {
      "css": "dist/goodtwitter2.style.css",
      "i18n": "dist/goodtwitter2.i18n.js",
      "emojiRegex": "static/emoji-regex.txt"
    }
  }
}
```

... or by passing them to the plugin directly through the `rollup.config.js` file:

```js
import addUserscriptHeader from "./packages/rollup-plugin-add-userscript-header"

export default {
  input: "./src/main.ts",
  plugins: [
    addUserscriptHeader({
      meta: metaOptions
    })
  ]
}
```

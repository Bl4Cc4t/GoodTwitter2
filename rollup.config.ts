import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
import addUserscriptHeader from "./packages/rollup-plugin-add-userscript-header/dist/plugin"
import pkg from "./package.json"


const extensions = [".js", ".ts"]

export default {
  input: "./src/ts/main.ts",
  plugins: [
    // postcss({
    //   extract: "goodtwitter2.style.css",
    //   plugins: [ autoprefixer() ],
    //   // minimize: true
    // }),

    // Allows node_modules resolution
    commonjs(),
    resolve({ extensions }),

    // Compile TypeScript/JavaScript files
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"]
    }),
    addUserscriptHeader({
      meta: {
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
          // "css": "dist/goodtwitter2.style.css",
          "css": "twitter.gt2eb.style.css",
          "i18n": "dist/goodtwitter2.i18n.js",
          "emojiRegex": "static/emoji-regex.txt"
        }
      }
    })
  ],

  output: [{
    file: pkg.main,
    format: "iife",
    name: pkg.name
  }]
}


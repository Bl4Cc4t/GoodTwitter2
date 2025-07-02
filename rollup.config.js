import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import babel from "@rollup/plugin-babel"
import replace from "@rollup/plugin-replace"
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import inlineSvg from "postcss-inline-svg"
import addUserscriptHeader from "rollup-plugin-add-userscript-header"
import { string } from "rollup-plugin-string"
import svgAsSelector from "./tools/build/postcss-plugin.svg-as-selector"
import pkg from "./package.json"


const extensions = [".js", ".ts"]

export default {
    input: "./src/ts/main.ts",
    plugins: [
        // scss
        postcss({
            extract: "goodtwitter2.style.css",
            plugins: [
                inlineSvg(),
                svgAsSelector(),
                autoprefixer(),
                cssnano()
            ],
            sourceMap: "inline"
        }),

        // ts
        commonjs(),
        resolve({
            extensions,
        }),
        babel({
            extensions,
            babelHelpers: "bundled",
            include: ["src/**/*"]
        }),
        replace({
            include: "**/*.svg",
            preventAssignment: true,
            delimiters: ["", ""],
            values: {
                "<svg": `<svg class="gt2-icon"`
            }
        }),
        string({
            include: "**/*.svg"
        }),
        addUserscriptHeader({
            meta: {
                "run-at": "document-body",
                match: [
                    "https://twitter.com/*",
                    "https://mobile.twitter.com/*",
                    "https://x.com/*",
                    "https://mobile.x.com/*"
                ],
                exclude: [
                    "https://twitter.com/i/cards/*",
                    "https://twitter.com/i/tweetdeck",
                    "https://twitter.com/i/release_notes",
                    "https://twitter.com/*/privacy",
                    "https://twitter.com/*/tos",
                    "https://twitter.com/account/access",
                ].map(e => [e, e.replace("//twitter", "//x")]).flat(),
                grant: [
                    "GM_addElement"
                ],
                connect: [
                    "api.twitter.com",
                    "api.x.com"
                ],
                require: [
                    `releases/download/v${pkg.version}/goodtwitter2.i18n.js`
                ],
                resource: {
                    css: `releases/download/v${pkg.version}/goodtwitter2.style.css`,
                    // emojiRegex: "raw/master/static/emoji-regex.txt"
                    emojiRegex: "https://raw.githubusercontent.com/Bl4Cc4t/GoodTwitter2/master/data/emoji-regex.txt"
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

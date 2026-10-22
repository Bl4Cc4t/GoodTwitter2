import { mkdirSync, readFileSync, writeFileSync } from "fs"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import postcss from "postcss"
import inlineSvg from "postcss-inline-svg"
import * as sass from "sass"
import svgAsSelector from "./postcss-plugin.svg-as-selector.js"

const STYLE = "src/style/twitter2020.scss"
const SCRIPT = "src/twitter2020/twitter2020.user.js"
const OUT = "dist/twitter2020.user.js"

// icons that get swapped inline (nav links)
const INLINE_ICONS = [
    "home", "home.fill", "tag", "tag.fill", "mail", "bookmark", "list-alt",
    "chat-bubble", "sync", "favorite", "upload", "bar-chart",
]

const scss = sass.compile(STYLE)
const css = await postcss([inlineSvg(), svgAsSelector(), autoprefixer(), cssnano()])
    .process(scss.css, { from: STYLE })

for (const warning of css.warnings())
    console.warn(warning.toString())

const icons = Object.fromEntries(INLINE_ICONS.map(name => {
    const svg = readFileSync(`icon/2017-edge/${name}.svg`, "utf-8")
    return [name, [...svg.matchAll(/ d="([^"]+)"/g)].map(e => e[1])]
}))

// filled heart is the outer outline of the regular one
icons["favorite.fill"] = [icons["favorite"][0].replace(/z.*$/i, "z")]

const script = readFileSync(SCRIPT, "utf-8")
    .replace("__CSS__", () => JSON.stringify(css.css))
    .replace("__ICONS__", () => JSON.stringify(icons))

mkdirSync("dist", { recursive: true })
writeFileSync(OUT, script)
console.log(`created ${OUT} (${Math.round(script.length / 1024)} KiB)`)

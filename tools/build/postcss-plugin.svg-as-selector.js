import { existsSync, readFileSync } from "fs"
import { dirname, resolve } from "path"

function getSvgFilePath(file, url) {
    if (file)
        return resolve(dirname(file), url)

    return resolve(url)
}

export default (opts = {}) => {
    return {
        postcssPlugin: "postcss-svg-as-selector",
        prepare(result) {
            return {
                Once(css) {
                    const svgs = {}
                    css.walkRules((rule) => {
                        let updatedSelectors = []

                        for (let selector of rule.selectors) {
                            let match = selector.match(/(.*)svg-as-selector\[[^=]+=["']([^"']+)["']](.*)/)

                            if (match) {
                                const [_, prefix, path, suffix] = match
                                const svgSelector = getSvgSelector(path)
                                if (svgSelector)
                                    selector = `${prefix}${svgSelector}${suffix}`
                            }

                            updatedSelectors.push(selector)
                        }

                        rule.selectors = updatedSelectors


                        function readFile(file) {
                            if (!existsSync(file)) {
                                rule.warn(result, `File not found: '${file}'`)
                                return null
                            }

                            return readFileSync(file, { encoding: "utf-8" })
                        }

                        function getSvgSelector(path) {
                            const svgFilePath = getSvgFilePath(rule.source.input.file, path)

                            if (!svgs.hasOwnProperty(svgFilePath)) {
                                const code = readFile(svgFilePath)
                                svgs[svgFilePath] = getInnerSvgSelector(code)
                            }

                            return svgs[svgFilePath]

                            function getInnerSvgSelector(code) {
                                if (!code) return null

                                const match = code.match(/g>\s*<(\w+)\s+([^/>]+)\s*\/?>/)

                                if (!match) {
                                    rule.warn(result, `malformed svg file: '${svgFilePath}'`)
                                    return null
                                }

                                const [_, type, attributeStr] = match
                                const attributes = [...attributeStr.matchAll(/\s*([^=\s]+)\s*=\s*['"]([^'"]*)['"]/g)]
                                const attributeSelector = attributes.map(e => `[${e[1]}^="${e[2]}"]`).join()
                                // return `svg:has(${type}${attributeSelector})`
                                return `svg ${type}${attributeSelector}`
                            }
                        }
                    })
                }
            }
        }
    }
}

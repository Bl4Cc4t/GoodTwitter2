import fs from "fs"
import path from "path"
import parser from "@babel/parser"
import traverse from "@babel/traverse"
import { OutputPlugin } from "rollup"
import { Entries, GM_GRANT, META_ORDER, PluginOptions, UserscriptMetadata } from "./types"
import "./extension/array.extension"


function getPackageJson() {
  let pjPath = path.resolve("package.json")
  console.log(`Current package.json: ${pjPath}`)
  if (!fs.existsSync(pjPath))
    throw new Error(`${pjPath} not found!`)

  return JSON.parse(fs.readFileSync(pjPath).toString())
}


function getMetadata(packageJson: any): UserscriptMetadata {
  let meta = packageJson.userscriptMetadata ?? {}
  meta.grant = meta.grant ?? []

  // top level fields from package.json
  ;(["name", "version", "author", "description", "license", "homepage"] as const)
    .forEach(e => {
      meta[e] = meta[e] ?? packageJson[e]
    })

  // downloadURL / updateURL
  let repo = getRepo(packageJson)
  if (repo) {
    meta.downloadURL = meta.downloadURL ?? `${repo}/raw/master/${packageJson.main}`
    meta.updateURL   = meta.updateURL   ?? meta.downloadURL
  }

  return meta
}


function getRepo(packageJson): string | null {
  return packageJson?.repository?.url.replace(/(^git\+|\.git$)/g, "") ?? null
}


function getLocalUrl(url: string, packageJson: any): string {
  let repo = getRepo(packageJson)
  return url.startsWith("http") || !repo ? url : `${repo}/raw/master/${url}`
}


function getHeader(code: string, options: PluginOptions = {}) {
  let pack = getPackageJson()
  let meta = getMetadata(pack)
  const ast = parser.parse(code)

  let header = ""

  traverse(ast, {
    Identifier(path) {
      let name = path.node.name

      // GM.* calls & window.(close|focus|onurlchange) calls
      if (path.parentPath.type == "MemberExpression") {
        let parent = (path.parent as any).object.name

        if (parent == "GM" && GM_GRANT.indexOf(name) > -1)
          meta.grant.push(`GM.${name}`)

        else if (parent == "window" && name.match(/^(close|focus|onurlchange)$/))
          meta.grant.push(`window.${name}`)
      }

      // unsafeWindow & GM_* calls
      if (name == "unsafeWindow" || (name.match(/^GM_.+$/) && GM_GRANT.indexOf(name.slice(3)) > -1))
        meta.grant.push(path.node.name)
    },

    Program: {
      exit() {
        // no grants found, default to "none"
        if (meta.grant.length == 0)
          meta.grant.push("none")


        // add passed meta tags from babel.config.json
        if (options.meta?.grant?.length) {
          meta.grant = meta.grant.concat(options.meta.grant)
          delete options.meta.grant
        }
        Object.assign(meta, options.meta)


        header = (Object.entries(meta) as Entries<UserscriptMetadata>)
          // sort meta tags
          .sort((a, b) => META_ORDER.indexOf(a[0]) - META_ORDER.indexOf(b[0]))

          // edit the tags and their values
          .map((tag_entry) => {
            // boolean tags  only consist of the tag itself
            if (typeof tag_entry[1] == "boolean") return [[tag_entry[0], ""]]
            // single string tags don't need to be edited
            if (typeof tag_entry[1] == "string") return [tag_entry]

            // resource tags look like this:
            // @resource name url
            if (tag_entry[0] == "resource") {
              tag_entry[1] = Object.entries(tag_entry[1]).map(e => {
                let [name, url] = e
                return `${name} ${getLocalUrl(url, pack)}`
              })
            }

            // require tags only have the url as value.
            // it needs to be transformed to an actual url if it is a local file.
            if (tag_entry[0] == "require") {
              tag_entry[1] = tag_entry[1].map(e => getLocalUrl(e, pack))
            }

            // all other tags are treated as string arrays.
            return (tag_entry[1] as string[])
              .sort()
              .dedupe()
              .map(e => [tag_entry[0], e])
          })
          .flat()
          .map((e: any) => `// @${e[0].padEnd(14)}${e[1]}`.trimEnd())
          .join("\n")

      }
    }
  })

  return `// ==UserScript==\n${header}\n// ==/UserScript==`
}



export default function(options: PluginOptions): OutputPlugin {
  return {
    name: "add-userscript-header",
    generateBundle(_opt, bundle) {
      for (let outfile of Object.values(bundle)) {
        if (outfile.type == "chunk") {
          let header = getHeader(outfile.code, options)
          outfile.code = `${header}\n\n${outfile.code}`
        }
      }
    }
  }
}

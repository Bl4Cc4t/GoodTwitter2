#!/usr/bin/env node

require("./include")
const fs = require("fs")
const path = require("path")
const yaml = require("yaml")
require("yaml/types").strOptions.fold.lineWidth = 0


;(() => {
  let dir = path.join(__dirname, "..", "i18n")
  let en  = yaml.parseDocument(fs.readFileSync(path.join(dir, "en.yml"), "utf8"))

  fs.readdir(dir, (err, files) => {
    if (err) console.error(err)

    for (let file of files) {
      if (file.endsWith(".yml") && !file.match(/^en\.yml/)) {
        let foreign = yaml.parseDocument(fs.readFileSync(path.join(dir, file), "utf8"))

        // walk through yml file
        ;(function walk(...path) {
          let i = 0
          for (let e of en.getByPath(path).items) {
            if (e.value.type == "MAP") walk(...path, "items", i, "value")
            else {
              // add untranslated fields
              if (!foreign.toJSON().flatten().hasOwnProperty(e.key.value)) {
                console.log(`[${file.split(".")[0]}] added "${e.key.value}"`)
                let tmp = foreign.getByPath(path).items
                tmp.splice(i, 0, e)
                tmp[i].value.comment = " TODO translation missing!"
              }
            }
            i++
          }
        })("contents")


        // write file
        fs.writeFileSync(path.join(dir, file.split(".")[0] + ".yml"), foreign.toString())
      }
    }

  })
})()

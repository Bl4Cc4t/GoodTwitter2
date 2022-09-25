import fs from "fs"
import path from "path"
import yaml, { YAMLMap } from "yaml"
import "./extension/object.extension"


;(() => {
  let dir = path.resolve("i18n")
  let en  = yaml.parseDocument(fs.readFileSync(path.join(dir, "en.yml"), "utf8"))

  fs.readdir(dir, (err, files) => {
    if (err) console.error(err)

    for (let file of files) {
      if (file.endsWith(".yml") && file != "en.yml") {
        let foreign = yaml.parseDocument(fs.readFileSync(path.join(dir, file), "utf8"))

        // walk through yml file
        ;(function walk(...path: string[]) {
          let i = 0
          for (let e of en.getByPath(...path).items) {

            if (e.value instanceof YAMLMap) walk(...path, "items", i.toString(), "value")
            else {
              // add untranslated fields
              if (!foreign.toJSON().flatten().hasOwnProperty(e.key.value)) {
                console.log(`[${file.split(".")[0]}] added "${e.key.value}"`)
                let tmp = foreign.getByPath(...path).items
                tmp.splice(i, 0, e)
                tmp[i].value.comment = " TODO translation missing!"
              }
            }
            i++
          }
        })("contents")


        // write file
        fs.writeFileSync(path.join(dir, file.split(".")[0] + ".yml"), foreign.toString({ lineWidth: 0 }))
      }
    }

  })
})()

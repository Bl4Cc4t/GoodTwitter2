import * as fs from "fs"
import * as path from "path"
import * as yaml from "yaml"
import "./extension/object.extension"


;(() => {
  let dir = path.resolve("i18n")
  fs.readdir(dir, (err, files) => {
    if (err) console.error(err)

    let out = {}
    let ctr = 0
    for (let file of files.filter(e => e.endsWith(".yml"))) {
      let tl = yaml.parseDocument(fs.readFileSync(path.join(dir, file), "utf8"))

      // walk through yml file
      ;(function walk(...path: string[]) {
        let i = 0
        for (let e of tl.getByPath(...path).items) {
          if (e.value.type == "MAP") walk(...path, "items", i.toString(), "value")
          else {
            // remove untranslated fields
            if (e.value.comment && e.value.comment.match("TODO translation missing!")) {
              tl.getByPath(...path).delete(e.key.value)
              ctr++
            }
          }
          i++
        }
      })("contents")

      out[file.split(".")[0]] = tl.toJSON().flatten()
    }

    // how many strings got deleted?
    console.log(`Trimmed ${ctr} untranslated strings.`)

    // write file
    fs.writeFileSync(path.resolve("dist", "goodtwitter2.i18n.js"), `const i18n = ${JSON.stringify(out)}`)
  })

})()

#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

let dir = path.join(__dirname, "..", "i18n")
let en = fs.readFileSync(path.join(dir, "en.json"), "utf8")

fs.readdir(path.join(__dirname, "..", "i18n"), (err, files) => {
  if (err) console.error(err)

  for (let file of files) {
    if (file.endsWith(".json") && file != "en.json") {
      let foreign = fs.readFileSync(path.join(dir, file), "utf8")
      let out = []
      let enLines = en.split("\n")
      let foreignLines = foreign.split("\n")
      let offset = 0

      for (let lineNr=0; lineNr < enLines.length; lineNr++) {
        // line with key
        if (enLines[lineNr].match(/\"([^\"]+)\"/)) {
          // translated line (key exists)
          if (foreignLines[lineNr-offset].match(/\"([^\"]+)\"/)
           && enLines[lineNr].match(/\"([^\"]+)\"/)[1] == foreignLines[lineNr-offset].match(/\"([^\"]+)\"/)[1]) {
            let t = foreignLines[lineNr-offset].trimRight()
            if (!t.endsWith(",") && lineNr < enLines.length-3) t += ","
            out.push(t)

          // new untranslated line (add *NEW* in front of the english version)
          } else {
            out.push(enLines[lineNr].replace(/: \"/, ": \"*NEW* "))
            offset++
          }

        // other line
        } else {
          out.push(enLines[lineNr].trimRight())
          if (enLines[lineNr].trim() != foreignLines[lineNr-offset].trim()) offset++
        }
      }

      fs.writeFileSync(path.join(dir, file), out.join("\n"))
    }
  }

})

#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

fs.readdir(path.join(__dirname, "i18n"), (err, files) => {
  if (err) console.error(err)

  let out = "let i18n = {"
  for (let file of files) {
    if (file.endsWith(".json")) {
      out += `${file.slice(0, -5)}: ${fs.readFileSync(path.join(__dirname, "i18n", file), "utf8").trim()},`
    }
  }
  out += "}; module.exports = i18n"

  fs.writeFileSync(path.join(__dirname, "twitter.gt2eb.i18n.js"), out)
})

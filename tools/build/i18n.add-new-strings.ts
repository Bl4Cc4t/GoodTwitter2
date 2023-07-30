import fs from "fs"
import path from "path"
import yaml, { YAMLMap } from "yaml"
import "./extension/object.extension"

/**
 * Adds new untranslated strings from the english file to the others
 */
async function addNewStrings() {
    let i18nDir = path.resolve("i18n")

    let content = await fs.promises.readFile(path.join(i18nDir, "en.yml"), { encoding: "utf8" })
    const englishDocument = yaml.parseDocument(content)

    for (let file of await fs.promises.readdir(i18nDir)) {
        if (!file.endsWith(".yml") || file == "en.yml")
            continue

        content = await fs.promises.readFile(path.join(i18nDir, file), { encoding: "utf8" })
        let foreignDocument = yaml.parseDocument(content)
        const addedFields: string[] = []
        const language = file.replace(".yml", "")

        walk("contents")

        if (addedFields.length)
            console.log(`[${language}] added ${addedFields.join(", ")}`)

        // write file
        await fs.promises.writeFile(path.join(i18nDir, file.split(".")[0] + ".yml"), foreignDocument.toString({ lineWidth: 0 }))

        // walk through yml file
        function walk(...path: string[]) {
            let i = 0
            for (let e of englishDocument.getByPath(...path).items) {

                if (e.value instanceof YAMLMap) {
                    walk(...path, "items", i.toString(), "value")
                }
                // add untranslated fields
                else if (!foreignDocument.toJSON().flatten().hasOwnProperty(e.key.value)) {
                    addedFields.push(e.key.value)
                    let tmp = foreignDocument.getByPath(...path).items
                    tmp.splice(i, 0, e)
                    tmp[i].value.comment = " TODO translation missing!"
                }
                i++
            }
        }
    }
}

(async () => {
    await addNewStrings()
})()

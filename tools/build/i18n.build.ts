import fs from "fs"
import path from "path"
import yaml, { YAMLMap } from "yaml"
import "./extension/object.extension"

/**
 * Creates the i18n file.
 * @param filePath the path to the file
 */
async function buildI18n(filePath: string) {
    let i18nPath = path.resolve("i18n")
    let result = {}
    let counter = 0
    for (let file of await fs.promises.readdir(i18nPath)) {
        if (!file.endsWith(".yml"))
            continue

        const language = file.replace(".yml", "")
        const content = await fs.promises.readFile(path.join(i18nPath, file), { encoding: "utf8" })
        const document = yaml.parseDocument(content)

        // walk through yml file & remove untranslated strings
        walk("contents")
        result[language] = document.toJSON().flatten()

        function walk(...path: string[]) {
            let i = 0
            for (let item of document.getByPath(...path).items) {
                if (item.value instanceof YAMLMap) {
                    walk(...path, "items", i.toString(), "value")
                }
                // remove untranslated fields
                else if (item.value.comment?.match("TODO translation missing!")) {
                    document.getByPath(...path).delete(item.key.value)
                    counter++
                }
                i++
            }
        }
    }

    // how many strings got deleted?
    console.log(`Trimmed ${counter} untranslated strings.`)

    // write file
    let content = `(() => { window.i18n = ${JSON.stringify(result)} })();`
    await fs.promises.writeFile(path.resolve(filePath), content)
}

(async () => {
    await buildI18n("dist/goodtwitter2.i18n.js")
})()

const fs = require("fs")
const fsPromises = fs.promises
const path = require("path")

const { readDirectory, traverseFileTree } = require("./directory")
const { static_directories } = require("../config")

async function cacheUpdateStatus() {
    const data = await fsPromises.readFile("./cache/update.json", "utf8")
    return JSON.parse(data)
}

async function updateCache() {
    let status = await cacheUpdateStatus()
    console.log("status", status)
    let updated = false
    if (status["static-assets-data"] === true) {
        console.log("Actictivated")
        updated = true
        status["static-assets-data"] = false
        await updateStaticAssetsData()
    }
    if (updated) {
        await fs.promises.writeFile("./cache/update.json", JSON.stringify(status, null, "  "))
    }
}

async function updateStaticAssetsData() {
    const static_assets_data = {}
    for (const static_directory of static_directories) {
        const file_tree = await readDirectory(static_directory.path, static_directory.options)
        const dict = {}
        traverseFileTree(file_tree, (node) => {
            if (node.name !== "root") {
                let node_copy = JSON.parse(JSON.stringify(node))
                node_copy.children = node_copy.children.map(c => {
                    delete c.children
                    return c
                })
                const full_path = path.join(static_directory.prefix, node_copy.path)
                dict[full_path] = node_copy
            }
        })
        static_assets_data[static_directory.name] = {
            name: static_directory.name,
            path: static_directory.path,
            prefix: static_directory.prefix,
            tree: file_tree,
            dict
        }
    }
    await fsPromises.writeFile("./cache/static-assets-data.json", JSON.stringify(static_assets_data, null, "  "))
}

async function getStaticAssetsData() {
    const data = await fsPromises.readFile("./cache/static-assets-data.json")
    return JSON.parse(data)
}

module.exports = {
    updateCache,
    getStaticAssetsData
}
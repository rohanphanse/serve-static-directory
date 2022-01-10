const fs = require("fs")
const fsPromises = fs.promises

const { readDirectory, traverseFileTree } = require("./directory")
const { static_directory_path } = require("../config")

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
    const file_tree = await readDirectory(static_directory_path)
    const paths = []
    const dict = {}
    traverseFileTree(file_tree, (node) => {
        if (node.name !== "root") {
            let node_copy = JSON.parse(JSON.stringify(node))
            node_copy.children = node_copy.children.map(c => {
                delete c.children
                return c
            })
            dict[node_copy.path] = node_copy
        }
        paths.push(node.path)
    })
        await fsPromises.writeFile("./cache/static-assets-data.json", JSON.stringify({
            tree: file_tree,
            paths,
            dict
        }, null, "  "))
}

async function getStaticAssetsData() {
    const data = await fsPromises.readFile("./cache/static-assets-data.json")
    return JSON.parse(data)
}

module.exports = {
    updateCache,
    getStaticAssetsData
}
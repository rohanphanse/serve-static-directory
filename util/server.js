const mime_types = require("mime-types")
const fs = require("fs")
const fsPromises = fs.promises
const path = require("path")

const { getStaticAssetsData } = require("./cache")
const { static_directory_path } = require("../config")

async function serveStaticAsset(data, req, res) {
    try {
        const url = req.url[req.url.length - 1] === "/" ? req.url.substring(0, req.url.length - 1) : req.url
        if (data.paths.includes(url)) {
            const node = data.dict[url]
            if (node.type === "file") {
                const content_type = mime_types.lookup(node.path)
                const file_data = await fsPromises.readFile(path.join(static_directory_path, node.path))
                res.writeHead(200, {
                    "Content-Type": content_type
                })
                res.end(file_data)
            } else if (node.type === "directory") {
                res.writeHead(200, {
                    "Content-Type": "text/html"
                })
                res.end(JSON.stringify(node.children))
            } else {
                throw new Error("Server error :(")
            }
        } else {
            throw new Error("Not found :(")
        }
    } catch (e) {
        return { error: true, message: e.message }
    }
}

module.exports = {
    serveStaticAsset
}

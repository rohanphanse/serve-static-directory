const mime_types = require("mime-types")
const fs = require("fs")
const fsPromises = fs.promises
const path = require("path")

async function serveStaticAsset(data, req, res) {
    try {
        const url = req.url[req.url.length - 1] === "/" ? req.url.substring(0, req.url.length - 1) : req.url
        for (const name in data) {
            const static_directory_data = data[name]
            if (static_directory_data.dict.hasOwnProperty(url)) {
                const node = static_directory_data.dict[url]
                console.log("NODE", node)
                if (node.type === "file") {
                    const content_type = mime_types.lookup(node.path)
                    const file_data = await fsPromises.readFile(path.join(static_directory_data.path, node.path))
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
            }
        }
        throw new Error("Not found :(")
    } catch (e) {
        res.writeHead(404, {
            "Content-Type": "text/html"
        })
        return res.end("<h1>Error 404: Not Found :(</h1><a href = '/'>Return to Home</a>")
    }
}

module.exports = {
    serveStaticAsset
}

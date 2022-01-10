const http = require("http")
const fs = require("fs")
const fsPromises = fs.promises

const { readDirectory, traverseFileTree } = require("./util/directory")
const { updateCache, getStaticAssetsData } = require("./util/cache")
const { serveStaticAsset } = require("./util/server")

const port = process.env.PORT || 3000

;(async () => {
    console.log("Check for cache update...")
    await updateCache()
    const staticAssetsData = await getStaticAssetsData()
    const server = createHTTPServer({
        staticAssetsData
    })
    server.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
})()

function createHTTPServer(static_data) {
    return http.createServer((req, res) => {
        try {
            console.log(req.method, req.url)
            switch (req.method) {
                case "GET":
                    return handleGETRequest(req, res, static_data)
                case "POST":
                    return handlePOSTRequest(req, res)
                default:
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    })
                    return res.end(JSON.stringify({ error: true, message: `Request method "${req.method}" not supported` }))
            }
        } catch (error) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: true, message: error.message }))
        }
    })
}

async function handleGETRequest(req, res, static_data) {
    const { staticAssetsData } = static_data
    try {
        switch (req.url) {
            case "/":
                fs.readFile("./public/index.html", "utf8", (error, data) => {
                    if (error) {
                        throw new Error("Server error with index.html")
                    }
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    })
                    return res.end(data)
                })
                break
            case "/static-assets-data":
                res.writeHead(200, {
                    "Content-Type": "application/json"
                })
                return res.end(JSON.stringify(staticAssetsData, null, "  "))
            default:
                const result = await serveStaticAsset(staticAssetsData, req, res)
                if (result.error) {
                    res.writeHead(404, {
                        "Content-Type": "text/html"
                    })
                    return res.end("<h1>Error 404: Not Found :(</h1>")
                }
                break
        }
    } catch (error) {
        res.writeHead(500, {
            "Content-Type": "application/json"
        })
        return res.end(JSON.stringify({ error: true, message: error.message }))
    }
}
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
                default:
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    })
                    return res.end(JSON.stringify({ error: true, message: `Request method "${req.method}" not supported` }))
            }
        } catch (error) {
            console.error(error)
            res.writeHead(500, {
                "Content-Type": "application/json"
            })
            res.end(JSON.stringify({ error: true, message: "Server error" }))
        }
    })
}

async function handleGETRequest(req, res, static_data) {
    const { staticAssetsData } = static_data
    try {
        switch (req.url) {
            case "/":
                const data = await fsPromises.readFile("./public/index.html", "utf8")
                res.writeHead(200, {
                    "Content-Type": "text/html"
                })
                return res.end(data)
            case "/static-assets-data":
                res.writeHead(200, {
                    "Content-Type": "application/json"
                })
                return res.end(JSON.stringify(staticAssetsData, null, "  "))
            default:
                return await serveStaticAsset(staticAssetsData, req, res)
                
        }
    } catch (error) {
        res.writeHead(500, {
            "Content-Type": "application/json"
        })
        return res.end(JSON.stringify({ error: true, message: error.message }))
    }
}
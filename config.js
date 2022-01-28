module.exports = {
    static_directories: [
        {
            name: "root",
            path: "./",
            prefix: "/root",
            options: {
                ignore: ["/.git", "/.upm", "/.breakpoints", "/.replit"]
            }
        },
        {
            name: "public",
            path: "./public",
            prefix: "/"
        },
        {
            name: "express",
            path: "./node_modules/express",
            prefix: "/express"
        }
    ]
}
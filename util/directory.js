const fs = require("fs")
const fsPromises = fs.promises
const path = require("path")

class FileTree {
    constructor(root) {
        this.root = root || new Node({ name: "root", path: "/", type: "directory" })
    }
}

class Node {
    constructor (params) {
        this.name = params.name
        this.path = params.path
        this.type = params.type // Either directory or file
        this.children = params.children || []
    }
}

async function readDirectory(root_directory_path, options = {}) {
    try {
        let fileTree = new FileTree()

        async function readDirectoryRecursively(directory_node) {
            const children_names = await fsPromises.readdir(path.join(root_directory_path, directory_node.path))
            const check_ignore = Array.isArray(options.ignore)
            for (const name of children_names) {
                const node_path = path.join(directory_node.path, name)
                if (!(check_ignore && options.ignore.includes(node_path))) {
                    const stats = await fsPromises.stat(path.join(root_directory_path, node_path))
                    const type = stats.isDirectory() ? "directory" : "file"
                    const node = new Node({ 
                        name,
                        path: node_path,
                        type
                    })
                    directory_node.children.push(node)
                    if (type === "directory") {
                        await readDirectoryRecursively(node)
                    }
                }
            }
        }

        await readDirectoryRecursively(fileTree.root)
        console.log(fileTree)
        return fileTree
    } catch (error) {
        console.log(error)
        return { error: true, message: error.message }
    }
}

function traverseFileTree(file_tree, func) {
    function traverseDirectory(directory_node) {
        func(directory_node)
        for (const child of directory_node.children) {
            if (child.type === "directory") {
                traverseDirectory(child)
            } else {
                func(child)
            }
        }
    }
    traverseDirectory(file_tree.root)
}

module.exports = {
    readDirectory,
    traverseFileTree
}
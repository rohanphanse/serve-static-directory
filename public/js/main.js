document.addEventListener("DOMContentLoaded", () => {
    const staticAssetsTree = document.getElementById("static-assets-tree")
    const log = document.getElementById("log")
    
    ;(async () => {
        if (!sessionStorage.getItem("static-assets-data")) {
            let data = await fetch("/static-assets-data")
            data = await data.json()
            sessionStorage.setItem("static-assets-data", JSON.stringify(data))
        }
        const staticAssetsData = JSON.parse(sessionStorage.getItem("static-assets-data"))
        createStaticAssetsTree(staticAssetsData)
    })()

    function createStaticAssetsTree(staticAssetsData) {
        // logToHTML("TREEE")
        function createTree(directoryElement, directory_node) {
            let sortedChildren = directory_node.children.sort((n1, n2) => {
                const order = {
                    "directory": 1,
                    "file": 0
                }
                const difference = order[n2.type] - order[n1.type]
                return difference
            })
            for (const child of sortedChildren) {
                const container = document.createElement("div")
                const item = document.createElement("div")
                item.className = "file-tree-item"
                const icon = document.createElement("div")
                if (child.type === "directory") {
                    icon.classList.add("file-tree-item-directory-icon")
                    icon.classList.add("fas")
                    icon.classList.add("fa-folder-open")
                    item.append(icon)

                    const name = document.createElement("div")
                    name.className = "file-tree-item-name"
                    name.innerText = child.name
                    item.append(name)
                    container.append(item)

                    const childrenContainer = document.createElement("div")
                    childrenContainer.className = "file-tree-item-children"
                    container.append(childrenContainer)

                    item.addEventListener("click", () => {
                        if (childrenContainer.style.display === "none") {
                            childrenContainer.style.display = "flex"
                            icon.classList.remove("fa-folder")
                            icon.classList.add("fa-folder-open")
                        } else {
                            childrenContainer.style.display = "none"
                            icon.classList.remove("fa-folder-open")
                            icon.classList.add("fa-folder")
                        }
                    })
                    item.click()

                    createTree(childrenContainer, child)
                } else {
                    icon.classList.add("file-tree-item-file-icon")
                    const splitPath = child.path.split(".")
                    const fileExtension = splitPath[splitPath.length - 1]
                    const iconData = extensionToIcon[fileExtension] || {}
                    if (extensionToIcon[fileExtension]) {
                        for (const c of iconData.icon) {
                            icon.classList.add(c)
                        }
                        icon.style.color = iconData.color
                        if (iconData.backgroundColor) {
                            icon.style.backgroundColor = iconData.backgroundColor
                        }
                    } else {
                        icon.classList.add("fas")
                        icon.classList.add("fa-file")
                    }
                    
                    item.append(icon)

                    const link = document.createElement("a")
                    link.className = "file-tree-item-link"
                    link.href = child.path
                    link.innerText = child.name
                    item.append(link)
                    container.append(item)
                }
                directoryElement.append(container)
            }
        }
        createTree(staticAssetsTree, staticAssetsData.tree.root)
    }

    function logToHTML(message) {
        const li = document.createElement("li")
        li.innerText = typeof message === "object" ? JSON.stringify(message) : message
        log.append(li)
    }
})
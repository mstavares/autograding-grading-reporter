const fs = require("fs");
const path = require("path");

exports.GetAuthors = () => {
  const workspace = process.env.GITHUB_WORKSPACE
  const filePath = path.join(workspace, "AUTHORS.txt")

  // TODO: lidar com o facto do ficheiro não existir ou estiver mal formatado

  const authors = fs.readFileSync(filePath, "utf8")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const number = line.split(/;/)[0]
      return number.match(/a/i) ? number.slice(1) : number
    })

  return authors
}
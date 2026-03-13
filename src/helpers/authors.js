const fs = require("fs");
const path = require("path");

exports.GetAuthors = () => {
  const workspace = process.env.GITHUB_WORKSPACE
  const filePath = path.join(workspace, "AUTHORS.txt")

  if (!fs.existsSync(filePath)) {
    throw new Error("AUTHORS.txt não encontrado")
  }

  const file = fs.readFileSync(filePath, "utf8")

  /*
  file
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .forEach((line, index) => {
    if (!regex.test(line)) {
      throw new Error(`Linha ${index + 1} inválida em AUTHORS.txt: ${line}`)
    }
  })
  */

  const authors = file
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const number = line.split(/;/)[0]
      return number.match(/a/i) ? number.slice(1) : number
    })

  if (authors.length > process.env.AUTHORS_AMOUNT) {
    throw new Error(`AUTHORS.txt deve ter no máximo ${process.env.AUTHORS_AMOUNT} autor(es)`)
  } else if (authors.length == 0) {
    throw new Error(`Não foi possível ler o(s) autor(es) do ficheiro AUTHORS.txt`)
  }

  return authors
}
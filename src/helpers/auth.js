const { GetRow } = require('../sheets/spreadsheet')

exports.Auth = async (authors, callback) => {
  try {
    if (authors.length > process.env.AUTHORS_AMOUNT) {
      callback.failure(`Só podem existir no máximo ${process.env.AUTHORS_AMOUNT} alunos no ficheiro AUTHORS.txt`);
      return
    }

    const repositoryUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`
    const rowsFound = await getRepositoryInstances(repositoryUrl);

    console.log(authors)
    console.log(repositoryUrl)

    if (rowsFound.length == 0) {
      console.log('vou registar o repositorio para estes authors')
      await insertRepositoryIdForAuthors(repositoryUrl, authors)
      console.log("tudo ok, registado")
      callback.success(await getRepositoryInstances(repositoryUrl))
      return
    } else if (rowsFound.length == authors.length) {
      console.log("vou validar a pertença do repositorio")
      for (const numero of rowsFound.map(row => row.numero)) {
        console.log(`A validar ${numero}`)
        if (!authors.includes(numero)) {
          callback.failure(`Erro a autenticar ${numero}`)
          return
        }
      }
    } else {
      callback.failure("Ocorreu um erro durante a autenticacao")
      return
    }
    console.log("Autenticacao concluida")
    callback.success(rowsFound)
  } catch (err) {
    callback.failure(err);
  }
}

const getRepositoryInstances = (repositoryId) => {
  return new Promise((resolve, reject) => {
    GetRow(
      process.env.SPREADSHEET_ID,
      process.env.WORKSHEET_NAME,
      { title: 'repositorio', instance: repositoryId },
      {
        success: (found) => resolve(found),
        failure: (error) => reject(error)
      }
    )
  })
}

const insertRepositoryIdForAuthors = async (repositoryId, authors) => {
  authors.forEach(async author => {
    try {
      const info = await getAuthorInfo(author)
      console.log(`info: ${info.numero} - ${info.nome}`)
      info.repositorio = repositoryId
      await info.save()
    } catch (err) {
      console.error(err)
      //callback.failure(err);
    }
  })
}

const getAuthorInfo = (author) => {
  return new Promise((resolve, reject) => {
    GetRow(
      process.env.SPREADSHEET_ID,
      process.env.WORKSHEET_NAME,
      { title: 'numero', instance: author },
      {
        success: (found) => found[0] ? resolve(found[0]) : reject(`Nao encontrei o author: ${author}`),
        failure: (error) => reject(error)
      }
    )
  })
}
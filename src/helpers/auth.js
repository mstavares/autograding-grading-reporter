const { GetAuthors } = require('./authors')
const { GetRow } = require('../sheets/spreadsheet')


exports.Auth = async (callback) => {
  try {
    const authors = GetAuthors();
    const rowsFound = await getRepositoryInstances(process.env.GITHUB_REPOSITORY_ID);

    if (rowsFound.lenght == 0) {
      console.log('vou registar o repositorio para estes authors')
      insertRepositoryIdForAuthors(process.env.GITHUB_REPOSITORY_ID, authors)
      console.log("tudo ok, registado")
    } else if (rowsFound.lenght == authors.lenght) {
      console.log("vou validar a pertença do repositorio")
      // TODO validar que repositorio pertence aos autores
    } else {
      callback.failure("Ocorreu um erro durante a autenticacao");
      return;
    }

    callback.success("Autenticacao concluida");
  } catch (err) {
    callback.failure(err);
  }

  // TODO validar se a quantidade de authors bate certa com a variavel de ambiente
  // necessario par definir quantos alunos tem cada

  /*
  const rowsFound = await getRepositoryInstances(process.env.GITHUB_REPOSITORY_ID)

  if (rowsFound.lenght == 0) {
    console.log('vou registar o repositorio para estes authors')
    insertRepositoryIdForAuthors(process.env.GITHUB_REPOSITORY_ID, authors)
    console.log("tudo ok, registado")
  } else if (rowsFound.lenght == authors.length) {
    console.log("vou validar a pertença do repositorio")
    // TODO validar que repositorio pertence aos autores
  } else {
    callback.failure('Ocorreu um erro durante a autenticacao')
  }
    */

  /*
  GetRow(
    process.env.SPREADSHEET_ID,
    process.env.WORKSHEET_NAME,
    { title: 'repositorio', instance: process.env.GITHUB_REPOSITORY_ID },
    {
      success: async (row) => {
        console.log(row)
        /*
        console.log(`repositorio ${row.repositorio}`)
        if (row.repositorio == null) {
          row.repositorio = process.env.GITHUB_REPOSITORY_ID
          await row.save()
        } else if (row.repositorio != process.env.GITHUB_REPOSITORY_ID) {
          callback.failure(`Erro de authenticacao, id do repositorio errado ${process.env.GITHUB_REPOSITORY_ID}`)
          return
        }      
          
      },
      failure: (error) => callback.failure(error)
    }
  )
  */

  /*
  const authorsData = authors.map(author => {
    GetRow(
      process.env.SPREADSHEET_ID,
      process.env.WORKSHEET_NAME,
      { title: 'numero', instance: author },
      {
        success: async (row) => {
          return {
            ...author,
            row
          }
          /*
          console.log(row)
          console.log(`repositorio ${row.repositorio}`)
          if (row.repositorio == null) {
            row.repositorio = process.env.GITHUB_REPOSITORY_ID
            await row.save()
          } else if (row.repositorio != process.env.GITHUB_REPOSITORY_ID) {
            callback.failure(`Erro de authenticacao, id do repositorio errado ${process.env.GITHUB_REPOSITORY_ID}`)
            return
          }
            
        },
        failure: (error) => callback.failure(error)
      }
    )
  })

  if (authors)
  */

  

  /*
  GetWorksheet(process.env.SPREADSHEET_ID, process.env.WORKSHEET_NAME, {
    success: async (worksheet) => {
      //await worksheet.loadCells('A1:Z1000')

      /*
      GetAllRows(process.env.SPREADSHEET_ID, process.env.WORKSHEET_NAME, {
        success: (rows) => {
          const studentNumbers = rows[0]['_sheet'].headerValues.indexOf(classDay)
        },
        failure: (error) => callback.failure(error)
      })
        *
    },
    failure: (error) => callback.failure(error)
  })
    */
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

const insertRepositoryIdForAuthors = (repositoryId, authors) => {
  authors.forEach(async author => {
    const info = getAuthorInfo(author)
    info.repositorio = repositoryId
    await info.save()
    /*
    GetRow(
      process.env.SPREADSHEET_ID,
      process.env.WORKSHEET_NAME,
      { title: 'numero', instance: author },
      {
        success: async (row) => {
          row.repositorio = repositoryId
          await row.save()           
        },
        failure: (error) => callback.failure(error)
      }
    )
      */

  })
}

const getAuthorInfo = (author) => {
  return new Promise((resolve, reject) => {
    GetRow(
      process.env.SPREADSHEET_ID,
      process.env.WORKSHEET_NAME,
      { title: 'numero', instance: author },
      {
        success: (found) => resolve(found),
        failure: (error) => reject(error)
      }
    )
  })
}
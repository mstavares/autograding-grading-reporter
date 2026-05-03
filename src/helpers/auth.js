const { GetRow, GetWorksheet } = require('../sheets/spreadsheet')

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
      for (const numero of rowsFound.map(row => row.get('numero'))) {
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

const getRepositoryInstances = async (repositoryId) => {
  return await GetRow(
    process.env.SPREADSHEET_ID,
    process.env.WORKSHEET_NAME,
    { title: 'repositorio', instance: repositoryId }
  );
}

const insertRepositoryIdForAuthors = async (repositoryId, authors) => {
  const sheet = await GetWorksheet(
    process.env.SPREADSHEET_ID,
    process.env.WORKSHEET_NAME
  );

  await sheet.loadHeaderRow();
  const repositorioColIndex = sheet.headerValues.indexOf('repositorio');

  if (repositorioColIndex === -1) {
    throw new Error('Column "repositorio" not found in sheet');
  }

  const maxRow = 1000;
  await sheet.loadCells(`A1:Z${maxRow}`);

  for (const author of authors) {
    try {
      const info = await getAuthorInfo(author);
      console.log(`info: ${info.get('numero')} - ${info.get('nome')}`);

      const rowIndex = info._rowNumber - 1;
      const cell = sheet.getCell(rowIndex, repositorioColIndex);
      cell.value = repositoryId;
    } catch (err) {
      console.error(err);
    }
  }

  await sheet.saveUpdatedCells();
}

const getAuthorInfo = async (author) => {
  const found = await GetRow(
    process.env.SPREADSHEET_ID,
    process.env.WORKSHEET_NAME,
    { title: 'numero', instance: author }
  );

  if (!found[0]) {
    throw new Error(`Nao encontrei o author: ${author}`);
  }

  return found[0];
}
const { GoogleSpreadsheet } = require('google-spreadsheet');

const creds = JSON.parse(
  Buffer.from(process.env.SHEETS_CREDENTIALS, "base64").toString("utf8")
);

creds.private_key = creds.private_key.replace(/\\n/g, "\n")

exports.GetSpreadsheet = (spreadSheetId, callback) => {
  callback.sucess(GoogleSpreadsheet(spreadSheetId))
}

exports.GetAllWorksheets = (spreadsheetId, callback) => {
  const spreadsheet = new GoogleSpreadsheet(spreadsheetId)
  console.log(spreadsheet)

  spreadsheet.useServiceAccountAuth(creds, function (err) {
    if (err) {
      callback.failure(err)
      return
    }

    spreadsheet.getInfo((err, info) => {
      if (err) {
        callback.failure(err)
        return
      }

      if (info && info.worksheets) {
        console.log('sucesso')
        callback.success(info.worksheets)
      } else {
        callback.failure('Erro na folha de configurações')
      }
    })
  })
}

exports.GetWorksheet = (spreadsheetId, worksheetTitle, callback) => {
  (async function() {
    const spreadsheet = new GoogleSpreadsheet(spreadsheetId)
    await spreadsheet.useServiceAccountAuth(creds)
    await spreadsheet.loadInfo();
    if(spreadsheet) {
      const foundSheet = spreadsheet.sheetsByIndex.find(sheet => sheet.title.toLowerCase() === worksheetTitle.toLowerCase())  
      if(foundSheet) callback.success(foundSheet); else callback.failure('Folha ' + worksheetTitle + ' não encontrada')
    } else {
      console.log(`ERRO!! ${spreadsheet}, ${worksheetTitle}`)
      callback.failure('Erro na folha de configrações')
    }
  }());
}

exports.AddRows = (spreadsheet, worksheetTitle, data, callback) => {
  this.GetWorksheet(spreadsheet, worksheetTitle, {
    success: (sheet) => callback.result(sheet.addRows(data)),
    failure: (err) => callback.failure(err)
  })
}

exports.GetAllRows = (spreadsheetId, worksheetTitle, callback) => {
  this.GetWorksheet(spreadsheetId, worksheetTitle, {
    success: (worksheet) => {
      (async function() {
        const rows = await worksheet.getRows({ offset: 0 })
        if(rows) callback.success(rows); else callback.failure(err)
      }());
    },
    failure: (err) => callback.failure(err)
  })
}

/*
exports.GetRow = (spreadSheetId, worksheetTitle, criteria, callback) => {
  this.GetAllRows(spreadSheetId, worksheetTitle, {
    success: (rows) => {
      const row = rows.find(row => row[criteria.title].toLowerCase() === criteria.instance.toString().toLowerCase())
      if(row) callback.success(row); else callback.failure(criteria.instance + ' não existe em registo')
    },
    failure: (err) => callback.failure(err)
  })
}
*/

exports.GetRow = (spreadSheetId, worksheetTitle, criteria, callback) => {
  this.GetAllRows(spreadSheetId, worksheetTitle, {
    success: (rows) => {
      console.log(criteria)
      console.log(rows)
      const rowsFound = rows.filter(
        row => row[criteria.title] && row[criteria.title].toLowerCase() === criteria.instance.toString().toLowerCase()
      )
      console.log(`found ${rowsFound} # ${rowsFound.length}`)
      callback.success(rowsFound)
      // TODO lidar com o facto de nao encontrar registos
    },
    failure: (err) => callback.failure(err)
  })
}
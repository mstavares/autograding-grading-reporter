const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const creds = JSON.parse(
  Buffer.from(process.env.SHEETS_CREDENTIALS, "base64").toString("utf8")
);

creds.private_key = creds.private_key.replace(/\\n/g, "\n");

// Create service account auth for v5.x
const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

// Legacy callback-based functions - no longer used
// exports.GetSpreadsheet = (spreadSheetId, callback) => {
//   callback.sucess(GoogleSpreadsheet(spreadSheetId))
// }

exports.GetAllWorksheets = async (spreadsheetId) => {
  const spreadsheet = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  await spreadsheet.loadInfo();
  return spreadsheet.sheetsByIndex;
}

exports.GetWorksheet = async (spreadsheetId, worksheetTitle) => {
  const spreadsheet = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
  await spreadsheet.loadInfo();

  const foundSheet = spreadsheet.sheetsByIndex.find(
    sheet => sheet.title.toLowerCase() === worksheetTitle.toLowerCase()
  );

  if (!foundSheet) {
    throw new Error('Folha ' + worksheetTitle + ' não encontrada');
  }

  return foundSheet;
}

exports.AddRows = async (spreadsheet, worksheetTitle, data) => {
  const sheet = await exports.GetWorksheet(spreadsheet, worksheetTitle);
  return await sheet.addRows(data);
}

exports.GetAllRows = async (spreadsheetId, worksheetTitle) => {
  const worksheet = await exports.GetWorksheet(spreadsheetId, worksheetTitle);
  const rows = await worksheet.getRows({ offset: 0 });
  return rows;
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

exports.GetRow = async (spreadSheetId, worksheetTitle, criteria) => {
  const rows = await exports.GetAllRows(spreadSheetId, worksheetTitle);
  const rowsFound = rows.filter(
    row => row.get(criteria.title) &&
           row.get(criteria.title).toLowerCase() === criteria.instance.toString().toLowerCase()
  );
  return rowsFound;
}
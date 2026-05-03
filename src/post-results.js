const core = require("@actions/core");
const { GetAuthors } = require("./helpers/authors")
const { Auth } = require("./helpers/auth")
const { GetWorksheet } = require("./sheets/spreadsheet")

exports.PostResults = async function PostResults(runnerResults) {
  const authors = GetAuthors()

  Auth(authors, {
    success: async (authorsInfo) => {
      const testResults = runnerResults.map(result => ({
        testName: result.runner,
        score: result.results.status == "pass"
          ? result.results.max_score
          : 0
      }))

      const totalScore = testResults.reduce((sum, test) => sum + test.score, 0)

      console.log(totalScore)
      console.log(testResults)

      const sheet = await GetWorksheet(
        process.env.SPREADSHEET_ID,
        process.env.WORKSHEET_NAME
      );

      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;

      const maxRow = authorsInfo.length + 100;
      await sheet.loadCells(`A1:Z${maxRow}`);

      for (const info of authorsInfo) {
        const currentTotal = info.get('total');
        if (currentTotal && currentTotal > totalScore) continue;

        const rowIndex = info._rowNumber - 1;

        testResults.forEach(test => {
          const colIndex = headers.indexOf(test.testName);
          if (colIndex !== -1) {
            const cell = sheet.getCell(rowIndex, colIndex);
            cell.value = test.score;
          }
        });
      }

      await sheet.saveUpdatedCells();
    },
    failure: (error) => {
      console.error(error)
      core.setFailed(error.message)
    }
  })
};

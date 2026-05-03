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

      // Find column indices for student number and test columns
      const numeroColIndex = headers.indexOf('numero');
      const testColIndices = {};
      testResults.forEach(test => {
        const colIndex = headers.indexOf(test.testName);
        if (colIndex !== -1) {
          testColIndices[test.testName] = colIndex;
        }
      });

      console.log('Header mapping:', { numeroColIndex, testColIndices });

      // Load cells for all rows (including header)
      const maxRow = 300; // Adjust based on actual sheet size
      await sheet.loadCells(`A1:Z${maxRow}`);

      console.log(`Loaded cells, looking for ${authorsInfo.length} students`);

      // For each author, find their row and update test scores
      for (const info of authorsInfo) {
        const studentNumber = info.get('numero');
        const currentTotal = info.get('total');

        console.log(`Processing student ${studentNumber}, current total: ${currentTotal}`);

        if (currentTotal && currentTotal > totalScore) {
          console.log(`Skipping ${studentNumber} - current total ${currentTotal} > ${totalScore}`);
          continue;
        }

        // Find the row index by scanning the numero column
        let rowIndex = -1;
        for (let r = 1; r < maxRow; r++) { // Start at 1 to skip header
          const cell = sheet.getCell(r, numeroColIndex);
          if (cell.value == studentNumber) {
            rowIndex = r;
            break;
          }
        }

        if (rowIndex === -1) {
          console.error(`Could not find row for student ${studentNumber}`);
          continue;
        }

        console.log(`Found student ${studentNumber} at row ${rowIndex + 1}`);

        // Update test score cells
        testResults.forEach(test => {
          const colIndex = testColIndices[test.testName];
          if (colIndex !== undefined) {
            const cell = sheet.getCell(rowIndex, colIndex);
            console.log(`Setting ${test.testName} (col ${colIndex}) = ${test.score}`);
            cell.value = test.score;
          }
        });
      }

      console.log('Saving updated cells...');
      await sheet.saveUpdatedCells();
      console.log('✅ Cells saved successfully');
    },
    failure: (error) => {
      console.error(error)
      core.setFailed(error.message)
    }
  })
};

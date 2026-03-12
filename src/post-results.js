const core = require("@actions/core");
const { GetAuthors } = require("./helpers/authors")
const { Auth } = require("./helpers/auth")
const { GetAllWorksheets, GetWorksheet } = require("./sheets/spreadsheet")

exports.PostResults = async function PostResults(runnerResults) {
  // combine max score and total score from each {runner, results} pair
  // if max_score is greater than 0 run the rest of this code
  const { totalPoints } = runnerResults.reduce(
    (acc, { results }) => {
      results.tests.forEach(({ score }) => {
        acc.totalPoints += score;
      });

      return acc;
    },
    { totalPoints: 0 }
  );

  const authors = GetAuthors()

  console.log(authors)

  console.log(process.env.SPREADSHEET_ID)
  console.log(process.env.WORKSHEET_NAME)

  Auth(process.env.SPREADSHEET_ID, process.env.WORKSHEET_NAME, {
    success: (result) => {
      console.log(result)
    },
    failure: (error) => console.error(error)
  })

  /*
  GetAllWorksheets(process.env.SPREADSHEET_ID, {
    success: (result) => console.log(result),
    failure: (error) => console.error(error)
  })
    */



  /**
   * spreadsheet id
   * worksheet id
   * private key
   */

  /*
  const text = `Points ${totalPoints}/${maxPoints}`;
  const summary = JSON.stringify({ totalPoints, maxPoints })

  // create notice annotations with the final result and summary
  core.notice(text, {
    title: "Autograding complete",
  })

  core.notice(summary, {
    title: "Autograding report",
  })
  */
};

const insertGrade = (studentId, evaluation, callback) => {
    console.log(`${studentId}, ${evaluation}`)

    /*
    setTimeout(function(year, subject, studentId, evaluation, grade, callback) {
        storage.getRow(null, subject, { title: 'ano', instance: year }, {
            success: (subjectSpreadSheetId) => {
                storage.getRow(subjectSpreadSheetId.id, 'projeto avaliacao', { title: 'numero', instance: studentId }, {
                    success: (student) => {
                        if(student && evaluation in student) {
                            if(grade != "-") {
                                const avoidNoGrade = grade == "" || grade == null ? 0 : grade
                                student[evaluation.toString()] = avoidNoGrade;
                                student.save()
                                callback.success(`Nota registada com sucesso ${student.numero}, ${avoidNoGrade}`)
                            } else {
                                callback.success(`Aluno com nota (-) ${student.numero}`)
                            }
                        } else {
                            callback.failure('Não foi possivel registar a nota do aluno ', studentId)
                        }
                    },
                    failure: (err) => callback.failure(err)
                })
                
            },
            failure: (err) => callback.failure(err)
        })
    }, Math.floor(Math.random() * 11) * 1000, year, subject, studentId, evaluation, grade, callback)
    */
}

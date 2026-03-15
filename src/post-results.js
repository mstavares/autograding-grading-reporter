const core = require("@actions/core");
const { GetAuthors } = require("./helpers/authors")
const { Auth } = require("./helpers/auth")

exports.PostResults = async function PostResults(runnerResults) {
  const authors = GetAuthors()

  Auth(authors, {
    success: (authorsInfo) => {
      const testResults = runnerResults.map(result => ({
        testName: result.runner,
        score: result.results.status == "pass" 
          ? result.results.max_score 
          : 0
      }))

      const totalScore = testResults.reduce((sum, test) => sum + test.score, 0)

      console.log(totalScore)
      console.log(testResults)

      for (const info of authorsInfo) {
        if (info.total && info.total > totalScore) return
        info.total = totalScore

        testResults.forEach(test => {
          info[test.testName] = test.score
        })

        info.save()
      }
    },
    failure: (error) => console.error(error)
  })

};
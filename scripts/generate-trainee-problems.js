// To generate new traineeProblem:
// $ node scripts/generate-traineeProblem.js


const fs            = require('fs')
const path          = require('path')
const { faker }     = require('@faker-js/faker')
faker.locale        = 'en_GB'
const weighted      = require('weighted')
const moment        = require('moment')
const _             = require('lodash')
const utils         = require('../app/lib/utils.js')
// const userFilters   = require('../app/filters/traineeProblem.js').filters
// const permissions   = require('../app/data/permissions.js')

let providers = require('../app/data/accrediting-providers')
let trainees = require('../app/data/records.json')

// To keep track of which trainees have already been assigned to a problem
let traineesCache = {
  duplicate: [],
  forgotten: []
}


let randomDateInPast = () => {

  let returnDate = faker.date.between(
      moment().subtract(4, 'years'),
      moment().subtract(6, 'months')
    )

  return returnDate
}

let problemTypes = {
// templates for problems? function to generate problems?
  duplicate: function () {

    return {
      title: "These trainees appear to be duplicates",
      description: "Review these trainees and either delete or withdraw one of them",
      traineeCount: 2
    }

  },
  forgotten: function() {
    return {
      title: "This trainee may have been forgotten",
      description: `The expected end date of this trainee was ${moment(randomDateInPast()).fromNow()}.
      If the trainee is no longer in training you should award or withdraw them. If they are still in training you should
      update the expected end date of their course.`,
      traineeCount: 1
    }
  }
}


// Create a single user
const generateTraineeProblem = (provider, activeTrainees) => {

  if (!provider) console.log("Error in generateProblem: provider missing")

  let randomProblemType = faker.helpers.arrayElement(Object.keys(problemTypes))

  // Generate a problem
  let problem = Object.assign({}, problemTypes[randomProblemType]())


  // Pick a random trainee and remove it from the pool of available trainees
  const pickRandomTrainee = () => {
    let filteredTrainees = activeTrainees.filter(trainee => !traineesCache[randomProblemType].includes(trainee.id))

    let randomTrainee = faker.helpers.arrayElement(filteredTrainees)?.id

    // Make a note of which we've used
    traineesCache[randomProblemType].push(randomTrainee)
    // Remove this trainee so it doesn't appear again
    // _.remove(activeTrainees, trainee => trainee.id == randomTrainee)
    return randomTrainee
  }

  // Allow for a problem having multiple trainees
  problem.trainees = []

  for (var i = 0; i < problem.traineeCount; i++) {
    problem.trainees.push(pickRandomTrainee())
  }

  problem.type = randomProblemType
  problem.id = faker.datatype.uuid()
  problem.provider = provider.name

  return problem
}

// Generates a bunch of problems per provider
const generateFakeTraineeProblems = () => {
  let traineeProblems = []

  providers.selected.forEach(provider => {

    let providerTrainees = trainees.filter(trainee => trainee.provider == provider.name)

    let activeTrainees = providerTrainees.filter( trainee => utils.isActiveStatus(trainee) )

    // Create between 10 to 100 traineeProblems per provider
    let numberOfTraineeProblemsToCreate = utils.getRandomArbitrary(20, Math.min(activeTrainees.length / 2, 250))

    Array(numberOfTraineeProblemsToCreate).fill().map((item, index) => {

      let problem = generateTraineeProblem(provider, activeTrainees)
      traineeProblems.push(problem)
    })

  })

  return traineeProblems
}


const generateTraineeProblemsFile = (filePath) => {
  const problems = generateFakeTraineeProblems()

  console.log(`Generated ${problems.length} fake trainee problems`)

  const filedata = JSON.stringify(problems, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      // console.log(`Problem data generated: ${filePath}`)
    }
  )
}

generateTraineeProblemsFile(path.join(__dirname, '../app/data/trainee-problems.json'))

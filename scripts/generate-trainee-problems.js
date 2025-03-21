// To generate new traineeProblem:
// $ node scripts/generate-trainee-problems.js

const fs = require('fs')
const path = require('path')
const { fakerUK: faker } = require('@faker-js/faker')
const weighted = require('weighted')
const moment = require('moment')
const utils = require('../app/lib/utils.js')
// const userFilters   = require('../app/filters/traineeProblem.js').filters
// const permissions   = require('../app/data/permissions.js')

const providers = require('../app/data/accrediting-providers')
const trainees = require('../app/data/records.json')

const seedTraineeProblems = require('./../app/data/seed-trainee-problems.json')

// To keep track of which trainees have already been assigned to a problem
const traineesCache = {}

seedTraineeProblems.forEach(problem => {
  if (!traineesCache[problem.type]) {
    traineesCache[problem.type] = []
  }

  traineesCache[problem.type].concat(problem.trainees)
})

const randomDateInPast = (max = false, min = false) => {
  const returnDate = faker.date.between(
    moment().subtract(max || 48, 'months'),
    moment().subtract(min || 6, 'months')
  )
  return returnDate
}

const problemRatios = {
  duplicate: 0.2,
  duplicateDraft: 0.1,
  forgotten: 0.3,
  deferredForgotten: 0.03
}

const problemTypes = {
// templates for problems? function to generate problems?
  duplicate: function () {
    return {
      title: 'These trainees appear to be duplicates',
      description: 'Review these trainees and either withdraw one, or email us with an action to take',
      traineeCount: 2,
      filterTrainees: function (trainees) {
        return trainees.filter(trainee => utils.isActiveStatus(trainee))
      }
    }
  },
  duplicateDraft: function () {
    return {
      title: 'This draft appears to be a duplicate',
      description: 'Review whether this draft is a duplicate and either delete it or withdraw the existing trainee',
      traineeCount: 2,
      filterTrainees: function (trainees) {
        return trainees.filter(trainee => utils.isDraft(trainee))
      }
    }
  },
  forgotten: function () {
    return {
      title: 'This trainee may have been forgotten',
      description: `The expected end date of this trainee was <span class="govuk-!-font-weight-bold">${moment(randomDateInPast()).fromNow()}</span>.
      If the trainee is no longer in training you should award or withdraw them. If they are still in training you should
      update the expected end date of their course.`,
      traineeCount: 1,
      filterTrainees: function (trainees) {
        return trainees.filter(trainee => utils.isActiveStatus(trainee) && !utils.isDeferred(trainee))
      }
    }
  },
  deferredForgotten: function () {
    const relativeDate = moment(randomDateInPast(60, 24)).from(moment(), true)
    return {
      title: 'Confirm the deferral is still correct',
      description: `This trainee has been deferred for <span class="govuk-!-font-weight-bold">${relativeDate}</span>.
      If the trainee is still deferred, please update their expected end date. If they have left the course you should withdraw them.`,
      traineeCount: 1,
      filterTrainees: function (trainees) {
        return trainees.filter(trainee => utils.isDeferred(trainee))
      }
    }
  }
}

// Create a single user
const generateTraineeProblem = (provider, providerTrainees) => {
  if (!provider) console.log('Error in generateProblem: provider missing')

  // let randomProblemType = faker.helpers.arrayElement(Object.keys(problemTypes))

  const randomProblemType = weighted.select(problemRatios)

  // Generate a problem
  const problem = Object.assign({}, problemTypes[randomProblemType]())

  // Apply a filter so we only have suitable trainees to choose from
  const filteredTrainees = problem.filterTrainees(providerTrainees)

  // Pick a random trainee and remove it from the pool of available trainees
  const pickRandomTrainee = () => {
    const traineesNotUsed = filteredTrainees.filter(trainee => !traineesCache[randomProblemType]?.includes(trainee.id))

    if (traineesNotUsed.length === 0) {
      // console.log(`Error with pickRandomTrainee: ran out of trainees for ${randomProblemType}!`)
      return false
    } else {
      const randomTrainee = faker.helpers.arrayElement(traineesNotUsed)?.id

      // Make a note of which we've used
      traineesCache[randomProblemType] = traineesCache[randomProblemType] || []
      traineesCache[randomProblemType].push(randomTrainee)
      return randomTrainee
    }
  }

  // Allow for a problem having multiple trainees
  problem.trainees = []

  for (let i = 0; i < problem.traineeCount; i++) {
    problem.trainees.push(pickRandomTrainee())
  }

  problem.trainees = problem.trainees.filter(Boolean)

  problem.type = randomProblemType
  // Remap duplicate drafts as regular duplicate type
  if (problem.type === 'duplicateDraft') problem.type = 'duplicate'
  problem.id = faker.string.uuid()
  problem.provider = provider.name
  problem.date = randomDateInPast(12, 0)

  // Make sure we have populated some trainees.
  if (problem.trainees.length !== problem.traineeCount) {
    console.log('Error: insufficient trainees for given problem type. Exiting')
    console.log(problem.id)
    return null
  }

  return problem
}

// Generates a bunch of problems per provider
const generateFakeTraineeProblems = () => {
  const traineeProblems = [...seedTraineeProblems]

  providers.selected.forEach(provider => {
    const providerTrainees = trainees.filter(trainee => trainee.provider === provider.name)

    // Create random number of problems per provider with some limits
    const numberOfTraineeProblemsToCreate = utils.getRandomArbitrary(
      5,
      Math.min(providerTrainees.length / 5, 10)
    )

    console.log(`Generating ${numberOfTraineeProblemsToCreate} problems`)

    Array(numberOfTraineeProblemsToCreate).fill().forEach(() => {
      const problem = generateTraineeProblem(provider, providerTrainees)
      if (problem) {
        traineeProblems.push(problem)
      }
    })
  })

  return traineeProblems
}

const generateTraineeProblemsFile = (filePath) => {
  const problems = generateFakeTraineeProblems()

  console.log(traineesCache)

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

const moment = require('moment')
const weighted = require('weighted')
const { fakerEN_GB: faker } = require('@faker-js/faker')
const allSchools = require('../gis-schools.js')
const statusFilters = require('./../../filters/statuses.js').filters
const trainingRouteData = require('../training-route-data')

// Not used as we’re hardcoding
// const qualifications = require('./../academic-qualifications.js')

const qualifications = {
  postgraduate: [
    'None',
    'Postgraduate certificate in education',
    'Postgraduate diploma in education'
  ],
  // Only including a subset of possible undergraduate stuff
  undergraduate: [
    'None',
    'Bachelor of Arts',
    'Bachelor of Science'
  ]
}

module.exports = (record) => {
  // Whether the given route could have academic qualifications as well
  const academicQualificationsApply = trainingRouteData.trainingRoutes[record.route]?.academicQualificationsApply || false

  // Statuses where an outcome should have been set
  const statusShouldHaveOutcome = statusFilters.isRecommendedOrAwarded(record.status)

  // Posgraduate / Undergraduate
  const courseLevel = trainingRouteData.trainingRoutes[record.route].courseLevel

  // Pick a suitable qualification
  const possibleQualifications = qualifications[courseLevel.toLowerCase()]
  const randomQualification = faker.helpers.arrayElement(possibleQualifications)

  // Save to record
  if (academicQualificationsApply && statusShouldHaveOutcome) {
    return {
      academicQualification: randomQualification
    }
  } else return undefined
}

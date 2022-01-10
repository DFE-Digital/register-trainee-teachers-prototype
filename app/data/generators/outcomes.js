const moment            = require('moment')
const weighted          = require('weighted')
const faker             = require('faker')
const allSchools        = require('../gis-schools.js')
const statusFilters     = require('./../../filters/statuses.js').filters
const trainingRouteData = require('../training-route-data')

// Not used as we’re hardcoding
// const qualifications = require('./../academic-qualifications.js')

const qualifications = {
  postgraduate: [
    "None",
    "Postgraduate certificate in education",
    "Postgraduate diploma in education"
    ],
  // Only including a subset of possible undergraduate stuff
  undergraduate: [
    "None",
    "Bachelor of Arts",
    "Bachelor of Science"
  ]
}




module.exports = (record) => {

  // Whether the given route could have academic qualifications as well
  let academicQualificationsApply = trainingRouteData.trainingRoutes[record.route]?.academicQualificationsApply || false

  // Statuses where an outcome should have been set
  let statusShouldHaveOutcome = statusFilters.isRecommendedOrAwarded(record.status)

  // Posgraduate / Undergraduate
  let courseLevel = trainingRouteData.trainingRoutes[record.route].courseLevel

  // Pick a suitable qualification
  let possibleQualifications = qualifications[courseLevel.toLowerCase()]
  let randomQualification = faker.helpers.randomize(possibleQualifications)

  // Save to record
  if (academicQualificationsApply && statusShouldHaveOutcome){
    return {
      academicQualification: randomQualification
    }
  }
  else return undefined
}

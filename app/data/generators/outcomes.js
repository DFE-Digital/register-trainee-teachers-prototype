// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
const allSchools = require('../gis-schools.js')
const statusFilters = require('./../../filters/statuses.js').filters


const trainingRouteData = require('../training-route-data')


module.exports = (application) => {

  let academicQualificationsApply = trainingRouteData.trainingRoutes[application.route]?.academicQualificationsApply || false

  let statusShouldHaveOutcome = statusFilters.isRecommendedOrAwarded(application.status)

  if (academicQualificationsApply && statusShouldHaveOutcome){
    return {
      academicQualification: "PGDE"
    }
  }
  else return undefined
}

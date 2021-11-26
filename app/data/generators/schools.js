// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
const allSchools = require('../gis-schools.js')

// Using the urn to match against
const leadSchoolUrns = require('./../lead-schools.js').selected.map(school => school.urn)

// We'll only pick lead schools from our reduced set so there's more chance the same school gets
// picked repeatedly - so that we can then simulate accounts for lead schools
const filteredSchools = allSchools.filter(school => leadSchoolUrns.includes(school?.urn))

const trainingRouteData = require('../training-route-data')

faker.locale  = 'en_GB'

const requiresLeadSchool = params => {
  let routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes("leadSchool")
}

const requiresEmployingSchool = params => {
  let routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes("employingSchool")
}

module.exports = (params) => {

  let leadSchool = requiresLeadSchool(params) ? faker.helpers.randomize(filteredSchools) : null

  let employingSchool = null

  if (requiresEmployingSchool(params)) {
    // Attempt to pick an employing school with a similar postcode
    let tempEmploying = faker.helpers.randomize(allSchools.filter(school => {
      if (!school.postcode || !leadSchool?.postcode) return false
      else return school.postcode.startsWith(leadSchool.postcode.charAt(0))
    }))
    // Fall back to random school if we didn’t find a tempEmploying
    employingSchool = (!tempEmploying) ? faker.helpers.randomize(allSchools) : tempEmploying
  }

  return {
    ...(leadSchool ? {leadSchool} : {}), // conditional
    ...(employingSchool ? {employingSchool} : {}), // conditional
  }
}

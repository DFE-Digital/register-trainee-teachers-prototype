// Generates fake training details
const { fakerUK: faker } = require('@faker-js/faker')
const allSchools = require('../gis-schools.js')

// Using the urn to match against
const leadPartnerUrns = require('./../lead-schools.js').selected.map(school => school.urn)

// We'll only pick lead partners from our reduced set so there's more chance the same school gets
// picked repeatedly - so that we can then simulate accounts for lead partners
const filteredSchools = allSchools.filter(school => leadPartnerUrns.includes(school?.urn))

const trainingRouteData = require('../training-route-data')

const requiresLeadPartner = params => {
  const routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes('leadPartner')
}

const requiresEmployingSchool = params => {
  const routeData = trainingRouteData.trainingRoutes[params.route]
  return routeData.fields && routeData.fields.includes('employingSchool')
}

module.exports = (params) => {
  const leadPartner = requiresLeadPartner(params) ? faker.helpers.arrayElement(filteredSchools) : null

  let employingSchool = null

  if (requiresEmployingSchool(params)) {
    // Attempt to pick an employing school with a similar postcode
    const tempEmploying = faker.helpers.arrayElement(allSchools.filter(school => {
      if (!school.postcode || !leadPartner?.postcode) {
        return false
      } else {
        return school.postcode.startsWith(leadPartner.postcode.charAt(0))
      }
    }))
    // Fall back to random school if we didn’t find a tempEmploying
    employingSchool = (!tempEmploying) ? faker.helpers.arrayElement(allSchools) : tempEmploying
  }

  return {
    ...(leadPartner ? { leadPartner } : {}), // conditional
    ...(employingSchool ? { employingSchool } : {}) // conditional
  }
}

const { fakerEN_GB: faker } = require('@faker-js/faker')
const weighted = require('weighted')

const trainingRouteData = require('./../training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../../lib/utils.js')

module.exports = (params) => {
  const routeData = trainingRoutes[params.route]

  // Only some routes have financial support possible
  const availableFinancialSupport = utils.getFinancialSupport(params)

  const initiatives = routeData?.initiatives || []
  const randomInitiative = faker.helpers.arrayElement(initiatives)
  let initiative

  const noInitiativeString = 'Not on a training initiative'

  if (initiatives.length == 0) {
    initiative = noInitiativeString
  } else {
    // Majority of trainees not on initiatives
    initiative = weighted.select([noInitiativeString, randomInitiative], [0.95, 0.05])
  }

  // Only generate bursary data for routes that have bursaries
  let source = false
  if (availableFinancialSupport) {
    bursary = {}

    const isUsingFinancialSupport = weighted.select([true, false], [0.9, 0.1])

    if (isUsingFinancialSupport) {
      source = availableFinancialSupport.type

      // If scholarships are available, pick them 70% of the time
      if (availableFinancialSupport.scholarshipValue) {
        source = weighted.select([source, 'scholarship'], [0.3, 0.7])
      }
    } else source = 'self-funded'

    // Special handling for Early years graduate entry
    if (source == 'bursary' && availableFinancialSupport.tiersApply) {
      const selectedTier = faker.helpers.arrayElement(availableFinancialSupport.tiers)
      source = selectedTier.name
    }
  }

  return {
    initiative,
    ...(source ? { source } : {}) // conditional
  }
}

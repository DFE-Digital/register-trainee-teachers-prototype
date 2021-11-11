const faker   = require('faker')
const weighted = require('weighted')

const trainingRouteData = require('./../training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../../lib/utils.js')

module.exports = (params) => {

  let routeData = trainingRoutes[params.route]

  // Only some routes have financial support possible
  let availableFinancialSupport = utils.getFinancialSupport(params)

  let initiatives = routeData?.initiatives || []
  let randomInitiative = faker.helpers.randomize(initiatives)
  let initiative

  let noInitiativeString = 'Not on a training initiative'

  if (initiatives.length == 0){
   initiative = noInitiativeString
  }
  else {
    // Majority of trainees not on initiatives
    initiative = weighted.select([noInitiativeString, randomInitiative], [0.95, 0.05])
  }

  // Only generate bursary data for routes that have bursaries
  let source = false
  if (availableFinancialSupport){
    bursary = {}

    let isUsingFinancialSupport = weighted.select([true, false], [0.9, 0.1])

    if (isUsingFinancialSupport){
      source = availableFinancialSupport.type

      // If scholarships are available, pick them 70% of the time
      if (availableFinancialSupport.scholarshipValue){
        source = weighted.select([source, "scholarship"], [0.3, 0.7])
      }
    }
    else source = "self-funded"

    // Special handling for Early years (postgrad)
    if (source == 'bursary' && availableFinancialSupport.tiersApply){
      let selectedTier = faker.helpers.randomize(availableFinancialSupport.tiers)
      source = selectedTier.name
    }

  }

  return  {
    initiative,
    ...(source ? {source} : {}) // conditional
  }
}

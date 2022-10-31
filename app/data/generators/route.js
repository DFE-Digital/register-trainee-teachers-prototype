const { faker } = require('@faker-js/faker')
const moment    = require('moment')
const weighted  = require('weighted')

const trainingRouteData = require('../training-route-data.js')

// Training routes
const trainingRoutes = Object.keys(trainingRouteData.trainingRoutes)
const enabledTrainingRoutes = trainingRouteData.enabledTrainingRoutes

const enabledApplyRoutes = enabledTrainingRoutes.filter(route => trainingRouteData.applyRoutes.includes(route))

// Rough percentages for each type of provider

// SCITTs are a mix of provider led postgrad, School Direct, and niche routes
// HEIs are mostly provider led postgrad with some School Direct and apprenticeships
const routeRatios = {
  "SCITT": {
    'Assessment only': 0.01,
    'Early years assessment only': 0.01,
    'Early years graduate entry': 0.02,
    'Early years graduate employment based': 0.04,
    'Early years undergraduate': 0.01,
    'High potential initial teacher training (HPITT)': 0,
    'Opt-in (undergrad)': 0.02,
    'Provider-led (postgrad)': 0.30,
    'Provider-led (undergrad)': 0,
    'School direct (fee funded)': 0.34,
    'School direct (salaried)': 0.08,
    'Teaching apprenticeship (postgrad)': 0.05,
    'International qualified teacher status (iQTS)': 0.05
  },
  "HEI": {
    'Assessment only': 0,
    'Early years assessment only': 0,
    'Early years graduate entry': 0,
    'Early years graduate employment based': 0,
    'Early years undergraduate': 0,
    'High potential initial teacher training (HPITT)': 0,
    'Opt-in (undergrad)': 0.02,
    'Provider-led (postgrad)': 0.45,
    'Provider-led (undergrad)': 0.3,
    'School direct (fee funded)': 0.05,
    'School direct (salaried)': 0.05,
    'Teaching apprenticeship (postgrad)': 0.05,
    'International qualified teacher status (iQTS)': 0.05
  }
}

// Take the route ratios but filter for routes that aren't enabled
const pickLikelyRoute = (enabledRoutes, providerType) => {
  let reducedRatios = {}
  enabledRoutes.forEach(route => {
    if (routeRatios?.[providerType]?.[route]){
      reducedRatios[route] = routeRatios[providerType][route]
    }
  })
  return weighted.select(reducedRatios)
}



module.exports = application => {

  let providerType = application.accreditingProviderType

  if (application?.source == 'Apply') {
    return pickLikelyRoute(enabledApplyRoutes, providerType)
  }
  else {
    return pickLikelyRoute(enabledTrainingRoutes, providerType)
  }
}

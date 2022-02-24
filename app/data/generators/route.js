const faker = require('faker')
const moment = require('moment')
const weighted = require('weighted')

const trainingRouteData = require('../training-route-data.js')

// Training routes
const trainingRoutes = Object.keys(trainingRouteData.trainingRoutes)
const enabledTrainingRoutes = trainingRouteData.enabledTrainingRoutes

const enabledApplyRoutes = enabledTrainingRoutes.filter(route => trainingRouteData.applyRoutes.includes(route))

// Rough percentages for each type of provider

// SCITTs are a mix of provider led postgrad, school direct, and niche routes
// HEIs are mostly provider led postgrad with some school direct and apprenticeships
const routeRatios = {
  "SCITT": {
    'Assessment only': 0.04,
    'Early years (assessment only)': 0.02,
    'Early years (postgrad)': 0.02,
    'Early years (salaried)': 0.02,
    'Early years (undergrad)': 0.02,
    'High potential initial teacher training (HPITT)': 0,
    'Opt-in (undergrad)': 0.02,
    'Provider-led (postgrad)': 0.5,
    'Provider-led (undergrad)': 0,
    'School direct (fee funded)': 0.14,
    'School direct (salaried)': 0.14,
    'Teaching apprenticeship (postgrad)': 0.05
  },
  "HEI": {
    'Assessment only': 0,
    'Early years (assessment only)': 0,
    'Early years (postgrad)': 0,
    'Early years (salaried)': 0,
    'Early years (undergrad)': 0,
    'High potential initial teacher training (HPITT)': 0,
    'Opt-in (undergrad)': 0.02,
    'Provider-led (postgrad)': 0.7,
    'Provider-led (undergrad)': 0.1,
    'School direct (fee funded)': 0.05,
    'School direct (salaried)': 0.05,
    'Teaching apprenticeship (postgrad)': 0.05
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

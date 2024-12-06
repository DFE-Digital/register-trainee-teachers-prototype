// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../lib/utils')

// Leave this filters line
const filters = {}

// Filter out records for routes that aren't enabled
// Needs to be old style function declaration for *this* to work
filters.filterDisabledTrainingRoutes = function (records) {
  const enabledTrainingRoutes = _.get(this, 'ctx.data.settings.enabledTrainingRoutes')
  if (!enabledTrainingRoutes) return [] // Something went wrong
  const filteredRecords = records.filter(record => {
    return enabledTrainingRoutes.includes(record.route)
  })
  return filteredRecords
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

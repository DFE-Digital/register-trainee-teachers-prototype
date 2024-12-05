const moment = require('moment')
const _ = require('lodash')

// Leave this filters line
const filters = {}

const utils = require('./../lib/utils.js')

// Pick the highest access level from array of access levels
filters.getHighestLevel = array => {
  if (!array || !Array.isArray(array)) return false
  else if (array.includes('admin')) return 'admin'
  else if (array.includes('accreditingProvider')) return 'accreditingProvider'
  else if (array.includes('leadPartner')) return 'leadPartner'
  else return false
}

// -------------------------------------------------------------------
// General permissions
// -------------------------------------------------------------------

// Returns an array of the access levels of each signed-in providers
// This is mostly an internal utility function
// eg ['accreditingProvider', 'leadPartner', 'admin']
filters.getAccessLevels = function (providers, data) {
  data = data || this?.ctx?.data || false

  // Loop through each signed-in provider and get their type
  const accessLevels = providers.map(provider => utils.getProviderType.apply(this, [provider, data]))
  // if (data?.isAdmin) accessLevels.push("admin")
  return accessLevels
}

// Get the highest level of access the signed-in providers have
filters.getAccessLevel = function (providers, data) {
  data = data || this?.ctx?.data || false
  // Get all access levels
  const accessLevels = filters.getAccessLevels.apply(this, [providers, data])
  // Get highest of the access levels
  return filters.getHighestLevel(accessLevels)
}

// Check if a provider (or providers) have auth to do an action
// Usually this will be called via the `isAuthorised(action)` function
filters.providerIsAuthorised = function (providers, action) {
  const data = this?.ctx?.data || false

  const record = data?.record || false

  if (!providers || !action) {
    console.log('Error: no provider or action provided')
    return false
  }

  // `admin` / `accreditingProvider` / `leadPartner`
  const providerType = filters.getAccessLevel.apply(this, [providers])

  // Access on a record might be different - for instance might be signed in as
  // an accrediting provider *and* a lead partner, but viewing the record only as the
  // lead partner - in which case their access level for that record is as a lead
  // school only.
  const recordAccessLevel = filters.recordAccessLevel.apply(this, [record])

  // If viewing a record, get our record access, else our provider type will do
  const accessLevel = (record) ? recordAccessLevel : providerType

  const accreditingProviderActions = [
    'addTrainees',
    'bulkActions',
    'editRecords',
    'exportRecords',
    'recommendForAward',
    'showIncomplete',
    'showProblem',
    'viewDiversity',
    'viewDrafts',
    'viewRecords'
  ]

  const leadPartnerActions = [
    'viewRecords'
  ]

  if (accessLevel == 'admin') {
    if (action == 'addTrainees') return false
    else return true
  } else if (accessLevel == 'accreditingProvider') {
    return accreditingProviderActions.includes(action)
  } else if (accessLevel == 'leadPartner') {
    return leadPartnerActions.includes(action)
  } else {
    console.log(`Error: provider type ${providerType}, access level ${accessLevel} not recognised.`)
  }
}

// -------------------------------------------------------------------
// Record permissions
// -------------------------------------------------------------------

// Returns an array of the access levels of each signed-in provider
// eg ['accreditingProvider', 'leadPartner', 'admin']
filters.getRecordAccessLevels = function (record, data = false) {
  data = data || this?.ctx?.data || false

  const signedInProviders = data.signedInProviders

  // Loop through each signed-in provider and see if they have any rights to the
  // record.
  const accessLevels = signedInProviders.map(provider => {
    if (record?.provider == provider) return 'accreditingProvider'
    else if (record?.schools?.leadPartner?.schoolName == provider) return 'leadPartner'
    else return false
  }).filter(Boolean)
  if (data?.isAdmin) accessLevels.push('admin')

  return accessLevels
}

// Get the highest access level the viewing user has to a record
filters.recordAccessLevel = function (record, data = false) {
  data = data || this?.ctx?.data || false
  const accessLevels = filters.getRecordAccessLevels.apply(this, [record, data])
  return filters.getHighestLevel(accessLevels)
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters


const moment = require("moment");
const _ = require('lodash');

// Leave this filters line
var filters = {}

let utils = require("./../lib/utils.js")

// Pick the highest access level from array of access levels
filters.getHighestLevel = array => {
  if (!array || !Array.isArray(array)) return false
  else if (array.includes("admin")) return "admin"
  else if (array.includes("accreditingProvider")) return "accreditingProvider"
  else if (array.includes("leadSchool")) return "leadSchool"
  else return false
}

// -------------------------------------------------------------------
// General permissions
// -------------------------------------------------------------------


// Returns an array of the access levels of each signed-in providers
// This is mostly an internal utility function
// eg ['accreditingProvider', 'leadSchool', 'admin']
filters.getAccessLevels = function(providers, data){
  data = data || this?.ctx?.data || false

  // Loop through each signed-in provider and get their type
  let accessLevels = providers.map(provider => utils.getProviderType.apply(this, [provider, data]))
  if (data?.isAdmin) accessLevels.push("admin")
  return accessLevels
}

// Get the highest level of access the signed-in providers have
filters.getAccessLevel = function(providers, data){
  data = data || this?.ctx?.data || false
  // Get all access levels
  let accessLevels  = filters.getAccessLevels.apply(this, [providers, data])
  // Get highest of the access levels
  return filters.getHighestLevel(accessLevels)
}

// Check if a provider (or providers) have auth to do an action
// Usually this will be called via the `isAuthorised(action)` function
filters.providerIsAuthorised = function(providers, action){
  const data = this?.ctx?.data || false

  const record = data?.record || false

  if (!providers|| !action) {
    console.log("Error: no provider or action provided")
    return false
  }

  // `admin` / `accreditingProvider` / `leadSchool`
  const providerType = filters.getAccessLevel.apply(this, [providers])

  // Access on a record might be different - for instance might be signed in as
  // an accrediting provider *and* a lead school, but viewing the record only as the
  // lead school - in which case their access level for that record is as a lead 
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
    'viewDiversity',
    'viewDrafts',
    'viewRecords',
  ]

  const leadSchoolActions = [
    'viewRecords'
  ]

  if (accessLevel == "admin") {
    if (action == 'addTrainees') return false
    else return true
  }

  else if (accessLevel == "accreditingProvider"){
    return accreditingProviderActions.includes(action)
  }

  else if (accessLevel == "leadSchool"){
    return leadSchoolActions.includes(action)
  }

  else {
    console.log(`Error: provider type ${providerType} not recognised.`)
  }

}

// -------------------------------------------------------------------
// Record permissions
// -------------------------------------------------------------------


// Returns an array of the access levels of each signed-in provider
// eg ['accreditingProvider', 'leadSchool', 'admin']
filters.getRecordAccessLevels = function(record, data=false){
  data = data || this?.ctx?.data || false

  let signedInProviders = data.signedInProviders

  // Loop through each signed-in provider and see if they have any rights to the
  // record.
  let accessLevels = signedInProviders.map(provider => {
    if (record?.provider == provider) return 'accreditingProvider'
    else if (record?.schools?.leadSchool?.schoolName == provider) return 'leadSchool'
    else return false
  }).filter(Boolean)
  if (data?.isAdmin) accessLevels.push("admin")

  return accessLevels
}

// Get the highest access level the viewing user has to a record
filters.recordAccessLevel = function(record, data=false){
  data = data || this?.ctx?.data || false
  let accessLevels = filters.getRecordAccessLevels.apply(this, [record, data])
  return filters.getHighestLevel(accessLevels)
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

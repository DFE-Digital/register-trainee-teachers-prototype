
const moment = require("moment");
const _ = require('lodash');

// Leave this filters line
var filters = {}

let utils = require("./../lib/utils.js")

filters.getHighestLevel = array => {
  if (array.includes("admin")) return "admin"
  if (array.includes("accreditingProvider")) return "accreditingProvider"
  else if (array.includes("leadSchool")) return "leadSchool"
  else return false
}

// -------------------------------------------------------------------
// General permissions
// -------------------------------------------------------------------


// Returns an array of the access levels of each signed-in provider
filters.getAccessLevels = function(providers, data=false){
  data = data || this?.ctx?.data || false

  // Loop through each signed-in provider and get their type
  let accessLevels = providers.map(provider => utils.getProviderType(provider, data))
  if (data?.settings?.viewAsAdmin == 'true') accessLevels.push("admin")
  return accessLevels
}

// Returns an array of the access levels of each signed-in provider
filters.getAccessLevel = function(providers, data=false){
  data = data || this?.ctx?.data || false

  let accessLevels  = filters.getAccessLevels(providers, data)

  console.log({accessLevels})

  // Loop through each signed-in provider and get their type
  return filters.getHighestLevel(accessLevels)
}

// -------------------------------------------------------------------
// Record permissions
// -------------------------------------------------------------------


// Returns an array of the access levels of each signed-in provider
filters.getRecordAccessLevels = function(record, data=false){
  data = data || this?.ctx?.data || false

  let signedInProviders = data.signedInProviders
  console.log({signedInProviders})

  // Loop through each signed-in provider and see if they have any rights to the
  // record.
  let accessLevels = signedInProviders.map(provider => {
    if (record?.provider == provider) return 'accreditingProvider'
    else if (record?.schools?.leadSchool?.schoolName == provider) return 'leadSchool'
    else return false
  }).filter(Boolean)
  if (data?.settings?.viewAsAdmin == 'true') accessLevels.push("admin")

  return accessLevels
}

// Get the highest access level the viewing user has to a record
filters.recordAccessLevel = function(record, data=false){
  data = data || this?.ctx?.data || false

  let accessLevels = filters.getRecordAccessLevels(record, data)

  return filters.getHighestLevel(accessLevels)
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

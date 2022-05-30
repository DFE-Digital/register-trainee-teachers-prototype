
const moment = require("moment")
const _ = require('lodash')
const utils = require('../lib/utils.js')
const permissions = require('../data/permissions.js')

// Leave this filters line
var filters = {}

// Return an array of users that belong to the current signed in provider
filters.getProviderUsers = function(data){
  data = data || this?.ctx?.data || false

  let currentProvider = data.settings.userActiveProvider

  let providerUsers = data.users.byProvider?.[currentProvider]

  return providerUsers
}

// Generate a user’s email address
// Input: { data, user: {fullName}, provider}
filters.getUserEmail = function(params){

  data = params.data || this?.ctx?.data || false
  user = params.user || data.settings.defaultUser
  activeProvider = params.provider || data?.settings?.userActiveProvider
  return `${user.fullName.split(" ").join(".")}@${filters.makeFakeSchoolDomain(activeProvider)}`.toLowerCase()
}

// User a provider’s name to generate a somewhat realistic domain name
filters.makeFakeSchoolDomain = (input, array=[], tld="ac.uk") => {
  let output = input.toLowerCase()

  // Strip out a bunch of common words and phrases
  array = array.concat([
    "academy",
    "college",
    "for boys",
    "for girls",
    "grammar",
    "hei",
    "scitt", // should come before itt
    "itt",
    "of ",
    "school",
    "the ",
    "university"
    ])
  array.forEach(item => output = output.replace(item, ""))
  // Remove punctuation
  output = output.replace(/[.,'’\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim()
  // Split and remove falsy
  .split(" ").filter(Boolean)
  // If it’s got a single part name, add 'school'
  if (output.length == 1) output.push("school") 
  let joined = output.join('-')
  return `${joined}.${tld}`
}

// Accrediting provider admins have the most permissions
let allPossiblePermissions = permissions.allAdminPermissions.accreditingProvider

// Take a user’s urrent permissions and sort them by a predefined order
filters.sortPermissions = array => array.sort((a, b) => allPossiblePermissions.indexOf(a) - allPossiblePermissions.indexOf(b));

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

// const fs = require('fs')
// const path = require('path')
// const individualFunctionsFolder = path.join(__dirname, './functions')
const moment = require('moment')
const _ = require('lodash')
const permissions = require('./filters/permissions.js').filters
const { fakerEN_GB: faker } = require('@faker-js/faker')
faker.seed(123)


// const functions = {}

// Import functions from functions folder
// if (fs.existsSync(individualFunctionsFolder)) {
//   const files = fs.readdirSync(individualFunctionsFolder)
//   files.forEach(file => {
//     const fileData = require(path.join(individualFunctionsFolder, file))
//     // Loop through each exported function in file (likely just one)
//     Object.keys(fileData).forEach((functionGroup) => {
//       // Get each method from the file
//       Object.keys(fileData[functionGroup]).forEach(functionName => {
//         functions[functionName] = fileData[functionGroup][functionName]
//       })
//     })
//   })
// }

// Return today’s date
exports.today = () => {
  return moment().format('YYYY-MM-DD')
}

exports.nowUTC = () => {
  return Date.now()
}

/*
  ---------------------------------------
  Get current month
  ---------------------------------------
  For example, if it’s January:
  - currentMonth() = 01
  - currentMonth(nameOfMonth) = ‘January’
*/
exports.currentMonth = (type) => {
  if (type === 'nameOfMonth') {
    return moment().format('MMMM')
  } else {
    return parseInt(moment().format('MM'), 10)
  }
}

// Get current year
exports.currentYear = (type) => {
  return moment().add(type, 'years').format('YYYY')
}

// Get the context - useful for logging
exports.getContext = () => {
  return this.ctx
}

// Expose all of lodash
// functions.lodash = _

// Expose all of moment
// functions.moment = moment

// Expose all of faker
// functions.faker = faker

// Pass through to utility function. Done like this so we don't need to use filter syntax - as nothing really needs to get sent anyway
exports.isAuthorised = (data, action) => {
  // const data = this.ctx?.data
  // return permissions.providerIsAuthorised.apply(this, [data.signedInProviders, action])
  return true
}

// Config - set upstream variables
// Function adapted from:
// https://github.com/LotusTM/Kotsu/blob/4558ca79c58eadb14554e92deb68b276855d4502/modules/nunjucks-extensions.js#L66
// see also https://github.com/mozilla/nunjucks/issues/406#issuecomment-227579804

// This allows child templates to override values set by parent templates
exports.config = (prop, value, merge = true) => {
  const ctxValue = _.get(this.ctx, prop)

  // Get current context value if no `value` provided
  if (value === undefined) return ctxValue

  if (!merge || !ctxValue) {
    _.set(this.ctx, prop, value)
    return
  }

  // If this isn't Object, nothing we can do here, exit without changes to context
  if (typeof value !== 'object') return

  // Shallow cloning prevents leaking when merging
  value = (_.isArray(value) && _.union([], value, ctxValue)) || _.merge({}, value, ctxValue)

  _.set(this.ctx, prop, value)
}

/* ------------------------------------------------------------------
  keep the following line to return your functions to the app
------------------------------------------------------------------ */
// return functions

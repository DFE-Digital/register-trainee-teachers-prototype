const _ = require('lodash')
const express = require('express')
const { faker }         = require('@faker-js/faker')
const moment = require('moment')
const path = require('path')
const router = express.Router()
const url = require('url')
const utils = require('./lib/utils')
const permissions = require('./filters/permissions.js').filters
const fs = require('fs')

// =============================================================================
// Catch all
// Used to pass common data to views
// Needs to be before other routes
// =============================================================================
router.all('*', function(req, res, next){
  const data = req.session.data
  if (req.query?.referrer) {
    // Referrer might be an array of urls. Split it up now so we’ve got more
    // structured data to work with in our views
    res.locals.referrer = req.query.referrer.split(',')
  }

  // Only search by the query if there is one
  // (and get "undefined" instead of "{}" if there is no query)
  let hasQuery = !_.isEmpty(req.query)
  if (hasQuery) {
    res.locals.query = req.query
    res.locals.queryString = url.format({
              query: req.query,
            })
  }
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  res.locals.currentPageUrl = url.parse(req.url).pathname

  // Todo - move this stuff to middleware?
  // Need to also save to locals as saving to data at this point won’t be available to the view unless refreshed
  data.isHatModel = (data.settings.providerModel == 'hat-model') ? true : false
  data.isBlendedModel = (data.settings.providerModel == 'blended-model') ? true : false
  data.signedInProviders = (data.isBlendedModel) ? data.settings.userProviders : [data.settings.userActiveProvider]
  data.isAdmin = (data.settings.viewAsAdmin == "true") ? true : false

  res.locals.data.isHatModel = data.isHatModel
  res.locals.data.isBlendedModel = data.isBlendedModel
  res.locals.data.signedInProviders = data.signedInProviders
  // Double check that active provider is listed in signedInProviders
  if (!data.signedInProviders.includes(data.settings.userActiveProvider)){
    console.log(`Error: active provider (${data.settings.userActiveProvider}) not in signedInProviders (${data.signedInProviders})`)
    console.log(`Using first signed in provider (${data.signedInProviders[0]}) as active provider`)
    data.settings.userActiveProvider = data.signedInProviders[0]
    res.locals.data.settings.userActiveProvider = data.settings.userActiveProvider
  }
  // Also save to locals so that the data is available immediately
  res.locals.accessLevel = permissions.getAccessLevel(data?.signedInProviders, data)
  res.locals.recordAccessLevel = permissions.recordAccessLevel(data?.record, data)

  next()
})

// Delete query string if clearQuery set
// This lets us give urls to reserach participants that set up data correctly
// and have the query string self-delete once done
router.get('*', function(req, res, next){
  const data = req.session.data

  let requestedUrl = url.parse(req.url).pathname
  // Delete cashes of invalid answers that should be flushed on each request
  delete data?.temp
  if (req?.query?.clearQuery){
    delete req.session.data.clearQuery
    res.redirect(requestedUrl)
  }
  else {
    next()
  }
})

router.post('*', function(req, res, next){
  if (req.session.data.successFlash) {
    req.flash('success', req.session.data.successFlash)
    delete req.session.data.successFlash
  }
  next()
})

// For directly setting prototype data in testing
router.post('/direct-set-data', function(req, res, next){
  const data = req.session.data

  let theKey = data.directSet?.key
  let theValue = data.directSet?.value
  let theValueJson = data.directSet?.valueJson
  let shouldMerge = data.directSet?.mergeJson == 'true'
  let parsedJson

  delete data.directSet

  if (theValueJson){
    try {
      parsedJson = JSON.parse(theValueJson)
    } catch (error) {
      console.error("Couldn't parse Json:", error);
    }
  }

  if (parsedJson){
    theValue = parsedJson

    // Whether to merge in to existing data
    if (shouldMerge){
      let currentValue = _.get(data, theKey)
      if (currentValue){
        theValue = {...currentValue, ...theValue}
      }
    }
  }

  console.log("Directly setting data")
  console.log({theKey})
  console.log({theValue})

  _.set(data, theKey, theValue)

  res.redirect("/direct-set-data")
})

// =============================================================================
// Individual pages
// =============================================================================
// Records list
require('./routes/records-list-routes')(router)

// =============================================================================
// Shared routes - add / edit record data
//
// These routes are for editing data on new records and existing records
// Match against 'new-record' and 'uuid record' paths and work for both.
// =============================================================================
require('./routes/shared-edit-routes')(router)

// =============================================================================
// New records
// =============================================================================
require('./routes/new-record-routes')(router)

// =============================================================================
// Existing records
// =============================================================================
require('./routes/existing-record-routes')(router)

// =============================================================================
// Bulk actions
// =============================================================================
require('./routes/bulk-action-routes')(router)

// =============================================================================
// Bulk uploads
// =============================================================================
require('./routes/bulk-update-routes')(router)


module.exports = router

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const _ = require('lodash')
const url = require('url')
const utils = require('./lib/utils')
const functions = require('./functions')
const permissions = require('./filters/permissions.js').filters

/// ------------------------------------------------------------------------ ///
/// Flash messaging
/// ------------------------------------------------------------------------ ///
const flash = require('connect-flash')
router.use(flash())

// =============================================================================
// Catch all
// Used to pass common data to views
// Needs to be before other routes
// =============================================================================
router.all('*', (req, res, next) => {
  const data = req.session.data
  if (req.query?.referrer) {
    // Referrer might be an array of urls. Split it up now so we’ve got more
    // structured data to work with in our views
    res.locals.referrer = req.query.referrer.split(',')
  }

  if (req.query?.page) {
    res.locals.page = req.query.page
    res.locals.nextPage = parseInt(req.query.page) + 1
    res.locals.prevPage = parseInt(req.query.page) - 1
  }

  res.locals.isAuthorised = functions.isAuthorised

  // Only search by the query if there is one
  // (and get "undefined" instead of "{}" if there is no query)
  const hasQuery = !_.isEmpty(req.query)
  if (hasQuery) {
    res.locals.query = req.query
    res.locals.queryString = url.format({
      query: req.query
    })
  }
  res.locals.flash = req.flash('success') // pass through 'success' messages only

  const myUrl = new URL(req.url, `http://${req.headers.host}`) // Include the host to construct a full URL
  res.locals.currentPageUrl = myUrl.pathname

  // Todo - move this stuff to middleware?
  // Need to also save to locals as saving to data at this point won’t be available to the view unless refreshed
  data.isHatModel = (data.settings.providerModel === 'hat-model')
  data.isBlendedModel = (data.settings.providerModel === 'blended-model')
  data.signedInProviders = (data.isBlendedModel) ? data.settings.userProviders : [data.settings.userActiveProvider]

  res.locals.data.isHatModel = data.isHatModel
  res.locals.data.isBlendedModel = data.isBlendedModel
  res.locals.data.signedInProviders = data.signedInProviders

  // Double check that active provider is listed in signedInProviders
  if (!data.signedInProviders.includes(data.settings.userActiveProvider)) {
    console.log(`Error: active provider (${data.settings.userActiveProvider}) not in signedInProviders (${data.signedInProviders})`)
    console.log(`Using first signed in provider (${data.signedInProviders[0]}) as active provider`)
    data.settings.userActiveProvider = data.signedInProviders[0]
    res.locals.data.settings.userActiveProvider = data.settings.userActiveProvider
  }

  // If there’s no signed in provider, fall back to the first available one
  if (!data?.settings?.userActiveProvider) {
    data.settings.userActiveProvider = data.userProviders[0]
    res.locals.data.settings.userActiveProvider = data.settings.userActiveProvider
  }

  // Mark as admin if the provider has an admin name
  if (data?.settings?.userActiveProvider === data.settings.defaultAdminName) {
    data.isAdmin = true
    res.locals.data.isAdmin = true
  } else {
    data.isAdmin = false
    res.locals.data.isAdmin = false
  }

  if (data?.settings?.userActiveProvider) {
    const provider = utils.getProviderData(data.settings.userActiveProvider, data)
    res.locals.activeProvider = provider
  }

  // data.isAdmin = (data.settings.viewAsAdmin === "true") ? true : false

  // Also save to locals so that the data is available immediately
  res.locals.accessLevel = permissions.getAccessLevel(data?.signedInProviders, data)
  res.locals.recordAccessLevel = permissions.recordAccessLevel(data?.record, data)

  res.locals.isSupportUi = res.locals.currentPageUrl.startsWith('/support')

  next()
})

// Delete query string if clearQuery set
// This lets us give urls to reserach participants that set up data correctly
// and have the query string self-delete once done
router.get('*', (req, res, next) => {
  const data = req.session.data

  const myUrl = new URL(req.url, `http://${req.headers.host}`) // Include the host to construct a full URL
  const requestedUrl = myUrl.pathname

  // Delete cashes of invalid answers that should be flushed on each request
  delete data?.temp
  if (req?.query?.clearQuery) {
    delete req.session.data.clearQuery
    res.redirect(requestedUrl)
  } else {
    next()
  }
})

router.post('*', (req, res, next) => {
  if (req.session.data.successFlash) {
    req.flash('success', req.session.data.successFlash)
    delete req.session.data.successFlash
  }
  next()
})

// For directly setting prototype data in testing
router.post('/direct-set-data', (req, res, next) => {
  const data = req.session.data

  const theKey = data.directSet?.key
  let theValue = data.directSet?.value
  const theValueJson = data.directSet?.valueJson
  const shouldMerge = data.directSet?.mergeJson === 'true'
  const updateRecord = data.directSet?.updateRecord === 'true'

  let parsedJson

  delete data.directSet

  if (theValueJson) {
    try {
      parsedJson = JSON.parse(theValueJson)
    } catch (error) {
      console.error("Couldn't parse Json:", error)
    }
  }

  if (parsedJson) {
    theValue = parsedJson

    // Whether to merge in to existing data
    if (shouldMerge) {
      const currentValue = _.get(data, theKey)
      if (currentValue) {
        theValue = { ...currentValue, ...theValue }
      }
    }
  }

  console.log('Directly setting data')
  console.log({ theKey })
  console.log({ theValue })

  _.set(data, theKey, theValue)

  // If we were given record data, save it back to data.records so it persists
  if (updateRecord) {
    if (data?.record?.id) {
      const recordIndex = data.records.findIndex(record => record.id === data.record.id)
      if (recordIndex) {
        console.log(`Updating record at index ${recordIndex}`)
        data.records[recordIndex] = data.record
      }
    } else {
      console.log('Error: no record id to update to')
    }
  }

  res.redirect('/direct-set-data')
})

// =============================================================================
// Guidance
// =============================================================================

// Redirect to tab if tabs are enabled.
router.get('/guidance/hesa-register-data-mapping', (req, res, next) => {
  const data = req.session.data

  if (data.settings.hesaGuidanceStyle === 'tabs') {
    res.redirect('/guidance/hesa-register-data-mapping/trainee-progress')
  } else {
    next()
  }
})

router.get('/guidance/hesa-register-data-mapping/:tabName', (req, res) => {
  const data = req.session.data

  // User has switched to non tab style so we should redirect away from tab urls.
  if (data.settings.hesaGuidanceStyle !== 'tabs') {
    res.redirect('/guidance/hesa-register-data-mapping')
  } else {
    res.render('guidance/hesa-register-data-mapping', {
      activeTab: req.params.tabName
    })
  }
})

// Used for UR setup where we are setting things on the query string, but don't want users to see a prototype page at the end
router.get('/set-up', (req, res, next) => {
  // return text string of 'done' in res
  res.send('Set up complete')
})

// =============================================================================
// Individual route files
// =============================================================================

// =============================================================================
// Support ui
// =============================================================================
require('./routes/support-routes')(router)

// =============================================================================
// Records list
// =============================================================================
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

// =============================================================================
// Organisations and users
// =============================================================================
require('./routes/organisations-and-users-routes')(router)

// =============================================================================
// API tokens
// =============================================================================
require('./routes/api-token')(router)

// =============================================================================
// Funding
// =============================================================================
require('./routes/funding-routes')(router)

// =============================================================================
// Reports
// =============================================================================
require('./routes/reports-routes')(router)

module.exports = router

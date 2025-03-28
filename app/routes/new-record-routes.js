const _ = require('lodash')
const dates = require('./../filters/dates.js').filters
const generateReference = require('./../data/generators/reference-number.js')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../lib/utils')

module.exports = router => {
  // Hacky solution to manually import a record to draft state
  // Useful for testing bugs so we can quickly restore a state
  router.get('/new-record/direct-add', (req, res) => {
    const data = req.session.data
    utils.deleteTempData(data)
    data.record = require('./../data/direct-add-draft-record.json')
    res.redirect('/new-record/overview')
  })

  // Delete data when starting new
  router.get(['/new-record/new', '/new-record'], (req, res) => {
    const data = req.session.data
    utils.deleteTempData(data)

    const record = {}
    record.status = 'Draft'
    record.source = 'Manual'
    record.events = { items: [] }
    record.reference = generateReference()
    data.record = record
    // If multiple providers, users must pick one as their first action
    if (data.signedInProviders.length > 1) {
      res.redirect('/new-record/pick-provider')
    } else {
      // If single provider, directly assign them to the record
      data.record.provider = data.signedInProviders[0]
      res.redirect('/new-record/select-route')
    }
  })

  // UTILITY: Force all sections to complete (for testing)
  // This mostly exists to help testing submitted journeys
  // Doesn’t populate any data so *will* result in partial records!
  router.get(['/new-record/complete', '/new-record/*/complete'], (req, res) => {
    const data = req.session.data
    const record = data.record
    const route = record.route || false // some bugs result in route being lost
    if (route) {
      const requiredSections = trainingRoutes[route].sections
      requiredSections.forEach(section => {
        _.set(record, `${section}.status`, 'Completed')
      })
      if (utils.sourceIsApply(record)) {
        _.set(record, 'applyData.status', 'Completed')
      }
      res.redirect('/new-record/overview')
    }
    res.redirect('/new-record/overview')
  })

  // We *really* need the provider to get set, so don't let users past
  // the page without picking one
  // Only relevant where users belong to multiple providers
  router.post('/new-record/pick-provider-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const provider = record?.provider
    const referrer = utils.getReferrer(req.query.referrer)
    // No data, return to page
    if (!provider) {
      res.redirect(`/new-record/pick-provider${referrer}`)
    } else {
      // Coming from the check answers page
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else if (record.route) {
        res.redirect('/new-record/overview')
      } else {
        res.redirect('/new-record/select-route')
      }
    }
  })

  // Route for when changing route separate from the course - used as the first page of manual drafts
  router.post(['/:recordtype/:uuid/select-route-answer', '/:recordtype/select-route-answer'], (req, res) => {
    const data = req.session.data
    const record = data.record
    const route = record?.route
    const referrer = utils.getReferrer(req.query.referrer)
    const existingCourseDetails = record?.courseDetails

    // No data, return to page
    if (!route) {
      res.redirect(`/new-record/select-route${referrer}`)
    }

    // It’s possible for a user to pick a Publish course, then go back to change the
    // route to one that doesn’t have publish courses. If they do this, we delete the
    // course details section
    if (existingCourseDetails?.isPublishCourse && route !== existingCourseDetails?.route) {
      delete record.courseDetails
      console.log('Changing to a route that doesn’t match the selected Publish course')
      // In the future, this could send to a confirm page checking if this is the right course
    }

    // Coming from the check answers page
    if (referrer) {
      res.redirect(utils.getReferrerDestination(req.query.referrer))
    } else {
      res.redirect('/new-record/overview')
    }
  })

  // Swap between two different templates for this page
  router.get('/new-record/overview', (req, res) => {
    const data = req.session.data
    const record = data.record

    if (utils.sourceIsApply(record) && data.settings.groupApplySections) {
      res.render('new-record/overview-apply-grouped-sections')
    } else res.render('new-record/overview')
  })

  // Prevent trainee data from being marked as reviewed if it
  // contains invalid answers
  router.post('/new-record/apply-trainee-application-answer', (req, res) => {
    const data = req.session.data
    const record = _.get(data, 'record') // copy record
    const referrer = utils.getReferrer(req.query.referrer)

    // Only validate if they’ve checked the 'reviewed' checkbox
    if (record?.applyData?.status === 'Completed' && utils.hasInvalidAnswers(record, data)) {
      console.log('Record has invalid answers, returning to trainee data page')
      let returnQuery
      if (referrer) {
        returnQuery = `${referrer}&errors=true`
      } else returnQuery = '?errors=true'
      delete record?.applyData?.status // clear the checkbox
      res.redirect(`/new-record/apply-trainee-application${returnQuery}`)
    } else {
      // Send them to the referrer
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        res.redirect('/new-record/overview')
      }
    }
  })

  // Task list confirmation page - pass errors to page
  // Todo: use flash messages or something to pass real errors in
  router.get('/new-record/check-record', (req, res) => {
    const data = req.session.data
    const errors = req.query.errors
    const record = _.get(data, 'record') // copy record
    const isComplete = utils.recordIsComplete(record)
    const errorList = !!(errors)

    if (utils.sourceIsApply(record) && data.settings.groupApplySections) {
      res.render('new-record/check-record-apply-grouped-sections', { errorList, recordIsComplete: isComplete })
    } else {
      res.render('new-record/check-record', { errorList, recordIsComplete: isComplete })
    }
  })

  // Delete draft
  router.get('/new-record/delete-draft/delete', (req, res) => {
    const data = req.session.data
    const records = data.records
    const theRecord = data.record
    if (theRecord.id) {
      const recordIndex = records.findIndex(record => record.id === theRecord.id)
      _.pullAt(records, [recordIndex]) // delete item at index
    }
    utils.deleteTempData(data)
    req.flash('success', 'Draft deleted')
    res.redirect('/drafts')
  })

  // Save a record and put in data store
  router.get('/new-record/save-as-draft', (req, res) => {
    const data = req.session.data
    // const records = data.records
    const record = data.record
    // No data, return to page
    if (!record) {
      res.redirect('/new-record/overview')
    } else {
      record.status = record.status || 'Draft' // just in case
      record.source = record.source || 'Manual' // just in case
      record.reference = record.reference || generateReference() // just in case
      utils.deleteTempData(data)
      utils.updateRecord(data, record)
      // req.flash('success', 'Record saved as draft')
      res.redirect('/drafts')
    }
  })

  // Submit for TRN
  router.post('/new-record/save', (req, res) => {
    const data = req.session.data
    const record = _.get(data, 'record') // copy record
    const referrer = utils.getReferrer(req.query.referrer)

    if (!utils.recordIsComplete(record)) {
      console.log('Record is incomplete, returning to check record')
      let returnQuery
      if (referrer) {
        returnQuery = `${referrer}&errors=true`
      } else {
        returnQuery = '?errors=true'
      }
      res.redirect(`/new-record/check-record${returnQuery}`)
    } else if (dates.isInPast(record?.courseDetails?.startDate)) {
      // if the ITT start date is in the past ask for the trainee’s start date
      res.redirect('/new-record/trainee-start-date')
    } else {
      utils.registerForTRN(record)
      utils.deleteTempData(data)
      utils.updateRecord(data, record, false)
      // Temporarily store the id so that we can look it up on the submitted page
      req.session.data.submittedRecordId = record.id
      res.redirect('/new-record/submitted')
    }
  })

  // Submit for TRN after setting start date
  router.post('/new-record/save-with-date', (req, res) => {
    const data = req.session.data
    const record = data.record
    const courseStartDate = record?.courseDetails?.startDate
    const traineeStarted = record?.trainingDetails?.traineeStarted
    const commencementDate = record?.trainingDetails?.commencementDate

    if ((!traineeStarted) || (traineeStarted === 'started-itt-later' && !commencementDate)) {
      res.redirect('/new-record/trainee-start-date')
    } else {
      if (traineeStarted === 'started-itt-on-time') {
        record.trainingDetails.commencementDate = courseStartDate
      } else if (traineeStarted === 'trainee-not-started') {
        delete record?.trainingDetails?.commencementDate
      }
      delete record?.trainingDetails?.traineeStarted

      // store the record
      utils.registerForTRN(record)
      utils.deleteTempData(data)
      utils.updateRecord(data, record, false)

      // Temporarily store the id so that we can look it up on the submitted page
      req.session.data.submittedRecordId = record.id

      res.redirect('/new-record/submitted')
    }
  })

  // Let users pick Apply applications to import.
  router.post('/drafts/apply-importable/update', (req, res) => {
    const data = req.session.data
    const selectedRecordIds = data?.applyImportable?.selectedTrainees || []

    const selectedCount = selectedRecordIds.length
    // console.log(`Apply importable selected trainees: ${selectedCount}`)

    if (selectedCount > 0) {
      const selectedRecords = utils.getRecordsById(data.records, selectedRecordIds)

      // Advance the records to Draft and remove old data
      selectedRecords.forEach(record => {
        record.status = 'Draft'
        delete record?.applyData?.applyStatus
        delete record?.applyData?.requiredConditions
      })

      let flashMessage
      if (selectedCount === 1) {
        flashMessage = 'One application from Apply imported as a draft trainee'
      } else {
        flashMessage = `${selectedCount} applications from Apply imported as draft trainees`
      }
      req.flash('success', flashMessage)
    }

    delete data.applyImportable

    // Return with Apply filter applied. In reality we should probably restore previous filters?
    res.redirect('/drafts?filterSource=Apply')
  })
}

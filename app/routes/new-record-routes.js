const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./../filters.js')()
const dates = require('./../filters/dates.js').filters
const _ = require('lodash')
const utils = require('./../lib/utils')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const generateReference = require("./../data/generators/reference-number.js")

module.exports = router => {

  // Hacky solution to manually import a record to draft state
  // Useful for testing bugs so we can quickly restore a state
  router.get('/new-record/direct-add', function (req, res) {
    const data = req.session.data
    utils.deleteTempData(data)
    data.record = require('./../data/direct-add-record.json')
    res.redirect('/new-record/overview')
  })

  // Delete data when starting new
  router.get(['/new-record/new', '/new-record'], function (req, res) {
    const data = req.session.data
    utils.deleteTempData(data)

    let record = {}
    record.status = "Draft"
    record.source = "Manual"
    record.events = { items: []}
    record.reference = generateReference()
    data.record = record
    // If multiple providers, users must pick one as their first action
    if (data.signedInProviders.length > 1){
      res.redirect('/new-record/pick-provider')
    }
    else {
      // If single provider, directly assign them to the record
      data.record.provider = data.signedInProviders[0]
      res.redirect('/new-record/select-route')
    }
  })

  // UTILITY: Force all sections to complete (for testing)
  // This mostly exists to help testing submitted journeys
  // Doesn’t populate any data so *will* result in partial records!
  router.get(['/new-record/complete', '/new-record/*/complete'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let route = record.route || false // some bugs result in route being lost
    if (route){
      let requiredSections = trainingRoutes[route].sections
      requiredSections.forEach(section => {
        _.set(record, `${section}.status`, "Completed")
      })
      if (utils.sourceIsApply(record)){
        _.set(record, `applyData.status`, "Completed")
      }
      res.redirect('/new-record/overview')
    }
    res.redirect('/new-record/overview')
  })

  // We *really* need the provider to get set, so don't let users past
  // the page without picking one
  // Only relevant where users belong to multiple providers
  router.post('/new-record/pick-provider-answer', function (req, res) {
    const data = req.session.data
    const record = data.record
    let provider = record?.provider
    let referrer = utils.getReferrer(req.query.referrer)
    // No data, return to page
    if (!provider){
      res.redirect(`/new-record/pick-provider${referrer}`)
    }
    else {
      // Coming from the check answers page
      if (referrer){
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      }
      else if (record.route) {
        res.redirect(`/new-record/overview`)
      }
      else {
        res.redirect(`/new-record/select-route`)
      }
    }
  })

  // Show error if route is not assessment only
  router.post('/new-record/select-route-answer', function (req, res) {
    const data = req.session.data
    let record = data.record
    let route = record?.route
    let referrer = utils.getReferrer(req.query.referrer)
    let existingCourseDetails = record?.courseDetails

    // No data, return to page
    if (!route){
      res.redirect(`/new-record/select-route${referrer}`)
    }
    // Route not supported
    else if (route == "Other") {
      res.redirect(`/new-record/route-not-supported${referrer}`)
    }
    else {

      // It’s possible for a user to pick a Publish course, then go back to change the
      // route to one that doesn’t have publish courses. If they do this, we delete the
      // course details section
      if (existingCourseDetails?.isPublishCourse && route != existingCourseDetails?.route){
        // delete record.courseDetails
        console.log("Changing to a route that doesn’t match the selected Publish course")
        // In the future, this could send to a confirm page checking if this is the right course
      }

      // TODO Make course details not complete if route is changed from Early years to a non Early years
      
      // Coming from the check answers page
      if (referrer){
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      }
      else {
        res.redirect(`/new-record/overview`)
      }
    }
   
  })

  // Swap between two different templates for this page
  router.get('/new-record/overview', function (req, res) {
    const data = req.session.data
    let record = data.record

    if (utils.sourceIsApply(record) && data.settings.groupApplySections){
      res.render('new-record/overview-apply-grouped-sections')
    }
    else res.render('new-record/overview')
  })

  // Prevent trainee data from being marked as reviewed if it
  // contains invalid answers
  router.post('/new-record/apply-trainee-application-answer', (req, res) => {

    const data = req.session.data
    let record = _.get(data, 'record') // copy record
    let referrer = utils.getReferrer(req.query.referrer)

    // Only validate if they’ve checked the 'reviewed' checkbox
    if (record?.applyData?.status == 'Completed' && utils.hasInvalidAnswers(record, data)){
      console.log('Record has invalid answers, returning to trainee data page')
      let returnQuery
      if (referrer){
        returnQuery = `${referrer}&errors=true`
      }
      else returnQuery = "?errors=true"
      delete record?.applyData?.status // clear the checkbox
      res.redirect(`/new-record/apply-trainee-application${returnQuery}`)
    }
    else {
      // Send them to the referrer
      if (referrer){
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      }
      else {
        res.redirect('/new-record/overview')
      }
    }
  })

  // Task list confirmation page - pass errors to page
  // Todo: use flash messages or something to pass real errors in
  router.get('/new-record/check-record', function (req, res) {
    const data = req.session.data
    let errors = req.query.errors
    let record = _.get(data, 'record') // copy record
    let isComplete = utils.recordIsComplete(record)
    let errorList = (errors) ? true : false
    
    if (utils.sourceIsApply(record) && data.settings.groupApplySections){
      res.render('new-record/check-record-apply-grouped-sections', {errorList, recordIsComplete: isComplete})
    }
    else res.render('new-record/check-record', {errorList, recordIsComplete: isComplete})
  })

  // Delete draft
  router.get('/new-record/delete-draft/delete', (req, res) => {
    const data = req.session.data
    const records = data.records
    let theRecord = data.record
    if (theRecord.id){
      let recordIndex = records.findIndex(record => record.id == theRecord.id)
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
    let record = data.record
    // No data, return to page
    if (!record){
      res.redirect('/new-record/overview')
    }
    else {
      record.status = record.status || "Draft" // just in case
      record.source = record.source || "Manual" // just in case
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
    let record = _.get(data, 'record') // copy record
    let referrer = utils.getReferrer(req.query.referrer)

    if (!utils.recordIsComplete(record)){
      console.log('Record is incomplete, returning to check record')
      let returnQuery
      if (referrer){
        returnQuery = `${referrer}&errors=true`
      }
      else returnQuery = "?errors=true"
      res.redirect(`/new-record/check-record${returnQuery}`)
    }
    // if the ITT start date is in the past ask for the trainee’s start date
    else if (dates.isInPast(record?.courseDetails?.startDate)){
      res.redirect('/new-record/trainee-start-date')
    }
    else {
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
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let courseStartDate = record?.courseDetails?.startDate
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let commencementDate = record?.trainingDetails?.commencementDate
    
    if ((!traineeStarted) || (traineeStarted == 'started-itt-later' && !commencementDate)) {
      res.redirect('/new-record/trainee-start-date')
    } else {
      if (traineeStarted == 'started-itt-on-time') {
        record.trainingDetails.commencementDate = courseStartDate
      } else if (traineeStarted == 'trainee-not-started') {
        delete record?.trainingDetails?.commencementDate
      }
      delete record?.trainingDetails?.traineeStarted

      // store the record
      utils.registerForTRN(record)
      utils.deleteTempData(data)
      utils.updateRecord(data, record, false)

      // Temporarily store the id so that we can look it up on the submitted page
      req.session.data.submittedRecordId = record.id

      res.redirect(`/new-record/submitted`)
    }
  })

}

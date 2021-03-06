const faker = require('faker')
const path = require('path')
const moment = require('moment')
const filters = require('./../filters.js')()
const _ = require('lodash')
const utils = require('./../lib/utils')

module.exports = router => {

  // Hacky solution to manually import a record to draft state
  // Useful for testing bugs so we can quickly restore a state
  router.get('/new-record/direct-add', function (req, res) {
    const data = req.session.data
    utils.deleteTempData(data)
    data.record = require('./../data/direct-add-record.json')
    res.redirect('/new-record/check-record')
  })

  // Delete data when starting new
  router.get(['/new-record/new', '/new-record'], function (req, res) {
    const data = req.session.data
    utils.deleteTempData(data)
    _.set(data, 'record', { status: 'Draft' })
    _.set(data, 'record.events.items', [])
    // If multiple providers, users must pick one as thier first action
    if (data.signedInProviders.length > 1){
      res.redirect('/new-record/pick-provider')
    }
    else {
      // If single provider, directly assign them to the record
      data.record.provider = data.signedInProviders[0]
      res.redirect('/new-record/select-route')
    }
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
        res.redirect(req.query.referrer)
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
        delete record.courseDetails
      }

      // TODO Make course details not complete if route is changed from Early years to a non Early years
      
      // Coming from the check answers page
      if (referrer){
        res.redirect(req.query.referrer)
      }
      else {
        res.redirect(`/new-record/overview`)
      }
    }
   
  })

  // Task list confirmation page - pass errors to page
  // Todo: use flash messages or something to pass real errors in
  router.get('/new-record/check-record', function (req, res) {
    const data = req.session.data
    let errors = req.query.errors
    let newRecord = _.get(data, 'record') // copy record
    let isComplete = utils.recordIsComplete(newRecord)
    let errorList = (errors) ? true : false
    res.render('new-record/check-record', {errorList, recordIsComplete: isComplete})
  })

  // Delete draft
  router.get('/new-record/delete-draft/delete', (req, res) => {
    const data = req.session.data
    const records = data.records
    let newRecord = data.record
    if (newRecord.id){
      let recordIndex = records.findIndex(record => record.id == newRecord.id)
      _.pullAt(records, [recordIndex]) // delete item at index
    }
    utils.deleteTempData(data)
    req.flash('success', 'Draft deleted')
    res.redirect('/records')
  })

  // Save a record and put in data store
  router.get('/new-record/save-as-draft', (req, res) => {
    const data = req.session.data
    // const records = data.records
    let newRecord = data.record
    // No data, return to page
    if (!newRecord){
      res.redirect('/new-record/overview')
    }
    else {
      newRecord.status = "Draft" // just in case
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord)
      // req.flash('success', 'Record saved as draft')
      res.redirect('/records')
    }
  })

  // Submit for TRN
  router.post('/new-record/save', (req, res) => {
    const data = req.session.data
    let newRecord = _.get(data, 'record') // copy record
    if (!utils.recordIsComplete(newRecord)){
      console.log('Record is incomplete, returning to check record')
      res.redirect('/new-record/check-record?errors=true')
    }
    else {
      utils.registerForTRN(newRecord)
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, false)
      // Temporarily store the id so that we can look it up on the submitted page
      req.session.data.submittedRecordId = newRecord.id 
      res.redirect('/new-record/submitted')
    }
  })


}

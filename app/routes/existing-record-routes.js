const { faker } = require('@faker-js/faker')
const path      = require('path')
const moment    = require('moment')
const filters   = require('./../filters.js')()
const dates     = require('./../filters/dates.js').filters
const _         = require('lodash')
const utils     = require('./../lib/utils')


module.exports = router => {

  // Manually advance an application from pending to trn received
  router.get('/record/:uuid/trn', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      if (newRecord.status == 'Pending TRN'){
        newRecord.status = 'TRN received'
        newRecord.trn = String(faker.datatype.number({
          'min': 1000000,
          'max': 9999999
        }))
        utils.deleteTempData(data)
        utils.updateRecord(data, newRecord, "TRN received")
      }
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Manually advance an application from Pending EYTS/QTS to EYTS/QTS.
  router.get('/record/:uuid/awarded', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      if (newRecord.status.includes('recommended') || newRecord.status == 'TRN received'){
        utils.recommendForAward(newRecord) // Recommend a group of trainees for EYTS/QTS first so data is correct
        utils.deleteTempData(data)
        
        newRecord.status = `${utils.getQualificationText(newRecord)} awarded` // EYTS/QTS awarded
        
        utils.updateRecord(data, newRecord, `${utils.getQualificationText(newRecord)} awarded`)
      }
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Collect the EYTS/QTS outcome date and set up the forking
  router.post('/record/:uuid/qualification/outcome-date-answer', (req, res) => {
    const data = req.session.data
    const record = data.record

    // Convert radio choices to real dates
    if (!record){
      res.redirect(`/record/${req.params.uuid}`)
    }
    else {
      let radioChoice = record.qualificationDetails.outcomeDateRadio
      if (radioChoice == "Today") {
        record.qualificationDetails.outcomeDate = filters.toDateArray(filters.today())
      }
      if (radioChoice == "Yesterday") {
        record.qualificationDetails.outcomeDate = filters.toDateArray(moment().subtract(1, "days"))
      } 
    }
    
    // Was the EYTS/QTS outcome a pass?
    // Not curretly being used
    if (_.get(data, "record.qualificationDetails.standardsAssessedOutcome") == 'No'){
      res.redirect(`/record/${req.params.uuid}/qualification/not-passed/reason`)
    }
    else {

      // Check if we should ask about academic qualifications - some routes don’t have them.
      if (utils.academicQualificationsApply(record) && !record?.outcome?.academicQualification){
        res.redirect(`/record/${req.params.uuid}/outcome/academic-qualifications`)
      }
      else {
        res.redirect(`/record/${req.params.uuid}/qualification/passed/confirm`)
      }

    }
  })

  // Copy EYTS/QTS (passed) data back to real record
  router.post('/record/:uuid/qualification/passed/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      utils.recommendForAward(newRecord)
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, false)
      res.redirect(`/record/${req.params.uuid}/qualification/passed/recommended`)
    }
  })

  // Copy qts (not passed data) back to real record
  // Not curretly being used
  router.post('/record/:uuid/qualification/not-passed/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      
      // Trainees may withdraw at this stage
      let isWithdrawing = (_.get(newRecord, "qualificationDetails.withdrawalStatus") == "Withdrawing from programme")
      // console.log('is withdrawing:', isWithdrawing)
      newRecord.qtsNotPassedOutcomeDate = new Date()
      utils.deleteTempData(data)
      utils.addEvent(newRecord, "Trainee did not pass their QTS")
      
      if (isWithdrawing){
        utils.addEvent(newRecord, "Trainee withdrawn")
        newRecord.previousStatus = newRecord.status
        newRecord.status = 'Withdrawn'
        newRecord.withdrawalDate = newRecord.qtsNotPassedOutcomeDate
        newRecord.withdrawalReason = newRecord.notPassedReason
        req.flash( 'success', {
          html: `
          <p class="govuk-notification-banner__heading">
            Training outcome recorded and trainee withdrawn
          </p>
          <p class="govuk-body">
            Contact <a class="govuk-notification-banner__link" href="mailto:becomingateacher@digital.education.gov.uk">becomingateacher@digital.education.gov.uk</a> if you think there’s a problem.
          </p>` } )
      }
      else {
        // newRecord.status = 'TRN received' // TODO: should we have a new status?
        req.flash('success', 'Training outcome recorded')   
      }
      newRecord.previousQtsOutcome = newRecord.notPassedReason
      delete newRecord?.notPassedReason
      newRecord.previousQtsOutcomeOther = newRecord.notPassedReasonOther
      delete newRecord?.notPassedReasonOther
      delete newRecord?.qualificationDetails?.standardsAssessedOutcome
      delete newRecord?.qualificationDetails?.withdrawalStatus
      delete newRecord?.qualificationDetails?.outcomeDateRadio
      utils.updateRecord(data, newRecord, false)
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Convert radio choices to real dates
  router.post('/record/:uuid/defer', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    let referrer = utils.getReferrer(req.query.referrer)

    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      let radioChoice = newRecord.deferredDateRadio
      if (radioChoice == "Today") {
        newRecord.deferredDate = filters.toDateArray(filters.today())
      } 
      if (radioChoice == "Yesterday") {
        newRecord.deferredDate = filters.toDateArray(moment().subtract(1, "days"))
      } 
      res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    }
  })

  // Copy defer data back to real record
  router.post('/record/:uuid/defer/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    let referrer = utils.getReferrer(req.query.referrer)

    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      newRecord.previousStatus = newRecord.status
      newRecord.status = 'Deferred'
      delete newRecord.deferredDateRadio
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, "Trainee deferred")
      req.flash('success', 'Trainee deferred')
      if (referrer){
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      }
      else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}`)
      }
    }
  })

  // Convert radio choices to real dates
  router.post('/record/:uuid/reinstate', (req, res) => {
    const data = req.session.data
    const newRecord = data.record

    // Update failed or no data
    if (!newRecord){
      res.redirect(`/record/${req.params.uuid}`)
    }
    else {
      let radioChoice = newRecord.reinstateDateRadio
      if (radioChoice == "Today") {
        newRecord.reinstateDate = filters.toDateArray(filters.today())
      }
      if (radioChoice == "Yesterday") {
        newRecord.reinstateDate = filters.toDateArray(moment().subtract(1, "days"))
      }
      res.redirect(`/record/${req.params.uuid}/reinstate/confirm`)
    }
  })

  // Copy reinstate data back to real record
  router.post('/record/:uuid/reinstate/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record

    let traineeStarted = newRecord?.trainingDetails?.traineeStarted

    // Set trainee deferred date as start date if trainee deferred before starting
    if (traineeStarted == "false") {
      newRecord.trainingDetails.commencementDate = newRecord.reinstateDate
      newRecord.trainingDetails.traineeStarted = "true"
    }

    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      newRecord.status = newRecord.previousStatus || 'TRN received'
      delete newRecord.previousStatus
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, "Trainee reinstated")
      req.flash('success', 'Trainee reinstated')
      res.redirect(`/record/${req.params.uuid}`)
    }
  })


  // Copy withdraw data back to real record
  router.post('/record/:uuid/withdraw/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record

    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {
      newRecord.previousStatus = newRecord.status
      newRecord.status = 'Withdrawn'
      delete newRecord.withdrawDateRadio
      if (newRecord.withdrawalReason != "For another reason") {
        delete newRecord.withdrawalReasonOther
      }

      let withdrawalReasonText = `Date of withdrawal: ${filters.govukDate(newRecord.withdrawalDate)}<br>`
      withdrawalReasonText += `Reason for withdrawal: ${newRecord?.withdrawalReasonOther || newRecord?.withdrawalReason}`

      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, false)
      utils.addEvent(newRecord, "Trainee withdrawn", withdrawalReasonText)
      req.flash('success', 'Trainee withdrawn')
      res.redirect('/record/' + req.params.uuid)
    }
  })

  // Get dates for withdraw flow
  router.post('/record/:uuid/withdraw', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    let referrer = utils.getReferrer(req.query.referrer)

    // Update failed or no data
    if (!newRecord){
      res.redirect('/record/:uuid')
    }
    else {

      if (utils.isDeferred(newRecord)){
        newRecord.withdrawalDate = newRecord.deferredDate
      }
      else {
        let radioChoice = newRecord.withdrawalDateRadio
        if (radioChoice == "Today") {
          newRecord.withdrawalDate = filters.toDateArray(filters.today())
        } 
        if (radioChoice == "Yesterday") {
          newRecord.withdrawalDate = filters.toDateArray(moment().subtract(1, "days"))
        }
      }

      res.redirect(`/record/${req.params.uuid}/withdraw/confirm${referrer}`)
    }
  })

  // Copy temp record back to real record
  router.post(['/record/:uuid/:page/update', '/record/:uuid/update'], (req, res) => {
    const data = req.session.data
    const record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    // Update failed or no data
    if (!record){
      res.redirect('/record/:uuid')
    }
    else {
      utils.deleteTempData(data)
      utils.updateRecord(data, record)
      req.flash('success', 'Trainee record updated')

      if (referrer){
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      }
      else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}/personal-details`)
      }
    }
  })

  // Get timeline items and pass to view
  router.get('/record/:uuid/timeline', (req, res) => {
    const data = req.session.data
    const record = data.record
    if (!record){
      res.redirect('/record/:uuid')
    }
    let timeline = utils.getTimeline(record)
    res.render(`record/timeline`, {timeline})
  })

  /*
    =========================================================================

    Removing, deferring and withdrawing trainees

    =========================================================================
  */

  // Remove route

  // Removes record
  router.get('/record/:uuid/remove/', (req, res) => {
    const data = req.session.data
    const records = data.records
    let theRecord = data.record
    if (theRecord.id){
      let recordIndex = records.findIndex(record => record.id == theRecord.id)
      _.pullAt(records, [recordIndex]) // delete item at index
    }
    utils.deleteTempData(data)
    req.flash('success', 'Record removed')
    res.redirect('/records')
  })


  // Defer route
  // If trainee has not started, skip deferred date
  router.post('/record/:uuid/defer/did-trainee-start-answer', (req, res) => {
    const data = req.session.data
    let record = data.record
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted == "true") {
      res.redirect(`/record/${req.params.uuid}/defer/when-did-trainee-start${referrer}`)
    } else if (traineeStarted == "false") {
      delete record?.trainingDetails?.commencementDate
      res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    } else {
      res.redirect(`/record/${req.params.uuid}/defer/did-trainee-start${referrer}`)
    }
  })

  // Defer route
  // If trainee started 'on time', set trainee start date to same as ITT start date
  // And skip deferal date question if deferral date is set (so ‘Change’ loop doesn't ask again)
  // unless new start date is after deferral date
  router.post('/record/:uuid/defer/when-did-the-trainee-start-answer', (req, res) => {
    let data = req.session.data
    let record = data.record
    let courseStartDate = record?.courseDetails?.startDate
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let commencementDate = record?.trainingDetails?.commencementDate
    let referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted == "started-itt-on-time"){
      record.trainingDetails.commencementDate = courseStartDate
    }

    if (moment(dates.toDateObject(record?.deferredDate)).isAfter(dates.toDateObject(commencementDate))) {
      res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    } else {
      res.redirect(`/record/${req.params.uuid}/defer${referrer}`)
    }
  })


  // Withdraw route
  // If trainee has not started, tell user they cannot withdraw the trainee
  router.post('/record/:uuid/withdraw/did-trainee-start-answer', (req, res) => {
    const data = req.session.data
    let record = data.record
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted == "true") {
      res.redirect(`/record/${req.params.uuid}/withdraw/when-did-trainee-start${referrer}`)
    } else if (traineeStarted == "false") {
      res.redirect(`/record/${req.params.uuid}/withdraw/cannot-withdraw${referrer}`)
    } else {
      res.redirect(`/record/${req.params.uuid}/withdraw/did-trainee-start${referrer}`)
    }
  })

  // Withdraw route
  // If trainee started 'on time', set trainee start date to same as ITT start date
  // And skip withdrawal question if withdrawal date is set (so ‘Change’ loop doesn't ask again)
  // unless new start date is after deferral date
  router.post('/record/:uuid/withdraw/when-did-the-trainee-start-answer', (req, res) => {
    let data = req.session.data
    let record = data.record
    let courseStartDate = record?.courseDetails?.startDate
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let commencementDate = record?.trainingDetails?.commencementDate
    let referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted == "started-itt-on-time"){
      record.trainingDetails.commencementDate = courseStartDate
    }
    if (moment(dates.toDateObject(record?.withdrawalDate)).isAfter(dates.toDateObject(commencementDate))) {
      res.redirect(`/record/${req.params.uuid}/withdraw/confirm${referrer}`)
    } else {
      delete record?.withdrawalDate
      res.redirect(`/record/${req.params.uuid}/withdraw${referrer}`)
    }
  })

  // end of delete, defer, withdraw routes
  // =========================================================================



  // trainee-details
  router.post('/record/:uuid/trainee-start-date', function (req, res) {
    let data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let courseStartDate = record?.courseDetails?.startDate
    let traineeStarted = record?.trainingDetails?.traineeStarted
    let commencementDate = record?.trainingDetails?.commencementDate

    if (traineeStarted == "started-itt-on-time"){
      record.trainingDetails.commencementDate = courseStartDate
    }
    else if (traineeStarted == "trainee-not-started"){ // If the answer was explicitly false.
      delete record?.trainingDetails?.commencementDate
    }
    res.redirect(`/record/${req.params.uuid}/trainee-start-date/confirm${referrer}`)
  })


  /*
  =========================================================================
  Course details
  =========================================================================
  */

  // Route to set some date up front before redirecting on
  router.get('/record/:uuid/course-details/is-course-change', function (req, res) {
    let data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)

    _.set(record, "temp.courseMoveTemp.courseMoveUpFront", "true")
    _.set(record, "temp.courseMoveTemp.isCourseMove", "true")

    res.redirect(`/record/${req.params.uuid}/course-details/course-change-date${referrer}`)

  })

  // Work out if course details have changed significantly and so we need to have the user
  // check the school and funding sections
  router.post('/:recordtype/:uuid/course-details/course-change-significant-change-check', function (req, res) {
    let data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)

    let previousRecord = utils.getRecordById(data.records, record.id)

    let courseMove = record?.temp?.courseMoveTemp
    let isCourseMove = (courseMove?.isCourseMove == "true") ? true : false
    if (isCourseMove){
      console.log(`Course change: changed on ${courseMove.courseMoveDate}`)
    }

    let courseCodeChanged = record?.courseDetails?.code != previousRecord?.courseDetails?.code

    let routeChanged = (record?.route != previousRecord?.route)
    if (routeChanged){
      console.log(`Course change: route changed from ${previousRecord?.route} to ${record?.route}`)
    }

    let studyModeChanged = (record?.courseDetails?.studyMode != previousRecord?.courseDetails?.studyMode)
    if (studyModeChanged){
      console.log(`Course change: study mode changed from ${previousRecord?.courseDetails?.studyMode} to ${record?.courseDetails?.studyMode}`)
    }

    // Check if the allocation subject has changed.
    // If the specialism has changed but the allocation subject remains the same
    // (eg physics to applied physics) then the change is minimal and it has no impact on funding
    let newAllocationSubject = utils.getAllocationSubject(record)
    let oldAllocationSubject = utils.getAllocationSubject(previousRecord)

    let allocationSubjectChanged = !Boolean(newAllocationSubject) || (newAllocationSubject !== oldAllocationSubject)

    if (allocationSubjectChanged){
      console.log(`Course change: allocation subject changed from ${newAllocationSubject} to ${oldAllocationSubject}`)
    }

    // Clear out data for sections that may no longer be needed
    if (!utils.requiresSection(record, "degree")){
      delete record?.degree
    }
    if (!utils.requiresSection(record, "schools")){
      delete record?.schools
    }
    if (!utils.requiresSection(record, "placement")){
      delete record?.placement
    }

    // Schools have individual fields
    if (!utils.requiresField(record, "leadSchool")){
      delete record?.schools?.leadSchool
    }
    if (!utils.requiresField(record, "employingSchool")){
      delete record?.schools?.employingSchool
    }

    if (routeChanged || allocationSubjectChanged){
      // Don’t trust financial incentives after a significant change - better to
      // collect again.
      delete record?.funding?.source
    }

    // If the route or first subject has changed, that's a significant change and providers
    // should review the rest of the training details
    if (routeChanged || courseCodeChanged || allocationSubjectChanged || isCourseMove || studyModeChanged){
      res.redirect(`${recordPath}/course-details/course-change-instructions${referrer}`)
    }
    else {
      // Implicitly not a course change, so we can delete any temp data
      delete record?.temp?.courseMoveTemp
      // 307 Redirect to POST route
      res.redirect(307, `${recordPath}/course-details/update${referrer}`)
    }
  })
  router.post('/:recordtype/:uuid/course-details/course-change-date-question-answer', function (req, res) {
    let data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)

    let isCourseMove = record?.temp?.courseMoveTemp?.isCourseMove

    // No data
    if (!isCourseMove){
      res.redirect(`/record/${req.params.uuid}/course-details/course-change-date-question${referrer}`)
    }
    else {

      if (isCourseMove == 'false') {
        // Clear previous data if we've now been told it’s not a course change
        delete record?.temp?.courseMoveTemp?.courseMoveDate
      }

      res.redirect(utils.getNextCourseChangeUrl(record, recordPath, referrer))

    }
  })

  // Work out the next url to send the user after a significant course change
  // This will look up what data is missing on the record and send the user to the form
  // page for that data
  router.get(['/:recordtype/:uuid/course-details/get-next-course-change-url','/:recordtype/course-details/get-next-course-change-url'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)

    // Unlike most pages, here we want to insert a new referrer in the query string
    let reviewCourseChangeUrl = `${recordPath}/course-details/final-check-course-change`
    let referrerArray = utils.pushReferrer(req.query.referrer, reviewCourseChangeUrl)
    let referrer = utils.getReferrer(referrerArray)

    res.redirect(utils.getNextCourseChangeUrl(record, recordPath, referrer))

  })

    // Work out if course details have changed significantly and so we need to have the user
  // check the school and funding sections
  router.post('/:recordtype/:uuid/course-details/final-check-course-change-answer', function (req, res) {
    let data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)

    let isCourseMove = (record?.temp?.courseMoveTemp?.isCourseMove == "true") ? true : false

    let timelineMessage = (isCourseMove) ? "Traineed moved to new course" : false

    if (isCourseMove){

      let bundle = {}
      bundle.dateFinished = record?.temp?.courseMoveTemp?.courseMoveDate

      let previousRecord = utils.getRecordById(data.records, record.id)

      // Make a copy so we don’t edit the original
      let previousRecordCopy = Object.assign({}, previousRecord)
      // Delete historic course details on reord so we don’t create circular JSON
      delete previousRecordCopy?.historicCourseDetails

      bundle.recordData = previousRecordCopy

      if (record.historicCourseDetails){
        record.historicCourseDetails.push(bundle)
      }
      else {
        record.historicCourseDetails = [bundle]
      }
    }

    delete record?.temp

    utils.deleteTempData(data)
    utils.updateRecord(data, record, timelineMessage)
    req.flash('success', 'Trainee record updated')

    if (referrer){
      res.redirect(utils.getReferrerDestination(req.query.referrer))
    }
    else {
      // More likely we've come from this tab where most things are on
      res.redirect(`/record/${req.params.uuid}`)
    }

  })

  // Existing record pages
  // NOTE!: needs to come after more specific routes
  router.get('/record/:uuid/:page*', function (req, res, next) {
    let records = req.session.data.records
    const referrer = req.query.referrer
    res.locals.referrer = referrer
    const record = records.find(record => record.id == req.params.uuid)
    if (!record){
      res.redirect('/records')
    }
    else {
      // Use our own render as some templates live at /index.html
      utils.render(path.join('record', req.params.page, req.params[0]), res, next)
      // res.render(path.join('record', req.params.page, req.params[0]))
    }
  })

}

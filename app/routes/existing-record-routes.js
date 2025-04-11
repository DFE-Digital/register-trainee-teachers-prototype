const _ = require('lodash')
const { fakerEN_GB: faker } = require('@faker-js/faker')
const dates = require('./../filters/dates.js').filters
const filters = require('./../filters.js')()
const moment = require('moment')
const path = require('path')
const utils = require('./../lib/utils')

module.exports = router => {
  // Manually advance an application from pending to trn received
  router.get('/record/:uuid/trn', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      if (newRecord.status === 'Pending TRN') {
        newRecord.status = 'TRN received'
        newRecord.trn = String(faker.number.int({
          min: 1000000,
          max: 9999999
        }))
        utils.deleteTempData(data)
        utils.updateRecord(data, newRecord, 'TRN received')
      }
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Toggle editing on hesa records
  // For the moment, the UI only lets you turn it on, not off
  router.get('/record/:uuid/toggle-editing', (req, res) => {
    const data = req.session.data
    const record = data.record

    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      const editingEnabled = record?.hesa?.editingEnabled || false
      let timelineMessage //, flashHtml

      _.set(record, 'hesa.editingEnabled', !(editingEnabled))

      if (editingEnabled) {
        timelineMessage = 'Editing disabled'

        // flashHtml = `
        // <p class="govuk-notification-banner__heading">
        //   Editing disabled
        // </p>`
      } else {
        timelineMessage = 'Editing enabled'

        // flashHtml = `
        // <p class="govuk-notification-banner__heading">
        //   Editing enabled
        // </p>
        // <p class="govuk-body">Changes made to this record will be overwritten by any future HESA updates to this trainee.
        // </p>`
      }

      utils.updateRecord(data, record, timelineMessage)
      // req.flash('success', {
      //       html: flashHtml
      //   })
      // req.flash('success', "Editing enabled")
      res.redirect(`/record/${req.params.uuid}/editing-enabled`)
    }
  })

  // Manually advance an application from Pending EYTS/QTS to EYTS/QTS.
  router.get('/record/:uuid/awarded', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      if (newRecord.status.includes('recommended') || newRecord.status === 'TRN received') {
        utils.recommendForAward(newRecord) // Recommend a group of trainees for EYTS/QTS first so data is correct
        utils.deleteTempData(data)

        newRecord.status = `${utils.getQualificationText(newRecord)} awarded` // EYTS/QTS awarded

        utils.updateRecord(data, newRecord, `${utils.getQualificationText(newRecord)} awarded`)
      }
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Confirm edited QTS date
  router.post('/record/:uuid/qualification/outcome-date-edit-confirm', (req, res) => {
    res.redirect(`/record/${req.params.uuid}/qualification/outcome-date-edit-confirm`)
  })

  // Collect the EYTS/QTS outcome date and set up the forking
  router.post('/record/:uuid/qualification/outcome-date-answer', (req, res) => {
    const data = req.session.data
    const record = data.record

    // Convert radio choices to real dates
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      const radioChoice = record.qualificationDetails.outcomeDateRadio
      if (radioChoice === 'Today') {
        record.qualificationDetails.outcomeDate = filters.toDateArray(filters.today())
      }
      if (radioChoice === 'Yesterday') {
        record.qualificationDetails.outcomeDate = filters.toDateArray(moment().subtract(1, 'days'))
      }
    }

    // Was the EYTS/QTS outcome a pass?
    // Not curretly being used
    if (_.get(data, 'record.qualificationDetails.standardsAssessedOutcome') === 'No') {
      res.redirect(`/record/${req.params.uuid}/qualification/not-passed/reason`)
    } else {
      // Check if we should ask about academic qualifications - some routes don’t have them.
      if (utils.academicQualificationsApply(record) && !record?.outcome?.academicQualification) {
        res.redirect(`/record/${req.params.uuid}/outcome/academic-qualifications`)
      } else {
        res.redirect(`/record/${req.params.uuid}/qualification/passed/confirm`)
      }
    }
  })

  // Copy EYTS/QTS (passed) data back to real record
  router.post('/record/:uuid/qualification/passed/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    // Update failed or no data
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
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
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      // Trainees may withdraw at this stage
      const isWithdrawing = (_.get(newRecord, 'qualificationDetails.withdrawalStatus') === 'Withdrawing from programme')
      // console.log('is withdrawing:', isWithdrawing)
      newRecord.qtsNotPassedOutcomeDate = new Date()
      utils.deleteTempData(data)
      utils.addEvent(newRecord, 'Trainee did not pass their QTS')

      if (isWithdrawing) {
        utils.addEvent(newRecord, 'Trainee withdrawn')
        newRecord.previousStatus = newRecord.status
        newRecord.status = 'Withdrawn'
        newRecord.withdraw.date = newRecord.qtsNotPassedOutcomeDate
        newRecord.withdraw.reason = newRecord.notPassedReason
        req.flash('success', {
          html: `
          <p class="govuk-notification-banner__heading">
            Training outcome recorded and trainee withdrawn
          </p>
          <p class="govuk-body">
            Contact <a class="govuk-notification-banner__link" href="mailto:becomingateacher@digital.education.gov.uk">becomingateacher@digital.education.gov.uk</a> if you think there’s a problem.
          </p>`
        })
      } else {
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
    const referrer = utils.getReferrer(req.query.referrer)

    // Update failed or no data
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      const radioChoice = newRecord.deferredDateRadio
      if (radioChoice === 'Today') {
        newRecord.deferredDate = filters.toDateArray(filters.today())
      }
      if (radioChoice === 'Yesterday') {
        newRecord.deferredDate = filters.toDateArray(moment().subtract(1, 'days'))
      }
      res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    }
  })

  // Copy defer data back to real record
  router.post('/record/:uuid/defer/update', (req, res) => {
    const data = req.session.data
    const newRecord = data.record
    const referrer = utils.getReferrer(req.query.referrer)

    // Update failed or no data
    if (!newRecord) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      newRecord.previousStatus = newRecord.status
      newRecord.status = 'Deferred'
      delete newRecord.deferredDateRadio
      utils.deleteTempData(data)
      utils.updateRecord(data, newRecord, 'Trainee deferred')
      req.flash('success', 'Trainee deferred')
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}`)
      }
    }
  })

  // Convert radio choices to real dates
  router.post('/record/:uuid/reinstate/reinstate-date-answer', (req, res) => {
    const data = req.session.data
    const record = data.record

    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      const radioChoice = record.reinstate.dateRadio
      if (radioChoice === 'Today') {
        record.reinstate.date = filters.toDateArray(filters.today())
      }
      if (radioChoice === 'Yesterday') {
        record.reinstate.date = filters.toDateArray(moment().subtract(1, 'days'))
      }

      res.redirect(`/record/${req.params.uuid}/reinstate/update-end-date`)
    }
  })

  // Copy reinstate data back to real record
  router.post('/record/:uuid/reinstate/update', (req, res) => {
    const data = req.session.data
    const record = data.record

    const traineeStarted = record?.trainingDetails?.traineeStarted

    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      // Set trainee deferred date as start date if trainee deferred before starting
      if (traineeStarted === 'false') {
        record.trainingDetails.commencementDate = record.reinstateDate
        record.trainingDetails.traineeStarted = 'true'
      }
      const radioChoice = record.reinstate.expectedEndDateIsSame

      // Radio choice is a design option currently disabled - we just show a date input instead
      if (radioChoice !== 'same-date') {
        if (record?.reinstate?.newEndDate) {
          record.courseDetails.endDate = record.reinstate.newEndDate
        }
      }
      // Delete this temporary data
      delete record.reinstate.newEndDate
      delete record.reinstate.dateRadio

      record.status = record.previousStatus || 'TRN received'
      delete record.previousStatus
      utils.deleteTempData(data)
      utils.updateRecord(data, record, 'Trainee reinstated')
      req.flash('success', 'Trainee reinstated')
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Revert QTS or EYTS status
  router.post('/record/:uuid/admin/revert/teaching-status/update', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      if (record.status.includes('awarded')) {
        console.log('un-awarding trainee')
        utils.revertAward(record) // Recommend a group of trainees for EYTS/QTS first so data is correct
        utils.deleteTempData(data)
        utils.updateRecord(data, record, false)
        const reasonText = `${record?.revert?.teachingStatus?.auditLogComment}`
        utils.addEvent(record, `${utils.getQualificationText(record)} award removed`, reasonText)

        req.flash('success', `${utils.getQualificationText(record)} award removed`)
      } else {
        console.log('Error: can\'t un-award a trainee that is not awarded')
      }
      delete record?.revert
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}`)
      }
    }
  })

  // Support changing accredited provider of a trainee
  router.post('/record/:uuid/accredited-provider/update', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      console.log(`Changing accredited provider to ${record.provider}`)

      // record?.revert?.withdraw?.auditLogComment
      const reasonText = `${record.temp.auditLogComment}`

      utils.addEvent(record, `Accredited provider changed from ${record.temp.oldProvider}`, reasonText)
      utils.deleteTempData(data)
      utils.updateRecord(data, record, false)
      req.flash('success', 'Accredited provider changed')

      // Delete temporary data
      delete record?.temp
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}`)
      }
    }
  })

  // Get timeline items and pass to view
  router.get('/record/:uuid/timeline', (req, res) => {
    const data = req.session.data
    const record = data.record
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    }
    const timeline = utils.getTimeline(record)
    res.render('record/timeline', { timeline })
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
    const theRecord = data.record
    if (theRecord.id) {
      const recordIndex = records.findIndex(record => record.id === theRecord.id)
      _.pullAt(records, [recordIndex]) // delete item at index
    }
    utils.deleteTempData(data)
    req.flash('success', 'Record removed')
    res.redirect('/records')
  })

  // Removes record
  router.post('/record/:uuid/remove/reason-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)

    const removeReason = record?.remove?.reason

    if (!removeReason) {
      res.redirect(`/record/${req.params.uuid}/remove/reason${referrer}`)
    } else {
      if (['did-not-start', 'added-in-error', 'already-has-teaching-status'].includes(removeReason)) {
        res.redirect(`/record/${req.params.uuid}/remove/confirm${referrer}`)
      } else if (removeReason === 'withdraw') {
        res.redirect(`/record/${req.params.uuid}/withdraw${referrer}`)
      } else if (removeReason === 'transferred-provider') {
        res.redirect(`/record/${req.params.uuid}/remove/date-of-transfer${referrer}`)
      } else {
        res.redirect(`/record/${req.params.uuid}/remove/reason${referrer}`)
      }
    }
  })

  // Remove route
  // If trainee has not started, skip deferred date
  router.post('/record/:uuid/remove/did-trainee-start-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const traineeStarted = record?.trainingDetails?.traineeStarted
    const referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted === 'true') {
      console.log('first')
      res.redirect(`/record/${req.params.uuid}/remove/cannot-remove${referrer}`)
    } else if (traineeStarted === 'false') {
      console.log('second')
      res.redirect(`/record/${req.params.uuid}/remove/confirm${referrer}`)
    } else {
      console.log('third')
      res.redirect(`/record/${req.params.uuid}/remove/did-trainee-start${referrer}`)
    }
  })

  // Admins deleting a record
  router.post('/record/:uuid/admin/delete/update', (req, res) => {
    const data = req.session.data
    const records = data.records
    const theRecord = data.record
    if (theRecord.id) {
      const recordIndex = records.findIndex(record => record.id === theRecord.id)
      _.pullAt(records, [recordIndex]) // delete item at index
    }
    utils.deleteTempData(data)
    req.flash('success', 'Record deleted')
    res.redirect('/records')
  })

  // Defer route
  // If trainee has not started, skip deferred date
  router.post('/record/:uuid/defer/did-trainee-start-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const traineeStarted = record?.trainingDetails?.traineeStarted
    const referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted === 'true') {
      _.set(record, 'defer.showStartDate', true)
      res.redirect(`/record/${req.params.uuid}/defer/when-did-trainee-start${referrer}`)
    } else if (traineeStarted === 'false') {
      delete record?.trainingDetails?.commencementDate
      res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    } else {
      res.redirect(`/record/${req.params.uuid}/defer/did-trainee-start${referrer}`)
    }
  })

  // Defer route
  // If trainee started 'on time', set trainee start date to same as ITT start date
  // And skip deferral date question if deferral date is set (so ‘Change’ loop doesn't ask again)
  // unless new start date is after deferral date
  router.post('/record/:uuid/defer/when-did-the-trainee-start-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const courseStartDate = record?.courseDetails?.startDate
    const traineeStarted = record?.trainingDetails?.traineeStarted
    const commencementDate = record?.trainingDetails?.commencementDate
    const referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted === 'started-itt-on-time') {
      record.trainingDetails.commencementDate = courseStartDate
    }

    res.redirect(`/record/${req.params.uuid}/defer/why-trainee-deferred${referrer}`)

    // Commented out for the time being over Moment.js deprecation errors
    // if (moment(dates.toDateObject(record?.deferredDate)).isAfter(dates.toDateObject(commencementDate))) {
    //   res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
    // } else {
    //   res.redirect(`/record/${req.params.uuid}/defer${referrer}`)
    // }
  })

  // Defer route
  // Ask the reason for deferral
  router.post('/record/:uuid/defer/why-trainee-deferred-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    // const deferralReason = req.session.data['deferral-reason']
    res.redirect(`/record/${req.params.uuid}/defer/confirm${referrer}`)
  })

  /*
  =========================================================================

  Withdraw routes

  =========================================================================
  */

  // Redirect to first page
  router.get('/record/:uuid/withdraw', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)

    if (utils.traineeStarted(record)) {
      res.redirect(`/record/${req.params.uuid}/withdraw/date`)
    } else if (utils.ittStartedButNoCommencementDate(record)) {
      res.redirect(`/record/${req.params.uuid}/withdraw/did-trainee-start`)
    } else {
      res.redirect(`/record/${req.params.uuid}/withdraw/cannot-withdraw${referrer}`)
    }
  })

  // If trainee has not started, tell user they cannot withdraw the trainee
  router.post('/record/:uuid/withdraw/did-trainee-start-answer', (req, res) => {
    const data = req.session.data
    const record = data.record

    const traineeStarted = record?.trainingDetails?.traineeStarted

    const referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted === 'true') {
      _.set(record, 'withdraw.showStartDate', true)
      res.redirect(`/record/${req.params.uuid}/withdraw/when-did-trainee-start${referrer}`)
    } else if (traineeStarted === 'false') {
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
    const data = req.session.data
    const record = data.record
    const courseStartDate = record?.courseDetails?.startDate
    const traineeStarted = record?.trainingDetails?.traineeStarted
    const commencementDate = record?.trainingDetails?.commencementDate
    const referrer = utils.getReferrer(req.query.referrer)

    if (traineeStarted === 'started-itt-on-time') {
      record.trainingDetails.commencementDate = courseStartDate
    }
    if (moment(dates.toDateObject(record?.withdraw?.date)).isAfter(dates.toDateObject(commencementDate))) {
      res.redirect(`/record/${req.params.uuid}/withdraw/date${referrer}`)
    } else {
      delete record?.withdraw?.date
      res.redirect(`/record/${req.params.uuid}/withdraw/date${referrer}`)
    }
  })

  // Get dates for withdraw flow
  router.post('/record/:uuid/withdraw/date-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    const radioChoice = record?.withdraw?.dateRadio

    if (utils.isDeferred(record) && record.deferredDate) {
      console.log('Record was previously deferred. Using deferral date for')
      _.set(record, 'withdraw.date', record.deferredDate)
      res.redirect(`/record/${req.params.uuid}/withdraw/details${referrer}`)
    } else {
      // Catch no answer given
      if (!radioChoice || (radioChoice === 'On another day' && !record?.withdraw?.date)) {
        res.redirect(`/record/${req.params.uuid}/withdraw/date`)
      } else {
        if (radioChoice === 'Today') {
          record.withdraw.date = filters.toDateArray(filters.today())
        }
        if (radioChoice === 'Yesterday') {
          record.withdraw.date = filters.toDateArray(moment().subtract(1, 'days'))
        }

        res.redirect(`/record/${req.params.uuid}/withdraw/details${referrer}`)
      }
    }
  })

  // Copy withdraw data back to real record
  router.post('/record/:uuid/withdraw/update', (req, res) => {
    const data = req.session.data
    let record = data.record

    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      record.previousStatus = record.status
      record.status = 'Withdrawn'
      record.withdraw.date = filters.toDateObject(record.withdraw.date)
      delete record.withdrawDateRadio

      const withdrawalReasonText = `Date trainee withdrew: ${filters.govukDate(record.withdraw.date)}`

      record = utils.setEndAcademicYear(record)
      record = utils.setAcademicYears(record)

      utils.deleteTempData(data)
      utils.updateRecord(data, record, false)
      utils.addEvent(record, 'Trainee withdrawn', withdrawalReasonText)
      req.flash('success', 'Trainee withdrawn')
      res.redirect('/record/' + req.params.uuid)
    }
  })

  // Revert withdrawal
  router.post('/record/:uuid/admin/revert/withdraw/update', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      if (record.status.includes('Withdrawn')) {
        console.log('un-withdrawing trainee')
        record.status = 'TRN received'
        delete record.withdraw
        // let revertWithdrawalReasonText = `Reason: Provider withdrew trainee by accident`
        const reasonText = `${record?.revert?.withdraw?.auditLogComment}`
        utils.addEvent(record, 'Withdrawal undone', reasonText)
        // utils.revertWithdrawal(record) // Recommend a group of trainees for EYTS/QTS first so data is correct
        utils.deleteTempData(data)
        utils.updateRecord(data, record, false)
        req.flash('success', 'Withdrawal undone')
      } else {
        console.log('Error: cannot un-withdraw a trainee that is not currently withdrawn')
      }
      // Delete temporary revert data
      delete record?.revert
      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}`)
      }
    }
  })

  // end of delete, defer, withdraw routes
  // =========================================================================

  // trainee-details
  router.post('/record/:uuid/trainee-start-date', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    const courseStartDate = record?.courseDetails?.startDate
    const traineeStarted = record?.trainingDetails?.traineeStarted

    if (traineeStarted === 'started-itt-on-time') {
      record.trainingDetails.commencementDate = courseStartDate
    } else if (traineeStarted === 'trainee-not-started') { // If the answer was explicitly false.
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
  router.get('/record/:uuid/course-details/is-course-change', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)

    _.set(record, 'temp.courseMoveTemp.courseMoveUpFront', 'true')
    _.set(record, 'temp.courseMoveTemp.isCourseMove', 'true')

    res.redirect(`/record/${req.params.uuid}/course-details/course-change-date${referrer}`)
  })

  // Work out if course details have changed significantly and so we need to have the user
  // check the school and funding sections
  router.post('/:recordtype/:uuid/course-details/course-change-significant-change-check', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    const recordPath = utils.getRecordPath(req)

    const previousRecord = utils.getRecordById(data.records, record.id)

    const courseMove = record?.temp?.courseMoveTemp
    const isCourseMove = (courseMove?.isCourseMove === 'true')
    if (isCourseMove) {
      console.log(`Course change: changed on ${courseMove.courseMoveDate}`)
    }

    const courseCodeChanged = record?.courseDetails?.code !== previousRecord?.courseDetails?.code

    const routeChanged = (record?.route !== previousRecord?.route)
    if (routeChanged) {
      console.log(`Course change: route changed from ${previousRecord?.route} to ${record?.route}`)
    }

    const studyModeChanged = (record?.courseDetails?.studyMode !== previousRecord?.courseDetails?.studyMode)
    if (studyModeChanged) {
      console.log(`Course change: study mode changed from ${previousRecord?.courseDetails?.studyMode} to ${record?.courseDetails?.studyMode}`)
    }

    // Check if the allocation subject has changed.
    // If the specialism has changed but the allocation subject remains the same
    // (eg physics to applied physics) then the change is minimal and it has no impact on funding
    const newAllocationSubject = utils.getAllocationSubject(record)
    const oldAllocationSubject = utils.getAllocationSubject(previousRecord)

    const allocationSubjectChanged = !newAllocationSubject || (newAllocationSubject !== oldAllocationSubject)

    if (allocationSubjectChanged) {
      console.log(`Course change: allocation subject changed from ${newAllocationSubject} to ${oldAllocationSubject}`)
    }

    // Clear out data for sections that may no longer be needed
    if (!utils.requiresSection(record, 'degree')) {
      delete record?.degree
    }
    if (!utils.requiresSection(record, 'schools')) {
      delete record?.schools
    }
    if (!utils.requiresSection(record, 'placement')) {
      delete record?.placement
    }

    // Schools have individual fields
    if (!utils.requiresField(record, 'leadPartner')) {
      delete record?.schools?.leadPartner
    }
    if (!utils.requiresField(record, 'employingSchool')) {
      delete record?.schools?.employingSchool
    }

    if (routeChanged || allocationSubjectChanged) {
      // Don’t trust financial incentives after a significant change - better to
      // collect again.
      delete record?.funding?.source
    }

    // If the route or first subject has changed, that's a significant change and providers
    // should review the rest of the training details
    if (routeChanged || courseCodeChanged || allocationSubjectChanged || isCourseMove || studyModeChanged) {
      res.redirect(`${recordPath}/course-details/course-change-instructions${referrer}`)
    } else {
      // Implicitly not a course change, so we can delete any temp data
      delete record?.temp?.courseMoveTemp
      // 307 Redirect to POST route
      res.redirect(307, `${recordPath}/course-details/update${referrer}`)
    }
  })
  router.post('/:recordtype/:uuid/course-details/course-change-date-question-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    const recordPath = utils.getRecordPath(req)

    const isCourseMove = record?.temp?.courseMoveTemp?.isCourseMove

    // No data
    if (!isCourseMove) {
      res.redirect(`/record/${req.params.uuid}/course-details/course-change-date-question${referrer}`)
    } else {
      if (isCourseMove === 'false') {
        // Clear previous data if we've now been told it’s not a course change
        delete record?.temp?.courseMoveTemp?.courseMoveDate
      }

      res.redirect(utils.getNextCourseChangeUrl(record, recordPath, referrer))
    }
  })

  // Work out the next url to send the user after a significant course change
  // This will look up what data is missing on the record and send the user to the form
  // page for that data
  router.get(['/:recordtype/:uuid/course-details/get-next-course-change-url', '/:recordtype/course-details/get-next-course-change-url'], (req, res) => {
    const data = req.session.data
    const record = data.record
    const recordPath = utils.getRecordPath(req)

    // Unlike most pages, here we want to insert a new referrer in the query string
    const reviewCourseChangeUrl = `${recordPath}/course-details/final-check-course-change`
    const referrerArray = utils.pushReferrer(req.query.referrer, reviewCourseChangeUrl)
    const referrer = utils.getReferrer(referrerArray)

    res.redirect(utils.getNextCourseChangeUrl(record, recordPath, referrer))
  })

  // Work out if course details have changed significantly and so we need to have the user
  // check the school and funding sections
  router.post('/:recordtype/:uuid/course-details/final-check-course-change-answer', (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)

    const isCourseMove = (record?.temp?.courseMoveTemp?.isCourseMove === 'true')

    const timelineMessage = (isCourseMove) ? 'Traineed moved to new course' : false

    if (isCourseMove) {
      const bundle = {}
      bundle.dateFinished = record?.temp?.courseMoveTemp?.courseMoveDate

      const previousRecord = utils.getRecordById(data.records, record.id)

      // Make a copy so we don’t edit the original
      const previousRecordCopy = Object.assign({}, previousRecord)
      // Delete historic course details on reord so we don’t create circular JSON
      delete previousRecordCopy?.historicCourseDetails

      bundle.recordData = previousRecordCopy

      if (record.historicCourseDetails) {
        record.historicCourseDetails.push(bundle)
      } else {
        record.historicCourseDetails = [bundle]
      }
    }

    delete record?.temp

    utils.deleteTempData(data)
    utils.updateRecord(data, record, timelineMessage)
    req.flash('success', 'Trainee record updated')

    if (referrer) {
      res.redirect(utils.getReferrerDestination(req.query.referrer))
    } else {
      // More likely we've come from this tab where most things are on
      res.redirect(`/record/${req.params.uuid}`)
    }
  })

  // Copy temp record back to real record
  router.post(['/record/:uuid/:page/update', '/record/:uuid/update'], (req, res) => {
    const data = req.session.data
    const record = data.record
    const referrer = utils.getReferrer(req.query.referrer)
    // Update failed or no data
    if (!record) {
      res.redirect(`/record/${req.params.uuid}`)
    } else {
      utils.deleteTempData(data)
      utils.updateRecord(data, record)
      req.flash('success', 'Trainee record updated')

      if (referrer) {
        res.redirect(utils.getReferrerDestination(req.query.referrer))
      } else {
        // More likely we've come from this tab where most things are on
        res.redirect(`/record/${req.params.uuid}/personal-details`)
      }
    }
  })

  // Existing record pages
  // NOTE!: needs to come after more specific routes
  router.get('/record/:uuid/:page*', (req, res, next) => {
    const records = req.session.data.records
    const referrer = req.query.referrer
    res.locals.referrer = referrer
    const record = records.find(record => record.id === req.params.uuid)
    if (!record) {
      res.redirect('/records')
    } else {
      // Use our own render as some templates live at /index.html
      utils.render(path.join('record', req.params.page, req.params[0]), res, next)
      // res.render(path.join('record', req.params.page, req.params[0]))
    }
  })
}

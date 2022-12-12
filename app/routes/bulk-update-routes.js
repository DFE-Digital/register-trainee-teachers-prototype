const _ = require('lodash')
const filters = require('./../filters.js')()
const moment = require('moment')
const path = require('path')
const seedRandom = require('seedrandom')
const url = require('url')
const utils = require('./../lib/utils')
const weighted = require('weighted')
const { faker } = require('@faker-js/faker')

let randomSeeded = new seedRandom("recommend")

const rowsHaveErrors = rows => {
  if (Array.isArray(rows)) {
    return rows.some(row => row.uploadStatus == "error")
  } else {
    return false
  }
}

const rowsHaveUpdates = rows => {
  if (Array.isArray(rows)) {
    return rows.some(row => row.uploadStatus == "updated")
  } else {
    return false
  }
}

module.exports = router => {
  /* 
  =========================================================
  Add (missing) details routes
  =========================================================
  */

  /* Review errors or skip */
  router.get('/bulk-update/add-details/errors-found-answer', function(req, res) {
    const data = req.session.data
    if (data?.bulk?.addDetailsFixErrors == "Fix errors now") {
      res.redirect('/bulk-update/add-details/fix-errors');
    } else if (data?.bulk?.addDetailsFixErrors == "Skip fixing errors") {
      delete data?.bulk?.addDetailsFixErrors
      res.redirect('/bulk-update/add-details/check-pending-updates')
    } else {
      res.redirect('/bulk-update/add-details/errors-found')
    }
  })

  /* Set-up check updates page up as coming from upload */
  router.get('/bulk-update/add-details/fix-file', function(req, res) {
    const data = req.session.data
    data.bulk = {
      addDetailsFixErrors: true
    }
    res.redirect('/bulk-update/add-details/check-pending-updates');
  });

  /* Clear review errors answer */
  // router.get('/bulk-update/add-details/no-update', function(req, res) {
  //   const data = req.session.data
  //   delete data?.bulk?.addDetailsFixErrors
  //   delete data?.bulk?.recommendFixErrors
  //   res.redirect('/bulk-update/add-details/check-pending-updates');
  // });

  /* Get trainees to add missing details */
  router.post('/bulk-update/add-details/bulk-update-answer', function(req, res) {

    const data = req.session.data
    let filteredRecords  = utils.filterRecords(data.records, data)
    let uploadedTrainees = utils.filterByCanBulkUpdate(filteredRecords)
    let randomSeeded = seedRandom("update")

    let templateErrors = [
      "TRN not recognised",
      "TRN missing",
      "Trainee start date: '07/20/2023' — enter a valid start date",
      "Trainee start date: '20/07/2023' — trainee start date must be in the past",
      "URN not recognised",
      "school is closed"
    ]

    /* For each record, randomly pick whether it's ok, in error, or unchanged. If in error, pick a random error */
    let processedRows = uploadedTrainees.map((trainee, index) => {

      let row = {
        rowNumber: index + 1,
        trainee,
        uploadStatus: weighted.select(["error", "unchanged", "updated"], [0.25, 0.05, 0.7], randomSeeded)
      }

      if (row.uploadStatus == "error") {
        row.errorMessage = utils.pickRandom(templateErrors, randomSeeded)
      }

      if (!row.trainee.trainingDetails.commencementDate) {
        row.trainee.trainingDetails.commencementDate = utils.getRandomArbitrary(6, 8) + "/" + utils.getRandomArbitrary(1, 28) + "/" + data.years.defaultCourseYear
      }

      if (row.errorMessage == "URN not recognised" || row.errorMessage == "school is closed") {

        if (row.trainee?.placement?.items && row.trainee?.placement?.items.length) {
          row.errorMessage = "URN: '" + row.trainee.placement?.items[0]?.school?.urn + "' — " + row.errorMessage
        } else {
          row.errorMessage = "URN: '231231' – URN not recognised"
        }
      }
      return row
    })

    data.bulkUpload = {
      processedRows
    }

    if (rowsHaveErrors(processedRows) && rowsHaveUpdates(processedRows)) {
      res.redirect('/bulk-update/add-details/errors-found')
    } else if (rowsHaveErrors(processedRows) && !rowsHaveUpdates(processedRows)) {
      res.redirect('/bulk-update/add-details/fix-errors')
    } else if (!rowsHaveErrors(processedRows) && rowsHaveUpdates(processedRows)) {
      res.redirect('/bulk-update/add-details/check-pending-updates')
    }
    else {
      res.redirect('/bulk-update/add-details/ralph-to-add-url')
    }
  })

  /* 
  =========================================================
  Recommened trainees for QTS or EYTS routes
  =========================================================
  */

  // Generate somewhat realistic data
  const populateErrors = (data, errorWeights, seed) => {

    console.log("Bulk recommend: populating errors")

    seed = seed || new seedRandom()

    let errorPercentage       = 0.10 // 5%
    let unchangedPercentage   = 0.05 // 5%
    let recommendedPercentage = 0.85 // 90%

    errorWeights = errorWeights || [errorPercentage, unchangedPercentage, recommendedPercentage]

    let wildCardDate = utils.getRandomArbitrary(1, 6) + "/" + utils.getRandomArbitrary(1, 28) + "/" + data.years.endOfCurrentCycle
    let processedRows = data?.bulkUpload?.processedRows

    if (!processedRows) {
      console.log("Bulk recommend: generating new errors")
      let filteredRecords  = utils.filterRecords(data.records, data)

      let uploadedTrainees = utils.filterByReadyToRecommend(filteredRecords)

      uploadedTrainees.sort((a, b) => utils.sortAlphabetical(a.personalDetails.familyName, b.personalDetails.familyName))

      /* For each record, randomly pick whether it's ok, in error, or unchanged. If in error, pick a random error */
      processedRows = uploadedTrainees.map((trainee, index) => {

        let selectedStatus = weighted.select(["error", "unchanged", "updated"], errorWeights, seed)

        let wildCardDate = utils.getRandomArbitrary(1, 28) + "/" + utils.getRandomArbitrary(1, 6) + "/" + data.years.endOfCurrentCycle
        let assessmentDate = weighted.select(["28/6/" + data.years.endOfCurrentCycle, "19/6/" + data.years.endOfCurrentCycle, "6/5/" + data.years.endOfCurrentCycle, wildCardDate], [0.5, 0.2, 0.2, 0.1], seed)

        let row = {
          rowNumber: index + 3,
          trainee,
          uploadStatus: selectedStatus,
          assessmentDate: (selectedStatus != 'unchanged') ? assessmentDate : null,
        }

        if (selectedStatus == "error") {
          // row.errorMessage = utils.pickRandom(templateErrors, seed)
          row.errorMessage = weighted.select([
              "Date standards met provided without a TRN or Provider trainee ID - add a TRN or Provider trainee ID or remove the date standards met", 
              "Date standards met: '20/9/2023' - date standards met must be in the past",
              "TRN and Provider trainee ID are not for the same trainee",
            ], 
            [0.25, 0.5, 0.25], seed)
        }

        return row
      })

    }

    // Reduce errors by 100%
    else {
      console.log("Bulk recommend: reducing existing errors")
      processedRows.forEach(row => {

        if (row.uploadStatus == "error"){
          let errorFixed = weighted.select([true, false], [1, 0.0])
          if (errorFixed){
            row.uploadStatus = "updated"
            delete row.errorMessage
          }

        }
      })
    }

    return processedRows

  }

  /* Clear out existing data when startin a new journey */
  router.get('/bulk-update/recommend/start', function(req, res) {
    console.log("Bulk recommend: starting new journey")
    const data = req.session.data
    delete data.bulkUpload
    delete data?.bulk
    res.redirect('/bulk-update/recommend/upload');
  });

  /* Clear review errors answer */
  router.post('/bulk-update/recommend/upload-answer', function(req, res) {
    const data = req.session.data

    data.bulkUpload = {
      ...data?.bulkUpload,
      processedRows: populateErrors(data)
    }
    res.redirect('/bulk-update/recommend/upload-summary');
  });

    /* Set-up check updates page up as coming from upload */
  router.post('/bulk-update/recommend/fix-errors-answer', function(req, res) {
    const data = req.session.data

    data.bulkUpload = {
      ...data?.bulkUpload,
      processedRows: populateErrors(data)
    }

    res.redirect('/bulk-update/recommend/upload-summary');
  });

  // Assume a small number of changes. Swaps some trainees from recommended and some to recommended
  router.post('/bulk-update/recommend/upload-changes-answer', function(req, res) {
    const data = req.session.data

    let processedRows = data?.bulkUpload?.processedRows

    if (!processedRows){
      res.redirect('/bulk-update/recommend/upload')
    }
    else {
      processedRows.forEach(row => {
        if (row.uploadStatus == "unchanged"){
          let startRecommending = weighted.select([true, false], [0.01, 0.99])
          if (startRecommending){
            console.log("Bulk recommend: swapping to recommended")
            row.uploadStatus = "updated"
            row.assessmentDate = `28/6/${data.years.endOfCurrentCycle}`
          }
        }
        else if (row.uploadStatus == "updated"){
          let stopRecommending = weighted.select([true, false], [0.05, 0.95])
          if (stopRecommending){
            console.log("Bulk recommend: swapping to not recommended")
            row.uploadStatus = "unchanged"
            delete row.assessmentDate
          }
        }
      })
    }

    data.bulkUpload = {
      ...data?.bulkUpload,
      processedRows
    }

    if (!processedRows || !processedRows.filter(row => row.uploadStatus == "updated")){
      res.redirect('/bulk-update/recommend/upload')
    }
    else {
      res.redirect('/bulk-update/recommend/upload-summary')
    }

  })

  // Redirect back to upload if there are no trainees with updates
  router.get('/bulk-update/recommend/check-pending-updates', function(req, res) {
    const data = req.session.data

    let processedRows = data?.bulkUpload?.processedRows

    if (!processedRows || !processedRows.filter(row => row.uploadStatus == "updated")){
      res.redirect('/bulk-update/recommend/upload')
    }
    else {
      res.render('bulk-update/recommend/check-pending-updates');
    }

  })

    // Redirect back to upload if there are no trainees with updates
  router.post('/bulk-update/recommend/update', function(req, res) {
    const data = req.session.data

    let successCount = 0
    let failCount = 0

    let processedRows = data?.bulkUpload?.processedRows || []
    let rowsWithUpdates = processedRows.filter(row => row.uploadStatus == "updated")
  
    console.log({processedRows})
    console.log(`processedRows: ${processedRows.length}`)
    console.log(`trainees to recommend: ${rowsWithUpdates.length}`)

    rowsWithUpdates.forEach(row => {
      // We need to look up the record again as the one we have is a copy
      let record = utils.getRecordById(data.records, row.trainee.id)
      let success = utils.recommendForAward(record, {date: row.assessmentDate})
      if (success) successCount++
      else failCount++
    })

    console.log(`Bulk recommend: ${successCount} ${filters.pluralise('success', successCount)}, ${failCount} ${filters.pluralise('failure', failCount)}.`)

    // Clear data for next time
    // delete data.bulkUpdate

    res.redirect('/bulk-update/recommend/confirmation')

  })

}

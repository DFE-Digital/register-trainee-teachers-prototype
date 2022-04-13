const _ = require('lodash')
const moment = require('moment')
const path = require('path')
const utils = require('./../lib/utils')
const url = require('url')
const filters = require('./../filters.js')()
const { faker } = require('@faker-js/faker')
const weighted = require('weighted')

module.exports = router => { 

  const getRandomArbitrary = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
  }

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
      res.redirect('/bulk-update/add-details/check-pending-updates');
    } else {
      res.redirect('/bulk-update/add-details/errors-found');
    }
  });

  /* Set-up check updates page up as coming from upload */
  router.get('/bulk-update/add-details/fix-file', function(req, res) {
    const data = req.session.data
    data.bulk = {
      addDetailsFixErrors: true,
    }
    res.redirect('/bulk-update/add-details/check-pending-updates');
  });

  /* Clear review errors answer */
  router.get('/bulk-update/add-details/no-update', function(req, res) {
    const data = req.session.data
    delete data?.bulk?.addDetailsFixErrors
    res.redirect('/bulk-update/add-details/check-pending-updates');
  });


  /* 
  =========================================================
  Recommened trainees for QTS or EYTS routes
  =========================================================
  */

  /* Review errors or skip */
  router.get('/bulk-update/recommend/errors-found-answer', function(req, res) {
    const data = req.session.data
    if (data?.bulk?.recommendFixErrors == "Fix errors now") {
      res.redirect('/bulk-update/recommend/fix-errors');
    } else if (data?.bulk?.recommendFixErrors == "Skip fixing errors") {
      delete data?.bulk?.recommendFixErrors
      res.redirect('/bulk-update/recommend/check-pending-updates');
    } else {
      res.redirect('/bulk-update/recommend/errors-found');
    }
  });

  /* Set-up check updates page up as coming from upload */
  router.get('/bulk-update/recommend/fix-file', function(req, res) {
    const data = req.session.data
    data.bulk = {
      recommendFixErrors: true,
    }
    res.redirect('/bulk-update/recommend/check-pending-updates');
  });

  /* Clear review errors answer */
  router.get('/bulk-update/recommend/no-update', function(req, res) {
    const data = req.session.data
    delete data?.bulk?.recommendFixErrors
    res.redirect('/bulk-update/recommend/check-pending-updates');
  });


  /* Get trainees to bulk recommend */
  router.post('/bulk-update/recommend/bulk-update-answer', function(req, res) {

    const data = req.session.data
    let filteredRecords  = utils.filterRecords(data.records, data)
    let uploadedTrainees = utils.filterByCanBulkRecommend(filteredRecords)

    let templateErrors = [
      'TRN not recognised',
      'TRN missing',
      'Date standards met: ‘09/20/2023’ — enter a valid date',
      'Date standards met: ‘20/09/2023’ — date the trainee met QTS must be in the past',
      'Postgraduate qualification: ‘BA (Hons)’ — enter ‘PGCE’, ‘PGDE’ or ‘None’ for postgraduate qualification',
      'Postgraduate qualification: ‘PGCE’ — trainees on undergraduate courses cannot be awarded a postgraduate qualification.',
      'Postgraduate qualification missing. If the trainee did not get a postgraduate qualification enter ‘None’.'
    ]

    let processedRows = uploadedTrainees.map((trainee, index) => {
      let row = {
        rowNumber: index + 1,
        trainee,
        uploadStatus: weighted.select(["error", "unchanged", "updated"], [0.1, 0.05, 0.85]),
        assessmentDate: getRandomArbitrary(6, 8) + "/" + getRandomArbitrary(1, 28) + "/" + data.years.endOfCurrentCycle
      }

      if (row.uploadStatus == "error") {
        row.errorMessage = faker.helpers.randomize(templateErrors)
      }

      return row
    })

    data.bulkUpload = {
      processedRows
    }

    res.redirect('/bulk-update/recommend/errors-found');
  })

}

const _ = require('lodash')
const filters = require('./../filters.js')()
const moment = require('moment')
const path = require('path')

const url = require('url')
const utils = require('./../lib/utils')
const weighted = require('weighted')
const { faker } = require('@faker-js/faker')


module.exports = router => {

  // Render a page for each organisation UUID
  router.get('/reports/choose-trainee-records', function(req, res, next) {
    const data = req.session.data

    // Delete any previous data
    delete data.reports

    let formOption = data?.settings?.traineeExportQuestionStyle

    if (formOption == "Two stage"){
      res.redirect('/reports/choose-trainee-records/year')
    }
    else {
      res.redirect('/reports/choose-trainee-records/year-group')
    }

  })


  // Render a page for each organisation UUID
  router.post('/reports/choose-trainee-records/year-answer', function(req, res, next) {

    const data = req.session.data

    let dateAnswer = data?.reports?.year

    // Skip following question about type of year
    if (dateAnswer == 'All years'){
      res.redirect('./statuses')
    }
    // Answer expected to be current year or previous year
    else if (dateAnswer){
      res.redirect('./year-type')
    }
    // No answer given, return to page
    else {
      res.redirect('/reports/date')
    }

  })

}

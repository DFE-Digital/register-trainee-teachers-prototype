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
    res.redirect('/reports/choose-trainee-records/year')
  })

}

const _ = require('lodash')
const filters = require('./../filters.js')()
const moment = require('moment')
const path = require('path')
const seedRandom = require('seedrandom')
const url = require('url')
const utils = require('./../lib/utils')
const weighted = require('weighted')
const { faker } = require('@faker-js/faker')

module.exports = router => {

  // Render organisation pages, passing along the organisation UUID
  router.get('/funding/:year/:page*', function (req, res, next) {

    // Use our own render as some templates live at /index.html
    utils.render(
      path.join('funding', req.params.page, req.params[0]), res, next, {
        fundingYearShort: req.params.year,
        fundingYear: utils.yearToAcademicYearString(req.params.year)
      }
    )
  })

}

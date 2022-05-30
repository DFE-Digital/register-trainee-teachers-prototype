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

  // Render a page for each organisation UUID
  router.get('/organisations/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let provider = data.providers.all.find(provider => provider.id == uuid)

    res.render('organisations/organisation', {
      provider: provider
    })
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/organisations/:uuid/:page*', function (req, res, next) {
    console.log('looking for org')
    // Use our own render as some templates live at /index.html
    utils.render(
      path.join('organisations', req.params.page, req.params[0]), res, next, {
        uuid: req.params.uuid
      }
    )
  })

}

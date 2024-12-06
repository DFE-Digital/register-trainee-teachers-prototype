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
  router.get('/token-manage', function (req, res, next) {
    const data = req.session.data
    const providerUuid = req.params.providerUuid

    utils.render(
      path.join('organisations', req.params.page, req.params[0]), res, next, {
        uuid: req.params.uuid
      }
    )

    // res.redirect(`/organisations/:providerUuid/token-manage`)
  })
}

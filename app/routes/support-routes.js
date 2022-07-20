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
  router.get('/support/organisations/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let provider = data.providers.all.find(provider => provider.id == uuid)

    if (!provider) res.redirect('/support/organisations')
    else {
      res.render('support/organisations/organisation', {
        provider,
        uuid,
        navActive: 'organisations'
      })
    }
    
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/organisations/:uuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let provider = data.providers.all.find(provider => provider.id == uuid)
    
    // Use our own render as some templates live at /index.html

    let targetUrl = path.join('support/organisations', req.params.page, req.params[0])

    console.log ({targetUrl})
    if (!provider) res.redirect('/support/organisations')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          provider,
          returnLink: {
            text: 'Cancel',
            href: `./../${uuid}`
          }
        }
      )
    }
  })

}

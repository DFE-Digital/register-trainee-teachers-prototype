const path = require('path')
const utils = require('./../lib/utils')
const apiTokens = require('../data/api-tokens')

// TODO: Add the Provider UUID to the routes

module.exports = router => {
  router.get('/token-manage', (req, res, next) => {
    const apiTokens = require('./../data/api-tokens')
    const tokens = apiTokens.tokens
    const providerUuid = req.params.providerUuid
    res.render('organisations/token-manage', {
      tokens
    })
  })

  router.get('/generate-token', (req, res, next) => {
    const providerUuid = req.params.providerUuid
    res.redirect('/organisations/:providerUuid/token-details')
  })

  router.get('/token-generated', (req, res, next) => {
    const providerUuid = req.params.providerUuid
    res.redirect('/organisations/:providerUuid/token-generated')
  })

  // Placeholder for the copy token functionality to be decided upon so
  router.get('/copy-token', (req, res, next) => {
    res.redirect('/organisations/:providerUuid/token-generated')
  })

  router.get('/token-revoke', (req, res, next) => {
    const providerUuid = req.params.providerUuid
    res.redirect('/organisations/:providerUuid/confirm-revoke')
  })
}

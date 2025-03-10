const path = require('path')
const utils = require('./../lib/utils')
const apiTokens = require('../data/api-tokens')

module.exports = router => {
  router.get('/token-manage', (req, res, next) => {
    const apiTokens = require('./../data/api-tokens')
    const tokens = apiTokens.tokens
    console.log(tokens);
    res.render('organisations/token-manage', { tokens })
  })

  router.get('/token-revoke', (req, res, next) => {
    const providerUuid = req.params.providerUuid
    res.redirect('/organisations/:providerUUid/confirm-revoke')
  })
}

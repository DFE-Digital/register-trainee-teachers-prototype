const path = require('path')
const utils = require('./../lib/utils')

module.exports = router => {
  router.get('/token-manage', (req, res, next) => {
    res.redirect('/organisations/:providerUuid/token-manage')
    // utils.render(
    //   path.join('organisations', req.params.page, req.params[0]), res, next, {
    //     uuid: req.params.uuid
    //   }
    // )
  })
}

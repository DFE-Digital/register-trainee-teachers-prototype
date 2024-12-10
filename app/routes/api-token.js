const path = require('path')
const utils = require('./../lib/utils')

module.exports = router => {
  router.get('/token-manage', function (req, res, next) {
    utils.render(
      path.join('organisations', req.params.page, req.params[0]), res, next, {
        uuid: req.params.uuid
      }
    )
  })
}

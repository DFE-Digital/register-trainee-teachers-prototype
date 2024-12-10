const path = require('path')
const utils = require('./../lib/utils')

module.exports = router => {
  // Render a page for each organisation UUID
  router.get('/organisations/:uuid', function (req, res, next) {
    const data = req.session.data
    const uuid = req.params.uuid
    const provider = data.providers.all.find(provider => provider.id === uuid)

    res.render('organisations/organisation', {
      provider
    })
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/organisations/:uuid/:page*', function (req, res, next) {
    // Use our own render as some templates live at /index.html
    utils.render(
      path.join('organisations', req.params.page, req.params[0]), res, next, {
        uuid: req.params.uuid
      }
    )
  })
}

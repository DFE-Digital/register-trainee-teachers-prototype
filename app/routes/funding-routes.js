const path = require('path')
const utils = require('./../lib/utils')

module.exports = router => {
  // Render organisation pages, passing along the organisation UUID
  router.get('/funding/:year/:page*', (req, res, next) => {
    // Use our own render as some templates live at /index.html
    utils.render(
      path.join('funding', req.params.page, req.params[0]), res, next, {
        fundingYearShort: req.params.year,
        fundingYear: utils.yearToAcademicYearString(req.params.year)
      }
    )
  })
}

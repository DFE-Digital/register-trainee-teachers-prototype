const { fakerEN_GB: faker } = require('@faker-js/faker')
const weighted = require('weighted')
const trainingRouteData = require('../training-route-data')
const utils = require('../../lib/utils.js')
const years = require('../years.js')

module.exports = application => {
  // All drafts are implicitly manual
  // TODO: how does this work with apply drafts?
  if (application.status === 'Draft') {
    return 'Manual'
  } else {
    // HEI records are nearly all HESA
    if (application.accreditingProviderType === 'HEI') {
      const routesThatMustBeManual = [
        'Opt-in',
        'iQTS',
        'Early  years',
        'Assessment only',
        'HPITT'
      ]
      if (routesThatMustBeManual.some(route => application.route.includes(route))) {
        return 'Manual'
      } else return 'HESA'
    } else {
      // Source for SCITTs will depend on date. Older records are DTTP, newer are Apply or manual
      const startYear = application.academicYear || years.currentAcademicYear
      const startYearSimple = utils.academicYearToYear(startYear)

      if (startYearSimple < 2021) return 'DTTP'

      else if (trainingRouteData.applyRoutes.includes(application.route)) {
        return weighted.select({
          Manual: 0.05,
          Apply: 0.95
        })
      } else {
        return 'Manual'
      }
    }
  }
}

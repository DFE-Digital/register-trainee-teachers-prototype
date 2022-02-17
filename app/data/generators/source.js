const faker = require('faker')
const weighted = require('weighted')
const trainingRouteData = require('../training-route-data')

module.exports = application => {

  if (application.status == "Draft") return "Manual"

  else {
    if (trainingRouteData.applyRoutes.includes(application.route)){
      if (application.accreditingProviderType == "HEI") {
        return weighted.select({
          "Manual": 0.1,
          "HESA":   0.9,
          "DTTP":   0.0,
          "Apply":  0.0
        })
      } else {
        return weighted.select({
          "Manual": 0.1,
          "HESA":   0.0,
          "DTTP":   0.3,
          "Apply":  0.3
        })
      }
    }
    else return "Manual"
  }
}

const { faker } = require('@faker-js/faker')
const moment    = require('moment')
const weighted          = require('weighted')

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Random whole number
function getRandomInt(min = 0, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// Approximately the most common conditions
let commonApplyConditions = {
  "DBS check": 0.5,
  "Provide evidence of GCSE grades": 0.1,
  "Provide evidence of qualifications": 0.1,
  "Provide evidence of degree grade": 0.1,
  "Complete fitness to train to teach": 0.1,
  "Health check required": 0.05,
  "Proof of identity to be provided": 0.05
}

// Return 1 -3 random conditions
const pickRandomConditions = () => {
  let numberOfConditions = getRandomInt(1, 4)

  console.log(`Number of conditions: ${numberOfConditions}`)

  let copyOfConditions = Object.assign({}, commonApplyConditions)

  const getRandomCondition = (conditions) => {
    return weighted.select(conditions)
  }

  let selectedConditions = Array(numberOfConditions).fill().map((item, index) => {
    let selectedCondition = getRandomCondition(copyOfConditions)
    delete copyOfConditions[selectedCondition]
    return selectedCondition
  }).sort()

  return selectedConditions

}


module.exports = ( application, params ) => {

  let isApplyPending = params?.applyData?.applyStatus == "Pending conditions"

  // console.log(application.submittedDate, moment(application.submittedDate))
  // console.log(application)
  // console.log('submitted date', application.submittedDate)
  return {
    recruitedDate: application.submittedDate,
    applicationDate: faker.date.between(
      moment(application.submittedDate).subtract(60, 'days'),
      moment(application.submittedDate)
    ),
    ...(isApplyPending && {
      requiredConditions: pickRandomConditions()
    })
  }
}

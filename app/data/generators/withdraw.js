const { fakerEN_GB: faker } = require('@faker-js/faker')
const weighted = require('weighted')

const utils = require('../../lib/utils.js')

const withdrawalReasons = require('../withdrawal-reasons.js')

const reasonsWithoutUnknown = withdrawalReasons.filter(reason => reason != 'Unknown')

module.exports = params => {
  const isWithdrawn = utils.isWithdrawn(params)

  let reasons = []

  const hasReason = weighted.select([true, false], [0.95, 0.05])

  // Pick up to 3 reasons
  const countOfReasons = weighted.select([1, 2, 3], [0.33, 0.33, 0.33])
  const randomisedReasons = faker.helpers.shuffle(reasonsWithoutUnknown)

  if (hasReason) {
    reasons = randomisedReasons.slice(0, countOfReasons)
  } else reasons.push('Unknown')

  return {
    ...params.withdraw,
    reasons
  }
}

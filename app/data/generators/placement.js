const weighted = require('weighted')
const { fakerEN_GB: faker } = require('@faker-js/faker')

const allSchools = require('../gis-schools.js')

module.exports = (params) => {
  const item = () => {
    const school = faker.helpers.arrayElement(allSchools)
    // const startMonth = faker.helpers.arrayElement(['1','2','3','4','5','6','7','8','9','10','11','12'])
    // const duration = faker.helpers.arrayElement(['1','2','4','8','10','12'])

    return {
      school,
      // startMonth,
      // duration,
      id: faker.string.uuid()
    }
  }

  let count = 0

  let status

  // Assume all pending TRN applications have 0 or 1 placements provided
  if (params?.status === 'Pending TRN') {
    count = weighted.select([0, 1], [0.3, 0.7])
  } else if (params?.status.includes('recommended') || params?.status.includes('awarded')) {
    // Implicitly recommended or awarded should have had two placements
    count = 2
  } else {
    // Remaining: TRN received, Withdrawn, Deferred
    count = weighted.select({
      0: 0.05,
      1: 0.05,
      2: 0.9
    })
  }

  const items = []
  for (let i = 0; i < count; i++) {
    items.push(item())
  }

  // Mark section as complete once we have two placements
  if (count === 2) {
    status = 'Completed'
  }

  if (params?.placement?.hasPlacements === 'Not yet') {
    return {}
  } else {
    return {
      items,
      status
    }
  }
}

const weighted = require('weighted')
const faker   = require('faker')
const placementSchools = require('../accrediting-providers.js').all

module.exports = (params) => {

  const item = () => {
    const location = faker.helpers.randomize(placementSchools).name
    const startMonth = faker.helpers.randomize(['1','2','3','4','5','6','7','8','9','10','11','12'])
    const duration = faker.helpers.randomize(['1','2','4','8','10','12'])

    return {
      location,
      startMonth,
      duration,
      id: faker.datatype.uuid()
    }
  }

  let count = weighted.select({
    0: 0.1,
    1: 0.3,
    2: 0.6
  })

  let status

  if (params?.status.includes('recommended') || params?.status.includes('awarded')) {
    count = 2
  }

  const items = []
  for (var i = 0; i < count; i++) {
    items.push(item())
  }

  // Mark section as complete once we have two placements
  if (count == 2){
    status = 'Complete'
  }

  if (params?.placement?.hasPlacements == 'Not yet') {
    return {}
  } else {
    return {
      items: items, 
      status
    }
  }

}

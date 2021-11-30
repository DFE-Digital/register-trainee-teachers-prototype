const faker = require('faker')

const statusesWithoutTRNs = [
  "Draft",
  "Pending TRN",
  ]

module.exports = application => {

  let trn

  if (!statusesWithoutTRNs.includes(application.status)){
    trn = faker.datatype.number({
      'min': 1000000,
      'max': 9999999
    })
    trn = String(trn)
  }

  return trn
}

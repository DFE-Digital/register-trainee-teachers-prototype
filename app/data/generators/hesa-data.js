const { faker } = require('@faker-js/faker')
const moment    = require('moment')
const weighted   = require('weighted')

let percentageMissing = [0,1] //disabled

module.exports = record => {

  // Some HESA records are missing nationality
  let nationality = record?.personalDetails?.nationality
  if (nationality){
    record.personalDetails.nationality = weighted.select([null, nationality], percentageMissing)
  }

  let endDate = record?.courseDetails?.endDate
  if (endDate){
    record.courseDetails.endDate = weighted.select([null, endDate], percentageMissing)
  }

  let hesaId = `2294839475${faker.datatype.number({'min': 1000000, 'max': 9999999})}`

  record.hesa = {
    id: hesaId
  }
  return record
}


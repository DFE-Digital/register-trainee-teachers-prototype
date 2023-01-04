const { faker } = require('@faker-js/faker')
const moment    = require('moment')


module.exports = application => {

  // console.log(application.submittedDate, moment(application.submittedDate))
  // console.log(application)
  // console.log('submitted date', application.submittedDate)
  return {
    recruitedDate: application.submittedDate,
    applicationDate: faker.date.between(
      moment(application.submittedDate).subtract(60, 'days'),
      moment(application.submittedDate)
    )
  }
}


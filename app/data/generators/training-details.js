// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const faker   = require('faker')
const schools = require('../gis-schools.js')

faker.locale  = 'en_GB'

// Not all trainees have start dates - but to get these statuses you must have
const statusesWhereTraineesMustHaveStarted = [
  'EYTS recommended',
  'EYTS awarded',
  'QTS recommended',
  'QTS awarded'
]


module.exports = (params) => {

  // Todo: make traineeId closer to what Providers user (20/21-1234, etc)
  const traineeId = faker.random.alphaNumeric(8).toUpperCase()

  // Much better to use submitted date
  let commencementDate = params?.submittedDate || faker.date.between(
    moment(),
    moment().subtract(200, 'days'))

  let traineeStarted

  // Some statuses implicitly *must* have a commencement date
  if (statusesWhereTraineesMustHaveStarted.includes(params?.status)){
    traineeStarted = "true"
  }
  else if (params?.status == "Draft") {
    traineeStarted = "false"
  }
  // Course that haven’t started, don’t get a start date
  else if (params?.courseDetails?.startDate && moment(params?.courseDetails?.startDate).isAfter()) {
    traineeStarted = "false"
    console.log(params?.courseDetails?.startDate)
  }
  else {
    traineeStarted = params?.traineeStarted || weighted.select({
      "true": 0.8, // Most students should have commencement dates
      "false": 0.2
    })
  }

  commencementDate = (traineeStarted == "true") ? commencementDate : undefined

  return {
    traineeId,
    traineeStarted,
    commencementDate
  }
}

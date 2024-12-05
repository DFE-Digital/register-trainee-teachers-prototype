// Generates fake training details

const moment = require('moment')
const weighted = require('weighted')
const { fakerUK: faker } = require('@faker-js/faker')
const schools = require('../gis-schools.js')

// Not all trainees have start dates - but to get these statuses you must have
const statusesWhereTraineesMustHaveStarted = [
  'EYTS recommended',
  'EYTS awarded',
  'QTS recommended',
  'QTS awarded'
]

module.exports = (params) => {
  // Todo: make traineeId closer to what Providers user (20/21-1234, etc)
  const traineeIdNumber = faker.string.alphanumeric(8).toUpperCase()

  // Much better to use submitted date
  let commencementDate = params?.submittedDate || faker.date.between(
    moment().subtract(200, 'days'),
    moment()
  )

  let traineeStarted

  // Some statuses implicitly *must* have a commencement date
  if (statusesWhereTraineesMustHaveStarted.includes(params?.status) || params?.source == 'HESA') {
    traineeStarted = 'true'
  } else if (params?.status == 'Draft') {
    traineeStarted = 'false'
  }
  // Course that haven’t started, don’t get a start date
  else if (params?.courseDetails?.startDate && moment(params?.courseDetails?.startDate).isAfter()) {
    traineeStarted = 'false'
  } else {
    traineeStarted = params?.traineeStarted || weighted.select({
      true: 0.95, // Most students should have commencement dates
      false: 0.05
    })
  }

  commencementDate = (traineeStarted == 'true') ? commencementDate : undefined

  // Estimate 30% of records with Trainee IDs
  const hasTraineeId = weighted.select([true, false], [0.3, 0.7])
  const traineeId = (hasTraineeId) ? traineeIdNumber : undefined

  return {
    traineeId,
    traineeStarted,
    commencementDate
  }
}

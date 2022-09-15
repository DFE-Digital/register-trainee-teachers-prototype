const { faker }         = require('@faker-js/faker')
const weighted          = require('weighted')
const moment            = require('moment')
const utils = require('../../lib/utils.js')
const years = require('../years.js')

module.exports = application => {

  let status = null

  let courseEndDate = application.courseDetails.endDate

  // console.log(courseEndDate)
  let todaysDate = moment()

  let submittedDate = application.submittedDate

  // 2% Deferred
  if (weighted.select([true, false], [0.02, 0.98])){
    status = 'Deferred'
  }
  // 2% Withdrawn
  else if (weighted.select([true, false], [0.02, 0.98])){
    status = 'Withdrawn'
  }
  // If it's not deferred or withdrawn and the course has finished, assume 
  // they're awarded
  else if (moment(courseEndDate).isBefore(todaysDate)){
    status = "QTS awarded"
  }
  // If the course end date is near, good chance they're awarded
  else if (moment(courseEndDate).isBetween(todaysDate, todaysDate.add(2, 'months'))){
    status = weighted.select(
      ["QTS recommended", "QTS awarded", "TRN received"],
      [0.05, 0.60, 0.35]
    )
  }
  // If today's date is close to the submitted date, they might be pending trn
  else if (todaysDate.isBetween(moment(submittedDate), moment(submittedDate).add(2, 'weeks'))){
    status = weighted.select(
      ["Pending TRN", "TRN received"],
      [0.10, 0.90]
    )
  }
  // In all other cases they're in training
  else {
    status = "TRN received"
  }

  return status
}

const weighted = require('weighted')
const moment = require('moment')

module.exports = application => {
  let status = null

  const courseEndDate = application.courseDetails.endDate
  const todaysDate = moment()
  const submittedDate = application.submittedDate

  // 2% Deferred
  if (weighted.select([true, false], [0.02, 0.98])) {
    status = 'Deferred'
  } else if (weighted.select([true, false], [0.02, 0.98])) {
    // 2% Withdrawn
    status = 'Withdrawn'
  } else if (moment(courseEndDate).isBefore(todaysDate)) {
    // If it's not deferred or withdrawn and the course has finished, assume
    // they're awarded
    status = 'QTS awarded'
  } else if (moment(courseEndDate).isBetween(todaysDate, todaysDate.add(2, 'months'))) {
    // If the course end date is near, good chance they're awarded
    status = weighted.select(
      ['QTS recommended', 'QTS awarded', 'TRN received'],
      [0.05, 0.60, 0.35]
    )
  } else if (todaysDate.isBetween(moment(submittedDate), moment(submittedDate).add(2, 'weeks'))) {
    // If today's date is close to the submitted date, they might be pending trn
    status = weighted.select(
      ['Pending TRN', 'TRN received'],
      [0.10, 0.90]
    )
  } else {
    // In all other cases they're in training
    status = 'TRN received'
  }

  return status
}

const { fakerEN_GB: faker } = require('@faker-js/faker')
const moment = require('moment')

// Faker has a bug that faker.helpers.dateBetween requires the input dates to be in order
const sortDates = (date1, date2) => {
  if (moment(date1).isBefore(moment(date2))) {
    return [date1, date2]
  } else return [date2, date1]
}

// Dates here a bit complex! In general makes updated date be after
// submitted date, and historic records likely to be updated near to the
// end of the accademic year.

module.exports = ({ updatedDate, submittedDate, deferredDate, withdrawalDate, qualificationAwardedDate }, application) => {
  // console.log(params)
  // console.log(typeof updatedDate)
  // console.log(application.academicYear)
  // let updatedDate, submittedDate, deferredDate, withdrawalDate, qtsAwarded

  // Extract the start year from the string
  const academicYearSimple = parseInt(application.academicYear.substring(0, 4))

  // Academic years start on 1 August
  const yearStartDate = moment(`${academicYearSimple}-08-01`).toDate()

  let yearEndDate = moment(yearStartDate).add(1, 'years').toDate()

  // Check if the end date is before today’s date
  const isCurrentYear = !(moment(yearEndDate).isBefore())

  // Randomise end dates for AO
  if (application.route === 'Assessment only') {
    yearEndDate = faker.date.between(
      moment(yearStartDate).add(90, 'days'),
      moment(yearEndDate)
    )
  }

  if (!updatedDate) {
    if (submittedDate) {
      // Updated date can’t be in the future
      const lastPossibleUpdatedDate = (moment(submittedDate).add(100, 'days').isAfter() ? moment() : submittedDate)

      updatedDate = faker.date.between(
        moment(submittedDate),
        moment(lastPossibleUpdatedDate)
      )
    }

    // Assume all drafts are recent
    if (application.status === 'Draft') {
      updatedDate = faker.date.between(
        moment().subtract(50, 'days'),
        moment().toISOString()
      )
    } else if (application.status === 'Pending TRN') {
      // Assume all pending are very recent
      updatedDate = faker.date.between(
        moment().subtract(6, 'days'),
        moment()
      )
    } else {
      // Random date within accademic year
      // Todo: should we bias towards August?

      // Updated date can't be in future
      // const lastPossibleUpdatedDate = (moment(yearEndDate).isAfter() ? moment() : yearEndDate)

      if (isCurrentYear) {
        const sortedDates = sortDates(yearStartDate, yearEndDate)

        updatedDate = faker.date.between(
          moment(sortedDates[0]),
          moment(sortedDates[1])
        )
      } else {
        // Historic entries are most likely updated near to the year end date
        updatedDate = faker.date.between(
          moment(yearEndDate).subtract(150, 'days'),
          moment(yearEndDate).add(0, 'days')
        )
      }
    }
  }

  // Submitted dates apply to everything except drafts
  if (!submittedDate && application.status !== 'Draft') {
    if (application.status === 'Pending TRN') {
      submittedDate = updatedDate
    } else {
      const sortedDates = sortDates(moment(yearStartDate).subtract(60, 'days'), moment(updatedDate).subtract(50, 'days'))

      submittedDate = faker.date.between(
        moment(sortedDates[0]),
        moment(sortedDates[1])
      )
    }
  }

  if (application.status === 'Deferred') {
    deferredDate = deferredDate || updatedDate
  }

  if (application.status === 'Withdrawn') {
    // Make sure withdrawal date is the same as the last updated date
    withdrawalDate = withdrawalDate || updatedDate
  }

  if (application.status.includes('awarded')) {
    const courseEndDate = application.courseDetails.endDate

    qualificationAwardedDate = faker.date.between(
      moment(courseEndDate).subtract(100, 'days'),
      moment(courseEndDate)
    )
    // Make sure withdrawal date is the same as the last updated date
    updatedDate = qualificationAwardedDate
  }

  // console.log({
  //   updatedDate,
  //   submittedDate,
  //   deferredDate,
  //   withdrawalDate,
  //   qtsAwardedDate
  // })

  // console.log("Deferred is:", typeof deferredDate)

  return {
    updatedDate,
    submittedDate,
    deferredDate,
    ...(withdrawalDate && {
      withdraw: {
        date: withdrawalDate
      }
    }),
    ...(qualificationAwardedDate && {
      qualificationDetails: {
        outcomeDate: qualificationAwardedDate
      }
    })
  }
}

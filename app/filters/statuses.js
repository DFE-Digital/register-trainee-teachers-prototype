// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------

// Leave this filters line
const filters = {}
const _ = require('lodash')

/*
  ====================================================================
  filterName
  --------------------------------------------------------------------
  Short description for the filter
  ====================================================================

  Usage:

  [Usage here]

  filters.sayHi = (name) => {
    return 'Hi ' + name + '!'
  }

*/

filters.getStatusText = function (data, defaultNotStarted = false, defaultInProgress = false) {
  if (!data) return defaultNotStarted || 'Incomplete'
  if (data?.status) return data.status
  else return defaultInProgress || 'In progress'
}

filters.getStatusClass = (status) => {
  switch (status) {
    // States that currently use the default tag style
    // - 'Enrolled'
    // - 'Conditions met'
    // - 'Conditions not met'
    // - 'Completed'

    // Application phases
    case 'Not started':
    case 'Incomplete':
      return 'govuk-tag--grey'
    case 'Review':
      return 'govuk-tag--pink'
    case 'In progress':
      return 'govuk-tag--grey'
    case 'Completed':
      return 'govuk-tag--blue'

    // Record statuses
    case 'Draft':
      return 'govuk-tag--grey'
    case 'Pending TRN':
      return 'govuk-tag--turquoise'
    case 'TRN received':
      return 'govuk-tag--blue'
    case 'EYTS recommended':
      return 'govuk-tag--purple'
    case 'EYTS awarded':
      return
    case 'QTS recommended':
      return 'govuk-tag--purple'
    case 'QTS awarded':
      return
    case 'Deferred':
      return 'govuk-tag--yellow'
    case 'Withdrawn':
      return 'govuk-tag--red'
    case 'Apply':
      return 'govuk-tag--pink'
    case 'Manual':
      return 'govuk-tag--grey'

    // Provider types
    case 'HEI':
      return 'govuk-tag--green'
    case 'SCITT':
      return 'govuk-tag--yellow'
    case 'Lead partner':
    case 'leadPartner':
      return 'govuk-tag--purple'
    case 'accreditingProvider':
      return 'govuk-tag--blue'

    default:
      return 'govuk-tag--blue'
  }
}

filters.sectionIsInProgress = data => {
  return (data)
}

filters.reviewIfInProgress = (url, data, path) => {
  if (!filters.sectionIsInProgress(data)) {
    return url
  } else {
    if (path) return path + '/confirm'
    else return url + '/confirm'
  }
}

filters.canBeAmended = status => {
  const statusesThatCanAmend = [
    'Draft',
    'Pending TRN',
    'TRN received',
    'Deferred'
  ]
  return statusesThatCanAmend.includes(status)
}

filters.canRecommendForQts = status => {
  const statusesThatShowQtsTabs = [
    'TRN received'
  ]
  return statusesThatShowQtsTabs.includes(status)
}

filters.canReinstate = status => {
  const statusesThatAllowReinstating = [
    'Deferred'
  ]
  return statusesThatAllowReinstating.includes(status)
}

filters.isRecommendedOrAwarded = status => {
  const statuses = [
    'EYTS recommended',
    'EYTS awarded',
    'QTS recommended',
    'QTS awarded'
  ]

  return statuses.includes(status)
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

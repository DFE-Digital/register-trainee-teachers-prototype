const { findOne } = require('../services/trainee')
const { validateDateInput, getDateParts } = require('../helpers/validation/date')

exports.when_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const trainee = findOne({ traineeId })

  if (trainee.placementDetails.length < 2) {
    res.redirect(`${traineeBaseUrl}/outcome/stop`)
  } else {
    let back = traineeBaseUrl
    let next = `${traineeBaseUrl}/outcome/when`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/outcome/check`
      next += '?referrer=check'
    }

    res.render('trainees/outcome/when', {
      trainee,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  }
}

exports.when_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const trainee = findOne({ traineeId })
  const { outcome } = req.session.data

  const errors = []

  if (!outcome.when) {
    errors.push({
      fieldName: 'when',
      href: '#outcome[when]',
      text: 'Select when the trainee’s QTS status changed'
    });
  }

  // let isoDate = null
  let fieldFlags = null

  if (outcome.when === 'Another date') {
    const { day, month, year } = getDateParts(outcome.anotherDate);

    const result = validateDateInput(
      { day, month, year },
      {
        label: 'the date the trainee’s QTS status changed',
        baseId: 'outcomeDate',
        constraint: 'todayOrPast',
        minYear: 1990,
        maxYear: 2100
      }
    );

    if (!result.valid) {
      errors.push(result.summaryError)
      fieldFlags = result.fieldFlags || null
    }
  }

  if (errors.length) {
    let back = traineeBaseUrl
    let next = `${traineeBaseUrl}/outcome/when`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/outcome/check`
      next += '?referrer=check'
    }

    res.render('trainees/outcome/when', {
      trainee,
      errors,
      outcomeDateFieldErrors: fieldFlags,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  } else {
    res.redirect(`${traineeBaseUrl}/outcome/check`)
  }
}

exports.check_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const trainee = findOne({ traineeId })
  const { outcome } = req.session.data

  res.render('trainees/outcome/check-your-answers', {
    trainee,
    outcome,
    actions: {
      back: `${traineeBaseUrl}/outcome/when`,
      cancel: traineeBaseUrl,
      change: `${traineeBaseUrl}/outcome`,
      next: `${traineeBaseUrl}/outcome/check`
    }
  })
}

exports.check_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  delete req.session.data.outcome

  req.flash('success', 'Trainee’s QTS status updated')
  res.redirect(traineeBaseUrl)
}

exports.stop_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const trainee = findOne({ traineeId })

  res.render('trainees/outcome/stop', {
    trainee,
    actions: {
      back: traineeBaseUrl,
      cancel: traineeBaseUrl,
      placements: `${traineeBaseUrl}/placements`
    }
  })
}

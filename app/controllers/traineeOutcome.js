const { findOne } = require('../services/trainee')
const { validateDateInput, getDateParts } = require('../helpers/validation/date')

exports.when_get = async (req, res) => {
  const { traineeId } = req.params
  const trainee = findOne({ traineeId })

  if (trainee.placementDetails.length < 2) {
    res.redirect(`/trainees/${traineeId}/outcome/stop`)
  } else {
    let back = `/trainees/${traineeId}`
    let next = `/trainees/${traineeId}/outcome/when`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/outcome/check`
      next += '?referrer=check'
    }

    res.render('trainees/outcome/when', {
      trainee,
      actions: {
        back,
        cancel: `/trainees/${traineeId}`,
        next
      }
    })
  }
}

exports.when_post = async (req, res) => {
  const { traineeId } = req.params
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
    let back = `/trainees/${traineeId}`
    let next = `/trainees/${traineeId}/outcome/when`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/outcome/check`
      next += '?referrer=check'
    }

    res.render('trainees/outcome/when', {
      trainee,
      errors,
      outcomeDateFieldErrors: fieldFlags,
      actions: {
        back,
        cancel: `/trainees/${traineeId}`,
        next
      }
    })
  } else {
    res.redirect(`/trainees/${traineeId}/outcome/check`)
  }
}

exports.check_get = async (req, res) => {
  const { traineeId } = req.params
  const trainee = findOne({ traineeId })
  const { outcome } = req.session.data

  res.render('trainees/outcome/check-your-answers', {
    trainee,
    outcome,
    actions: {
      back: `/trainees/${traineeId}/outcome/when`,
      cancel: `/trainees/${traineeId}`,
      change: `/trainees/${traineeId}/outcome`,
      next: `/trainees/${traineeId}/outcome/check`
    }
  })
}

exports.check_post = async (req, res) => {
  const { traineeId } = req.params
  delete req.session.data.outcome

  req.flash('success', 'Trainee’s QTS status updated')
  res.redirect(`/trainees/${traineeId}`)
}

exports.stop_get = async (req, res) => {
  const { traineeId } = req.params
  const trainee = findOne({ traineeId })

  res.render('trainees/outcome/stop', {
    trainee,
    actions: {
      back: `/trainees/${traineeId}`,
      cancel: `/trainees/${traineeId}`,
      placements: `/trainees/${traineeId}/placements`
    }
  })
}

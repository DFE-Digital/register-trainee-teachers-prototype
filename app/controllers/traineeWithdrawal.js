const {
  validateDateInput,
  getDateParts,
  todayUTC,
  toISO
} = require('../helpers/validation/date')

exports.start_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`

  res.render('trainees/withdraw/index', {
    actions: {
      back: traineeBaseUrl,
      cancel: traineeBaseUrl,
      next: `${traineeBaseUrl}/withdraw/when`
    }
  })
}

exports.when_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`

  let back = traineeBaseUrl
  let next = `${traineeBaseUrl}/withdraw/when`
  if (req.query?.referrer === 'check') {
    back = `${traineeBaseUrl}/withdraw/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/when', {
    actions: {
      back,
      cancel: traineeBaseUrl,
      next
    }
  })
}

exports.when_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.when) {
    errors.push({
      fieldName: 'when',
      href: '#withdrawal[when]',
      text: 'Select when the trainee withdrew'
    });
  }

  // let isoDate = null
  let fieldFlags = null

  if (withdrawal.when === 'Another date') {
    const { day, month, year } = getDateParts(withdrawal.anotherDate);

    const result = validateDateInput(
      { day, month, year },
      {
        label: 'the date the trainee withdrew',
        baseId: 'withdrawalDate',
        constraint: 'todayOrPast',
        minYear: 1990,
        maxYear: 2100
      }
    );

    if (!result.valid) {
      errors.push(result.summaryError)
      fieldFlags = result.fieldFlags || null
    }
    // else {
    //   isoDate = result.iso
    // }
  }

  // Today / Yesterday
  // if (withdrawal.when === 'Today') {
  //   const t = todayUTC()
  //   isoDate = toISO(t.getUTCFullYear(), t.getUTCMonth()+1, t.getUTCDate())
  // }
  // if (withdrawal.when === 'Yesterday') {
  //   const t = todayUTC()
  //   t.setUTCDate(t.getUTCDate() - 1)
  //   isoDate = toISO(t.getUTCFullYear(), t.getUTCMonth()+1, t.getUTCDate())
  // }

  if (errors.length) {
    let back = traineeBaseUrl
    let next = `${traineeBaseUrl}/withdraw/when`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/withdraw/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/when', {
      errors,
      withdrawalDateFieldErrors: fieldFlags,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      res.redirect(`${traineeBaseUrl}/withdraw/check`)
    } else {
      res.redirect(`${traineeBaseUrl}/withdraw/who`)
    }
  }
}

exports.who_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  req.session.data.tempWithdrawal = req.session.data.withdrawal

  let back = `${traineeBaseUrl}/withdraw/when`
  let next = `${traineeBaseUrl}/withdraw/who`
  if (req.query?.referrer === 'check') {
    back = `${traineeBaseUrl}/withdraw/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/who', {
    actions: {
      back,
      cancel: traineeBaseUrl,
      next
    }
  })
}

exports.who_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data
  const { tempWithdrawal } = req.session.data

  const errors = []

  if (!withdrawal.who) {
    const error = {}
    error.fieldName = "who"
    error.href = "#withdrawal[who]"
    error.text = "Select who chose to withdraw the trainee"
    errors.push(error)
  }

  if (errors.length) {
    let back = `${traineeBaseUrl}/withdraw/when`
    let next = `${traineeBaseUrl}/withdraw/who`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/withdraw/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/who', {
      errors,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      if (withdrawal.who === tempWithdrawal.who) {
        res.redirect(`${traineeBaseUrl}/withdraw/check`)
      } else {
        res.redirect(`${traineeBaseUrl}/withdraw/why?referrer=check`)
      }
    } else {
      res.redirect(`${traineeBaseUrl}/withdraw/why`)
    }
  }
}

exports.why_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data
  const { tempWithdrawal } = req.session.data

  let back = `${traineeBaseUrl}/withdraw/who`
  let next = `${traineeBaseUrl}/withdraw/why`
  if (req.query?.referrer === 'check') {
    // if (withdrawal.who === tempWithdrawal.who) {
      back = `${traineeBaseUrl}/withdraw/check`
    // } else {
    //   back = `/trainees/${traineeId}/withdraw/who?referrer=check`
    // }
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/why', {
    actions: {
      back,
      cancel: traineeBaseUrl,
      next
    }
  })
}

exports.why_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.why) {
    const error = {}
    error.fieldName = "why"
    error.href = "#withdrawal[why]"
    if (withdrawal.who === 'The trainee chose to withdraw') {
      error.text = "Select why the trainee chose to withdraw"
    } else {
      error.text = "Select why you withdrew the trainee"
    }
    errors.push(error)
  } else {
    if (withdrawal.why.includes('Safeguarding concerns') && !withdrawal.safeguardingReason.length) {
      const error = {}
      error.fieldName = "safeguardingReason"
      error.href = "#withdrawal-safeguarding-reason"
      error.text = "Enter the concerns"
      errors.push(error)
    }

    if (withdrawal.why.includes('Another reason') && !withdrawal.anotherReason.length) {
      const error = {}
      error.fieldName = "anotherReason"
      error.href = "#withdrawal-another-reason"
      error.text = "Enter the reason"
      errors.push(error)
    }
  }

  if (errors.length) {
    let back = `${traineeBaseUrl}/withdraw/who`
    let next = `${traineeBaseUrl}/withdraw/why`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/withdraw/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/why', {
      errors,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      res.redirect(`${traineeBaseUrl}/withdraw/check`)
    } else {
      res.redirect(`${traineeBaseUrl}/withdraw/interested`)
    }
  }
}

exports.interested_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data

  if (!withdrawal.why.includes('Safeguarding concerns')) {
    delete req.session.data.withdrawal.safeguardingReason
  }

  if (!withdrawal.why.includes('Another reason')) {
    delete req.session.data.withdrawal.anotherReason
  }

  let back = `${traineeBaseUrl}/withdraw/why`
  let next = `${traineeBaseUrl}/withdraw/interested`
  if (req.query?.referrer === 'check') {
    back = `${traineeBaseUrl}/withdraw/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/interested', {
    actions: {
      back,
      cancel: traineeBaseUrl,
      next
    }
  })
}

exports.interested_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.interested) {
    const error = {}
    error.fieldName = "interested"
    error.href = "#withdrawal[interested]"
    error.text = "Select if the trainee would be interested in becoming a teacher in the future"
    errors.push(error)
  }

  if (errors.length) {
    let back = `${traineeBaseUrl}/withdraw/why`
    let next = `${traineeBaseUrl}/withdraw/interested`
    if (req.query?.referrer === 'check') {
      back = `${traineeBaseUrl}/withdraw/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/interested', {
      errors,
      actions: {
        back,
        cancel: traineeBaseUrl,
        next
      }
    })
  } else {
    res.redirect(`${traineeBaseUrl}/withdraw/check`)
  }
}

exports.check_get = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const { withdrawal } = req.session.data

  if (!withdrawal.why.includes('Safeguarding concerns')) {
    delete req.session.data.withdrawal.safeguardingReason
  }

  if (!withdrawal.why.includes('Another reason')) {
    delete req.session.data.withdrawal.anotherReason
  }

  res.render('trainees/withdraw/check-your-answers', {
    actions: {
      back: `${traineeBaseUrl}/withdraw/interested`,
      cancel: traineeBaseUrl,
      change: `${traineeBaseUrl}/withdraw`,
      next: `${traineeBaseUrl}/withdraw/check`
    }
  })
}

exports.check_post = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  delete req.session.data.withdrawal

  req.flash('success', 'Trainee withdrawn')
  res.redirect(traineeBaseUrl)
}

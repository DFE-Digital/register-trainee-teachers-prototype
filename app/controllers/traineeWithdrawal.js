exports.start_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/index', {
    actions: {
      back: `/trainees/${traineeId}`,
      next: `/trainees/${traineeId}/withdraw/when`
    }
  })
}

exports.when_get = async (req, res) => {
  const { traineeId } = req.params

  let back = `/trainees/${traineeId}`
  let next = `/trainees/${traineeId}/withdraw/when`
  if (req.query?.referrer === 'check') {
    back = `/trainees/${traineeId}/withdrawal/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/when', {
    actions: {
      back,
      next
    }
  })
}

exports.when_post = async (req, res) => {
  const { traineeId } = req.params
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.when) {
    const error = {}
    error.fieldName = "when"
    error.href = "#withdrawal[when]"
    error.text = "Select when the trainee withdrew"
    errors.push(error)
  }

  if (errors.length) {
    let back = `/trainees/${traineeId}`
    let next = `/trainees/${traineeId}/withdraw/when`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/withdrawal/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/when', {
      errors,
      actions: {
        back,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      res.redirect(`/trainees/${traineeId}/withdraw/check`)
    } else {
      res.redirect(`/trainees/${traineeId}/withdraw/who`)
    }
  }
}

exports.who_get = async (req, res) => {
  const { traineeId } = req.params

  let back = `/trainees/${traineeId}/withdraw/when`
  let next = `/trainees/${traineeId}/withdraw/who`
  if (req.query?.referrer === 'check') {
    back = `/trainees/${traineeId}/withdrawal/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/who', {
    actions: {
      back,
      next
    }
  })
}

exports.who_post = async (req, res) => {
  const { traineeId } = req.params
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.who) {
    const error = {}
    error.fieldName = "who"
    error.href = "#withdrawal[who]"
    error.text = "Select why you are withdrawing the trainee"
    errors.push(error)
  }

  if (errors.length) {
    let back = `/trainees/${traineeId}/withdraw/when`
    let next = `/trainees/${traineeId}/withdraw/who`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/withdrawal/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/who', {
      errors,
      actions: {
        back,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      res.redirect(`/trainees/${traineeId}/withdraw/check`)
    } else {
      res.redirect(`/trainees/${traineeId}/withdraw/why`)
    }
  }
}

exports.why_get = async (req, res) => {
  const { traineeId } = req.params

  let back = `/trainees/${traineeId}/withdraw/who`
  let next = `/trainees/${traineeId}/withdraw/why`
  if (req.query?.referrer === 'check') {
    back = `/trainees/${traineeId}/withdrawal/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/why', {
    actions: {
      back,
      next
    }
  })
}

exports.why_post = async (req, res) => {
  const { traineeId } = req.params
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.why) {
    const error = {}
    error.fieldName = "why"
    error.href = "#withdrawal[why]"
    if (withdrawal.who === 'The trainee chose to withdraw') {
      error.text = "Select why the trainee chose to withdraw"
    } else {
      error.text = "Select why you had to withdraw the trainee"
    }
    errors.push(error)
  }

  if (errors.length) {
    let back = `/trainees/${traineeId}/withdraw/who`
    let next = `/trainees/${traineeId}/withdraw/why`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/withdrawal/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/why', {
      errors,
      actions: {
        back,
        next
      }
    })
  } else {
    if (req.query?.referrer === 'check') {
      res.redirect(`/trainees/${traineeId}/withdraw/check`)
    } else {
      res.redirect(`/trainees/${traineeId}/withdraw/interested`)
    }
  }
}

exports.interested_get = async (req, res) => {
  const { traineeId } = req.params

  let back = `/trainees/${traineeId}/withdraw/why`
  let next = `/trainees/${traineeId}/withdraw/interested`
  if (req.query?.referrer === 'check') {
    back = `/trainees/${traineeId}/withdrawal/check`
    next += '?referrer=check'
  }

  res.render('trainees/withdraw/interested', {
    actions: {
      back,
      next
    }
  })
}

exports.interested_post = async (req, res) => {
  const { traineeId } = req.params
  const { withdrawal } = req.session.data

  const errors = []

  if (!withdrawal.interested) {
    const error = {}
    error.fieldName = "interested"
    error.href = "#withdrawal[interested]"
    error.text = "Select if this trainee would be interested in becoming a teacher in the future"
    errors.push(error)
  }

  if (errors.length) {
    let back = `/trainees/${traineeId}/withdraw/why`
    let next = `/trainees/${traineeId}/withdraw/interested`
    if (req.query?.referrer === 'check') {
      back = `/trainees/${traineeId}/withdrawal/check`
      next += '?referrer=check'
    }

    res.render('trainees/withdraw/interested', {
      errors,
      actions: {
        back,
        next
      }
    })
  } else {
    res.redirect(`/trainees/${traineeId}/withdraw/check`)
  }
}

exports.check_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/check-your-answers', {
    actions: {
      back: `/trainees/${traineeId}/withdraw/interested`,
      change: `/trainees/${traineeId}/withdraw`,
      next: `/trainees/${traineeId}/withdraw/check`
    }
  })
}

exports.check_post = async (req, res) => {
  const { traineeId } = req.params

  req.flash('success', 'Trainee withdrawn')
  res.redirect(`/trainees/${traineeId}`)
}

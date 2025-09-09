exports.start_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/index', {
    actions: {
      back: `/trainees/${traineeId}`,
      next: `/trainees/${traineeId}/withdraw/when`
    }
  })
}

// exports.start_post = async (req, res) => {
//   const { traineeId } = req.params

//   const errors = []

//   if (errors.length) {
//     res.render('trainees/withdraw/index', {
//       errors,
//       actions: {
//         back: `/trainees/${traineeId}`,
//         next: `/trainees/${traineeId}/withdraw/when`
//       }
//     })
//   } else {
//     res.redirect(`/trainees/${traineeId}/withdraw/when`)
//   }
// }

exports.when_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/when', {
    actions: {
      back: `/trainees/${traineeId}`,
      next: `/trainees/${traineeId}/withdraw/when`
    }
  })
}

exports.when_post = async (req, res) => {
  const { traineeId } = req.params

  const errors = []

  if (errors.length) {
    res.render('trainees/withdraw/when', {
      errors,
      actions: {
        back: `/trainees/${traineeId}`,
        next: `/trainees/${traineeId}/withdraw/when`
      }
    })
  } else {
    res.redirect(`/trainees/${traineeId}/withdraw/who`)
  }
}

exports.who_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/who', {
    actions: {
      back: `/trainees/${traineeId}/withdraw/when`,
      next: `/trainees/${traineeId}/withdraw/who`
    }
  })
}

exports.who_post = async (req, res) => {
  const { traineeId } = req.params

  const errors = []

  if (errors.length) {
    res.render('trainees/withdraw/who', {
      errors,
      actions: {
        back: `/trainees/${traineeId}/withdraw/when`,
        next: `/trainees/${traineeId}/withdraw/who`
      }
    })
  } else {
    res.redirect(`/trainees/${traineeId}/withdraw/why`)
  }
}

exports.why_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/why', {
    actions: {
      back: `/trainees/${traineeId}/withdraw/who`,
      next: `/trainees/${traineeId}/withdraw/why`
    }
  })
}

exports.why_post = async (req, res) => {
  const { traineeId } = req.params

  const errors = []

  if (errors.length) {
    res.render('trainees/withdraw/why', {
      errors,
      actions: {
        back: `/trainees/${traineeId}/withdraw/who`,
        next: `/trainees/${traineeId}/withdraw/why`
      }
    })
  } else {
    res.redirect(`/trainees/${traineeId}/withdraw/interested`)
  }
}

exports.interested_get = async (req, res) => {
  const { traineeId } = req.params

  res.render('trainees/withdraw/interested', {
    actions: {
      back: `/trainees/${traineeId}/withdraw/why`,
      next: `/trainees/${traineeId}/withdraw/interested`
    }
  })
}

exports.interested_post = async (req, res) => {
  const { traineeId } = req.params

  const errors = []

  if (errors.length) {
    res.render('trainees/withdraw/interested', {
      errors,
      actions: {
        back: `/trainees/${traineeId}/withdraw/why`,
        next: `/trainees/${traineeId}/withdraw/interested`
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
      next: `/trainees/${traineeId}/withdraw/check`
    }
  })
}

exports.check_post = async (req, res) => {
  const { traineeId } = req.params

  req.flash('success', 'Trainee withdrawn')
  res.redirect(`/trainees/${traineeId}`)
}

const { findOne } = require('../models/trainee')

exports.show = async (req, res) => {
  delete req.session.data.withdrawal
  delete req.session.data.referrer

  const { traineeId } = req.params
  const trainee = findOne({ traineeId })

  res.render('trainees/index', {
    trainee,
    actions: {
      back: '#',
      defer: `/trainees/${traineeId}/defer`,
      withdraw: `/trainees/${traineeId}/withdraw`,
      outcome: `/trainees/${traineeId}/outcome/when`
    }
  })
}

exports.personal = async (req, res) => {
  const { traineeId } = req.params
  const trainee = findOne({ traineeId })

  res.render('trainees/personal', {
    trainee,
    actions: {
      back: '#',
      defer: `/trainees/${traineeId}/defer`,
      withdraw: `/trainees/${traineeId}/withdraw`,
      outcome: `/trainees/${traineeId}/outcome/when`
    }
  })
}

const { findMany, findOne } = require('../models/trainee')

exports.draft = async (req, res) => {
  const trainees = []

  res.render('trainees/draft-list', {
    trainees,
    actions: {

    }
  })
}

exports.registered = async (req, res) => {
  const trainees = findMany()

  res.render('trainees/registered-list', {
    trainees,
    actions: {

    }
  })
}

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

    }
  })
}

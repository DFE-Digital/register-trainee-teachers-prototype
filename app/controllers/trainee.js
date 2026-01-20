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

exports.about = async (req, res) => {
  delete req.session.data.withdrawal
  delete req.session.data.outcome
  delete req.session.data.referrer

  const { traineeId } = req.params
  const trainee = findOne({ traineeId })

  res.render('trainees/index', {
    trainee,
    actions: {
      back: '/trainees/registered',
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
      back: '/trainees/registered'
    }
  })
}

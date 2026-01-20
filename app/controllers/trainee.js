const { findMany, findOne } = require('../services/trainee')

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

  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const traineeBaseUrl = `${baseUrl}/trainees/${traineeId}`
  const trainee = findOne({ traineeId })

  res.render('trainees/index', {
    trainee,
    actions: {
      back: `${baseUrl}/trainees/registered`,
      defer: `${traineeBaseUrl}/defer`,
      withdraw: `${traineeBaseUrl}/withdraw`,
      outcome: `${traineeBaseUrl}/outcome/when`
    }
  })
}

exports.personal = async (req, res) => {
  const { providerId, traineeId } = req.params
  const baseUrl = `/providers/${providerId}`
  const trainee = findOne({ traineeId })

  res.render('trainees/personal', {
    trainee,
    actions: {
      back: `${baseUrl}/trainees/registered`
    }
  })
}

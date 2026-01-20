const trainees = require('../database/trainees.json')

const findMany = (params) => {
  return trainees
}

const findOne = (params = {}) => {
  const trainee = trainees.find((item) => {
    if (params.traineeId && item.id === params.traineeId) {
      return true
    }

    if (params.trn && String(item.trainingDetails?.trn) === String(params.trn)) {
      return true
    }

    if (params.hesaId && String(item.trainingDetails?.hesaId) === String(params.hesaId)) {
      return true
    }

    return false
  })

  return trainee || {}
}

module.exports = {
  findMany,
  findOne
}

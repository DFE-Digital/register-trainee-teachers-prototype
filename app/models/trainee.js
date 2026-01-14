const trainees = require('../database/trainees.json')

const findMany = (params) => {
  return trainees
}

const findOne = (params) => {
  let trainee = {}

  if (params.traineeId || params.trn || params.hesaId) {
    trainee = trainees.find(trainee =>
      trainee.id === params.traineeId ||
      trainee.trn === params.trn ||
      trainee.hesaId === params.hesaId
    )
  }

  return trainee
}


module.exports = {
  findMany,
  findOne
}

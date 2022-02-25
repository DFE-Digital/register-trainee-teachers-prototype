const { faker } = require('@faker-js/faker')
const moment    = require('moment')

// Two letters followed by four numbers
// This approximates the reference number used by Apply / Manage
const generateReference = () => {
  let chars = 'ABCDEFGHGKLMNPQRSTWXYZ' // without I or O
  let getRandomChar = () => chars.charAt(Math.floor(Math.random() * chars.length));
  let code = getRandomChar() + getRandomChar()
  for (var i = 0; i < 4; i++){
    code += faker.datatype.number({
      'min': 0,
      'max': 9
    })
  }
  return code
}

module.exports = () => generateReference()

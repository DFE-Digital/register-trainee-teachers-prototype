let degree = require('./degree.js')

let postgraduateQualifications = [
  {
    short: "PGCE",
    long: "Postgraduate certificate in education",
    type: "Postgraduate"
  },
  {
    short: "PGDE",
    long: "Postgraduate diploma in education",
    type: "Postgraduate"
  }
]

// let undergraduateQualifications = degree().types.undergraduate

let undergraduateQualifications = degree().types.undergraduate.map(item => {
  return {
    type: "Undergraduate",
    ...item
  }
})

// console.log({undergraduateQualifications})

module.exports = {
  postgraduate: postgraduateQualifications,
  undergraduate: undergraduateQualifications,
  all: postgraduateQualifications.concat(undergraduateQualifications)
}

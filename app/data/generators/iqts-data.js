const { faker } = require('@faker-js/faker')
const moment    = require('moment')
const weighted   = require('weighted')

const countries = require('../countries')
const countriesExcludingUK = countries.filter(country => country != "United Kingdom")

let percentageMissing = [0.8,0.2]

module.exports = params => {



  let randomCountry = faker.helpers.randomize(countriesExcludingUK)

  return {
    country: randomCountry
  }
}

const { faker } = require('@faker-js/faker')

const countries = require('../countries')
const countriesExcludingUK = countries.filter(country => country != "United Kingdom")

module.exports = params => {

  let randomCountry = faker.helpers.arrayElement(countriesExcludingUK)

  return {
    country: randomCountry
  }
}

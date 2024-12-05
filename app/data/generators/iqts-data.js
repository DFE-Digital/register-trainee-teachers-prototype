const { fakerEN_GB: faker } = require('@faker-js/faker')

const countries = require('../countries')
const countriesExcludingUK = countries.filter(country => country != 'United Kingdom')

module.exports = params => {
  const randomCountry = faker.helpers.arrayElement(countriesExcludingUK)

  return {
    country: randomCountry
  }
}

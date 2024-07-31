const { fakerEN_GB: faker } = require('@faker-js/faker')
const ugEntryQualifications = require('../undergraduate-qualifications.js')

module.exports = () => {

  const type = faker.helpers.arrayElement(ugEntryQualifications)
  const tarrifPoints = faker.helpers.arrayElement(['16','24','32','72','112','136','136','152','160','170','200','320','400'])

  return {
    type,
    tarrifPoints
  }

  // TODO: be smarter about the a tarrif points. Move it to a dev task !

}

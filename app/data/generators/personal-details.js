const { fakerEN_GB: faker }  = require('@faker-js/faker')
const weighted   = require('weighted')

module.exports = () => {
  const sexInteger = faker.helpers.arrayElement([0, 1])

  let sex = { 0: 'Male', 1: 'Female' }[sexInteger]

  const givenName = faker.person.firstName(sex)

  const familyName = faker.person.lastName(sex)

  const middleNameOptions = {
    hasMiddleName: faker.person.firstName(sex),
    hasDoubleMiddleName: faker.person.firstName(sex) + " " + faker.person.firstName(sex),
    doesNotHaveMiddleName: null
  }
  const selectedMiddleName = weighted.select({
    hasMiddleName: 0.55,
    hasDoubleMiddleName: 0.15,
    doesNotHaveMiddleName: 0.3,
  })

  const middleNames = middleNameOptions[selectedMiddleName]

  const nationalities = {
    british: ['British'],
    irish: ['Irish'],
    french: ['French'],
    dual: ['French', 'Swiss'],
    multiple: ['British', 'French', 'Swiss']
  }
  const selectedNationality = weighted.select({
    british: 0.65,
    irish: 0.05,
    french: 0.1,
    dual: 0.1,
    multiple: 0.1
  })
  const nationality = nationalities[selectedNationality]

  return {
    givenName,
    familyName,
    middleNames,
    nationality,
    sex,
    dateOfBirth: faker.date.between('1958-01-01', '1998-01-01'),
    email: faker.internet.email(givenName, familyName).toLowerCase()
  }
}

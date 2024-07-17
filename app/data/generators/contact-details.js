const { fakerUK: fakerFR } = require('@faker-js/faker')
const { fakerUK: faker } = require('@faker-js/faker')


module.exports = (personalDetails) => {
  let address, internationalAddress = undefined
  let county = undefined // faker.address.county()

  if (personalDetails.isInternationalTrainee) {
    internationalAddress = `${fakerFR.address.streetAddress()}
${fakerFR.address.city()}
${fakerFR.address.state()}
${fakerFR.address.zipCode()}`
  }
  else {

    address = {
      line1: faker.address.streetAddress(),
      line2: '',
      level2: faker.address.city(),
      level1: personalDetails.isInternationalTrainee ? faker.address.state() : county,
      postcode: faker.address.zipCode(),
      ...(personalDetails.isInternationalTrainee && { country: 'France' })
    }
  }

  return {
    // phoneNumber: faker.phone.number(),
    email: faker.internet.email(personalDetails.givenName, personalDetails.familyName).toLowerCase(),
    address,
    internationalAddress,
    addressType: (personalDetails.isInternationalTrainee) ? 'international' : 'domestic'
  }
}

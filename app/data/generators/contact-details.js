const { fakerFR } = require('@faker-js/faker')
const { fakerEN_GB: faker } = require('@faker-js/faker')

module.exports = (personalDetails) => {
  let address; let internationalAddress
  const county = undefined // faker.location.county()

  if (personalDetails.isInternationalTrainee) {
    internationalAddress = `${fakerFR.location.streetAddress()}
${fakerFR.location.city()}
${fakerFR.location.state()}
${fakerFR.location.zipCode()}`
  } else {
    address = {
      line1: faker.location.streetAddress(),
      line2: '',
      level2: faker.location.city(),
      level1: personalDetails.isInternationalTrainee ? faker.location.state() : county,
      postcode: faker.location.zipCode(),
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

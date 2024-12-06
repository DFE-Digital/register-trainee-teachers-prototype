const { fakerEN_GB: faker } = require('@faker-js/faker')
const fs = require('fs')
const path = require('path')
const weighted = require('weighted')
const placesData = require('../app/data/places.js')
const fakePlaces = placesData.fakePlaces

const countToGenerate = 40000

const schoolSuffixes = {
  School: 0.1,
  'Junior School': 0.03,
  'Infant School': 0.03,
  'High School': 0.1,
  'Primary School': 0.2,
  'Secondary School': 0.2,
  College: 0.2,
  'Sixth Form College': 0.1,
  University: 0.05,
  Academy: 0.1,
  'Primary Academy': 0.03,
  'Tuition Centre': 0.03
}

const commonPlaces = [
  'Abbey',
  'Abbey Woods',
  'Cherry',
  'Church Hill',
  'Christchurch',
  'Langley',
  'Manor',
  'New',
  'North',
  'North East',
  'Stratford'
]

// Faith schools

// Assumed to be only primary
const primarySchools = [
  'Primary School',
  'Infant School',
  'School',
  'Middle School'
]

const faithSchoolPlaces = [
  'All Saints',
  'St Andrew’s',
  "St John's",
  'St Paul’s',
  'St Peter’s',
  'St Peter and St Paul',
  'St Clement’s',
  'St Thomas’s',
  'St Vincent’s'
]

const faithSuffixes = [
  '',
  'CofE',
  'Church of England',
  'Catholic'
]

const cardinalDirections = [
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
  'NW'
]

const generators = {}

generators.generateFaithSchool = () => {
  return `${faker.helpers.arrayElement(faithSchoolPlaces)} ${faker.helpers.arrayElement(faithSuffixes)} ${faker.helpers.arrayElement(primarySchools)}`.replace('  ', ' ')
}

generators.generateSchoolWithCommonName = () => {
  const suffix = weighted.select(schoolSuffixes)
  return `${faker.helpers.arrayElement(commonPlaces)} ${suffix}`
}

generators.generateSchoolWithUncommonName = () => {
  const suffix = weighted.select(schoolSuffixes)
  return `${faker.helpers.arrayElement(fakePlaces)} ${suffix}`
}

// Frequency of mix between common school names, faith names, and uncommon names
// Chosen arbitrarily to provide a mix of very similar names, familiar names, and
// less common names.
const schoolNameMix = {
  generateSchoolWithCommonName: 0.5,
  generateFaithSchool: 0.3,
  generateSchoolWithUncommonName: 0.2
}

const generateSchool = (params = {}) => {
  const selectedGenerator = weighted.select(schoolNameMix)

  const schoolName = params.schoolName || generators[selectedGenerator]()
  const uuid = params.uuid || faker.string.uuid()

  // 5 or 6 digits
  const urn = params.urn || faker.number.int({
    min: 100000,
    max: 9999999
  })

  // Not all schools have addresses
  const hasAddress = (params.addressLine1) ? true : weighted.select([true, false], [0.9, 0.1])
  let ukprn, addressLine1, town, postcode

  if (hasAddress) {
    addressLine1 = params.addressLine1 || faker.location.streetAddress()
    town = params.town || weighted.select(placesData.weightedCities)
    let fakePostcode = faker.location.zipCode()
    if (town === 'London') {
      fakePostcode = fakePostcode.split(' ').pop()
      fakePostcode = `${faker.helpers.arrayElement(cardinalDirections)}${faker.number.int({ min: 1, max: 20 })} ${fakePostcode}`
    }
    postcode = params.postcode || fakePostcode
  }

  const output = {
    schoolName,
    urn,
    uuid,
    ...(ukprn && { ukprn }),
    ...(addressLine1 && { addressLine1 }),
    ...(town && { town }),
    ...(postcode && { postcode })
  }
  return output
}

const generateFakeSchools = () => {
  const schools = []

  for (let i = 0; i < countToGenerate; i++) {
    // Pick an application in a certain state
    schools.push(generateSchool())
  }

  return schools
}

/**
 * Generate JSON file
 *
 * @param {String} filePath Location of generated file
 * @param {String} count Number of schools to generate
 *
 */
const generateSchoolsFile = (filePath) => {
  const schools = generateFakeSchools()

  console.log('Generated fake schools')
  const filedata = JSON.stringify(schools, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      console.log(`School data generated: ${filePath}`)
    }
  )
}

generateSchoolsFile(path.join(__dirname, '../app/data/fake-schools.json'))

// Code below used to work out which are the most common cities and use that to make
// an object for the weighted module. Takes in the cities column from real list of schools.
// let cities = {}

// rawCities.forEach(city =>{
//   if (cities[city]) {
//     cities[city] = cities[city]++
//   }
//   else cities[city] = 1
// })

// let citiesWithCounts = []

// let sortedCities= Object.keys(cities).sort(function(a, b) {
//   var keyA = cities[b],
//     keyB = cities[b];
//   // Compare the 2 dates
//   if (keyA < keyB) return -1;
//   if (keyA > keyB) return 1;
//   return 0;
// });

// weightedCities = {}

// cortedCities.forEach(city =>{
//   weightedCities[city] = city / 1000
// })

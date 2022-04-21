const yaml                  = require('js-yaml')
const fs                    = require('fs')
const path                  = require('path')

let countries               = require('./countries')
let ethnicities             = require('./ethnicities')
let nationalities           = require('./nationalities')
let statuses                = require('./status')
let strings                 = require('./strings')
const dataPath              = path.resolve(__dirname);
let serviceUpdates          = yaml.load(fs.readFileSync(dataPath + '/service-updates.yaml'))

// Degree stuff
let awards                  = require('./awards') // Types of degree
let degreeData              = require('./degree')()
let degreeTypes             = degreeData.types.all
let degreeTypesSimple       = degreeData.types.all.map(type => type.text).sort()
let subjects                = degreeData.subjects
let ukComparableDegrees     = degreeData.ukComparableDegrees

// Sort two things alphabetically, not case-sensitive
const sortAlphabetical = (x, y) => {
  if(x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase();
    y = y.toLowerCase();
  }
  return x > y ? 1 : (x < y ? -1 : 0);
}

let degreeInstitutions      = require('./degree-instituions')
  .map(degreeInstitution => {
    // Merge the synonyms into a single list
    degreeInstitution.synonyms = degreeInstitution.suggestion_synonyms.concat(degreeInstitution.match_synonyms)
    return degreeInstitution
  })
  .sort((a, b) => sortAlphabetical(a.name,b.name))

// Undergraduate qualification
let ugEntryQualifications   = require('./undergraduate-qualifications')

let academicQualifications   = require('./academic-qualifications')

// Assessment only
let assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
let ittSubjectData          = require('./itt-subjects')
let ittSubjects             = ittSubjectData.subjectSpecialismsArray
let allSubjects             = ittSubjectData.allSubjects

let withdrawalReasons       = require('./withdrawal-reasons')
let notPassedReasons        = require('./not-passed-reasons')

// Different training routes
let trainingRouteData       = require('./training-route-data')
let trainingRoutes = trainingRouteData.trainingRoutes
let publishRoutes = trainingRouteData.publishRoutes
let nonPublishRoutes = trainingRouteData.nonPublishRoutes

let allTrainingRoutes       = Object.keys(trainingRoutes)

let courses                 = require('./courses.json')
// let schools                 = require('./gis-schools.js') // too big to load in to session

// Super hacky method of picking 5 schools randomly from the list to
// pretend to be the provider's recently used schools
// let schoolsTop5             = schools.slice(1200).filter((school, index ) => (index % 330 == 0)).slice(0, 5)



let providers = {}

providers.accreditingProviders    = require('./accrediting-providers')

providers.leadSchools = require('./lead-schools')

providers.all = providers.accreditingProviders.all.concat(providers.leadSchools.selected)

providers.selected = providers.accreditingProviders.selected.concat(providers.leadSchools.selected)

// console.log(providers.all)


let years                   = require('./years')

let funding                 = require('./funding')

// =============================================================================
// Settings - things that can be changed from /admin
// =============================================================================

let settings = {}

// Currently enabled routes
settings.enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name).sort()

// One of `blended-model` or `hat-model`
settings.providerModel = "hat-model"

// The providers the signed-in user belongs to
settings.userProviders = [
  "Webury Hill SCITT",
  // "Coventry University",
  "King’s Oak University",
  // "The University of Buckingham",
  "West Park Primary School",
  "Beam Primary School",
  "Hope Academy"
]

settings.viewAsAdmin = 'false'

// The ‘active’ provider for the current user if using hat model
// Must be one of the ones in settings.userProviders
// settings.userActiveProvider = "Webury Hill SCITT"
settings.userActiveProvider = "King’s Oak University"
// settings.userActiveProvider = "Beam Primary School"

settings.providerType = "accrediting-provider"

// Enable apply integration
settings.groupApplySections = 'true'

// Enable apply integration
settings.highlightInvalidAnswers = 'true'

// Enable timeline on records
settings.includeDeclaration = false

settings.bulkLinksInPrimaryNav = "Show bulk updates"

settings.skipCourseDatesPage = 'true'

// Default number of Publish courses that the provider offers
settings.courseLimit = 12

// the minimum number of placements before EYTS/QTS can be awarded
settings.minPlacementsRequired = 2

// Supliment records with getter for name
let records = require('./records.json')
records = records.map(record => {
  if (record.personalDetails){
    Object.defineProperty(record.personalDetails, 'fullName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.middleNames)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
    Object.defineProperty(record.personalDetails, 'shortName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }
  
  return record
})

module.exports = {
  academicQualifications,
  allTrainingRoutes,
  assessmentOnlyAgeRanges,
  awards,
  countries,
  courses,
  degreeInstitutions,
  degreeTypes,
  degreeTypesSimple,
  ethnicities,
  funding,
  ittSubjects,
  allSubjects,
  nationalities,
  notPassedReasons,
  providers,
  records,
  // schools,
  // schoolsTop5,
  settings,
  statuses,
  strings,
  subjects,
  trainingRoutes,
  trainingRouteData,
  publishRoutes,
  nonPublishRoutes,
  ukComparableDegrees,
  serviceUpdates,
  withdrawalReasons,
  ugEntryQualifications,
  years,
  primarySubjectOptions: ittSubjectData.primarySubjectOptions
}

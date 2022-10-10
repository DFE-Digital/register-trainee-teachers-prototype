const yaml                  = require('js-yaml')
const fs                    = require('fs')
const path                  = require('path')
const utils                 = require('../lib/utils.js')

let countries               = require('./countries')
let ethnicities             = require('./ethnicities')
let nationalities           = require('./nationalities')
let statuses                = require('./status')
let strings                 = require('./strings')
let permissions             = require('./permissions')
const dataPath              = path.resolve(__dirname);
let serviceUpdates          = yaml.load(fs.readFileSync(dataPath + '/service-updates.yaml'))

// Degree stuff
let awards                  = require('./awards') // Types of degree
let degreeData              = require('./degree')()
let degreeGrades            = degreeData.grades
let degreeTypes             = degreeData.types.all
let degreeTypesSimple       = degreeData.types.all.map(type => type.text).sort()
let subjects                = degreeData.subjects
let ukComparableDegrees     = degreeData.ukComparableDegrees
let allUsers                = require('./users.json')
const userFilters           = require('../filters/users.js').filters

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

providers.leadSchools.all = providers.leadSchools.selected

providers.all = providers.accreditingProviders.all.concat(providers.leadSchools.selected)

providers.selected = providers.accreditingProviders.selected.concat(providers.leadSchools.selected)





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




let isAdmin = false
settings.defaultAdminName = "System admin"

// Must be one of the user providers above
let defaultProvider = settings.userProviders[0]

if (isAdmin){
  settings.userActiveProvider = settings.defaultAdminName
  settings.previousUserActiveProvider = defaultProvider
}
else {
  settings.userActiveProvider = defaultProvider
}

// Enable apply integration
settings.groupApplySections = 'true'

// Enable apply integration
settings.highlightInvalidAnswers = 'true'

// Enable timeline on records
settings.includeDeclaration = false

settings.bulkLinksInPrimaryNav = "None"

settings.trainingYearsUiStyle = "Checkboxes"

settings.traineeExportQuestionStyle = "Two stage"

settings.skipCourseDatesPage = 'true'

settings.showFundingInPrimaryNav = 'true'

// Default number of Publish courses that the provider offers
settings.courseLimit = 12

// the minimum number of placements before EYTS/QTS can be awarded
settings.minPlacementsRequired = 2

settings.hesaGuidanceStyle = 'tabs'


// Users
let defaultUser = {
  fullName: 'Jane Burns',
  id: '43e32448-30ba-4ce1-94ea-00da84b45f08'
}


// This will generate a default user that belongs to each enabled organisation
// Done as a (complex) function so that if we change the enabled orgs through
// the ui this function can be called to recalculate the defaults
const calculateUsers = (firstProvider, userProviders) => {

  const lookUpProvider = provider => {
    let item
    if (providers?.all){
      item = providers.all.find(item => item.name == provider) || false
    }
    if (!item) console.log(`Error with getProvider data: ${provider} not found.`)
    return item
  }

  const getProviderData = providers => {
    if (Array.isArray(providers)){
      return providers.map(provider => lookUpProvider(provider) ).filter(Boolean)
    }
    else return lookUpProvider(providers)
  }

  let users = {} // reset users
  users.all = allUsers

  defaultUser.email = userFilters.getUserEmail({
    user: defaultUser,
    provider: firstProvider
  })
  defaultUser.providers = getProviderData(userProviders)

  defaultUser.providers.map(provider => {

    provider.access = {
      role: "team admin",
      permissions: permissions.allAdminPermissions[provider.type]
    }

    return provider
  })

  users.all.push(defaultUser)

  users.byProvider = {}

  allUsers.forEach(user => {
    user.providers.forEach(provider => {
      if (!users.byProvider[provider.name]) users.byProvider[provider.name] = []
      users.byProvider[provider.name].push(user)
    })
  })

  return users

}

let users = calculateUsers(defaultProvider, settings.userProviders)


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
  calculateUsers,
  countries,
  courses,
  defaultUser,
  degreeInstitutions,
  degreeTypes,
  degreeTypesSimple,
  degreeGrades,
  ethnicities,
  funding,
  ittSubjects,
  allSubjects,
  nationalities,
  notPassedReasons,
  permissions,
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
  users,
  years,
  primarySubjectOptions: ittSubjectData.primarySubjectOptions
}

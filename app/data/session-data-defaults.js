const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const utils = require('../lib/utils.js')

const countries = require('./countries')
const disabilities = require('./disabilities')
const ethnicities = require('./ethnicities')
const nationalities = require('./nationalities')
const statuses = require('./status')
const strings = require('./strings')
const permissions = require('./permissions')
const dataPath = path.resolve(__dirname)
const serviceUpdates = yaml.load(fs.readFileSync(dataPath + '/service-updates.yaml'))

// Degree stuff
const awards = require('./awards') // Types of degree
const degreeData = require('./degree')()
const degreeGrades = degreeData.grades
const degreeTypes = degreeData.types.all
const degreeTypesSimple = degreeData.types.all.map(type => type.text).sort()
const subjects = degreeData.subjects
const ukComparableDegrees = degreeData.ukComparableDegrees
const allUsers = require('./users.json')
const userFilters = require('../filters/users.js').filters

// Sort two things alphabetically, not case-sensitive
const sortAlphabetical = (x, y) => {
  if (x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase()
    y = y.toLowerCase()
  }
  return x > y ? 1 : (x < y ? -1 : 0)
}

const degreeInstitutions = require('./degree-instituions')
  .map(degreeInstitution => {
    // Merge the synonyms into a single list
    degreeInstitution.synonyms = degreeInstitution.suggestion_synonyms.concat(degreeInstitution.match_synonyms)
    return degreeInstitution
  })
  .sort((a, b) => sortAlphabetical(a.name, b.name))

// Undergraduate qualification
const ugEntryQualifications = require('./undergraduate-qualifications')

const academicQualifications = require('./academic-qualifications')

// Assessment only
const assessmentOnlyAgeRanges = require('./assessmentOnlyAgeRanges')
const ittSubjectData = require('./itt-subjects')
const ittSubjects = ittSubjectData.subjectSpecialismsArray
const allSubjects = ittSubjectData.allSubjects

const withdrawalReasons = require('./withdrawal-reasons')
const notPassedReasons = require('./not-passed-reasons')

// Different training routes
const trainingRouteData = require('./training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const publishRoutes = trainingRouteData.publishRoutes
const nonPublishRoutes = trainingRouteData.nonPublishRoutes

const allTrainingRoutes = Object.keys(trainingRoutes)

const courses = require('./courses.json')

const traineeProblems = require('./trainee-problems.json')

// let schools                 = require('./gis-schools.js') // too big to load in to session

// Super hacky method of picking 5 schools randomly from the list to
// pretend to be the provider's recently used schools
// let schoolsTop5             = schools.slice(1200).filter((school, index ) => (index % 330 === 0)).slice(0, 5)

const providers = {}

providers.accreditingProviders = require('./accrediting-providers')

providers.leadPartners = require('./lead-schools')

providers.leadPartners.all = providers.leadPartners.selected

providers.all = providers.accreditingProviders.all.concat(providers.leadPartners.selected)

providers.selected = providers.accreditingProviders.selected.concat(providers.leadPartners.selected)

const years = require('./years')

const funding = require('./funding')

// =============================================================================
// Settings - things that can be changed from /admin
// =============================================================================

const settings = {}

// Currently enabled routes
settings.enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled === true).map(route => route.name).sort()

// One of `blended-model` or `hat-model`
settings.providerModel = 'hat-model'

// The providers the signed-in user belongs to
settings.userProviders = [
  'Webury Hill SCITT',
  // "Coventry University",
  'King’s Oak University',
  // "The University of Buckingham",
  'West Park Primary School',
  'Beam Primary School',
  'Hope Academy'
]

const isAdmin = false
settings.defaultAdminName = 'System admin'

// Must be one of the user providers above
const defaultProvider = settings.userProviders[0]

if (isAdmin) {
  settings.userActiveProvider = settings.defaultAdminName
  settings.previousUserActiveProvider = defaultProvider
} else {
  settings.userActiveProvider = defaultProvider
}

// Enable apply integration
settings.groupApplySections = 'true'

// Enable apply integration
settings.highlightInvalidAnswers = 'true'

// Enable timeline on records
settings.includeDeclaration = false

settings.bulkLinksInPrimaryNav = 'Show bulk recommend'

// Flow that combines withdrawing and removing in one
settings.useCombinedRemoveFlow = 'true'

settings.academicYearsUiStyle = 'Checkboxes'

settings.traineeExportQuestionStyle = 'Two stage'

settings.skipCourseDatesPage = 'true'

settings.showFundingInPrimaryNav = 'true'

// Default number of Publish courses that the provider offers
settings.courseLimit = 12

// the minimum number of placements before EYTS/QTS can be awarded
settings.minPlacementsRequired = 2

settings.signOffPeriods = 'none'

settings.hesaGuidanceStyle = 'tabs'

// Users
const defaultUser = {
  fullName: 'Jane Burns',
  id: '43e32448-30ba-4ce1-94ea-00da84b45f08'
}

// This will generate a default user that belongs to each enabled organisation
// Done as a (complex) function so that if we change the enabled orgs through
// the ui this function can be called to recalculate the defaults
const calculateUsers = (firstProvider, userProviders) => {
  const lookUpProvider = provider => {
    let item
    if (providers?.all) {
      item = providers.all.find(item => item.name === provider) || false
    }
    if (!item) console.log(`Error with getProvider data: ${provider} not found.`)
    return item
  }

  const getProviderData = providers => {
    if (Array.isArray(providers)) {
      return providers.map(provider => lookUpProvider(provider)).filter(Boolean)
    } else return lookUpProvider(providers)
  }

  const users = {} // reset users
  users.all = allUsers

  defaultUser.email = userFilters.getUserEmail({
    user: defaultUser,
    provider: firstProvider
  })
  defaultUser.providers = getProviderData(userProviders)

  defaultUser.providers.map(provider => {
    provider.access = {
      role: 'team admin',
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

const users = calculateUsers(defaultProvider, settings.userProviders)

// Supliment records with getter for name
let records = require('./records.json')
records = records.map(record => {
  if (record.personalDetails) {
    Object.defineProperty(record.personalDetails, 'fullName', {
      get () {
        const names = []
        names.push(this.givenName)
        names.push(this.middleNames)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
    Object.defineProperty(record.personalDetails, 'shortName', {
      get () {
        const names = []
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
  disabilities,
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
  traineeProblems,
  withdrawalReasons,
  ugEntryQualifications,
  users,
  years,
  primarySubjectOptions: ittSubjectData.primarySubjectOptions
}

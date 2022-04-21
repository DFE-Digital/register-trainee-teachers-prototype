// To generate new records:

// node scripts/generate-records.js

// Re-run this script after generating new courses
const fs                = require('fs')
const path              = require('path')
const { faker }         = require('@faker-js/faker')
faker.locale            = 'en_GB'
const moment            = require('moment')
const _                 = require('lodash')
const weighted          = require('weighted')

// Data
const trainingRouteData = require('../app/data/training-route-data')
const seedRecords       = require('../app/data/seed-records')
const statuses          = require('../app/data/status')
const courses           = require('../app/data/courses.json')
const accreditingProviderData      = require('../app/data/accrediting-providers.js')
const providers         = accreditingProviderData.selected
const statusFilters          = require('./../app/filters/statuses.js').filters

// Settings
let simpleGcseGrades    = true //output pass/fail rather than full detail

// Todo: get this from the years.js file?
const defaultYearsToGenerate = [2017, 2018, 2019, 2020, 2021, 2022]
const reducedYearsToGenerate = [2020, 2021, 2022]
const currentYear     = 2021

const sortBySubmittedDate = (x, y) => {
  return new Date(y.submittedDate) - new Date(x.submittedDate);
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Random whole number
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}
// Random number between x and y
const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

// Training routes
const trainingRoutes = Object.keys(trainingRouteData.trainingRoutes)

// Generators
const generateRoute = require('../app/data/generators/route.js')
const generateTrainingDetails = require('../app/data/generators/training-details')
const generateDates = require('../app/data/generators/dates')
const generateReference = require('../app/data/generators/reference-number')
const generateTrn = require('../app/data/generators/trn')
const generateCourseDetails = require('../app/data/generators/course-details')
const generatePersonalDetails = require('../app/data/generators/personal-details')
const generateContactDetails = require('../app/data/generators/contact-details')
const generateDiversity = require('../app/data/generators/diversity')
const generateDegree = require('../app/data/generators/degree')
const generateGce = require('../app/data/generators/gce')
const generateGcse = require('../app/data/generators/gcse')
const generateEvents = require('../app/data/generators/events')
const generateFunding = require('../app/data/generators/funding')
const generateOutcomes = require('../app/data/generators/outcomes')
const generatePlacement = require('../app/data/generators/placement')
const generateUndergraduateQualification = require('../app/data/generators/undergraduate-qualifications')
const generateSchools = require('../app/data/generators/schools')
const generateSource = require('../app/data/generators/source')
const generateApplyData = require('../app/data/generators/apply-data')

// Populate application data object with fake data
const generateFakeApplication = (params = {}) => {

  let application = {}

  application.academicYear    = params.academicYear
  if (!application.academicYear){
    let startYear = params.academicYearSimple || currentYear
    // Convert year to longer string form `2020 to 2021`
    application.academicYear  = `${startYear} to ${startYear + 1}`
  }

  application.diversity       = (params.diversity === null) ? undefined : { ...generateDiversity(), ...params.diversity }
  application.id              = params.id || faker.datatype.uuid()
  application.personalDetails = (params.personalDetails === null) ? undefined : { ...generatePersonalDetails(), ...params.personalDetails }
  application.provider        = params.provider || faker.helpers.randomize(providers).name
  application.accreditingProviderType    = params.accreditingProviderType || "SCITT" // TODO: this should look up the accrediting provider type from the provider's name
  application.route           = (params.route === null) ? undefined : (params.route || generateRoute(params))
  application.status          = params.status || faker.helpers.randomize(statuses)
  
  if (application.status == "Deferred") {
    application.previousStatus = "TRN received" // set a state to go back to
  }

  // Needed in particular order

  // Dates
  application                  = { ...application, ...generateDates(params, application) }
  // Training

  // Reference numbers like Apply
  application.reference              = (params.reference === null) ? undefined : (params.reference || generateReference())
  application.trn              = (params.trn === null) ? undefined : (params.trn || generateTrn(application))

  application.source          = (params.source) ? params.source : generateSource(application)
  if (application.source == "Apply"){
    application.applyData = { ...generateApplyData(application), ...params.applyData}
    // if (params.applyData) application.applyData = params.applyData
  }
  application.courseDetails = (params.courseDetails === null) ? undefined : { ...generateCourseDetails(params, application), ...params.courseDetails }
  // There's a slight edge case that programme details might return with a different route - if so save it back up
  if (application?.courseDetails?.route && application.courseDetails.route != application.route){
    console.log("Overwriting route") // hacky, and hopefully doesn’t happen often
    application.route = application.courseDetails.route
  }

  application.events           = generateEvents(application)

  application.trainingDetails  = (params.trainingDetails === null) ? undefined : { ...generateTrainingDetails(application), ...params.trainingDetails }


  // Contact details
  application.isInternationalTrainee = !(application.personalDetails.nationality.includes('British') || application.personalDetails.nationality.includes('Irish'))
  application.contactDetails   = (params.contactDetails === null) ? undefined : { ...generateContactDetails(application), ...params.contactDetails } 
  // Education
  application.gcse             = (params.gcse === null) ? undefined : { ...generateGcse(application.isInternationalTrainee, simpleGcseGrades), ...params.gcse }

  // A Levels - not used currently
  // application.gce = (params.gce === null) ? undefined : generateGce(faker, isInternationalTrainee)
  
  let requiredSections = trainingRouteData.trainingRoutes[application.route].sections

  // Lead and employing school
  if (requiredSections.includes('schools')){
      application.schools = (params.schools === null) ? undefined : { ...generateSchools(application), ...params.schools }
  }

  // Postgraduate qualification
  if (requiredSections.includes('degree')) {
    application.degree           = (params.degree === null) ? undefined : { ...generateDegree(params, application), ...params.degree }
  }

  application.funding = (params.funding === null) ? undefined : { ...generateFunding(application), ...params.funding }

  // Undergraduate Qualification
  if (requiredSections.includes('undergraduateQualification')) {
    application.undergraduateQualification           = (params.undergraduateQualification === null) ? undefined : { ...generateUndergraduateQualification(), ...params.undergraduateQualification }  
  }
  
  // Placements
  if (requiredSections.includes('placement')) {
    application.placement        = (params.placement === null) ? undefined : { ...generatePlacement(application), ...params.placement } 
  }

  // Make sure statuses match qualifications
  let routeQualifications = trainingRouteData.trainingRoutes[application.route].qualifications
  if (routeQualifications.includes('EYTS')) {  
    application.status = application.status.replace('QTS', 'EYTS')
  }

  // Outcomes
  // let academicQualificationsApply = trainingRouteData.trainingRoutes[application.route]?.academicQualificationsApply || false

  // if (academicQualificationsApply && statusFilters.isRecommendedOrAwarded(application.status)) {
  //   _.set(application, "outcome.academicQualification", "PGCE")
  // }

  application.outcome = (params.outcome === null) ? undefined : { ...generateOutcomes(application), ...params.outcome }

  return application

}

const generateFakeApplications = () => {

  let applications = []

  seedRecords.forEach(seedRecord => {
    // Hardcode provider and year
    // Todo - apply these back to seed records?
    let seed = {...seedRecord, ...{
      provider: "Webury Hill SCITT",
      accreditingProviderType: "SCITT",
      academicYearSimple: currentYear
    }}
    applications.push(generateFakeApplication(seed))
  })

  // Generate trainees for each provider
  providers.forEach(provider => {

    // Approximate size of provider
    // TODO: store provider size somewhere so it can be used here and
    // by the course generator
    let providerSize = getRandomArbitrary(50, 100)
    let yearsToGenerate = defaultYearsToGenerate
    if (provider?.name == "Webury Hill SCITT") providerSize = 130
    if (provider?.name == "King’s Oak University") {
      providerSize = 400
      yearsToGenerate = reducedYearsToGenerate // generate fewer years as there's so many records
    }

    yearsToGenerate.forEach((year) => {
      // Years can be ±10% in size
      let traineeCount = getRandomArbitrary((providerSize * 0.9), (providerSize * 1.1))
      if (year > currentYear){
        traineeCount = traineeCount * 0.3 // generate fewer future trainees
      }

      applications = applications.concat(generateFakeApplicationsForProvider(provider, year, traineeCount))
    })

  })

  applications = applications.sort(sortBySubmittedDate)

  return applications

}

/**
 * Generate a number of fake applications
 *
 * @param {String} count Number of applications to generate
 *
 */
const generateFakeApplicationsForProvider = (provider, year, count) => {

  let applications = []
  let targetCounts

  // Future years should probably be nearly all drafts, mostly Apply drafts
  if (year > currentYear){
    // Limit no more than 30 future draft trainees
    count = Math.min(count, 30)

    // Only SCITTs should have Apply drafts
    let isScitt = (provider?.accreditingProviderType != "HEI")
    targetCounts = {
      draft: (isScitt) ? 0.20 : 0.9,
      applyEnrolled: (isScitt) ? 0.70 : 0,
      pendingTrn: 0.05,
      trnReceived: 0.05,
      qualificationRecommended: 0.00,
      qualificationAwarded: 0.00,
      deferred: 0.00,
      withdrawn: 0.00,
    }
  }
  else if (year == currentYear){
    targetCounts = {
      draft: 0.15,
      applyEnrolled: 0.0,
      pendingTrn: 0.05,
      trnReceived: 0.61,
      qualificationRecommended: 0.05,
      qualificationAwarded: 0.05,
      deferred: 0.02,
      withdrawn: 0.03,
    }
  }
  // Previous years will be mostly awarded with some withdrawn and a handful of deferred
  else {
    targetCounts = {
      draft: 0,
      pendingTrn: 0,
      trnReceived: 0,
      qualificationRecommended: 0,
      qualificationAwarded: 0.95,
      deferred: (year == (currentYear -1)) ? 0.05 : 0, // allow for a couple deferred students from previous year
      withdrawn: 0.05,
    }
  }

  const stubApplication = {} 

  // Todo: make these drafts more random
  stubApplication.draft = {
    status: 'Draft',
    trainingDetails: {
      status: 'Completed'
    },
    personalDetails: {
      status: 'Completed'
    },
    contactDetails: {
      status: 'Completed'
    },
    diversity: {
      status: 'Completed'
    },
    degree: null,
    updatedDate: faker.date.between(
      moment(),
      moment().subtract(16, 'days'))
  }

  let applyStubUpdatedDate = faker.date.between(
    moment(),
    moment().subtract(16, 'days')
  )

  stubApplication.applyEnrolled = {
    source: "Apply",
    status: "Draft",
    updatedDate: applyStubUpdatedDate,
    applyData: {
      recruitedDate: applyStubUpdatedDate,
      applicationDate: faker.date.between(
        moment().subtract(30, 'days'),
        moment().subtract(60, 'days')
      ),
      status: 'Review'
    },
    personalDetails: {
      status: 'Review'
    },
    contactDetails: {
      status: 'Review'
    },
    diversity: {
      status: 'Review'
    },
    degree: {
      status: 'Review'
    },
    academicYearSimple: currentYear,
    courseDetails: {
      isPublishCourse: true,
      status: 'Review'
    },
    placement: null,
    trainingDetails: null,
    schools: null,
    funding: null
  }

  stubApplication.pendingTrn = {
    status: 'Pending TRN'
  }

  stubApplication.trnReceived = {
    status: 'TRN received'
  }

  stubApplication.qualificationRecommended = {
    status: 'QTS recommended',
    route: (year == currentYear) ? "Assessment only" : undefined // AO is the only route likely to be recommended
  }

  stubApplication.qualificationAwarded = {
    status: 'QTS awarded',
    route: (year == currentYear) ? "Assessment only" : undefined // AO is the only route likely to be recommended
  }

  stubApplication.deferred = {
    status: 'Deferred'
  }

  stubApplication.withdrawn = {
    status: 'Withdrawn'
  }

  for (var i = 0; i < count; i++) {
    // Pick an application in a certain state
    let statusPick = weighted.select(targetCounts)
    // Set common provider and year for all stubs
    let selectedStub = {
      ...{
        provider: provider.name,
        accreditingProviderType: provider.accreditingProviderType,
        academicYearSimple: year
      }, 
      ...stubApplication[statusPick]
    }

    const application = generateFakeApplication(selectedStub)
    applications.push(application)
  }

  return applications
}

/**
 * Generate JSON file
 *
 * @param {String} filePath Location of generated file
 * @param {String} count Number of applications to generate
 *
 */
const generateApplicationsFile = (filePath) => {
  const applications = generateFakeApplications()
  // console.log(applications)
  console.log(`Generated ${applications.length} records`)

  // Logging
  let applicationCounts = {}
  statuses.forEach(status => {
    applicationCounts[status] = applications.filter(application => application.status == status).length
  })
  console.log({applicationCounts})

  const filedata = JSON.stringify(applications, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      console.log(`Application data generated: ${filePath}`)
    }
  )
}

generateApplicationsFile(path.join(__dirname, '../app/data/records.json'))

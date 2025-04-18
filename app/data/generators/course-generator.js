// Generates fake course details
// Used to either simulate courses provided by publishers, or to populate
// data used in our seed records

const moment = require('moment')
const weighted = require('weighted')
const { fakerUK: faker } = require('@faker-js/faker')
const trainingRouteData = require('./../training-route-data')

const utils = require('./../../lib/utils.js')

const ittSubjects = require('./../itt-subjects')
const peSubjects = ittSubjects.peSubjects

const publishSubjects = ittSubjects.publishSubjects

const primaryPublishSubjects = Object.keys(publishSubjects).filter(subject => subject.includes('Primary'))

const enabledRoutes = {}
trainingRouteData.enabledTrainingRoutes.forEach(route => {
  enabledRoutes[route] = trainingRouteData.trainingRoutes[route]
})

// One letter followed by three numbers
// Older course codes are a different format, but this is what
// will be used going forward
const generateCourseCode = () => {
  const chars = 'ABCDEFGHGKLMNPQRSTWXYZ' // without I or O
  let code = chars.charAt(Math.floor(Math.random() * chars.length))
  for (let i = 0; i < 3; i++) {
    code += faker.number.int({
      min: 0,
      max: 9
    })
  }
  return code
}

// Common observed in Publish
// TODO: update this to export EYTS too
const qualificationOptions = {
  one: {
    qualifications: ['QTS'],
    qualificationsSummary: 'QTS full time'
  },
  two: {
    qualifications: ['QTS', 'PGCE'],
    qualificationsSummary: 'PGCE with QTS full time'
  },
  three: {
    qualifications: ['QTS', 'PGDE'],
    qualificationsSummary: 'PGDE with QTS full time'
  },
  four: {
    qualifications: ['QTS'],
    qualificationsSummary: 'QTS part time'
  },
  five: {
    qualifications: ['QTS', 'PGDE'],
    qualificationsSummary: 'PGDE with QTS part time'
  }
}

// Pick an enabled route
const pickRoute = (isPublishCourse = false) => {
  if (isPublishCourse) {
    const publishRoutes = Object.keys(enabledRoutes).filter(route => {
      return enabledRoutes[route].isPublishRoute
    })
    return faker.helpers.arrayElement(publishRoutes)
  } else {
    const nonPublishRoutes = Object.keys(enabledRoutes).filter(route => {
      return enabledRoutes[route].isNonPublishRoute
    })
    return faker.helpers.arrayElement(nonPublishRoutes)
  }
}

// Return some realistic subjects a primary teacher might train in
// Only used for 'manually added' trainees
const getPrimarySubjects = subjectCount => {
  // Assumption that all primary courses have `Primary` as the first subject
  const subjects = ['Primary teaching']

  // Other primary specialisms
  const primarySpecialisms = ittSubjects.commonPrimarySubjects
    .filter(subject => subject !== 'Primary teaching')

  if (subjectCount === 2) {
    const specialism = faker.helpers.arrayElement([
      faker.helpers.arrayElement(['Mathematics', 'English studies']), // Lots of primary teachers have these
      faker.helpers.arrayElement(primarySpecialisms)
    ])
    subjects.push(specialism)
  }

  return subjects
}

// Return some realistic subjects a secondary teacher might train in
// This is only used or 'manually added' trainees as Publish uses a different set of subjects and so
// has courses that look a bit different
const getSecondarySubjects = (subjectCount) => {
  let subjects

  // Shuffle our data so we can get x values from them by slicing
  const randomisedLanguages = faker.helpers.shuffle(ittSubjects.modernLanguagesSubjects)
  const randomisedSecondarySubjects = faker.helpers.shuffle(ittSubjects.commonSecondarySubjects)
  const randomisedScienceSubjects = faker.helpers.shuffle(['Physics', 'Chemistry', 'Biology'])

  // PE is one of these three
  const randomPeSubject = faker.helpers.arrayElement(peSubjects)

  // Bias slightly towards specific subjects but have some random
  // ones too for good measure
  if (subjectCount === 1) {
    subjects = faker.helpers.arrayElement([
      faker.helpers.arrayElement(ittSubjects.coreSubjects),
      faker.helpers.arrayElement(ittSubjects.commonSecondarySubjects)
    ])
  }

  // Dual subjects typically have one of a few common sets of subjects
  if (subjectCount === 2) {
    subjects = faker.helpers.arrayElement([
      randomisedLanguages.slice(0, 2), // Two languages
      [randomisedSecondarySubjects[0], randomisedLanguages[0]], // One subject and one language
      randomisedScienceSubjects.slice(0, 2), // Two sciences
      randomisedSecondarySubjects.slice(0, 2), // Two subjects
      [randomPeSubject, randomisedScienceSubjects[0]] // PE with EBacc
    ])
  }

  // Nearly always languages and sciences
  if (subjectCount === 3) {
    subjects = faker.helpers.arrayElement([
      randomisedLanguages.slice(0, 3), // Three languages
      randomisedScienceSubjects, // Science subjects
      [randomPeSubject].concat(randomisedScienceSubjects.slice(0, 2)) // PE with two EBacc subjects
    ])
  }

  return subjects
}

// Return some realistic-ish subjects a secondary teacher might train in
// This uses Publish’s list of subjects which is different than Register and DTTP’s list.
const getSecondaryPublishSubjects = (subjectCount) => {
  let subjects

  // Pull out languages (derived from where the allocation subject is Modern languages)
  const modernLanguagesSubjects = Object.keys(publishSubjects).filter(subject => {
    return publishSubjects[subject].allocationSubject === 'Modern languages'
  })

  // // Pull out languages (derived from where the allocation subject is Ancient languages)
  // let ancientLanguageSubjects = Object.keys(publishSubjects).filter(subject => {
  //   return publishSubjects[subject].allocationSubject === "Ancient languages"
  // })

  // All subjects that don't include 'Primary' and are not a language
  const nonPrimaryPublishSubjects = Object.keys(publishSubjects).filter(subject => {
    return !subject.includes('Primary') && publishSubjects[subject].allocationSubject !== 'Modern languages' &&
    publishSubjects[subject].allocationSubject !== 'Ancient languages'
  })

  // Shuffle our data so we can get n values from them by slicing
  const randomisedLanguages = faker.helpers.shuffle(modernLanguagesSubjects)
  const randomisedSecondarySubjects = faker.helpers.shuffle(nonPrimaryPublishSubjects)
  const randomisedScienceSubjects = faker.helpers.shuffle(['Physics', 'Chemistry', 'Biology'])

  // Bias slightly towards specific subjects but have some random
  // ones too for good measure
  if (subjectCount === 1) {
    subjects = faker.helpers.arrayElement([
      faker.helpers.arrayElement(ittSubjects.corePublishSubjects),
      faker.helpers.arrayElement(nonPrimaryPublishSubjects),
      // In Publish users pick specific languages - this isn't modelled here - instead we just set
      // 'Modern languages' and the ui will ask which language. We do include single languages though.
      'Modern languages',
      randomisedLanguages.slice(0, 1), // One language
      'Latin',
      'Design and technology', // good example with lots of specialisms
      'Physical education' // common example that should be a specialism
    ])
  }

  // Dual subjects typically have one of a few common sets of subjects
  if (subjectCount === 2) {
    subjects = faker.helpers.arrayElement([
      // Multiple languages commented out as we will probably ask our users to specify languages
      // through the ui
      // randomisedLanguages.slice(0,2),                        // Two languages
      // A subject with modern languages isn't likely, but is included as a test case
      ['Modern languages', 'Biology'], //
      ['Biology', 'Modern languages'], //
      // [randomisedSecondarySubjects[0], randomisedLanguages[0]], // One subject and one language
      randomisedScienceSubjects.slice(0, 2), // Two sciences
      [randomisedScienceSubjects[0], randomisedSecondarySubjects[0]], // Science with another subject
      randomisedSecondarySubjects.slice(0, 2), // Two subjects
      ['Physical education', randomisedScienceSubjects[0]] // PE with EBacc-ish
    ])
    // Check for duplicate subjects
    // Shouldn’t really be possible as we either slice from a unique set or pick from mutually
    // exclusive sets - just in case though ;)
    while (subjects[0] === subjects[1]) {
      console.log('Err! both subjects are the same. Choosing a different second subject was:', subjects[0], subjects[1])
      subjects[1] = faker.helpers.arrayElement(nonPrimaryPublishSubjects)
    }
  }

  return subjects
}

module.exports = (params) => {
  const isPublishCourse = !!(params.isPublishCourse)

  const route = params.route || pickRoute(isPublishCourse)

  const isEarlyYears = route.includes('Early years')

  const isUndergrad = route.includes('undergraduate')

  let phase, qualifications, qualificationsSummary, studyMode

  if (isEarlyYears) {
    phase = 'Early years'
  } else {
    // else phase = faker.helpers.arrayElement(['Primary', 'Secondary'])
    phase = weighted.select(['Primary', 'Secondary'], [0.3, 0.7])
  }

  const ageRanges = trainingRouteData.phases[phase].ageRanges

  const ageRange = (Array.isArray(ageRanges)) ? faker.helpers.arrayElement(ageRanges) : null

  let subjects, publishCourseSubjects

  if (isEarlyYears) {
    // This subject isn’t really used or shown - but matches how DTTP handles it
    subjects = 'Early years teaching'
  } else if (phase === 'Primary') {
    if (isPublishCourse) {
      publishCourseSubjects = faker.helpers.arrayElement(primaryPublishSubjects)
    } else {
      subjects = getPrimarySubjects(weighted.select([1, 2], [0.7, 0.3])) // 70% just primary
    }
  } else {
    let subjectCount
    if (isPublishCourse) {
      subjectCount = weighted.select([1, 2], [0.7, 0.3])
      publishCourseSubjects = getSecondaryPublishSubjects(subjectCount)
    } else {
      subjectCount = weighted.select([1, 2, 3], [0.6, 0.3, 0.1]) // 40% multiple subjects
      subjects = getSecondarySubjects(subjectCount)
    }
  }

  publishCourseSubjects = [].concat(publishCourseSubjects) // coerce to array just in case
  subjects = [].concat(subjects) // coerce to array just in case

  // Duaration in years. Note AO always has a duration of 1 even though it’s only 12 weeks
  let duration

  if (route === 'Assessment only') {
    duration = 1
  } else if (isUndergrad) {
    duration = parseInt(weighted.select({
      3: 0.8, // Regular full time
      4: 0.15, // 4 year full time
      6: 0.05 // Undergrad part time
    }))

    studyMode = (duration !== 6) ? 'Full time' : 'Part time'
  } else {
    duration = parseInt(weighted.select({
      1: 0.8, // 1 year full time or mix - majority of courses are full time
      2: 0.15, // 2 years part time
      3: 0.05 // 3 years par time
    }))
  }

  // Full time (or mix)
  if (duration === 1) {
    studyMode = 'Full time'

    // If early years or AO, just use route defaults
    // Todo: extend this to add academic qualifications possible for early years
    if (isEarlyYears || route.includes('Assessment only')) {
      qualifications = enabledRoutes[route].qualifications
      qualificationsSummary = enabledRoutes[route].qualificationsSummary

      // Hack in some part time AO trainees - which would still have duration 1
      studyMode = weighted.select(['Full time', 'Part time'], [0.8, 0.2])

      if (studyMode === 'Part time') {
        qualificationsSummary = qualificationsSummary.concat(' part time') // totally hacky
      }
    } else {
      const selected = weighted.select({
        one: 0.2, // QTS
        two: 0.75, // QTS with PGCE
        three: 0.05 // QTS with PGDE
      })

      qualifications = qualificationOptions[selected].qualifications
      qualificationsSummary = qualificationOptions[selected].qualificationsSummary

      // Some Publish courses could be set as "Full time or part time - we mostly treat ast full time
      // but let's have some ambiguity here so the ui can clear it up
      if (isPublishCourse) {
        studyMode = weighted.select(['Full time', 'Full time or part time'], [0.9, 0.1])
        if (studyMode === 'Full time or part time') {
          qualificationsSummary = qualificationsSummary.concat(' or part time') // totally hacky
        }
      }
    }
  } else {
    // Part time
    if (!isUndergrad) {
      studyMode = 'Part time'
    }
    if (isEarlyYears) {
      qualifications = enabledRoutes[route].qualifications
      qualificationsSummary = enabledRoutes[route].qualificationsSummary
    } else {
      const selected = weighted.select({
        four: 0.2, // QTS part time
        five: 0.8 // QTS with PGDE
      })
      qualifications = qualificationOptions[selected].qualifications
      qualificationsSummary = qualificationOptions[selected].qualificationsSummary
    }
  }

  // PE only has allocated places
  let allocatedPlace
  if (trainingRouteData.trainingRoutes[route].hasAllocatedPlaces && peSubjects.includes(subjects[0])) {
    allocatedPlace = true
  }

  // Assume most courses start in Autumn
  const startMonth = weighted.select([9, 10, 11], [0.9, 0.06, 0.04]) // September, October, November
  const startYear = params.startYear || moment().toDate().getFullYear() // Current year
  const startDate = moment(`${startYear}-${startMonth}-01`, 'YYYY-MM-DD').toDate()

  const academicYear = `${startYear} to ${startYear + 1}`

  // Assume courses are 9 months long
  const endDate = moment(startDate).add(duration, 'years').subtract(2, 'months').toDate()

  // let endAcademicYear = utils.dateToAcademicYear(endDate)

  if (isPublishCourse) {
    const code = generateCourseCode() // G568

    const id = faker.string.uuid()

    // English with biology
    const courseNameShort = `${utils.prettifySubjects(publishCourseSubjects)}`
    // English with biology (Q483)
    const courseNameLong = `${courseNameShort} (${code})`

    return {
      ...(ageRange ? { ageRange } : {}), // conditionally return age range
      allocatedPlace,
      code,
      duration,
      id,
      isPublishCourse,
      phase,
      qualifications,
      qualificationsSummary,
      route,
      startDateVague: startDate,
      academicYear,
      // endAcademicYear,
      studyMode,
      publishSubjects: utils.arrayToOrdinalObject(publishCourseSubjects),
      courseNameShort,
      courseNameLong
    }
  } else {
    return {
      ...(ageRange ? { ageRange } : {}), // conditionally return age range
      allocatedPlace,
      duration,
      endDate,
      isPublishCourse,
      phase,
      qualifications,
      qualificationsSummary,
      route,
      startDate,
      academicYear,
      // endAcademicYear,
      studyMode,
      subjects: utils.arrayToOrdinalObject(subjects)
    }
  }
}

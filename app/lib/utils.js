// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _                      = require('lodash')
const { faker }              = require('@faker-js/faker')
const moment                 = require('moment')
const path                   = require('path')
const url                    = require('url')
const trainingRouteData      = require('./../data/training-route-data')
const trainingRoutes         = trainingRouteData.trainingRoutes
const arrayFilters           = require('./../filters/arrays.js').filters
const dates                  = require('./../filters/dates.js').filters
const ittSubjects            = require('./../data/itt-subjects')
const generateReference      = require('./../data/generators/reference-number')
const academicQualifications = require('./../data/academic-qualifications.js')
const years                  = require('./../data/years.js')

// -------------------------------------------------------------------
// General
// -------------------------------------------------------------------

// Cooerce falsy inputs to real true and false
// Needed as Nunjucks doesn't treat all falsy values as false
exports.falsify = (input) => {
  if (!input) return false
  if (input == null) return false
  if (input == undefined) return false
  if (_.isNumber(input)) return input
  else if (input == false) return false
  if (_.isString(input)){
    let truthyValues = ['yes', 'true']
    let falsyValues = ['no', 'false']
    if (truthyValues.includes(input.toLowerCase())) return true
    else if (falsyValues.includes(input.toLowerCase())) return false
  }
  return input;
}

// Sort two things alphabetically, not case-sensitive
exports.sortAlphabetical = (x, y) => {
  if(x.toLowerCase() !== y.toLowerCase()) {
    x = x.toLowerCase();
    y = y.toLowerCase();
  }
  return x > y ? 1 : (x < y ? -1 : 0);
}

// first, second, third, etc
exports.getOrdinalName = integer => {
  let ordinals = [
    'zeroth', // shouldn't be possible
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth'
  ]
  
  if (!_.isNumber(integer) || integer < 1 || integer > 10){
    console.log("Error in getOrdinalName: input out of bounds")
    return ""
  }
  else {
    return ordinals[integer]
  }
}

// As above, but offset by 1. So a zeroth element in an erray is 'first'
exports.getOrdinalNameIndex0 = integer => exports.getOrdinalName(integer + 1)


// ['Foo', 'Bar', null] => { first: 'Foo', second: 'Bar', third: null }
exports.arrayToOrdinalObject = array => {
  let output = {}
  array.forEach( (item, index) =>{
    output[exports.getOrdinalName(index + 1)] = item
  })
  return output
}

// Test a string to see if it’s a UUID
exports.isUuid = testString => {
  testString = "" + testString
  let result = testString.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
  return Boolean(result)
}


// Loosely copied from /lib/utils
// Allows a template to live at 'foo/index' and be served from 'foo'
// The kit normally does this by defualt, but not if you want to do your
// own GET / POST routes
exports.render = (path, res, next, ...args) => {

  // Try to render the path
  res.render(path, ...args, function (error, html) {
    if (!error) {
      // Success - send the response
      res.set({ 'Content-type': 'text/html; charset=utf-8' })
      res.end(html)
      return
    }
    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      next(error)
      return
    }
    if (!path.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.html
      exports.render(path + '/index', res, next, ...args)
      return
    }
    // We got template not found both times - call next to trigger the 404 page
    next()
  })
}

// -------------------------------------------------------------------
// Course / route / programme
// -------------------------------------------------------------------

// "2022" -> "2022 to 2023"
exports.yearToAcademicYearString = year => {
  let yearInt = parseInt(year)
  return `${year} to ${yearInt + 1}`
}

// "2022 to 2023" -> "2022"
exports.academicYearStringToYear = string => {
  if (string) return string.substring(0, 4)
  else return false
}

// Return the academic year that a date falls in
exports.dateToAcademicYear = date => {
  let theDate = moment(date)
  if (!theDate.isValid()){
    console.log("Error in dateToAcademicYear: provided date is invalid")
    return false
  }
  let theYear = theDate.year()
  let testDate = moment(`${theYear}-09-01`)

  if (theDate.isBefore(testDate)){
    return exports.yearToAcademicYearString(theYear -1)
  }
  else return exports.yearToAcademicYearString(theYear)
}

exports.setAcademicYear = record => {
  let courseStartDate = record?.courseDetails?.courseStartDate
  let traineeStartDate = record?.trainingDetails?.commencementDate
  if (!courseStartDate){
    return record
  }
  else {
    let compareDate = traineeStartDate || courseStartDate
    if (Array.isArray(compareDate)) compareDate = dates.arrayToDateObject(compareDate)

    let academicYear = exports.dateToAcademicYear(compareDate)
    if (academicYear) {
      record.academicYear = academicYear
    }
    return record
  }
}

// Check if the course has allocated places
exports.hasAllocatedPlaces = (record) => {
  let routeHasAllocatedPlaces = trainingRoutes[record.route]?.hasAllocatedPlaces || false
  let allocatedSubjects = trainingRouteData.allocatedSubjects // Just PE right now

  // Allocations are based off of the 'allocation subject' rather than the specialisms
  let recordAllocationSubject = exports.getAllocationSubject(record)
  let subjectIsAllocated = allocatedSubjects.includes(recordAllocationSubject)
  return (routeHasAllocatedPlaces && subjectIsAllocated)
}

// Check if the course route requires this field or any of these fields
exports.requiresField = (record, fieldNames) => {
  fieldNames = [].concat(fieldNames) // Force to array
  let route = record.route
  if (!route) {
    console.log("Missing route in requiresField")
    return false
  }
  let requiredFields = trainingRoutes[route]?.fields
  return (requiredFields) ? requiredFields.some(field => fieldNames.includes(field)) : false
}

// Check if the course route requires this section or any of these sections
exports.requiresSection = (record, sectionNames) => {
  sectionNames = [].concat(sectionNames) // Force to array
  let route = record?.route
  let requiredSections
  if (route) {
    requiredSections = trainingRoutes[route]?.sections
  }
  else {
    console.log("No route provided, using default sections")
    // This is a fallback so drafts still work _mostly_ during development
    requiredSections = trainingRouteData.defaultSections
  }
  return requiredSections.some(section => sectionNames.includes(section))
}

// Returns: false / Early years / Primary / Secondary
// Todo: should this be explicitly set on the record?
exports.getCoursePhase = record => {

  let phases = trainingRouteData.phases

  let matchedPhase

  // Early years routes don’t have an age range - but they’re all implicitly 'Early years'
  if (exports.routeIsEarlyYears(record?.route)) return "Early years"
  // Defer to an explicit level if it exists - not all records have this
  else if (record?.courseDetails?.phase) return record?.courseDetails?.phase

  // Age range can be used to derive the phase
  else if (record?.courseDetails?.ageRange) {
    matchedPhase = Object.keys(phases).filter(phase => Array.isArray(phases[phase]?.ageRanges) && phases[phase].ageRanges.includes(record.courseDetails.ageRange)).pop()
  }
  else return false

  return matchedPhase
}

// Undergraduate / Postgraduate
exports.getCourseLevel = record => {
  return trainingRoutes?.[record.route]?.courseLevel || false
}

// Used to set the right qualification on a record
exports.setCourseDefaults = record => {
  let route = record?.route

  if (!route || !record?.courseDetails) return record

  let routeData = trainingRoutes[route]
  let routeDefaults = {
    qualifications: routeData.qualifications,
    qualificationsSummary: routeData.qualificationsSummary,
    duration: routeData.duration
  }

  record.courseDetails = {
    ...routeDefaults,
    ...record.courseDetails
  }

  return record
}


// Copy relevant Publish course dates to trainee if they’re set
// Dates depend on what study mode the trainee is on
exports.setCourseDatesIfPresent = courseDetails => {

  // If there's already start and end dates, do nothing
  if (courseDetails.startDate && courseDetails.endDate) return courseDetails

  if (exports.isFullTime(courseDetails)){
    courseDetails.startDate = courseDetails.startDate || courseDetails.startDateFullTime
    courseDetails.endDate = courseDetails.endDate || courseDetails.endDateFullTime
  }

  else if (exports.isPartTime(courseDetails)){
    courseDetails.startDate = courseDetails.startDate || courseDetails.startDatePartTime
    courseDetails.endDate = courseDetails.endDate || courseDetails.endDatePartTime
  }

  return courseDetails
}

// Decision tree of conditional pages for Publish courses
exports.getNextPublishCourseDetailsUrl = (record, recordPath, referrer) => {

  // Unsure why there's two filters in use here. But it seems to work so not touching for now
  let hasUnmappedPublishSubjects = exports.hasUnmappedPublishSubjects(record.courseDetails) || exports.subjectsAreIncomplete(record.courseDetails)

  let isMissingStudyMode = exports.needsStudyMode(record)
  let isMissingDates = exports.needsCourseDates(record)
  let isAllocated = exports.hasAllocatedPlaces(record)

  if (hasUnmappedPublishSubjects){
    return `${recordPath}/course-details/choose-specialisms${referrer}`
  }
  // Courses can be dual study mode. If so, ask which this trainee is
  else if (isMissingStudyMode){
    return `${recordPath}/course-details/study-mode${referrer}`
  }
  // Backfill course dates
  else if (isMissingDates){
    return `${recordPath}/course-details/dates${referrer}`
  }
  // else if (isAllocated) {
  //   // After /allocated-place the journey will match other course-details routes
  //   return `${recordPath}/course-details/allocated-place${referrer}`
  // }
  else {
    return `${recordPath}/course-details/confirm${referrer}`
  }
}

// When changing course or route, new data might be required - either because the new
// route needs more data or because some previous data is invalid. This function checks
// the record to see what's there vs what the route says should be there. Returns an
// array of items.
exports.getCourseChangeMissingItems = (record) => {

  let isMissingDegree = exports.needsDegree(record)
  let isMissingSchools = exports.needsSchools(record)
  let isMissingLeadSchool = exports.needsLeadSchool(record)
  let isMissingEmployingSchool = exports.needsEmployingSchool(record)
  let isMissingFundingSource = exports.needsFundingSource(record)

  let missing = []

  if (isMissingDegree) missing.push("degree")
  if (isMissingSchools) missing.push("schools")
  else {
    if (isMissingLeadSchool) missing.push("lead school")
    if (isMissingEmployingSchool) missing.push("employing school")
  }

  if (isMissingFundingSource) missing.push("funding method")
  return missing
}

// Decision tree of conditional pages for Publish courses
exports.getNextCourseChangeUrl = (record, recordPath, referrer) => {

  let missingItems = exports.getCourseChangeMissingItems(record)

  let startWithReviewPage = false

  if (startWithReviewPage){
    return `${recordPath}/course-details/final-check-course-change${referrer}`
  }
  else if (missingItems.includes("degree")){
    return `${recordPath}/degree/add${referrer}`
  }
  else if (missingItems.includes("schools") || missingItems.includes("lead school")){
    return `${recordPath}/schools/lead-school${referrer}`
  }
  else if (missingItems.includes("employing-school")){
    return `${recordPath}/schools/employing-school${referrer}`
  }
  else if (missingItems.includes("funding method")){
    return `${recordPath}/funding/financial-support${referrer}`
  }
  else {
    return `${recordPath}/course-details/final-check-course-change${referrer}`
  }
}

// Delete those bits of course details that would have come from Publish. Output should
// resemble what you get if you manually add course details.
exports.deletePublishCourseReferences = courseDetails => {

  if (!courseDetails) {
    console.log("Error with deletePublishCourseReferences: courseDetails empty")
    return
  }

  delete courseDetails?.code
  delete courseDetails?.courseNameLong
  delete courseDetails?.courseNameShort
  delete courseDetails?.isPublishCourse
  delete courseDetails?.publishSubjects
  delete courseDetails?.startDateVague

  return courseDetails

}

// Have a stab at clearing incompatible data from course details - eg it’s a secondary course but the subject
// is early years
// TODO: would it be better to wipe course details but retain specific allowed items?
exports.deleteIncompatibleCourseReferences = record => {

  if (!record) {
    console.log("Error with deleteIncompatibleCourseReferences: record empty")
    return
  }

  delete record?.courseDetails?.route
  delete record?.courseDetails?.isPublishCourse
  delete record?.courseDetails?.qualifications
  delete record?.courseDetails?.qualificationsSummary

  // Using this lower level function to identify Early years because we don't trust
  // any of the course details at this point.
  let isEarlyYears = exports.routeIsEarlyYears(record?.route)

  // If moving from Early years to non early years, clear out the subject
  if (!isEarlyYears){
    if (record?.courseDetails?.subjects?.first == "Early years teaching"){
      delete record.courseDetails.subjects
    }

    if (record?.courseDetails?.phase == "Early years"){
      delete record.courseDetails.phase
    }
  }

  if (isEarlyYears){

    if (record?.courseDetails?.subjects?.first != "Early years teaching"){
      delete record?.courseDetails?.subjects
    }

    if (record?.courseDetails?.phase != "Early years"){
      delete record?.courseDetails?.phase
    }

    delete record?.courseDetails?.ageRange

  }

  if (record?.route && record.route.toLowerCase().includes("assessment only")){

    delete record?.courseDetails.studyMode

    // If a trainee is moving to / from an assessment only course, it’s
    // likely any existing course details will be wrong.
    delete record?.courseDetails?.startDate
    delete record?.courseDetails?.endDate
  }

  return record

}

// -------------------------------------------------------------------
// Funding - initiatives and bursaries
// -------------------------------------------------------------------

exports.hasInitiatives = (record) => {
  let route = record?.route
  if (route && trainingRoutes[route].initiatives){
    return trainingRoutes[route].initiatives.length > 0
  }
  else return false
}

exports.isOnInitiative = record => {
  return record?.funding?.initiative != 'Not on a training initiative'
}

exports.subjectToAllocationSubject = subject => {
  if(!subject){
    console.log("Err: subject missing")
    return false
  }
  let allocationSubject = ittSubjects.subjectSpecialisms?.[subject]?.allocationSubject || false
  return allocationSubject
}

exports.getAllocationSubject = (input) => {
  // Support passing in a course or a record
  let courseSubject = input?.subjects?.first || input?.courseDetails?.subjects?.first || false
  if (!courseSubject){
    console.log('No course subject available')
    return false
  }
  else {
    let allocationSubject = exports.subjectToAllocationSubject(courseSubject)
    return allocationSubject
  }
}


// Internal helper to look up bursary available
exports.getFinancialSupportByRouteAndSubject = (route, subject) => {
  let financialSupport = {}

  if (!route) return false
  let routeData = trainingRoutes[route]

  if (!routeData?.financialSupportAvailable) return false

  let financialSupportMatch = false

  financialSupport.allSubjects = []

  routeData.financialSupport.forEach(financialSupportLevel => {

    // Build up an array of subjects that attract a financialSupport
    financialSupport.allSubjects = financialSupport.allSubjects.concat(financialSupportLevel.subjects)

    if (subject && financialSupportLevel.subjects.includes(subject)) {
      financialSupport = Object.assign(financialSupportLevel, financialSupport)
      financialSupport.subject = subject
      financialSupportMatch = true
      return
    }
    // Early years don’t really have subjects - but we can check the route instead
    // Todo: should we just copy over the entire object?
    else if (exports.routeIsEarlyYears(route) && financialSupportLevel.subjects.includes("Early years")){
      financialSupport = Object.assign(financialSupportLevel, financialSupport)
      financialSupport.subject = "Early years"
      financialSupport.tiersApply = financialSupportLevel?.tiersApply || false
      financialSupportMatch = true
      return
    }
  })

  let output = financialSupportMatch ? financialSupport : false

  return output
}

// Look up available financialSupport for the current record
exports.getFinancialSupport = record => {
  if (!record) return false

  // Allocation subject may be falsy. For some routes this will mean we can’t calulate the financialSupport
  // for Early years, it doesn't matter
  let allocationSubject = exports.getAllocationSubject(record) 
  return exports.getFinancialSupportByRouteAndSubject(record.route, allocationSubject)
}

// Get financialSupport value eg, 24000
exports.getFinancialSupportValue = record => {
  return exports.getFinancialSupport(record).value || false
}

// Get scholarship value, eg 26000
exports.getScholarshipValue = record => {
  return exports.getFinancialSupport(record).scholarshipValue || false
}

// Some routes *never* have bursaries
exports.routeHasFinancialSupport = route => {
  if (!route) return false
  return trainingRoutes[route]?.financialSupportAvailable || false
}

// Check whether bursaries are available for a given route chosen course
exports.financialSupportApplies = (record) => {
  let financialSupport = exports.getFinancialSupport(record)
  if (financialSupport) return true
  else return false
}

// Check whether scholarships are available for a given route chosen course
exports.scholarshipsApply = (record) => {
  let financialSupport = exports.getFinancialSupport(record)
  if (financialSupport?.scholarshipValue) return true
  else return false
}

// Can only start funding section if we know bursaries aren’t a thing or if they are a thing and we
// have the necessary course information to know if bursaries apply or not
exports.canStartFundingSection = record => {
  if (!exports.routeHasFinancialSupport(record?.route)) return true
  // Early years routes with bursaries need no extra info
  else if (exports.isEarlyYears(record)) return true
  // Other routes need course details to start bursaries
  else {
    let courseDetailsComplete = exports.sectionIsComplete(record.courseDetails)
    return courseDetailsComplete
  }
}

// Check if qualifications array contains an item
exports.qualificationIs = (record, qualification) => {

  let qualifications = record?.courseDetails?.qualifications || trainingRoutes?.[record?.route]?.qualifications || []

  return qualifications.includes(qualification)
}

exports.qualificationIsQTS = record => exports.qualificationIs(record, "QTS")

exports.qualificationIsEYTS = record => exports.qualificationIs(record, "EYTS")

exports.qualificationIsPGCE = record => exports.qualificationIs(record, "PGCE")

exports.qualificationIsPGDE = record => exports.qualificationIs(record, "PGDE")

exports.getQualificationText = record => {
  if (exports.qualificationIsEYTS(record)) return "EYTS"
  else if (exports.qualificationIsQTS(record)) return "QTS"
  else return "unknown"
}

// Look up an academic qualification using string - so we can get the abbreviation or long name
exports.lookUpAcademicQualification = searchText => {
  let allQualifications = academicQualifications.all

  // todo: this might fail where two qualifications have the same abbreviation
  return allQualifications.find(item => {
    return  (searchText == item.long) || (searchText == item.short)
  }) || false
}

// Sort by subject, including course code
// TODO: is this filter needed? could we just sort alphabetically?
exports.sortPublishCourses = courses => {
  let sorted = courses.sort((a, b) => {
    return exports.sortAlphabetical(a.courseNameLong, b.courseNameLong)
  })
  return sorted
}

// Return courses run by the current provider
// If run as a filter, data comes via Nunjucks context. If run from elsewhere,
// we need to explicitly pass in data.
exports.getProviderCourses = function({ courses, provider, route = false, year = false }){
  if (!provider) {
    console.log('Error: no provider given')
    return []
  }
  if (!courses?.[provider]?.courses){
    console.log('Error: no courses. The kit has likely been reset.')
    return []
  }
  let filteredCourses = courses[provider].courses
  if (route) {
    filteredCourses = filteredCourses.filter(course => route == course.route)
  }
  if (year) {
    filteredCourses = filteredCourses.filter(course => course.academicYear.startsWith(year))
  }
  let sortedCourses = exports.sortPublishCourses(filteredCourses)
  return sortedCourses
}

// Group courses by academic year
exports.groupCoursesByYear = function(courses){

  let output = {}

  courses.forEach(course => {
    let startYear = course.academicYear.substring(0, 4)
    if (!output[startYear]){
      output[startYear] = []
    }
    output[startYear].push(course)
  })

  return output
}

// Look up a course by the Publish Code
exports.getCourseByCode = function(code, data=false){
  data = data || this?.ctx?.data || false
  let foundCourse

  // Iterate through each provider and then through each of their courses
  // This code is a bit awkward. It relies on the first find() breaking as soon as a provider
  // is found
  Object.keys(data.courses).find( provider => {
    foundCourse = data.courses[provider].courses.find(course => course.code == code)
    return foundCourse
  })

  if (!foundCourse) console.log(`Error: course ${code} not found`)

  return foundCourse
}

exports.updatePublishCourse = function(course, data=false){
  data = data || this?.ctx?.data || false

  // Iterate through each provider and then through each of their courses
  // Avoiding using getCourseByCode() as we want a reference to the course not a copy.
  let foundCourse

  Object.keys(data.courses).find( provider => {
    foundCourse = data.courses[provider].courses.find(_course => _course.code == course.code)
    return foundCourse
  })

  if (!foundCourse) console.log(`Error: course ${course?.courseNameLong} not found, so couldn’t be 
    updated`)

  // This overwrites the one we found by reference. There's probably a cleaner way of
  // doing this
  foundCourse = course
}

// Look up a Publish course from the trainee record
exports.getTraineePublishCourse = function(record, data=false){
  data = data || this?.ctx?.data || false
  if (!record.courseDetails || !record.courseDetails.code) return false
  else return exports.getCourseByCode(record.courseDetails.code, data)
}


exports.updatePublishCourseDates = (courseDetails, data) => {

  let theCourse = exports.getCourseByCode(courseDetails?.code, data)

  if (exports.isFullTime(courseDetails)){
    theCourse.startDateFullTime = theCourse.startDateFullTime || courseDetails?.startDate || undefined
    theCourse.endDateFullTime = theCourse.endDateFullTime || courseDetails?.endDate || undefined
  }
  else if (exports.isPartTime(courseDetails)){
    theCourse.startDatePartTime = theCourse.startDatePartTime || courseDetails?.startDate || undefined
    theCourse.endDatePartTime = theCourse.endDatePartTime || courseDetails?.endDate || undefined
  }

  exports.updatePublishCourse(theCourse, data)

}

// Check if the selected provider offers publish courses for the selected route
exports.routeHasPublishCourses = function(record){
  if (!record) return false
  const data = Object.assign({}, this.ctx.data)
  let providerCourses = exports.getProviderCourses(data?.courses, record?.provider, record.route, data)
  return (providerCourses.length > 0)
}

// Lowercase array excluding some proper nouns
exports.dynamicLowercase = input => {
  if (!input) return input
  
  // These things shouldn’t get lowercased
  let ignoreSubjects = [
  "Arabic",
  "Chinese",
  "Early years",
  "English",
  "French",
  "German",
  "Greek",
  "Ancient Hebrew",
  "Italian",
  "Japanese",
  "Latin",
  "Mandarin",
  "Portuguese",
  "Russian",
  "Spanish",
  "Welsh",
  ]

  const makeLowercase = item => {
    let output = item.toLowerCase()

    ignoreSubjects.forEach(subject => {
      let regex = new RegExp(`${subject.toLowerCase()}`, "g") // match multiple times
      // Note: if we upgrade to node 16, we could use output.replaceAll instead
      output = output.replace(regex, subject)
    })
    return output
  }

  if (typeof input === 'string') {
    return makeLowercase(input)
  }
  else {
    let array = [].concat(input)
    return array.map(subject => {
      return makeLowercase(subject)
    })
  }

}

// Combine multiple subject names together
// Eg Biology with English, Chemistry with physical education and physics
// A bit similar to:
// https://github.com/DFE-Digital/teacher-training-api/blob/045a4b3e97df0ccdb72c38b3611dcb8d094c29cc/app/services/courses/generate_course_name_service.rb#L51
exports.prettifySubjects = (subjects, lowercaseFirst=false) => {
  // No data?
  if (!subjects || Object.values(subjects).length == 0) {
    return ''
  }

  // Grab the subjects and filter out falsy values
  subjects = Object.values(subjects).filter(Boolean)

  let isModernLanguagesCourse = (exports.subjectToAllocationSubject(subjects[0]) == "Modern languages")

  // If the first subject is a language, push 'Modern languages' in to the start - this way we'll
  // get names like 'Modern languages with French' which looks a bit neater.
  if ( (subjects.length > 1) && isModernLanguagesCourse){
    subjects = [...new Set(["Modern languages"].concat(subjects))]
  }

  if (subjects[0] == 'Specialist teaching (primary with mathematics)'){
    return "Primary with mathematics"
  }

  // A string or just one subject
  // Return straight away so we don’t shorten the string
  if (typeof subjects === 'string' || subjects.length == 1){
    if (lowercaseFirst) return exports.dynamicLowercase(subjects)
    else return subjects
  }

  // Shallow copy as we’re about to shift() the first item
  // Also do some cleanup on the data
  let subjectsCopy = [...subjects].map(subject => {
    return subject
      .replace('Primary teaching', 'Primary')
      .replace('Specialist teaching (primary with mathematics)', 'Primary with mathematics')
      .replace('General sciences', 'Science')
      .replace('Modern languages', '_modern_lang') // Temporarily rename this
      .replace(' languages', '') // Strip out languages from 'Chinese languages' etc
      .replace(' language', '') // Strip out language from 'English language' etc
      .replace('English studies', 'English') // Shorten this
      .replace('_modern_lang', 'Modern languages') // Restore 'Modern languages'
  })

  // Lowercase everything
  if (lowercaseFirst){
    subjectsCopy = exports.dynamicLowercase(subjectsCopy)
  }
  // Lowercase all the subjects except those starting with words in ignoreSubjects
  else {
    subjectsCopy = [subjectsCopy.shift()].concat(exports.dynamicLowercase(subjectsCopy))
  }

  // Join with ‘with’ and ‘and’
  // ‘a with b’ or ‘a with b and c’
  let returnString = arrayFilters.withSeparate(subjectsCopy)
  return returnString
}

// eg Biology (J482)
// Todo: is this needed any more? should this come from publish?
// exports.getCourseName = (course) => {
//   return `${exports.prettifySubjects(course.subjects)} (${course.code})`
// }

// Get a specialism for a given Publish subject
exports.publishSubjectToSpecialism = subject => {
  let publishSubjects = ittSubjects.publishSubjects

  if (!publishSubjects[subject]){
    console.log(`Error in publishSubjectMapsToSpecialism: subject (${subject}) not found.`)
    return false
  }
  else return publishSubjects[subject].specialism || false
}

// If a given Publish subject is mappable to a single specialism
exports.publishSubjectMapsToSpecialism = subject => {
  return Boolean(exports.publishSubjectToSpecialism(subject))
}

// Look up possible specialisms for a given Publish subject
exports.publishSubjectToPossibleSpecialisms = subject => {
  let publishSubjects = ittSubjects.publishSubjects

  if (!publishSubjects[subject]){
    console.log(`Error in publishSubjectMapsToSpecialism: subject (${subject}) not found.`)
    return false
  }
  else return publishSubjects[subject].subjectSpecialisms || false
}

 // Split a single string in to multiple subjects
// Used as Publish and our UI try to simplify common options using radio options
exports.mapPrimarySubjectsToSubjectSpecialisms = (primaryString, existingSubjects=false) => {
  let subjects = {}

  // First specialism is always primary teaching
  subjects.first = "Primary teaching"

  switch(primaryString){
    case "Primary with English":
      subjects.second = "English studies"
      break
    case "Primary with physical education":
      subjects.second = "Physical education"
      break
    case "Primary with science":
      subjects.second = "General sciences"
      break
    case "Primary with geography and history":
      subjects.second = "Geography"
      subjects.third = "History"
      break
    case "Primary with mathematics":
      // Primary with maths is treated specially - override the first subject to set this
      // specific specialism
      subjects.first = "Specialist teaching (primary with mathematics)"
      break
    case "Primary with modern languages":
      subjects.second = "Modern languages"
      break
    case "Primary with another subject":
      if (existingSubjects?.second) subjects.second = existingSubjects.second
      if (existingSubjects?.third) subjects.third = existingSubjects.third
      break
  }

  return subjects
}


// Map those Publish subjects that can be mapped unambiguously.
// TODO: this code is nearly identical to setSubjectSpecialisms() in course-details.js - they
// should probably be combined together
exports.mapMappablePublishSubjects = course => {

  let publishSubjects = course?.publishSubjects
  let firstSubject = publishSubjects.first

  if (!publishSubjects) {
    console.log("Err: mapMappablePublishSubjects missing subjects")
    return course
  }

  let subjects = course.subjects || {}

  // Hacky handling for Primary courses. Publish only treats them as having a single 'subject' but
  // we want to map it to up to three specialisms.
  if (firstSubject.includes("Primary")){
    subjects = exports.mapPrimarySubjectsToSubjectSpecialisms(firstSubject)
  }

  // Secondary courses
  else {
    // Loop through each Publish subject and look up the mappable specialism, or else set the
    // subject to 'null'
    Object.keys(publishSubjects).forEach(ordinal => {

      // Get the specialism (or null)
      let mappedPublishSubject = exports.publishSubjectToSpecialism(publishSubjects[ordinal])
      subjects[ordinal] = subjects?.[ordinal] || mappedPublishSubject || null
    })

  }

  // Apply the subjects back to the course
  course.subjects = subjects

  return course
}

exports.hasUnmappedPublishSubjects = course => {

  let publishSubjects = course?.publishSubjects
  if (!publishSubjects) {
    console.log("Err: hasUnmappedPublishSubjects missing subjects")
    return course
  }

  // Check that for each publish subject, we have an item in the subjects array
  return Object.keys(publishSubjects).some(ordinal => {
    if (!course.subjects) return false
    else return !course.subjects[ordinal]
  })
}

// Similar to hasUnmappedPublishSubjects, but instead check we have no null values in subjects.
exports.subjectsAreIncomplete = courseDetails => {
  if (!courseDetails?.subjects) return true
  return Object.values(courseDetails.subjects).some(subject => subject == null)
}

// For Apply drafts, ask users to confirm the course is correct before proceeding.
// This allows us to launch in to a flow to backfill missing data *or* let them swap to a different
// course
exports.courseNeedsToBeConfirmed = courseDetails => {
  if (exports.sectionIsComplete(courseDetails)) return false
  else return (Boolean(courseDetails?.needsConfirming))
}

// -------------------------------------------------------------------
// Records
// -------------------------------------------------------------------

// Statuses
exports.isDraft = record => {
  return record?.status == "Draft"
}

exports.isNonDraft = record => {
  return record?.status != "Draft"
}

exports.isPendingTrn = record => {
  return record?.status == "Pending TRN"
}

exports.isTrnReceived = record => {
  return record?.status == "TRN received"
}

exports.isRecommended = record => {
  return record?.status.includes("recommended") //EYTS recommended and QTS recommended
}

exports.isAwarded = record => {
  return record?.status.includes("awarded") // EYTS awarded and QTS awarded
}

exports.isDeferred = record => {
  return record?.status == "Deferred"
}

exports.isNotDeferred = record => {
  return record?.status !== "Deferred"
}

exports.isWithdrawn = record => {
  return record?.status == "Withdrawn"
}

// Active statuses – trainee hasn’t finished their training
// (not ‘qualified’ or ‘withdrawn’)
exports.isActiveStatus = record => {
  return [
    "Pending TRN", 
    "TRN received", 
    "QTS recommended", 
    "EYTS recommended", 
    "Deferred"
  ].includes(record.status)
}

// Source types
exports.sourceIsApply = record => {
  return record?.source == "Apply"
}

exports.sourceIsManual = record => {
  return record?.source != "Apply"
}

exports.sourceIsHESA = record => {
  return record?.source == "HESA"
}

exports.isApprenticeship = record => {
  return record?.route == "Teaching apprenticeship (postgrad)"
}

// Active, Future, Historic

exports.isActive = record => {
  return exports.isCurrentYear(record) || (exports.isPreviousYears(record) && exports.isActiveStatus(record))
}

exports.isPreviousYears = record => {
  return !exports.isCurrentYear(record) && !exports.isFutureYear(record)
}

// Get end year
exports.getEndAcademicYear = record => {
  return moment(record?.courseDetails?.endDate).format("YYYY")
}

// Check if record is finishing this year
exports.isFinishingThisAcademicYear = record => {
  return exports.getEndAcademicYear(record) == years.endOfCurrentCycle
}

// Check if record finished earlier than this year
exports.finishedEarlierThanThisAcademicYear = record => {
  return exports.getEndAcademicYear(record) < years.endOfCurrentCycle
}

// HESA records will be locked until 14 April of the last year of the course
// (this is based on last HESA update, but also arbitrary)
exports.dateHesaRecordUnlocked = record => {
  return moment(`${exports.getEndAcademicYear(record)}-04-14`).format("YYYY-MM-DD")
}

/* 
  A HESA record should be read only if:
  - its not finishing this academic year
  - or its finishing this year, but today’s date is before the cut-off
*/

exports.isHesaAndLocked = record => {

  const source = record?.source

  let shouldBeLocked = false

  if (exports.sourceIsHESA(record)) {
     if (exports.finishedEarlierThanThisAcademicYear(record)) {
        shouldBeLocked = false
     } else if (exports.isFutureYear(record)) {
        shouldBeLocked = true
     }
     else if (exports.isFinishingThisAcademicYear(record) && (moment().isBefore(exports.dateHesaRecordUnlocked(record)))) {
        shouldBeLocked = true
     }
   }
  return shouldBeLocked
}

// trainees who:
// - started this year
// - are on a course that finishes this year, or in the future
exports.isCurrentYear = record => {
  let isStartingThisYear = record?.academicYear == years.currentAcademicYear
  let endAcademicYear = exports.dateToAcademicYear(record?.courseDetails?.endDate)
  let isFinishingThisYearOrGreater = (endAcademicYear == years.currentAcademicYear) || (endAcademicYear == years.nextAcademicYear)
  return isStartingThisYear || (isFinishingThisYearOrGreater && !exports.isFutureYear) || !record?.academicYear
}

exports.isFutureYear = record => {
  return record?.academicYear == years.nextAcademicYear
}

exports.isHistoric = record => {
  return !exports.isCurrentYear(record) && !exports.isFutureYear(record) && !exports.isActiveStatus(record)
}

exports.getCohortFilter = record => {
  if (exports.isActive(record)) {
    return "Current"
  } else if (exports.isFutureYear(record)) {
    return "Next year’s"
  } else if (exports.isHistoric(record)) {
    return "Past"
  } else {
    console.log("error in getCohortFilter")
    return "Unknown"
  }
}

// Course levels

exports.isUndergraduate = data => {
  return exports.getCourseLevel(data) == "Undergraduate"
}

exports.isPostgraduate = data => {
  return exports.getCourseLevel(data) == "Postgraduate"
}
// Phases

// Unlike the other phases, this is probably reliable - as it checcks the route rather than the age
// ranges of the course
exports.isEarlyYears = record => {
  return exports.getCoursePhase(record) == "Early years"
}

// Explicitly test the route only - as
exports.routeIsEarlyYears = route => {
  return route && route.includes("Early years")
}

// Used by placements - for Early years the locations you go to are settings and not 
// necessarily schools
exports.schoolOrSettingText = record => {
  if (exports.isEarlyYears(record)) {
    return "setting"
  }
  else return "school"
}

exports.isPrimary = record => {
  return exports.getCoursePhase(record) == "Primary"
}

// TODO: this might not be reliable - need to check all age ranges
// map to one of the phases
exports.isSecondary = record => {
  return exports.getCoursePhase(record) == "Secondary"
}

// Get study mode from record or courseDetails
exports.getStudyMode = data => {
  return data?.courseDetails?.studyMode || data?.studyMode
}

exports.isFullTime = data => {
  return exports.getStudyMode(data) == "Full time"
}

exports.isPartTime = data => {
  return exports.getStudyMode(data) == "Part time"
}

exports.isFullTimeOrPartTime = data => {
  return exports.getStudyMode(data) == "Full time or part time"
}

exports.sectionIsComplete = section => {
  return section?.status == "Completed" || (section?.status && section.status.includes("Completed"))
}

exports.academicQualificationsApply = record => {
  return trainingRoutes?.[record?.route]?.academicQualificationsApply && exports.isPostgraduate(record)
}

// Check if all sections are complete
exports.recordIsComplete = function(record, data=false ) {

  data = Object.assign({}, (data || this?.ctx?.data || false))

  if (!record || !record?.route) return false

  // Pretend 20% of submitted records are incomplete
  if (exports.isNonDraft(record)){
    let statusesThatMustBeComplete = [
      'EYTS recommended',
      'EYTS awarded',
      'QTS recommended',
      'QTS awarded',
      'Deferred',
      'Withdrawn'
    ]
    if (statusesThatMustBeComplete.includes(record?.status)) return true
      else
    return !exports.hasOutstandingActions(record, data)
  }

  let requiredSections = _.get(trainingRoutes, `${record.route}.sections`)
  let applyReviewSections = trainingRouteData.applyReviewSections

  if (!requiredSections) return false // something went wrong

  // All required sections must be marked completed
  let recordIsComplete = requiredSections.every(section => {

    let sectionStatus = record[section]?.status == "Completed"
    
    // Default
    if (exports.sourceIsManual(record)){
      return sectionStatus
    }

    // Special handling for Apply drafts which *may* work differently
    else if (exports.sourceIsApply(record)){

      // Some sections are collected together with one checkbox for all
      // If so, defer to that checkbox
      if (applyReviewSections.includes(section)){
        return (record.applyData.status == "Completed") || sectionStatus
      }
      else return sectionStatus
    }
    else {
      console.log("Error, record type not recognised")
    }
  })

  return recordIsComplete
}

// Checks if the placement criteria has been met
exports.needsPlacementDetails = function(record, data = false) {

  data = Object.assign({}, (data || this?.ctx?.data || false))

  let needsPlacementDetails = false
  let placementCount = (record?.placement?.items) ? record.placement.items.length : 0
  let minPlacementsRequired = data?.settings?.minPlacementsRequired || 2

  if (exports.requiresSection(record, 'placement')) {
    // if ((record?.placement?.status != 'Completed') || (placementCount < minPlacementsRequired)) {
    //   needsPlacementDetails = true
    //
    if (placementCount < minPlacementsRequired) needsPlacementDetails = true
  }
  return needsPlacementDetails
}

// Check if record has started and if it is, is missing a start date
exports.needsStartDate = function(record) {
  let needsStartDate = false

  let traineeStarted = record?.trainingDetails?.commencementDate
  let ittStartDate = moment(record?.courseDetails?.startDate)

  if (!traineeStarted && dates.isInPast(record?.courseDetails?.startDate) && record.status != "Deferred") {
    needsStartDate = true
  }

  return needsStartDate
}

// Check if there are outsanding actions (Either adding start date or placements details)
exports.hasOutstandingActions = function(record, data = false) {

  data = Object.assign({}, (data || this?.ctx?.data || false))
  
  let hasOutstandingActions = false

  if (exports.needsStartDate(record)) {
    hasOutstandingActions = true
  }
  else if (exports.needsPlacementDetails(record, data)) {
    hasOutstandingActions = true
  }
  return hasOutstandingActions
}

// Some Publish courses are only `Full time or part time` which isn’t specific enough.
// TODO: Study mode is not relevant to all routes, this should also check if the route needs
// study mode
exports.needsStudyMode = record => {

  let routeRequiresStudyMode = exports.requiresField(record, "studyMode")

  if (!routeRequiresStudyMode) return false

  let allowedStudyModes = [
    "Full time",
    "Part time"
  ]
  return (!allowedStudyModes.includes(record?.courseDetails?.studyMode))
}

exports.needsCourseDates = record => {
  return !Boolean(record?.courseDetails?.startDate) || !Boolean(record?.courseDetails?.endDate)
}

exports.needsDegree = record => {
  let routeRequiresDegree = exports.requiresSection(record, "degree")
  return routeRequiresDegree && !Boolean(record?.degree) && !Boolean(record?.degree?.items)
}

exports.needsSchools = record => {
  return exports.needsLeadSchool(record) || exports.needsEmployingSchool(record)
}

exports.needsLeadSchool = record => {
  let routeRequiresLeadSchool = exports.requiresField(record, "leadSchool")
  return routeRequiresLeadSchool && !Boolean(record?.schools?.leadSchool)
}

exports.needsEmployingSchool = record => {
  let routeRequiresEmployingSchool = exports.requiresField(record, "employingSchool")
  return routeRequiresEmployingSchool && !Boolean(record?.schools?.employingSchool)
}

exports.needsFundingSource = record => {
  let financialSupportApplies = exports.financialSupportApplies(record)
  return financialSupportApplies && !record?.funding?.source
}

// -------------------------------------------------------------------
// Existing record states
// -------------------------------------------------------------------

/*
  ====================================================================
  ittInTheFuture
  --------------------------------------------------------------------
  true if itt start date is in the future
  ====================================================================
*/

exports.ittInTheFuture = (record) => {
  return dates.isInFuture(record?.courseDetails?.startDate)
}


/*
  ====================================================================
  ittStartedButNoCommencementDate
  --------------------------------------------------------------------
  true if itt start is in the past AND
  trainee does not have a commencement date
  ====================================================================
*/

exports.ittStartedButNoCommencementDate = (record) => {
  let ittStartDate = record?.courseDetails?.startDate
  let traineeStartDate = record?.trainingDetails?.commencementDate

  return (dates.isInPast(ittStartDate) && !traineeStartDate)
}

/*
  ====================================================================
  traineeStarted
  --------------------------------------------------------------------
  true if itt start is in the past AND
  trainee has a commencement date
  ====================================================================
*/

exports.traineeStarted = (record) => {
  let ittStartDate = record?.courseDetails?.startDate
  let traineeStartDate = record?.trainingDetails?.commencementDate

  return (dates.isInPast(ittStartDate) && traineeStartDate)
}

// -------------------------------------------------------------------
// Get records
// -------------------------------------------------------------------

// Look up a record using it’s UUID
exports.getRecordById = (records, id) => {
  return records.find(record => record.id == id)
}

// Look up several records using UUID
exports.getRecordsById = (records, array) => {
  return exports.filterRecordsBy(records, 'id', array)
}

// -------------------------------------------------------------------
// Filter records
// -------------------------------------------------------------------

// Filter down a set of records for those that match provided filter object
exports.filterRecords = (records, data, filters = {}) => {

  let filteredRecords = records
  let applyEnabled = data.settings.enableApplyIntegration

  if (data?.settings?.viewAsAdmin != "true"){
    // Only allow records for the signed-in providers
    filteredRecords = exports.filterBySignedIn(filteredRecords, data)
  }


  // Only show records for training routes that are enabled
  let enabledTrainingRoutes = data.settings.enabledTrainingRoutes

  // Only show records for currently enabled routes or draft records
  filteredRecords = filteredRecords.filter(record => enabledTrainingRoutes.includes(record.route) || (exports.isDraft(record)))

  if (!applyEnabled){
    filteredRecords = filteredRecords.filter(record => exports.sourceIsManual(record))
  }

  if (filters.cohortFilter){
    filteredRecords = filteredRecords.filter(record => filters.cohortFilter.includes(exports.getCohortFilter(record)))
  }

  if (filters.cycle && filters.cycle != "All years"){
    filteredRecords = filteredRecords.filter(record => filters.cycle.includes(record.academicYear))
  }

  if (filters.completeStatus){
    filteredRecords = filteredRecords.filter(record => {
      let completeStatus = (exports.recordIsComplete(record, data)) ? 'Complete' : 'Incomplete'
      return filters.completeStatus.includes(completeStatus)
    })
  }

  if (filters.courseLevel){
    filteredRecords = filteredRecords.filter(record => filters.courseLevel.includes(exports.getCourseLevel(record)))
  }

  // Apply or manual
  if (filters.source){
    filteredRecords = filteredRecords.filter(record => filters.source.includes(record.source))
  }

  // Primary / Secondary etc
  if (filters.phase){
    filteredRecords = filteredRecords.filter(record => filters.phase.includes(exports.getCoursePhase(record)))
  }

  // Full time or Part time
  // Note - some Publish courses are "Full time or part time" until reviewed by a user - this filter
  // lets those trainees appear in both filters.
  if (filters.studyMode){
    filteredRecords = filteredRecords.filter(record => {
      let courseStudyMode = (record?.courseDetails?.studyMode && record.courseDetails.studyMode.toLowerCase()) || ""
      return filters.studyMode.some(filter => courseStudyMode.includes(filter.toLowerCase()))
    })
  }

  // List of providers if signed in as multiple
  if (filters.providers){
    filteredRecords = filteredRecords.filter(record => filters.providers.includes(record.provider))
  }

  // Admin only filter for picking from all providers
  if (filters.allProviders && filters.allProviders != "All providers"){
    filteredRecords = filteredRecords.filter(record => filters.allProviders.includes(record.provider))
  }

  if (filters.trainingRoutes){
    filteredRecords = filteredRecords.filter(record => filters.trainingRoutes.includes(record.route))
  }

  if (filters.status){
    filteredRecords = filteredRecords.filter(record =>  filters.status.includes(record.status))
  }

  // Filter by the specialism or allocation subject
  // Also searches publish subjects where the course’s subjects haven’t been completed
  if (filters.subject && filters.subject != "All subjects"){

    // To array
    let searchSubjects = [filters.subject]

    // Expand out sciences to three allocation subjects
    if (filters.subject == "Sciences - biology, chemistry, physics"){
      searchSubjects = ['Biology', 'Chemistry', 'Physics']
    }

    filteredRecords = filteredRecords.filter(record => {

      let traineeSubjects = record?.courseDetails?.subjects
      let publishSubjects = record?.courseDetails?.publishSubjects

      // If we don’t have any subjects, we can't filter by subject
      if (!traineeSubjects && !publishSubjects) return false

      // Read values from subject objects
      traineeSubjects = traineeSubjects && Object.values(traineeSubjects) || []
      let traineeAllocationSubjects = traineeSubjects.map(subject => subject && exports.subjectToAllocationSubject(subject))
      publishSubjects = publishSubjects && Object.values(publishSubjects) || []
      let publishAllocationSubjects = publishSubjects.map(subject => exports.subjectToAllocationSubject(subject))

      // Loop through each search subject to find at least one match
      return searchSubjects.some(searchSubject => {
        let specialismsMatch = traineeSubjects.includes(searchSubject)
        let allocationSubjectsMatch = traineeAllocationSubjects.includes(searchSubject)

        // Search across Publish subjects only where specialisms aren’t set
        // This should mean that Apply drafts where specialisms aren’t set can still be filtered,
        // whilst registered trainees then prefer the actual specialisms set
        let shouldSearchPublish = publishSubjects && exports.subjectsAreIncomplete(record)
        let publishSubjectsMatch = shouldSearchPublish && publishSubjects.includes(searchSubject)
        let publishAllocationSubjectsMatch = shouldSearchPublish && publishAllocationSubjects.includes(searchSubject)

        return specialismsMatch || allocationSubjectsMatch || publishSubjectsMatch || publishAllocationSubjectsMatch

      })
      
    })
  }

  return filteredRecords
}

// Text search across a few selected fields
exports.filterRecordsBySearchTerm = (records, searchQuery=false) => {
  if (!searchQuery) return records

  let searchQueryLowercase = searchQuery.toLowerCase()

  let filteredRecords = records.filter(record => {
    let fullName = record?.personalDetails?.fullName.toLowerCase() || "" // Draft records might not have a full name

    // Check that every part exists in the trainee’s name
    let searchParts = searchQueryLowercase.split(' ')
    let nameMatch = searchParts.every(part => fullName.includes(part))

    let referenceMatch = searchParts.some(part => (record?.reference || "").toLowerCase().includes(part))
    let traineeIdMatch = searchParts.some(part => (record?.trainingDetails?.traineeId || "").toLowerCase().includes(part))

    let trnMatch = searchParts.some(part => (record?.trn || "").toString().includes(part))

    return referenceMatch || traineeIdMatch || trnMatch || nameMatch
  })

  return filteredRecords
}

// Utility function to filter by a key
// Basically identical to the ‘where’ filter
exports.filterRecordsBy = (records, key, array, invert=false) => {
  array = [].concat(array) // force to array
  let filtered = records.filter(record => {
    let isIncluded = array.includes(_.get(record, key))
    if (invert) {
      return !isIncluded
    }
    else {
      return isIncluded
    }
  })
  return filtered
}

exports.filterByProvider = function(records, array, data=false){
  data = Object.assign({}, (data || this.ctx.data || false))

  array = [].concat(array) // force to array

  return records.filter(record => {

    // Enrich provider data
    let providerData = exports.getProviderData.apply(this, [array, data])

    // Check if any of the providers match
    return providerData.some(provider => {
      if (provider.type == "accreditingProvider"){
        return record.provider == provider.name
      }
      else if (provider.type == "leadSchool"){
        return provider.name == record?.schools?.leadSchool?.schoolName
      }
      else return false
    })

  })
}

// Filter records for particular providers
exports.filterByAccreditingProvider = (records, array) => {
  return exports.filterRecordsBy(records, 'provider', array)
}

// Filter records for particular providers
exports.filterByLeadSchool = (records, array) => {
  return exports.filterRecordsBy(records, 'schools.leadSchool.schoolName', array)
}

// Filter records for currently signed in providers
// Can’t be an arrow function because we need access to the Nunjucks context
exports.filterBySignedIn = function(records, data=false){
  data = Object.assign({}, (data || this.ctx.data || false))

  if (!data) {
    console.log('Error with filterBySignedIn: session data not provided')
    return []
  }
  if (!Array.isArray(data.signedInProviders) || data.signedInProviders.length < 1){
    console.log('Error with filterBySignedIn: user doesn’t appear to be signed in to any providers')
    return []
  }
  return exports.filterByProvider(records, data.signedInProviders, data)
}

// Only records from a specific academic year or years
exports.filterByYear = (records, array) => {
  return exports.filterRecordsBy(records, 'academicYear', array)
}

// Filter records by status
exports.filterByActive = (records) => {
  return records.filter(record => exports.isActive(record) )
}

exports.filterByFuture = (records) => {
  return records.filter(record => exports.isFutureYear(record) )
}

// Filter records by status
exports.filterByStatus = (records, array, invert) => {
  array = [].concat(array)
  return exports.filterRecordsBy(records, 'status', array, invert)
}

exports.filterOutDeferred = (records) => {
  return records.filter(record => exports.isNotDeferred(record))
}

exports.filterByComplete = function(records, data=false) {
  data = Object.assign({}, (data || this?.ctx?.data || false))
  return records.filter(record => exports.recordIsComplete(record, data))
}

exports.filterByIncomplete = function(records, data=false) {
  data = Object.assign({}, (data || this?.ctx?.data || false))
  return records.filter(record => !exports.recordIsComplete(record, data))
}

exports.filterByQualification = (records, qualification) => {
  return records.filter(record => {
    let courseQualifications = record?.courseDetails?.qualifications
    let courseQualificationMatches = courseQualifications && courseQualifications.includes(qualification)
    return courseQualificationMatches
 })
}

exports.filterByNeedsStartDate = (records) => {
  return records.filter(record => exports.needsStartDate(record))
}

exports.filterByNeedsPlacements = (records, data=false) => {
  data = Object.assign({}, (data || this?.ctx?.data || false))
  return records.filter(record => exports.needsPlacementDetails(record, data))
}

exports.filterOutEarlyYears = (records) => {
  return records.filter(record => !exports.isEarlyYears(record))
}

exports.filterByEarlyYears = (records) => {
  return records.filter(record => exports.isEarlyYears(record))
}

exports.filterByAcademicQualificationsApply = (records) => {
  return records.filter(record => exports.academicQualificationsApply(record))
}

exports.filterByPostgraduate = (records) => {
  return records.filter(record => exports.isPostgraduate(record))
}

exports.filterByUndergraduate = (records) => {
  return records.filter(record => exports.isUndergraduate(record))
}

// Trainees that can be bulk updated
exports.filterByCanBulkUpdate = (records) => {
  let filteredRecords = exports.filterByActive(records)
  filteredRecords = exports.filterOutEarlyYears(filteredRecords)
  filteredRecords = exports.filterByIncomplete(filteredRecords)
  return filteredRecords
}

// Trainees that can be bulk updated
exports.filterByCannotBulkUpdate = (records) => {
  let filteredRecords = exports.filterByActive(records)
  filteredRecords = exports.filterByEarlyYears(filteredRecords)
  filteredRecords = exports.filterByIncomplete(filteredRecords)
  return filteredRecords
}

// Trainees that can be bulk recommended
exports.filterByCanBeRecommended = (records) => {
  let filteredRecords = exports.filterByComplete(records)
  filteredRecords = exports.filterByActive(filteredRecords)
  filteredRecords = exports.filterOutDeferred(filteredRecords)
  return filteredRecords
}

// -------------------------------------------------------------------
// Sort records
// -------------------------------------------------------------------

// Sort by a date
// Uses lodash.get so we can read nested properties
exports.sortRecordsByDate = (records, sortKey, reverse=false) => {
  records = records.sort((a, b) => new Date(_.get(b, sortKey)).getTime() - new Date(_.get(a, sortKey)).getTime())
  return (reverse) ? records.reverse() : records
}

// Sort records by thing. Tests for specific cases and otherwise falls back to string comparison of field
exports.sortRecordsBy = (records, sortType) => {

  const compareStrings = (a, b) => {
    if (a && b){
      return a.localeCompare(b)
    }
    else return (a) ? 1 : -1
  }

  if (!sortType) return records

  switch (sortType){
    case "lastName":
      records.sort( (a, b) => compareStrings(a?.personalDetails?.familyName, b?.personalDetails?.familyName))
      break
    case "firstName":
      records.sort( (a, b) => compareStrings(a?.personalDetails?.givenName, b?.personalDetails?.givenName))
      break
    case "updatedDate":
      records = exports.sortRecordsByDate(records, 'updatedDate')
      break
    default:
      console.log(`Sorting records by unknown type: ${sortType}`)
      records.sort( (a, b) => compareStrings(_.get(a, sortType), _.get(b, sortType)))
      break
  }

  return records

}

// Sort by last name
exports.sortRecordsByLastName = records => {
  return exports.sortRecordsBy(records, 'lastName')
}

// Sort by date updated
exports.sortRecordsByDateUpdated = records => {
  return exports.sortRecordsByDate(records, 'updatedDate')
}

// -------------------------------------------------------------------
// Providers
// -------------------------------------------------------------------

// Look up provider data using the provider name.
// Works with strings and arrays of strings
// eg
// "Coventry University" => 
// {
//   name: 'Coventry University',
//   type: 'accreditingProvider'
// }
exports.getProviderData = function(input, data=false){
  data = data || this?.ctx?.data || false

  if (!data){
    console.log("Error with getProviderData: no data!")
    return false
  }

  const lookUpProvider = provider => {
    let item
    if (data?.providers?.all){
      item = data.providers.all.find(item => item.name == provider) || false
    }
    if (!item) console.log(`Error with getProvider data: ${provider} not found.`)
    return item
  }

  if (Array.isArray(input)){
    return input.map(provider => lookUpProvider(provider) ).filter(Boolean)
  }
  else return lookUpProvider(input)
}

// Gets the type of a provider - currently `accreditingProvider` or `leadSchool`
exports.getProviderType = function(provider, data=false){
  data = data || this?.ctx?.data || false

  let found = data?.providers?.all && data.providers.all.find(item => item.name == provider)
  return found?.type || false
}

exports.providerIsAccrediting = function(provider, data=false){
  data = data || this?.ctx?.data || false
  return exports.getProviderType.apply(this, [provider, data]) == 'accreditingProvider'
}

exports.providerIsLeadSchool = function(provider, data=false){
  data = data || this?.ctx?.data || false
  return exports.getProviderType.apply(this, [provider, data]) == 'leadSchool'
}




// -------------------------------------------------------------------
// Misc
// -------------------------------------------------------------------


// Add an event to a record’s timeline
exports.addEvent = (record, title, description) => {
  record.events.items.push({
    title: title,
    user: 'Provider',
    date: new Date(),
    ...(description ? {description} : {}) // conditionally pass description
  })
}

// Delete temporary stores of data
exports.deleteTempData = (data) => {
  delete data.degreeTemp
  delete data.record
  delete data.submittedRecordId
  delete data.placementTemp
}

// Stolen from Manage
exports.getTimeline = (record) => {
  return record.events.items.map(item => {
    return {
      label: {
        text: item.title
      },
      datetime: {
        timestamp: item.date,
        type: 'datetime'
      },
      byline: {
        text: item.user
      },
      ...(item.description ? {description: item.description} : {})
      // link: getLink(item, record)
    }
  }).reverse()
}

// Update or create a record
// Todo: this function is overcomplicated. Make simpler!
exports.updateRecord = (data, newRecord, timelineMessage) => {

  if (!newRecord) return false

  let records = data.records
  newRecord.updatedDate = new Date()

  if (timelineMessage !== false){
    let message = (timelineMessage) ? timelineMessage : "Record updated"
    exports.addEvent(newRecord, message)
  }
  if (newRecord.addressType == "domestic"){
    delete newRecord?.contactDetails?.internationalAddress
  }
  if (newRecord.addressType == "international"){
    delete newRecord?.contactDetails?.address
  }
  data.record = newRecord

  if (newRecord.personalDetails){
    Object.defineProperty(newRecord.personalDetails, 'fullName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.middleNames)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }
  if (newRecord.personalDetails){
    Object.defineProperty(newRecord.personalDetails, 'shortName', {
      get() {
        let names = []
        names.push(this.givenName)
        names.push(this.familyName)
        return names.filter(Boolean).join(' ')
      },
      enumerable: true
    })
  }

  // All records should have a provider by this point
  if (!newRecord.provider){
    console.log(`Error in updateRecord - record has no provider`)
    if (data.signedInProviders.length == 1) { // One provider only
      newRecord.provider = data.signedInProviders[0] // Implicitly a 1 item array
    }
  }

  // Must be a new record
  if (!newRecord.id){
    newRecord.id = faker.datatype.uuid()
    records.push(newRecord)
  }
  // Is an existing record
  else {
    let recordIndex = records.findIndex(record => record.id == newRecord.id)
    records[recordIndex] = newRecord
  }
  return true
}

// Used by the bulk flows
exports.doBulkAction = (action, record, params) => {
  if (action == 'Submit a group of records and request TRNs'){
    return exports.registerForTRN(record)
  }
  if (action == 'Recommend a group of trainees for EYTS or QTS'){
    return exports.recommendForAward(record, params)
  }
}

// Advance a record to 'QTS recommended' status
exports.registerForTRN = (record) => {

  if (!record) return false

  // Only draft records can be submitted for TRN
  if (!exports.isDraft(record)){
    console.log(`registerForTRN failed: ${record.id} (${record?.personalDetails?.shortName}) has the wrong status (${record.status})`)
    return false
  }

  // Hopefully we won't be supplied any records in the wrong status
  // Just in case though...
  else if (!exports.recordIsComplete(record)){
    console.log(`Submit a group of records and request TRNs failed: ${record.id} (${record?.personalDetails?.shortName}) is not complete`)
    return false
  }
  else {
    record.status = 'Pending TRN'
    record.source = record.source || "Manual" // just in case
    record.reference = record.reference || generateReference()
    delete record?.placement?.status
    record.submittedDate = new Date()
    record.updatedDate = new Date()

    // Set default qualifcation, duration, etc
    // Just in case - this shoudl already be set
    record = exports.setCourseDefaults(record)
    exports.addEvent(record, "Trainee submitted for TRN")
  }
  return true
}

// Advance a record to 'QTS recommended' status
exports.recommendForAward = (record, params) => {

  if (!record) return false
  if (record.status.includes('recommended')){
    // Nothing to do
  }
  else if (record.status != 'TRN received'){
    console.log(`Recommend a group of trainees for EYTS or QTS failed: ${record.id} (${record?.personalDetails?.shortName}) has the wrong status (${record.status})`)
    return false
  }
  else {
    record.status = `${exports.getQualificationText(record)} recommended`
    _.set(record, 'qualificationDetails.standardsAssessedOutcome', "Passed")
    record.qualificationRecommendedDate = record?.qualificationDetails?.outcomeDate || params?.date || new Date()
    record.updatedDate = new Date()
    exports.addEvent(record, `Trainee recommended for ${exports.getQualificationText(record)}`)
  }
  return true
}

// -------------------------------------------------------------------
// Invalid answers / errors
// -------------------------------------------------------------------

// Push an item to the errorArray
// Needs the context so if calling from another filter needs to be called with `.apply(this, [args])`
// Usage: exports.addToErrorArray.apply(this, [{name: message, id}])
exports.addToErrorArray = function(item){
  if (!this?.ctx?.data){
    console.log("Error with addToErrorArray: ctx not passed in")
    return false
  } 
  let errorArray = this.ctx?.data?.temp?.errorArray || []
  errorArray.push(item)
  _.set(this.ctx, 'data.temp.errorArray', errorArray)
}

// Remove placeholder tags that are used to trigger things
exports.stripPlaceholders = (value, items=false) => {
  if (!value) return value

  let itemsToStrip = items || [
    '**invalid**',
    '**missing**'
  ]

  const stripStrings = string => {
    if (!_.isString(string)) return string
    else itemsToStrip.forEach(item => {
      string = string.replace(item, "")
    })
    return string
  }

  if (Array.isArray(value)){
    return value.map(arrayItem => stripStrings(arrayItem))
  }
  else if (_.isString(value)){
    return stripStrings(value)
  }
  else return value
}

/*
Highlight invalid summary list rows

This is filter patches in the ability to highlight rows on a summary list which
contain invalid answers. 

We indicate invalid answers by prefacing them with the string **invalid** or **missing**

This filter loops through each row, looking for this string in value.html or value.text.
If found, it adds some classes and messaging, and moves the action link within the value.

It also pushes the name of the row with the error to a temporary array stored
in the Nunjucks context. This is a hacky way that we can get a list of each of the 
errors visible in a set of summary lists without knowing about the data structure of a
record. The very act of running this filter on each summary list builds up this array.
We can then use that array to display a summary at the top of the page. This is combined
with a catch all route (*) that wipes the array with each request - so it should only
have items found since the last request.

This is very hacky - but works. It avoids us needing to know much about the data
or program errors per field. We just reivew the summary list to decide if something
is wrong.
*/
exports.highlightInvalidRows = function(rows, params=false) {
  let ctx = Object.assign({}, this.ctx)

  let returnRows = [...rows] //duplicate array - not sure this is needed

  // We need to add to any existing answers from previous times
  // this filter has run on this page
  // let invalidAnswers = ctx.data?.temp?.invalidAnswers || []
  let featureEnabled = ctx?.data?.settings?.highlightInvalidAnswers == "true"

  if (returnRows) {
    // Loop through each row
    returnRows = returnRows.map(row => {
      if (!row) return row

      let theRow = Object.assign({}, row)

      // Values are stored two possible places
      let value = theRow?.value?.html || theRow?.value?.text || ""
      if (_.isString(value)) value = value.trim()
      
      if (featureEnabled){

        if (params?.treatEmptyAsMissing && (!value || value == "")) {
          // Using .apply() to pass on value of 'this'
          theRow = Object.assign({}, exports.markSummaryRowMissing.apply(this, [theRow]))
        }

        else if (value && value.includes('**missing**')) {
          // Using .apply() to pass on value of 'this'
          theRow = Object.assign({}, exports.markSummaryRowMissing.apply(this, [theRow]))
        }

        // We preface invalid answers with **invalid** but technically it should work anywhere
        // Probably might not work for dates / values that get transformed before display
        else if (value && value.includes('**invalid**')) {
          // Using .apply() to pass on value of 'this'
          theRow = Object.assign({}, exports.markSummaryRowInvalid.apply(this, [theRow]))
        }
      }
      // If feature not enabled, we still need to strip placeholders
      else {
        theRow.value.html = exports.stripPlaceholders(value)
        delete theRow.value?.text // not needed any more
      }

      return theRow
    })
  }

  return returnRows
}

// Internal utility function to add markup to summary row to show visually inset styles
const styleSummaryRowAsInset = (row, params) => {

  // Keys are stored two possible places
  let key = row?.key?.html || row?.key?.text

  // GOVUK summary lists don’t support setting an id on rows
  // so we wrap the key in a div with our own id
  row.key.html = (params.id) ? `<div id="${params.id}">${key}</div>` : key
  delete row.key?.text

  // Message that gets shown in bold
  let messageHtml = (params.message) ? `<p class="govuk-body app-summary-list__message--invalid govuk-!-margin-bottom-2">${params.message}</p>` : ''

  // Grab the existing action link and craft a new link
  let linkHtml = '' // default to no link
  let actionItems = row?.actions?.items

  // If there’s more than one link (unlikely), do nothing
  if (actionItems && actionItems.length == 1){
    let href = row?.actions?.items[0].href
    let hidden = (params.linkTextAppendHidden) ? `<span class="govuk-visually-hidden"> ${params.linkTextAppendHidden}</span>` : ""
    linkHtml = `<div>
    <a class="govuk-link govuk-link--no-visited-state app-summary-list__link--invalid" href="${href}">
    ${params.linkText}${hidden}
    </a></div>`
    delete row.actions.items
  }

  // Add a class to the row so we can target it
  row.classes = `${row.classes} app-summary-list__row--invalid`

  // Wrap in a div for styling
  // Values are stored two possible places
  let value = row?.value?.html || row?.value?.text
  let userValueHtml = (value) ? `<div class="app-summary-list__user-value">${value}</div>` : ""

  // Entire thing is wrapped in a div so we can style a left border within the padding of the
  // summary list value box

  row.value.html = `<div class="app-summary-list__value-inset">${messageHtml}${userValueHtml}${linkHtml}</div>`
  delete row?.value?.text // just in case

  return row
}

// Generate messages to be used in inset styling
// Type can be `invalid` or `missing`
exports.markSummaryRow = function(row, type) {

  row = Object.assign({}, row)

  // Keys are stored two possible places
  let key = row?.key?.html || row?.key?.text

  // Values are stored two possible places
  let value = row?.value?.html || row?.value?.text || ""
  delete row?.value?.text // we’ll use row.value.html instead
  _.set(row, "value.html", exports.stripPlaceholders(value))// strip any placeholder tags

  // Generate an id so we can anchor to this row
  let id = `summary-list--row-invalid--${faker.datatype.uuid()}`

  let message, linkText, linkTextAppendHidden

  if (type == 'invalid'){
    message = `${key} is not recognised`
    linkText = "Review the trainee’s answer"
    linkTextAppendHidden = `for ${key.toLowerCase()}`

    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'missing'){
    message = `${key} is missing`
    delete row.value?.html // if it’s missing, there shouldn’t be a value
    linkText = `Enter ${key.toLowerCase()}`
    if (this?.ctx?.query?.errors){
      // Using .apply() to pass on value of 'this'
      exports.addToErrorArray.apply(this, [{name: message, id}])
    }
  }

  // If there are no actions, style text grey instead of blue inset
  if (!row?.actions?.items ||  !row?.actions?.items.length || !row?.actions?.items[0].href){
    console.log("no link")
    row = {
      ...row,
      value: {
        html: `<div class="govuk-hint">${message}</div>`
      }
    }
  }

  else {
    row = styleSummaryRowAsInset(row, {
      id,
      message,
      linkText,
      linkTextAppendHidden
    })
  }

  return row
}

exports.markSummaryRowInvalid = function(row) {
  // Using .apply() to pass on value of 'this'
  return exports.markSummaryRow.apply(this, [row, 'invalid'])
}

exports.markSummaryRowMissing = function(row) {
  // Using .apply() to pass on value of 'this'
  return exports.markSummaryRow.apply(this, [row, 'missing'])
}


exports.markInput = function(data, params){
  let type = params.type
  // Keys are stored two possible places
  let key = data?.label?.html || data?.label?.text || data?.fieldset?.legend?.html || data?.fieldset?.legend?.text

  // Values are stored two possible places
  let valueCleaned = exports.stripPlaceholders(data.value) // strip any placeholder tags

  // Generate an id so we can anchor to this row
  let id = data?.id || `app-input-invalid--${faker.datatype.uuid()}`

  let message

  if (type == 'error'){
    message = `Enter ${key.toLowerCase()}`
    data.errorMessage = {
      text: message
    }
    data.value = valueCleaned
    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'invalid'){
    message = `${key} is not recognised`
    data.errorMessage = {
      html: `The trainee entered ‘${valueCleaned}’${params.invalidMessage || ', which was not recognised. You need to search for the closest match.'}`
    }
    data.classes = (data.classes) ? `${data.classes} app-invalid-answer` : 'app-invalid-answer'
    delete data.value
    // Using .apply() to pass on value of 'this'
    exports.addToErrorArray.apply(this, [{name: message, id}])
  }
  else if (type == 'missing'){
    message = `${key} is missing`
    
    data.errorMessage = {
      html: message
    }
    data.classes = (data.classes) ? `${data.classes} app-invalid-answer` : 'app-invalid-answer'
    delete data.value
  }

  data.id = id

  return data
}

exports.markInputError = function(data) {
  return exports.markInput.apply(this, [data, 'error'])
} 

exports.markInputInvalid = function(data) {
  return exports.markInput.apply(this, [data, 'invalid'])
} 

exports.markInputMissing = function(data) {
  return exports.markInput.apply(this, [data, 'missing'])
} 
// Take in a form object to 

exports.highlightInvalidInputs = function(data, params={}){

  let value = data.value

  if (value && value.includes('**invalid**')) {
    params.type = 'invalid'
    // Using .apply() to pass on value of 'this'
    data = exports.markInput.apply(this, [data, params])
  }

  if (value && value.includes('**missing**')) {
    params.type = 'missing'
    // Using .apply() to pass on value of 'this'
    data = exports.markInput.apply(this, [data, params])
  }

  return data
}

// Count invalid or missing answers on a record
exports.countInvalidAnswers = function(record, data=false) {
  // Prefer context if available
  // This will pick up dynamically generated errors, but only
  // works within a view
  if (this.ctx){
    // console.log('Counting invalid answers with CTX')
    let errorArray = this.ctx?.data.temp?.errorArray || []
    return errorArray.length
  }
  // The context is not available from routes - so use record data as fallback
  // This count could be wrong if errors have been added dynamically - it can only
  // pick up records that include the placeholder strings
  else {
    // console.log('Counting invalid answers with json')
    let jsonRecord = JSON.stringify(record)
    let invalidCount = (jsonRecord.match(/\*\*invalid\*\*/g) || []).length
    let missingCount = (jsonRecord.match(/\*\*missing\*\*/g) || []).length
    return (invalidCount + missingCount)
  }
}

// Whether any data in the record is considered invalid
exports.hasInvalidAnswers = function(record, data=false) {
  // A page can set this temp variable to 'tell' this filter that errors
  // apply - otherwise fall back to counting errors
  let hasErrors
  if (data?.temp?.pageHasErrors == "true") hasErrors = true
  return hasErrors || exports.countInvalidAnswers.apply(this, [record]) > 0
}

// -------------------------------------------------------------------
// Schools
// -------------------------------------------------------------------

// This approximates a similar search as we do client side with Lunr
exports.searchSchools = (schools = [], query = "") => {
  if (!query) return []

  // Strip most punctuation for fuzzier matching
  const removePunctuation = input => input.replace(/['’‘.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")

  let queryParts = removePunctuation(query.toLowerCase()).split(" ")

  let results = schools.filter(school => {

    // All parts must match
    return queryParts.every(part => {
      let match = false
      let simpleSchoolName = removePunctuation(school.schoolName).toLowerCase()

      // 849382
      if (school.urn.includes(part)) match = true
      // Abbeywood School
      if (simpleSchoolName.includes(part)) match = true
      // Postcode with spaces
      if (school.postcode && school.postcode.toLowerCase().includes(part)) match = true
      // Postcode without spaces
      if (school.postcode && school.postcode.toLowerCase().replace(" ", "").includes(part)) match = true
      return match

    })
  })
  return results
}

// -------------------------------------------------------------------
// Routing
// -------------------------------------------------------------------

// Adds referrer as query string if it exists
exports.addReferrer = (url, referrer) => {
  if (!referrer || referrer == undefined) return url
  else {
    return `${url}?referrer=${referrer}`
  }
}

exports.orReferrer = function(url, referrer) {
  let currentPageUrl = this?.ctx?.currentPageUrl || false

  let referrerDestination = exports.getReferrerDestination(referrer, currentPageUrl)

  if (!referrer || !referrerDestination) return url
  else {
    return referrerDestination
  }
}

exports.pushReferrer = (existingReferrer, newReferrer) => {
  if (!existingReferrer) return newReferrer
  else {
    return [].concat(existingReferrer).concat(newReferrer)
  }
}

// Append referrer to string if it exists
exports.getReferrer = referrer => {
  if (referrer && referrer != 'undefined'){
    return `?referrer=${referrer}`
  }
  else return ''
}

// Appends a query param to an optional existing one
// Used so we can add query params whilst also providing a referrer
exports.addQueryParam = (existing, param) => {
  return (existing) ? `${existing}&${param}` : `?${param}`
}

exports.setQueryParam = (query, key, value) => {
  let newQuery = Object.assign({}, query)
  _.set(newQuery, key, value)
  return newQuery
}

// Combine pathname and query
exports.makeUrlWithQuery = (pathname, query) => {
  return url.format({
    pathname,
    query: query,
  })
}

// Update the current query with sort order set
exports.createSortLink = function(pathname, sortOrder){
  let ctx = Object.assign({}, this.ctx)
  let query = ctx.query
  query = exports.setQueryParam(query, 'sortOrder', sortOrder)
  return exports.makeUrlWithQuery(pathname, query)
}

// Referrer could be an array of urls. If so, return the last one
// and put the remaining as the next referrer.
// This lets us support multiple return destinations
exports.getReferrerDestination = function(referrer, currentPageUrl=false) {

  // Split referrer string in to array parts
  const getReferrerArray = referrer => {
    let referrerArray = []
    if (typeof referrer == 'string'){
      referrerArray = referrer.split(",")
    }
    if (Array.isArray(referrerArray)){
      return referrerArray
    }
    else return []
  }

  // Strip duplicates and falsy values
  let referrerArray = [...getReferrerArray(referrer).filter(Boolean)]

  // Strip the current page’s url if present (we don’t want to redirect to the page we came from)
  referrerArray = referrerArray.filter(item => item != currentPageUrl)

  // No url found
  if (referrerArray.length == 0) {
    return ''
  }
  // A single return url
  else if (referrerArray.length == 1){
    return referrerArray[0]
  }
  // Multiple return urls
  else {
    let referrerCopy = [...referrerArray]
    let last = referrerCopy.pop()
    return `${last}?referrer=${referrerCopy}`
  }

}

// Return first part of url to use in redirects
exports.getRecordPath = req => {
  let recordType = req.params.recordtype
  return (recordType == 'record') ? (`/record/${req.params.uuid}`) : '/new-record'
}

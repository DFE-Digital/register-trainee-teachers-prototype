// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const trainingRouteData = require('./../data/training-route-data')
const trainingRoutes = trainingRouteData.trainingRoutes
const utils = require('./../lib/utils')
const arrayFilters = require('./arrays.js').filters
const funding = require('../data/funding')

// Leave this filters line
var filters = {}

// Return whether a record has a first or last name
filters.hasName = (record) => {
  return (record?.personalDetails?.givenName || record?.personalDetails?.familyName)
}

// Return "Firstname Lastname"
// Likely no longer needed - done with a getter now
filters.getShortName = record => {
  let names = []
  names.push(record?.personalDetails?.givenName)
  names.push(record?.personalDetails?.familyName)
  return names.filter(Boolean).join(' ')
}

// Return "Lastname, Firstname"
filters.getShortNameReversed = ({
  givenName="",
  familyName=""} = false) => {
  let names = []
  names.push(familyName)
  names.push(givenName)
  return names.filter(Boolean).join(', ')
}

// Return full name with middle names if present
// Likely no longer needed - done with a getter now
filters.getFullName = ({
  givenName="",
  middleNames="",
  familyName=""} = false) => {
  let names = []
  names.push(givenName)
  names.push(middleNames)
  names.push(familyName)
  return names.filter(Boolean).join(' ')
}

// Prepend with 'Other grade:' if grade isn’t a pre-set type
filters.prettifyDegreeGrade = grade => {
  if (!grade) return ""
  let isOtherGrade = ![
    "First-class honours",
    "Upper second-class honours (2:1)",
    "Lower second-class honours (2:2)",
    "Third-class honours",
    "Pass"
  ].includes(grade)
  return (isOtherGrade) ? `Other grade: ${grade.toLowerCase()}` : grade
}

// Metadata about a school as a string
// URN 1234567, City, Postcode
filters.getSchoolHint = (school) => {
  let hint = `URN ${school.urn}`
  if (school.town) hint += `, ${school.town}` // Not all schools have cities
  if (school.postcode) hint += `, ${school.postcode}` // Not all schools have postcodes
  return hint
}

// Map school names so we get the hint in grey on a second line
filters.getSchoolNamesForAutocomplete = (schools) => {
  return schools.map(school => {
    return [`${school.schoolName} | ${filters.getSchoolHint(school)}`, school.uuid]
  })
}



// Biology (J482)
filters.getCourseNamesForSelect = (courses) => {
  return courses.map(course => {
    return {
      text: course.courseNameLong,
      value: course.id
    }
  })
}

// Map course names so in autocomplete we get the name with
// a hint on a second line
// Biology (J482)
// QTS with PGCE full-time
filters.getCourseNamesForAutocomplete = (courses) => {
  return courses.map(course => {
    return {
      name: course.courseNameLong,
      hint: course.qualificationsSummary,
      value: course.id
    }
  })
}

// Combine type with abbreviation if abbreviation is different
// The autocomplete will split these and make the abbreviation
// display in bold
// 
// Bachelor of Science (BSc)
filters.getDegreeTypesForAutocomplete = (degreeTypes) => {
  return degreeTypes.map(type => {

    let append = ((type.short && type.short != type.full) ? type.short : null)

    if (append) append = ` <span class="autocomplete__option--bold">(${type.short})</span>`

    return {
      name: type.text,
      value: type.value,
      synonyms: [type.short].concat(type.synonyms).filter(Boolean),
      append: append,
      hint: type.hint,
      boost: type.boost
    }
  })
}

// Return a pretty name for the degree
filters.getDegreeName = (degree) => {
  if (!degree) return ''

  let typeText

  if (utils.falsify(degree.isInternational)){
    if (degree.type == 'UK ENIC not provided'){
      typeText = "Non-UK degree"
    }
    else typeText = `Non-UK ${degree.type}`
  }
  else {
    typeText = degree.type
  }
  return `${typeText}: ${degree.subject && degree.subject.toLowerCase()}`
}

filters.getDegreeHint = (degree) =>{
  if (!degree) return ''
  if (utils.falsify(degree.isInternational)){
    return `${degree.country} (${degree.endDate})`
  }
  else {
    return `${degree.org} (${degree.endDate})`
  } 
}

filters.includes = (route, string) =>{
  if (route && route.includes(string)) {
    return true
  } else {
    return false
  }
}

// work out what types of funding the org is getting to give tab name
// eg "[bursaries]"
// eg "[bursaries, grants]"
filters.typesOfFunding = () => {
  let typesOfFunding = []

  let bursaryTrainees = 0
  funding.annualFundingScitts.forEach(element => {
    bursaryTrainees += bursaryTrainees 
    + element.numberOfTtraineesPgIttOrTier1EyItt
    + element.numberOfTtraineesTier2EyItt
    + element.numberOfTtraineesTier3EyItt
    + element.numberOfTtraineesUGIttOrTier4EyItt
  })

  if(bursaryTrainees > 0){
    typesOfFunding.push("bursaries")
  }

  let scholarshipTrainnees = 0
  funding.annualFundingScitts.forEach(element => {
    scholarshipTrainnees += element.numberOfTtraineesScholarship
  })
  if(scholarshipTrainnees > 0){
    typesOfFunding.push("scholarships")
  }
  return typesOfFunding
}

// Attempt to fix the names from funding
filters.fixNamesFromFunding = (string) => {
  return string.toLowerCase().replace(/ ay /g," ").replace(/ & /g," and ").replace(/in-year/g,"").replace(/adjs |adj /g,"adjustment ").replace(/annex g/g,"").replace(/fe/g, "further education").replace(/itt/g, "ITT").replace(/ey /g, "early years ")
}

/*
  Takes year ranges and makes them consistnent
  - eg "19/20" ----> "2019 to 20"
  - eg "2019/20" --> "2019 to 20"
*/
filters.formatYearRange = (string) => {
  return string
    .replace(/(\d{4})\/(\d{2})/, '$1&nbsp;to&nbsp;$2')
    .replace(/(\d{2})\/(\d{2})/, '20$1&nbsp;to&nbsp;$2');
}



exports.filters = filters

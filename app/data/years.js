// let academicYears = [
//   // "2024 to 2025",
//   // "2023 to 2024",
//   "2022 to 2023",
//   "2021 to 2022",
//   "2020 to 2021",
//   "2019 to 2020",
//   "2018 to 2019",
//   "2017 to 2018"
// ]

let startAcademicYears = [
  "2022 to 2023",
  "2021 to 2022",
  "2020 to 2021",
  "2019 to 2020 and prior"
]

let endAcademicYears = [
  // "2025 to 2026",
  "2024 to 2025",
  "2023 to 2024",
  "2022 to 2023",
  "2020 to 2021",
  "2019 to 2020 and prior"
  // "2019 to 2020",
  // "2018 to 2019",
  // "2017 to 2018"
]

let academicYears = [
  "2022 to 2023",
  "2021 to 2022",
  "2020 to 2021 and prior"
]

let currentAcademicYear = "2022 to 2023"
let currentAcademicYearSimple = 2022

// First of August of current academic year
// Todo: use this in publish course generator
let academicYearStartDate = new Date(`${currentAcademicYearSimple}-8-1`)

let defaultCourseYear = 2022


// Todo: this is a duplicate from utils - should have only one
const academicYearToYear = string => {
  if (string) return parseInt(string.substring(0, 4))
  else return false
}

// Todo: this is a duplicate from utils - should have only one
const yearToAcademicYearString = year => {
  let yearInt = parseInt(year)
  return `${year} to ${yearInt + 1}`
}

const incrementOrDecrimentYear = (year, units) => {
  let yearShort = academicYearToYear(year)

  if (yearShort){
    return yearToAcademicYearString(yearShort + units)
  }
  else {
    console.log("Error with incrementOrDecrimentYear")
    return year
  }
}

let endOfCurrentCycle = defaultCourseYear + 1

// The first year in the range
let academicYearsShort = academicYears.map(year => academicYearToYear(year))

let nextAcademicYear = incrementOrDecrimentYear(currentAcademicYear, 1)
let previousAcademicYear = incrementOrDecrimentYear(currentAcademicYear, -1)

module.exports = {
    academicYearStartDate,
    academicYears,
    academicYearsShort,
    currentAcademicYear,
    currentAcademicYearSimple,
    defaultCourseYear,
    startAcademicYears,
    endAcademicYears,
    endOfCurrentCycle,
    nextAcademicYear,
    previousAcademicYear,
   // academicYears
  }


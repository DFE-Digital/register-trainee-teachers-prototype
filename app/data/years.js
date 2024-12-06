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

const startAcademicYears = [
  '2026 to 2027',
  '2025 to 2026',
  '2024 to 2025',
  '2023 to 2024',
  '2022 to 2023',
  '2021 to 2022',
  '2020 to 2021 and prior'
  // "2019 to 2020 and prior"
]

const endAcademicYears = [
  '2027 to 2028',
  '2026 to 2027',
  '2025 to 2026',
  '2024 to 2025',
  '2023 to 2024',
  '2022 to 2023',
  '2021 to 2022',
  '2020 to 2021 and prior'
  // "2020 to 2021",
  // "2019 to 2020",
  // "2018 to 2019",
  // "2017 to 2018"
]

const academicYears = [
  '2025 to 2026',
  '2024 to 2025',
  '2023 to 2024',
  '2022 to 2023',
  '2021 to 2022',
  '2020 to 2021 and prior'
]

const currentAcademicYear = '2024 to 2025'
const currentAcademicYearSimple = 2024
const nextAcademicYearSimple = 2025

// First of August of current academic year
// Todo: use this in publish course generator
const academicYearStartDate = new Date(`${currentAcademicYearSimple}-8-1`)

const defaultCourseYear = 2024

// Todo: this is a duplicate from utils - should have only one
const academicYearToYear = string => {
  if (string) return parseInt(string.substring(0, 4))
  else return false
}

// Todo: this is a duplicate from utils - should have only one
const yearToAcademicYearString = year => {
  const yearInt = parseInt(year)
  return `${year} to ${yearInt + 1}`
}

const incrementOrDecrimentYear = (year, units) => {
  const yearShort = academicYearToYear(year)

  if (yearShort) {
    return yearToAcademicYearString(yearShort + units)
  } else {
    console.log('Error with incrementOrDecrimentYear')
    return year
  }
}

const endOfCurrentCycle = defaultCourseYear + 1

// The first year in the range
const academicYearsShort = academicYears.map(year => academicYearToYear(year))

const nextAcademicYear = incrementOrDecrimentYear(currentAcademicYear, 1)
const previousAcademicYear = incrementOrDecrimentYear(currentAcademicYear, -1)

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
  nextAcademicYearSimple,
  previousAcademicYear
  // academicYears
}

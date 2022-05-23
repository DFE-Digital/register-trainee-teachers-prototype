let academicYears = [
  // "2024 to 2025",
  // "2023 to 2024",
  "2022 to 2023",
  "2021 to 2022",
  "2020 to 2021",
  "2019 to 2020",
  "2018 to 2019",
  "2017 to 2018"
]

let endAcademicYears = [
  // "2025 to 2026",
  "2024 to 2025",
  "2023 to 2024",
  "2022 to 2023",
  "2021 to 2022",
  "2020 to 2021",
  "2019 to 2020",
  "2018 to 2019",
  "2017 to 2018"
]

let currentAcademicYear = "2021 to 2022"
let currentAcademicYearSimple = 2021

let defaultCourseYear = 2021
// defaultCourseYear = null

let endOfCurrentCycle = defaultCourseYear + 1

// The first year in the range
let academicYearsShort = academicYears.map(year => year.substring(0, 4))

let yearIndex = academicYears.findIndex(year => year == currentAcademicYear)
let nextAcademicYear = academicYears[yearIndex - 1]
let previousAcademicYear = academicYears[yearIndex + 1]

module.exports = {
    academicYears,
    academicYearsShort,
    currentAcademicYear,
    currentAcademicYearSimple,
    defaultCourseYear,
    endAcademicYears,
    endOfCurrentCycle,
    nextAcademicYear,
    previousAcademicYear
  }


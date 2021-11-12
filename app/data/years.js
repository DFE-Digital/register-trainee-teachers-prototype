let academicYears = [
  // "2024 to 2025",
  // "2023 to 2024",
  "2022 to 2023",
  "2021 to 2022",
  "2020 to 2021",
  // "2019 to 2020"
]

let defaultVisibleYears = [
  "2021 to 2022",
  "2020 to 2021"
]

let currentAcademicYear = "2021 to 2022"

let defaultCourseYear = "2022"
// defaultCourseYear = null

// The first year in the range
let academicYearsShort = academicYears.map(year => year.substring(0, 4))

let yearIndex = academicYears.findIndex(year => year == currentAcademicYear)
let nextAcademicYear = academicYears[yearIndex - 1]
let previousAcademicYear = academicYears[yearIndex + 1]

module.exports = {
    academicYears,
    academicYearsShort,
    defaultVisibleYears,
    defaultCourseYear,
    currentAcademicYear,
    nextAcademicYear,
    previousAcademicYear
  }


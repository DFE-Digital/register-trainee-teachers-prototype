const url = require('url')
const utils = require('./../lib/utils')
const objectFilters = require('./../filters/objects.js').filters

// Work around a bug where occasionally _unchecked would appear
// Also coerce to array to be easier to work with
const cleanInputData = (data) => {
  if (!data || data === '_unchecked') {
    return undefined
  } else {
    data = [].concat(data) // coerce to arrays so we can filter them
    // _unchecked sometimes appears - can't track down what's causing it
    data = data.filter(item => item !== '_unchecked')
    return (data.length === 0) ? undefined : data // return undefined if array now empty
  }
}

const getSearchQuery = req => req.query?.searchQuery || ''

// Clean up query to create a filters object with selected filters
const getFilters = (req) => {
  // Copy the query
  const query = Object.assign({}, req.query)

  // Following code is awkward - had some issues with saving objects in query string and then
  // with _unchecked values appearing. So it's set as top level data, then cleaned and remapped
  // to an object

  // Needed because this is coming via query string and not auto-data store
  // And these values may contain '_unchecked'
  const filtersToClean = [
    'filterCohortFilter',
    'filterAllProviders',
    'filterCompleteStatus',
    'filterCourseLevel',
    'filterYears',
    'filterStartYears',
    'filterEndYears',
    'filterPhase',
    'filterSource',
    'filterStatus',
    'filterStudyMode',
    'filterTrainingRoutes',
    'filterTrainingStatus',
    'filterAcademicYears',
    'filterUserProviders']

  filtersToClean.forEach(filter => query[filter] = cleanInputData(query[filter]))

  // Remap to an object so we can pass it to the filterRecords function
  // that is shared by the
  const filters = {
    cohortFilter: query.filterCohortFilter,
    status: query.filterStatus,
    source: query.filterSource,
    completeStatus: query.filterCompleteStatus,
    courseLevel: query.filterCourseLevel,
    years: query.filterYears,
    startYears: query.filterStartYears,
    endYears: query.filterEndYears,
    phase: query.filterPhase,
    studyMode: query.filterStudyMode,
    providers: query.filterUserProviders,
    allProviders: query.filterAllProviders,
    trainingRoutes: query.filterTrainingRoutes,
    trainingStatus: query.filterTrainingStatus,
    academicYears: query.filterAcademicYears,
    subject: query.filterSubject
  }

  // if (filters?.cycle) {
  //   delete filters?.cohortFilter
  // }

  // if (filters?.cohortFilter) {
  //   delete filters?.cycle
  // }

  return filters
}

// Todo: this could probably be simpler
const getHasFilters = (filters, searchQuery) => {
  return !!(filters.status) ||
  !!(filters.cohortFilter) ||
  !!(filters.completeStatus) ||
  !!(filters.courseLevel) ||
  !!(filters.source) ||
  !!(filters.phase) ||
  !!(filters.studyMode) ||
  !!(searchQuery) ||
  !!(filters.subject && filters.subject !== 'All subjects') ||

  !!(filters.years && filters.years !== 'All years') ||
  !!(filters.startYears && filters.startYears !== 'All years') ||
  !!(filters.endYears && filters.endYears !== 'All years') ||
  !!(filters.trainingRoutes) ||
  !!(filters.trainingStatus) ||
  !!(filters.academicYears && filters.academicYears !== 'All years') ||
  !!(filters.providers) ||
  !!(filters.allProviders && filters.allProviders !== 'All providers')
}

// Make object to hold details of selected filters with appropriate links to clear each one
const getSelectedFilters = (req) => {
  const query = Object.assign({}, req.query)
  const filters = getFilters(req)
  const searchQuery = getSearchQuery(req)
  const myUrl = new URL(req.url, `http://${req.headers.host}`) // Include the host to construct a full URL
  const pathname = myUrl.pathname

  const hasFilters = getHasFilters(filters, searchQuery)

  if (!hasFilters) return false

  const selectedFilters = {
    categories: []
  }

  if (searchQuery) {
    const newQuery = Object.assign({}, query)
    delete newQuery.searchQuery
    selectedFilters.categories.push({
      heading: { text: 'Text search' },
      items: [{
        text: searchQuery,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  if (filters.cohortFilter) {
    selectedFilters.categories.push({
      heading: { text: 'Cohorts' },
      items: filters.cohortFilter.map((cohortFilter) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterCohortFilter = filters.cohortFilter.filter(a => a !== cohortFilter)
        return {
          text: cohortFilter,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.trainingStatus) {
    selectedFilters.categories.push({
      heading: { text: 'Training status' },
      items: filters.trainingStatus.map((status) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterTrainingStatus = filters.trainingStatus.filter(a => a !== status)

        return {
          text: status,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  // Combined start and end years select - not currently used
  if (filters.years && filters.years !== 'All years') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterYears
    let headingText = 'Year'
    // Show conditional heading depending on if it’s a start or end year
    if (filters.years[0].toLowerCase().includes('end')) {
      headingText = 'End year'
    } else if (filters.years[0].toLowerCase().includes('start')) {
      headingText = 'Start year'
    } else if (filters.years[0].toLowerCase().includes('training')) {
      headingText = 'Academic year'
    }

    const tagLabelText = filters.years[0].replace('End year: ', '').replace('Start year: ', '').replace('Academic year: ', '')
    selectedFilters.categories.push({
      heading: { text: headingText },
      items: [{
        text: tagLabelText,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  // Start years
  if (filters.startYears && filters.startYears !== 'All years') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterStartYears
    selectedFilters.categories.push({
      heading: { text: 'Start year' },
      items: [{
        text: filters.startYears,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  // End years
  if (filters.endYears && filters.endYears !== 'All years') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterEndYears
    selectedFilters.categories.push({
      heading: { text: 'End year' },
      items: [{
        text: filters.endYears,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  // Academic years
  if (filters.academicYears && filters.academicYears !== 'All years') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterAcademicYears
    selectedFilters.categories.push({
      heading: { text: 'Academic year' },
      items: [{
        text: filters.academicYears,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  if (filters.allProviders && filters.allProviders !== 'All providers') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterAllProviders
    selectedFilters.categories.push({
      heading: { text: 'Provider' },
      items: [{
        text: filters.allProviders,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  const completeFilterLabel = (pathname === '/drafts') ? 'Draft completion' : 'Available to do'

  if (filters.completeStatus) {
    selectedFilters.categories.push({
      heading: { text: completeFilterLabel },
      items: filters.completeStatus.map((completeStatus) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterCompleteStatus = filters.completeStatus.filter(a => a !== completeStatus)
        return {
          text: completeStatus,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.source) {
    selectedFilters.categories.push({
      heading: { text: 'Record source' },
      items: filters.source.map((source) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterSource = filters.source.filter(a => a !== source)
        return {
          text: source,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.courseLevel) {
    selectedFilters.categories.push({
      heading: { text: 'Course level' },
      items: filters.courseLevel.map((courseLevel) => {
        const newQuery = Object.assign({}, query)
        newQuery.filtercourseLevel = filters.courseLevel.filter(a => a !== courseLevel)
        return {
          text: courseLevel,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.phase) {
    selectedFilters.categories.push({
      heading: { text: 'Education phase' },
      items: filters.phase.map((phase) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterPhase = filters.phase.filter(a => a !== phase)
        return {
          text: phase,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.studyMode) {
    selectedFilters.categories.push({
      heading: { text: 'Full time or part time' },
      items: filters.studyMode.map((studyMode) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterPhase = filters.studyMode.filter(a => a !== studyMode)
        return {
          text: studyMode,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.providers) {
    selectedFilters.categories.push({
      heading: { text: 'Provider' },
      items: filters.providers.map((provider) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterUserProviders = filters.providers.filter(a => a !== provider)

        return {
          text: provider,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.trainingRoutes) {
    selectedFilters.categories.push({
      heading: { text: 'Training route' },
      items: filters.trainingRoutes.map((route) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterTrainingRoutes = filters.trainingRoutes.filter(a => a !== route)

        return {
          text: route,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.status) {
    selectedFilters.categories.push({
      heading: { text: 'Status' },
      items: filters.status.map((status) => {
        const newQuery = Object.assign({}, query)
        newQuery.filterStatus = filters.status.filter(a => a !== status)

        return {
          text: status,
          href: url.format({
            pathname,
            query: newQuery
          })
        }
      })
    })
  }

  if (filters.subject && filters.subject !== 'All subjects') {
    const newQuery = Object.assign({}, query)
    delete newQuery.filterSubject
    selectedFilters.categories.push({
      heading: { text: 'Subject' },
      items: [{
        text: filters.subject,
        href: url.format({
          pathname,
          query: newQuery
        })
      }]
    })
  }

  return selectedFilters
}

module.exports = router => {
  router.get('/records', (req, res, next) => {
    const data = req.session.data

    if (data.settings.academicYearsUiStyle === 'Tabs') {
      res.redirect('/records/current-year')
    } else {
      next()
    }
  })

  router.get(['/records', '/records/:tabName'], (req, res) => {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    const filters = getFilters(req)

    // If there’s no query string at all, we want to apply some defaults
    // const hasQueryString = Boolean(Object.keys(req.query).length)

    // by default set search results to show "Current" trainees
    // if (!hasQueryString) filters.cohortFilter = ["Current"]
    // if (!hasQueryString) filters.trainingStatus = ["Actively training"]

    const searchQuery = getSearchQuery(req)

    const hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    const selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)

    const tabName = req?.params?.tabName
    if (tabName) {
      const currentYear = data.years.currentAcademicYear
      const tabFilters = {}
      if (tabName === 'current-year') {
        console.log('Showing current year')
        tabFilters.academicYears = [currentYear]
        filteredRecords = utils.filterRecords(filteredRecords, data, tabFilters)
      } else if (tabName === 'previous-year') {
        console.log('Showing current year')
        const previousYear = utils.yearToAcademicYearString(utils.academicYearToYear(currentYear) - 1)
        tabFilters.academicYears = [previousYear]
        filteredRecords = utils.filterRecords(filteredRecords, data, tabFilters)
      } else if (tabName === 'next-year') {
        console.log('Showing next year')
        const nextYear = utils.yearToAcademicYearString(utils.academicYearToYear(currentYear) + 1)
        tabFilters.academicYears = [nextYear]
        filteredRecords = utils.filterRecords(filteredRecords, data, tabFilters)
      } else if (tabName === 'all-years') {
        console.log('Showing all years')
      } else {
        console.log(`Error: tab name ${tabName} not recognised`)
      }
    }
    // console.log(req.query)
    // if (!hasFilters) filteredRecords = filteredRecords.filter(record => record.academicYear === "2021 to 2022")

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    // All records except drafts
    const draftRecords = utils.filterRecordsBy(filteredRecords, 'status', 'Draft')
    const registeredRecords = objectFilters.removeWhere(filteredRecords, 'status', ['Draft', 'Apply pending conditions'])
    const draftRecordsCount = hasFilters ? draftRecords.length : null

    // Truncate records in case there's lots - and as we don't have working pagination
    const filteredRecordsRealCount = registeredRecords.length
    console.log({ filteredRecordsRealCount })
    filteredRecords = registeredRecords.slice(0, 100)

    if (req?.params?.tabName && data.settings.academicYearsUiStyle !== 'Tabs') {
      res.redirect('/records')
    } else {
      res.render('records', {
        filteredRecords,
        filteredRecordsRealCount,
        hasFilters,
        selectedFilters,
        draftRecordsCount,
        activeTab: req.params.tabName
      })
    }
  })

  router.get('/drafts', (req, res) => {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    const filters = getFilters(req)
    const searchQuery = getSearchQuery(req)

    const hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    const selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)

    // Only drafts

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    const draftRecords = utils.filterRecordsBy(filteredRecords, 'status', 'Draft')
    const registeredRecords = objectFilters.removeWhere(filteredRecords, 'status', 'Draft')
    const registeredRecordsCount = hasFilters ? registeredRecords.length : null

    const filteredRecordsRealCount = draftRecords.length

    res.render('drafts', {
      filteredRecords: draftRecords,
      filteredRecordsRealCount,
      hasFilters,
      selectedFilters,
      registeredRecordsCount
    })
  })

  router.get('/support/trainees', (req, res) => {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    const filters = getFilters(req)

    // If there’s no query string at all, we want to apply some defaults
    const hasQueryString = Boolean(Object.keys(req.query).length)

    // by default set search results to show "Current" trainees
    // if (!hasQueryString) filters.cohortFilter = ["Current"]
    if (!hasQueryString) filters.trainingStatus = ['Actively training']

    const searchQuery = getSearchQuery(req)

    const hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    // const selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)
    // console.log(req.query)
    // if (!hasFilters) filteredRecords = filteredRecords.filter(record => record.academicYear === "2021 to 2022")

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    // All records except drafts
    // let draftRecords = utils.filterRecordsBy(filteredRecords, 'status', "Draft")
    // let registeredRecords = objectFilters.removeWhere(filteredRecords, 'status', "Draft")
    // let draftRecordsCount = hasFilters ? draftRecords.length : null

    // Truncate records in case there's lots - and as we don't have working pagination
    const filteredRecordsRealCount = filteredRecords.length()
    filteredRecords = filteredRecords.slice(0, 204)

    res.render('support/trainees/index.html', {
      filteredRecords,
      filteredRecordsRealCount,
      hasFilters,
      navActive: 'trainees'
      // selectedFilters
    })
  })
}

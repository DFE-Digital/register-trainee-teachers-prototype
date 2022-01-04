const url = require('url')
const _ = require('lodash')
const utils = require('./../lib/utils')
const objectFilters = require('./../filters/objects.js').filters
const years = require('./../data/years.js')

// Work around a bug where occasionally _unchecked would appear
// Also coerce to array to be easier to work with
const cleanInputData = data => {
  if (!data || data == '_unchecked') {
    return undefined
  }
  else {
    data = [].concat(data) // coerce to arrays so we can filter them
    // _unchecked sometimes appears - can't track down what's causing it
    data = data.filter(item => item != '_unchecked')
    return (data.length == 0) ? undefined : data // return undefined if array now empty
  }
}

const getSearchQuery = req => req.query?.searchQuery || ""

// Clean up query to create a filters object with selected filters
const getFilters = req => {

  // Copy the query
  let query = Object.assign({}, req.query)

  // Following code is awkward - had some issues with saving objects in query string and then
  // with _unchecked values appearing. So it's set as top level data, then cleaned and remapped
  // to an object

  // Needed because this is coming via query string and not auto-data store
  // And these values may contain '_unchecked'
  let filtersToClean = [
  'filterCohortFilter',
  'filterAllProviders',
  'filterCompleteStatus',
  'filterCourseLevel',
  'filterCycle',
  'filterPhase',
  'filterSource',
  'filterStatus',
  'filterStudyMode',
  'filterTrainingRoutes',
  'filterUserProviders']
  filtersToClean.forEach(filter => query[filter] = cleanInputData(query[filter]))

  // Remap to an object so we can pass it to the filterRecords function
  // that is shared by the
  let filters = {
    cohortFilter: query.filterCohortFilter,
    status: query.filterStatus,
    source: query.filterSource,
    completeStatus: query.filterCompleteStatus,
    courseLevel: query.filterCourseLevel,
    cycle: query.filterCycle,
    phase: query.filterPhase,
    studyMode: query.filterStudyMode,
    providers: query.filterUserProviders,
    allProviders: query.filterAllProviders,
    trainingRoutes: query.filterTrainingRoutes,
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
  return !!(filters.status) 
  || !!(filters.cohortFilter)
  || !!(filters.completeStatus)
  || !!(filters.courseLevel)
  || !!(filters.source)
  || !!(filters.phase)
  || !!(filters.studyMode)
  || !!(searchQuery)
  || !!(filters.subject && filters.subject != 'All subjects')

  || !!(filters.cycle && filters.cycle != 'All years')

  || !!(filters.trainingRoutes)
  || !!(filters.providers)
  || !!(filters.allProviders && filters.allProviders != 'All providers')
}

// Make object to hold details of selected filters with appropriate links to clear each one
const getSelectedFilters = req => {

  let query = Object.assign({}, req.query)
  let filters = getFilters(req)
  let searchQuery = getSearchQuery(req)
  let pathname = url.parse(req.url).pathname

  let hasFilters = getHasFilters(filters, searchQuery)

  if (!hasFilters) return false

  let selectedFilters = {
    categories: []
  }

  if (searchQuery) {
    let newQuery = Object.assign({}, query)
    delete newQuery.searchQuery
    selectedFilters.categories.push({
      heading: { text: "Text search" },
      items: [{
        text: searchQuery,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  if (filters.cohortFilter) {
    selectedFilters.categories.push({
      heading: { text: "Cohorts" },
      items: filters.cohortFilter.map((cohortFilter) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterCohortFilter = filters.cohortFilter.filter(a => a != cohortFilter)
        return {
          text: cohortFilter,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.cycle && filters.cycle != 'All years') {
    let newQuery = Object.assign({}, query)
    delete newQuery.filterCycle
    selectedFilters.categories.push({
      heading: { text: "Start year" },
      items: [{
        text: filters.cycle,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  if (filters.allProviders && filters.allProviders != 'All providers') {
    let newQuery = Object.assign({}, query)
    delete newQuery.filterAllProviders
    selectedFilters.categories.push({
      heading: { text: "Provider" },
      items: [{
        text: filters.allProviders,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  let completeFilterLabel = (pathname == '/drafts') ? "Draft completion" : "Record completion"

  if (filters.completeStatus) {
    selectedFilters.categories.push({
      heading: { text: completeFilterLabel },
      items: filters.completeStatus.map((completeStatus) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterCompleteStatus = filters.completeStatus.filter(a => a != completeStatus)
        return {
          text: completeStatus,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.source) {
    selectedFilters.categories.push({
      heading: { text: 'Record source' },
      items: filters.source.map((source) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterSource = filters.source.filter(a => a != source)
        return {
          text: source,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.courseLevel) {
    selectedFilters.categories.push({
      heading: { text: 'Course level' },
      items: filters.courseLevel.map((courseLevel) => {

        let newQuery = Object.assign({}, query)
        newQuery.filtercourseLevel = filters.courseLevel.filter(a => a != courseLevel)
        return {
          text: courseLevel,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.phase) {
    selectedFilters.categories.push({
      heading: { text: 'Education phase' },
      items: filters.phase.map((phase) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterPhase = filters.phase.filter(a => a != phase)
        return {
          text: phase,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.studyMode) {
    selectedFilters.categories.push({
      heading: { text: 'Full time or part time' },
      items: filters.studyMode.map((studyMode) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterPhase = filters.studyMode.filter(a => a != studyMode)
        return {
          text: studyMode,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.providers) {
    selectedFilters.categories.push({
      heading: { text: 'Provider' },
      items: filters.providers.map((provider) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterUserProviders = filters.providers.filter(a => a != provider)

        return {
          text: provider,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }



  if (filters.trainingRoutes) {
    selectedFilters.categories.push({
      heading: { text: 'Training route' },
      items: filters.trainingRoutes.map((route) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterTrainingRoutes = filters.trainingRoutes.filter(a => a != route)

        return {
          text: route,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.status) {
    selectedFilters.categories.push({
      heading: { text: 'Status' },
      items: filters.status.map((status) => {

        let newQuery = Object.assign({}, query)
        newQuery.filterStatus = filters.status.filter(a => a != status)

        return {
          text: status,
          href: url.format({
            pathname,
            query: newQuery,
          })
        }
      })
    })
  }

  if (filters.subject && filters.subject != 'All subjects') {
    let newQuery = Object.assign({}, query)
    delete newQuery.filterSubject
    selectedFilters.categories.push({
      heading: { text: "Subject" },
      items: [{
        text: filters.subject,
        href: url.format({
          pathname,
          query: newQuery,
        })
      }]
    })
  }

  return selectedFilters
}


module.exports = router => {

  router.get(['/records'], function (req, res) {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    let filters = getFilters(req)

    // If there’s no query string at all, we want to apply some defaults
    let hasQueryString = Boolean(Object.keys(req.query).length)

    // by default set search results to show "Current" trainees
    if (!hasQueryString) filters.cohortFilter = ["Current"]

    let searchQuery = getSearchQuery(req)

    let hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    let selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)
    // console.log(req.query)
    // if (!hasFilters) filteredRecords = filteredRecords.filter(record => record.academicYear == "2021 to 2022")

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)


    // All records except drafts
    let draftRecords = utils.filterRecordsBy(filteredRecords, 'status', "Draft")
    let registeredRecords = objectFilters.removeWhere(filteredRecords, 'status', "Draft")
    let draftRecordsCount = draftRecords.length



    // Truncate records in case there's lots - and as we don't have working pagination
    filteredRecords = filteredRecords.slice(0, 204)

    res.render('records', {
      filteredRecords: registeredRecords,
      hasFilters,
      selectedFilters,
      draftRecordsCount
    })
  })

  router.get(['/drafts'], function (req, res) {
    const data = req.session.data

    // We’re not in a record, so make sure to flush record data
    delete req.session?.data?.record
    delete res.locals.data?.record

    // Grab filters and clean them up
    let filters = getFilters(req)
    let searchQuery = getSearchQuery(req)

    let hasFilters = getHasFilters(filters, searchQuery)

    // Show selected filters as labels that can be individually removed
    let selectedFilters = getSelectedFilters(req)

    // Filter records using the filters provided
    let filteredRecords = utils.filterRecords(data.records, data, filters)

    // Only drafts

    // Sort records by sortOrder, defaulting to updatedDate
    filteredRecords = utils.sortRecordsBy(filteredRecords, (req?.query?.sortOrder || 'updatedDate'))

    // Search traineeId and full name
    filteredRecords = utils.filterRecordsBySearchTerm(filteredRecords, searchQuery)

    let draftRecords = utils.filterRecordsBy(filteredRecords, 'status', "Draft")
    let registeredRecords = objectFilters.removeWhere(filteredRecords, 'status', "Draft")
    let registeredRecordsCount = registeredRecords.length

    res.render('drafts', {
      filteredRecords: draftRecords,
      hasFilters,
      selectedFilters,
      registeredRecordsCount,
    })
  })

}

const faker = require('faker')
const path = require('path')
const moment = require('moment')
const utils = require('./../lib/utils')
const _ = require('lodash')
const years = require('../data/years')

// In function because this is too big to pass around in session
const getSchools = () => {
  return require('./../data/gis-schools.js')
}

module.exports = router => {

  // Load up data for a record
  // This implimentation makes a copy of the record and stores it in a temporary location
  // any edits happen on this temporary data - depending on the journey, some routes may then
  // copy this temp record back to the main records list. This means we can support things like
  // cancelling changes - as we just need to load the original record again.
  // One downside is it means the prototype doesn’t support multiple records being opened
  // at once.
  router.get('/record/:uuid', function (req, res) {
    const data = req.session.data

    utils.deleteTempData(data)
    const records = req.session.data.records
    const record = records.find(record => record.id == req.params.uuid)
    if (!record){
      res.redirect('/records')
    }
    // Save record to session to be used by views
    req.session.data.record = record

    // Redirect to task draft journey if still a draft
    if (utils.isDraft(record)){
      res.redirect('/new-record/overview')
    }
    // Only submitted records
    else {
      res.locals.record = record
      res.render('record')
    }
  })

  // =============================================================================
  // Schools
  // =============================================================================

  // Forward on to the appropriate schools page depending on what the route needs
  router.get(['/:recordtype/:uuid/schools','/:recordtype/schools'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    if (utils.requiresField(record, 'leadSchool')){
      res.redirect(`${recordPath}/schools/lead-school${referrer}`)
    }
    else if (utils.requiresField(record, 'employingSchool')){
      res.redirect(`${recordPath}/schools/employing-school${referrer}`)
    }
    else {
      // This path shouldn't be possible
      res.redirect(`${recordPath}/schools/confirm${referrer}`)
    }
  })

  // Toggle between an autocomplete page and a search results page on the basis of there being a search query
  router.get(['/:recordtype/:uuid/schools/lead-school','/:recordtype/schools/lead-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let schoolSearchTerm = req.query?._schoolSearch
    const schools = getSchools()

    if (schoolSearchTerm){
      let results = false
      let resultsCount = 0
      results = utils.searchSchools(schools, schoolSearchTerm)
      resultsCount = results.length
      results = results.slice(0, 15) // truncate results
      res.render(`${req.params.recordtype}/schools/lead-school-results`, { searchResults: results, resultsCount })
    }
    else {
      res.render(`${req.params.recordtype}/schools/lead-school`)
    }

  })

  // This route deals with users searching for schools by string or having selected a
  // school from a set of results.
  router.post(['/:recordtype/:uuid/schools/lead-school','/:recordtype/schools/lead-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    const schools = getSchools()

    // default to applicable unless checkbox set
    let leadSchoolApplicable = true
    if (record?.schools?.leadSchool?.notApplicable && record?.schools?.leadSchool?.notApplicable.includes('true') ){
      leadSchoolApplicable = false
    }

    // Input added with js by the autocomplete
    let autocompleteRawValue = req.body?._autocomplete_raw_value_school_picker

    // School selected via autocomplete
    let autocompleteUuid = req.body?._autocomplete_result_uuid

    // AutocompleteUuid isn’t always reliable
    // If a user has made a valid selection then goes back to edit their answer, autocompleteUuid will be filled
    // with their previous answer. If they then type something new in to the autocomplete but don’t pick an answer,
    // then the old Uuid will get submitted. Here we check that the school name for the provided Uuid matches the
    // raw autocomplete string submitted. If they don’t match, wipe the UUID as it’s invalid - and instead we should
    // run a string search for the given name.
    if (autocompleteUuid && autocompleteRawValue){
      let selectedSchool = schools.find(school => school.uuid == autocompleteUuid)
      if (selectedSchool?.schoolName != autocompleteRawValue){
        autocompleteUuid = undefined
      }
    }

    // Used for no-js searching
    // Or where a user types in to the autocomplete too quickly
    let schoolSearchTerm = (!autocompleteUuid && autocompleteRawValue) || req.body?._schoolSearch || false

    let searchResultRadios = req.body?._searchResultRadios
    let schoolResultUuid = (searchResultRadios && searchResultRadios != 'searchAgain') ? searchResultRadios : false

    // Uuid could come via two form inputs
    let schoolUuid = autocompleteUuid || schoolResultUuid || false

    let leadSchoolIsEmployingSchool = (record?.schools?.leadSchoolIsEmployingSchool == "true") ? true : false
    delete record?.schools?.leadSchoolIsEmployingSchool // Checkbox no longer needed

    // Search again
    if (schoolSearchTerm && !schoolUuid && leadSchoolApplicable){
      let queryParams = utils.addQueryParam(referrer, `_schoolSearch=${schoolSearchTerm}`)
      res.redirect(`${recordPath}/schools/lead-school${queryParams}`)
    }
    // No answer given and no search term
    else if (!schoolUuid && leadSchoolApplicable){
      res.redirect(`${recordPath}/schools/lead-school${referrer}`)
    }
    else {
      if (leadSchoolApplicable){
        let selectedSchool = schools.find(school => school.uuid == schoolUuid)

        // Seed records might have schools that aren't in our schools list
        // This may happen if a user tries to edit an existing seed record
        if (!selectedSchool) {
          console.log(`School not found - you probably need to update the seed records`)
        }
        else {
          // Using _.set as lead school might not exist yet
          _.set(record, 'schools.leadSchool', selectedSchool)
        }
      }

      // Some routes have a conditional next question
      // We bypass this if we've already got an answer for employing school
      if (utils.requiresField(record, 'employingSchool') && !record?.schools?.employingSchool){

        // If an employing school isn’t already set, users can tell us the employing school
        // is the same as the employing school
        if (leadSchoolIsEmployingSchool && !record?.schools?.employingSchool) {
          // record.schools.employingSchool = selectedSchool
          _.set(record, 'schools.employingSchool', selectedSchool)
          // Skip to next page
          res.redirect(`${recordPath}/schools/confirm${referrer}`)
        }
        else {
          res.redirect(`${recordPath}/schools/employing-school${referrer}`)
        }
        
      }
      else {
        res.redirect(`${recordPath}/schools/confirm${referrer}`)
      }
    }

  })

  // Toggle between an autocomplete page and a search results page on the basis of there being a search query
  router.get(['/:recordtype/:uuid/schools/employing-school','/:recordtype/schools/employing-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let schoolSearchTerm = req.query?._schoolSearch
    const schools = getSchools()

    if (schoolSearchTerm){
      let results = false
      let resultsCount = 0
      
      results = utils.searchSchools(schools, schoolSearchTerm)
      resultsCount = results.length
      results = results.slice(0, 15) // truncate results
      res.render(`${req.params.recordtype}/schools/employing-school-results`, { searchResults: results, resultsCount })
    }
    else {
      res.render(`${req.params.recordtype}/schools/employing-school`)
    }

  })

  // This route deals with users searching for schools by string or having selected a
  // school from a set of results.
  router.post(['/:recordtype/:uuid/schools/employing-school','/:recordtype/schools/employing-school'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    const schools = getSchools()

    // default to applicable unless checkbox set
    let employingSchoolApplicable = true
    if (record?.schools?.employingSchool?.notApplicable && record?.schools?.employingSchool?.notApplicable.includes('true') ){
      employingSchoolApplicable = false
    }

    // Input added with js by the autocomplete
    let autocompleteRawValue = req.body?._autocomplete_raw_value_school_picker

    // School selected via autocomplete
    let autocompleteUuid = req.body?._autocomplete_result_uuid

    // AutocompleteUuid isn’t always reliable
    // If a user has made a valid selection then goes back to edit their answer, autocompleteUuid will be filled
    // with their previous answer. If they then type something new in to the autocomplete but don’t pick an answer,
    // then the old Uuid will get submitted. Here we check that the school name for the provided Uuid matches the
    // raw autocomplete string submitted. If they don’t match, wipe the UUID as it’s invalid - and instead we should
    // run a string search for the given name.
    if (autocompleteUuid && autocompleteRawValue){

      let selectedSchool = schools.find(school => school.uuid == autocompleteUuid)
      if (selectedSchool?.schoolName != autocompleteRawValue){
        autocompleteUuid = undefined
      }
    }

    // Used for no-js searching
    // Or where a user types in to the autocomplete too quickly
    let schoolSearchTerm = (!autocompleteUuid && autocompleteRawValue) || req.body?._schoolSearch || false

    let searchResultRadios = req.body?._searchResultRadios
    let schoolResultUuid = (searchResultRadios && searchResultRadios != 'searchAgain') ? searchResultRadios : false

    // Uuid could come via two form inputs
    let schoolUuid = autocompleteUuid || schoolResultUuid || false

    // Search again
    if (schoolSearchTerm && !schoolUuid && employingSchoolApplicable){
      let queryParams = utils.addQueryParam(referrer, `_schoolSearch=${schoolSearchTerm}`)
      res.redirect(`${recordPath}/schools/employing-school${queryParams}`)
    }
    // No answer given and no search term
    else if (!schoolUuid && employingSchoolApplicable){
      res.redirect(`${recordPath}/schools/employing-school${referrer}`)
    }
    else {
      if (employingSchoolApplicable){
        let selectedSchool = schools.find(school => school.uuid == schoolUuid)

        // Seed records might have schools that aren't in our schools list
        // This may happen if a user tries to edit an existing seed record
        if (!selectedSchool) {
          console.log(`School not found - you probably need to update the seed records`)
        }
        else {
          // Using _.set as lead school might not exist yet
          _.set(record, 'schools.employingSchool', selectedSchool)
        }
      }

      res.redirect(`${recordPath}/schools/confirm${referrer}`)
    }

  })

  // =============================================================================
  // Course details - general
  // =============================================================================

  // Decide whether to go down Publish pick-course journey or directly to manual course details
  router.get(['/:recordtype/:uuid/course-details','/:recordtype/course-details'], function (req, res) {
    const data = req.session.data
    const record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let route = data.record?.route

    if (!route || !record.provider) {
      if (!route) console.log("Error: route not set")
      if (!record?.provider) console.log("Error: provider not set")
      res.redirect("/records")
    }
    else {
      // If it’s an Apply draft we let users pick from all routes
      if (utils.sourceIsApply(record)) route = false

      // Look up courses offered by this provider
      let providerCourses = utils.getProviderCourses({
        courses: data.courses,
        provider: record.provider,
        route
      })

      if (!providerCourses.length){
        // Early years can skip phase question
        if (utils.isEarlyYears(record)) {
          res.redirect(`${recordPath}/course-details/details${referrer}`)
        }
        // All other routes need phase
        else {
          res.redirect(`${recordPath}/course-details/phase${referrer}`)
        }
      }
      else {
        let coursesByYear = utils.groupCoursesByYear(providerCourses)
        let defaultYear = (utils.academicYearStringToYear(record.academicYear)) || years.defaultCourseYear

        // If we have a default year and there's courses
        if (defaultYear && coursesByYear[defaultYear] && coursesByYear[defaultYear].length > 0){
          res.redirect(`${recordPath}/course-details/pick-course/${defaultYear}${referrer}`)
        }
        else {
          res.redirect(`${recordPath}/course-details/course-year${referrer}`)
        }
      }

    }

  })

    // Decide whether to go down Publish pick-course journey or directly to manual course details
  router.post(['/:recordtype/:uuid/course-details/course-year-answer','/:recordtype/course-details/course-year-answer'], function (req, res) {
    const data = req.session.data
    const record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let route = record?.route
    let academicYearString = record?.courseDetails?.academicYear
    let academicYear = utils.academicYearStringToYear(academicYearString)

    // No data, return to page
    if (!academicYear){
      res.redirect(`${recordPath}/course-details/course-year${referrer}`)
    }
    else {

      let providerCourses = utils.getProviderCourses({
        courses: data.courses,
        provider: record.provider,
        route
      })
      let coursesByYear = utils.groupCoursesByYear(providerCourses)

      // Check if we already have a stored course - if so, we may need to wipe it if it's for
      // a different year than was just chosen.
      if (record.courseDetails.isPublishCourse){
        let existingCourse = utils.getCourseByCode(record?.courseDetails?.code, data)
        // Check if the academic years match. If not, clear out the course details.
        if (existingCourse?.academicYear != academicYearString){
          delete record.courseDetails
          record.courseDetails = {
            academicYear: academicYearString
          }
        }
      }

      // If there are courses for that academic year, show course picker page
      if (coursesByYear[academicYear] && coursesByYear[academicYear].length > 0){
        res.redirect(`${recordPath}/course-details/pick-course/${academicYear}${referrer}`)
      }
      // If there are no courses, assume manual entry for course details
      else {
        res.redirect(`${recordPath}/course-details/phase${referrer}`)
      }
    }

  })

    // Decide whether to go down Publish pick-course journey or directly to manual course details
  router.get(['/:recordtype/:uuid/course-details/pick-course/:courseStartYear','/:recordtype/course-details/pick-course/:courseStartYear'], function (req, res) {
    const data = req.session.data
    const record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let courseStartYear = req.params.courseStartYear
    let route = data.record?.route

    // If it’s an Apply draft we let users pick from all routes
    if (utils.sourceIsApply(record)) route = false

    let isInvalidCourseYear = !years.academicYearsShort.includes(courseStartYear)

    // Year is invalid
    if (isInvalidCourseYear){
      console.log(`Error: provided year (${courseStartYear}) is not a valid course year`)
      res.redirect(`${recordPath}/course-details/course-year`)
    }
    else {
      // Look up courses offered by this provider
      let providerCourses = utils.getProviderCourses({
        courses: data.courses,
        provider: record?.provider,
        route,
        year: courseStartYear
      })
      if (providerCourses.length == 0){
        res.redirect(`${recordPath}/course-details/phase${referrer}`)
      }
      else {
        res.render(`${req.params.recordtype}/course-details/pick-course`, {
          providerCourses,
          courseStartYear,
          filteredRoute: route
        })
      }
    }

  })


  // =============================================================================
  // Course details - Apply
  // =============================================================================

  // Apply drafts: start by confirming the course is correct
  // This question exists because we have conditional questions to ask (specialisms, course dates),
  // but the provider may want to change the course - so we double check the course is correct
  // before asking those conditional questions
  router.post(['/:recordtype/:uuid/course-details/confirm-course','/:recordtype/course-details/confirm-course'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let confirmed = record.courseDetails.confirmedCourse
    delete record.courseDetails.confirmedCourse

    if (!confirmed){
      res.redirect(`${recordPath}/course-details/confirm-course${referrer}`)
    }
    else if (confirmed == 'course-confirmed'){
      delete record?.courseDetails?.needsConfirming
      res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath,referrer))
      // res.redirect(`${recordPath}/course-details/choose-specialisms${referrer}`)
    }
    else if (confirmed == 'change-course'){
      delete record?.courseDetails?.needsConfirming
      res.redirect(`${recordPath}/course-details/course-details${referrer}`)
    }

  })

  // =============================================================================
  // Course details - Publish journey
  // =============================================================================

  // Picking a Publish course
  router.post(['/:recordtype/:uuid/course-details/pick-course-answer','/:recordtype/course-details/pick-course-answer'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let enabledRoutes = data.settings.enabledTrainingRoutes
    let route = record?.route
    let academicYear = utils.academicYearStringToYear(record.academicYear)

    // Set route to false so that provider courses doesn’t filter by route
    if (utils.sourceIsApply(record)) route = false
    let providerCourses = utils.getProviderCourses({
      courses: data.courses,
      provider: record.provider,
      route
    })
    let selectedCourse = _.get(data, 'record.selectedCourseTemp')

    // User shouldn’t have been on this page, send them to manual course details journey
    if (providerCourses.length == 0){
      res.redirect(`${recordPath}/course-details/phase${referrer}`)
    }
    // No data, return to page
    else if (!selectedCourse){
      res.redirect(`${recordPath}/course-details/pick-course/${academicYear}${referrer}`)
    }
    // They’ve chosen to enter details manually
    else if (selectedCourse == "Other"){

      // User has swapped from a publish to a non-publish course. Delete existing data 
      if (record?.courseDetails?.isPublishCourse){
        delete record.courseDetails
      }

      // Send them down the manual course details journey
      res.redirect(`${recordPath}/course-details/phase${referrer}`)
    }

    // A publish course was selected
    else {

      // UI supports picking courses via radios or via an autocomplete
      // So we have to check different sorts of values to work out which we might have gotten

      // Course selected via Autocomplete
      if (selectedCourse == "publish-course") {

        // Default value from select (used by defualt for no-js)
        selectedCourse = _.get(data, 'record.selectedCourseAutocompleteTemp')

        // Read the raw autocomplete value.
        // We can’t read the autocomplete value from the select because the Publish autocomplete
        // values include hints, so the correct option in the select doesn’t get chosen by the js.
        // Instead we read the raw value of the autocomplete input itself and map that string back
        // to the id of the course.
        let selectedCourseRawAutocomplete = req.body._autocompleteRawValue_publishCourse
        // Will only exist if js
        if (selectedCourseRawAutocomplete){
          selectedCourse = providerCourses.find(course => {
            return course.courseNameLong == req.body._autocompleteRawValue_publishCourse
          })?.id
        }
      }

      // From here, course selected is either via radio, or we've looked it up above
      // Assume everything else is a course id
      let courseIndex = (selectedCourse) ? providerCourses.findIndex(course => course.id == selectedCourse) : false
      if (courseIndex < 0){
        // Nothing found for current provider (something has gone wrong)
        console.log(`Provider course ${selectedCourse} not recognised`)
        res.redirect(`${recordPath}/course-details/pick-course/${academicYear}${referrer}`)
      }
      else {
        // Copy over that provider’s course data
        let courseDetails = providerCourses[courseIndex]

        // Fill in specialisms that are mappable
        record.courseDetails = utils.mapMappablePublishSubjects(courseDetails)

        // Set course start and end dates for the trainee if the course has them
        // We don’t get full course dates from Publish, but once a user has added a trainee on a 
        // particular course we ask if the dates they add for that trainee should be saved back to the 
        // course - if so we’ll now have them and can apply them to future trainees on that course
        // and study mode.
        record.courseDetails = utils.setCourseDatesIfPresent(courseDetails)

        if (utils.isDraft(record)){
          record = utils.setAcademicYear(record)
        }

        record.academicYear = courseDetails.academicYear

        // For apply records we let them pick a Publish course which 
        // might have a different route.
        if (record.route != record.courseDetails.route){
          console.log(`The selected Publish course’s route does not match the draft’s route. Draft route changed to ${record.courseDetails.route}`)
          record.route = record.courseDetails.route
        }

        // Send to next conditional page or confirm page
        res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath,referrer))
      }
    }
  })

  // This route is here only to redirect the user *away* if there are no unmapped subjects
  // We do this because they could have chosen specialisms and then clicked back - this catches that
  // behavour and at least sends them someplace somewhat sensible.
  router.get(['/:recordtype/:uuid/course-details/choose-specialisms','/:recordtype/course-details/choose-specialisms'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    // Unsure why we have two filters for this. Too scared to remove now
    let hasUnmappedPublishSubjects = utils.hasUnmappedPublishSubjects(record.courseDetails) || utils.subjectsAreIncomplete(record.courseDetails)

    // We loop through this page up to 3 times. When done, we'll redirect away
    if (hasUnmappedPublishSubjects){
      res.render(`${req.params.recordtype}/course-details/choose-specialisms`)
    }
    // Send to next conditional page or confirm page
    else res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath,referrer))
  })

  // Deal with specialisms data as it comes in
  // Users can loop through this page, so if there are remaining unmapped subjects
  // we send them back to the same page to do the next one.
  router.post(['/:recordtype/:uuid/course-details/choose-specialisms','/:recordtype/course-details/choose-specialisms'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let courseDetails = record?.courseDetails

    // Special handling for languages
    if (courseDetails.subjectsArrayTemp){

      // Grab first 3 subjects as that’s all we support
      // In production we’ll throw a validation error if more are picked
      let subjectsArray = courseDetails.subjectsArrayTemp.slice(0, 3)

      // If there are two Publish subjects, that means we can only have
      // two languages
      let publishSubjectsCount = Object.keys(courseDetails.publishSubjects).length
      if (publishSubjectsCount > 1) subjectsArray = subjectsArray.slice(0, 2)

      // If a subject has already been set, add to it
      // For instance, it could be Biology with two languages - we don't want to overwrite Biology
      // as the first subject
      if (courseDetails?.subjects?.first) {
        subjectsArray = [courseDetails?.subjects?.first].concat(subjectsArray)
      }
      // It’s possible a second subject has already been set. If so, just add it to the end.
      // This means if the provider picked two languages, the existing second subject would get pushed 
      // to the third slot
      else if (courseDetails?.subjects?.second) {
        subjectsArray.push(courseDetails.subjects.second)
      }
      // If there's a null entry that means we've got an unmapped Publish subject - add that to the 
      // end so we don’t forget about it
      else if (courseDetails?.subjects?.second === null) {
        subjectsArray.push(null)
      }

      delete courseDetails.subjectsArrayTemp // No longer needed

      // Convert back to our object data structure
      courseDetails.subjects = utils.arrayToOrdinalObject(subjectsArray)

    }

    // Send to next conditional page or confirm page
    res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath,referrer))

  })

  // Shown for Publish courses that are dual study mode.
  router.post(['/:recordtype/:uuid/course-details/study-mode','/:recordtype/course-details/study-mode'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    // Now that we have study mode, we might be able to set course dates
    record.courseDetails = utils.setCourseDatesIfPresent(record?.courseDetails)

    // Send to next conditional page or confirm page
    res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath,referrer))

  })

  // Optionally save the trainee's course dates back to the course for that study mode
  router.post(['/:recordtype/:uuid/course-details/dates-answer','/:recordtype/course-details/dates-answer'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    let hasDates = !utils.needsCourseDates(record)
    let copyDatesToCourse = Boolean(record?.courseDetails?.saveDatesBackToCourse == "true")
    delete record?.courseDetails?.saveDatesBackToCourse

    // No dates provided
    if (!hasDates){
      res.redirect(`${recordPath}/course-details/dates${referrer}`)
    }

    // Save these dates back on the course for reuse by other trainees
    if (hasDates && copyDatesToCourse){
      // If we have dates, we can save those back to the Publish course for use in the future
      // NB: this copies the trainee's course dates - perhaps we should directly use the form values
      utils.updatePublishCourseDates(record.courseDetails, data)
    }

    // Use the course start date to set the academic year for the trainee
    if (utils.isDraft(record)){
      record = utils.setAcademicYear(record)
    }

    // Send to next conditional page or confirm page
    res.redirect(utils.getNextPublishCourseDetailsUrl(record, recordPath, referrer))

  })

  // =============================================================================
  // Course details - manual journey / editing a publish course
  // =============================================================================

  // Picking a phase (Primary or Secondary education)
  router.post(['/:recordtype/:uuid/course-details/phase','/:recordtype/course-details/phase'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let phase = record?.courseDetails?.phase

    // Handle users going back to change phase. If so, clear out existing subjects which are now
    // invalid
    let isPrimary = (phase == "Primary")
    if (isPrimary &&  record?.courseDetails?.subjects?.first && 
        !record?.courseDetails?.subjects?.first.toLowerCase().includes("primary")){
      delete record.courseDetails.subjects
      delete record.courseDetails.ageRange
    }
    let isSecondary = (phase == "Secondary")
    if (isSecondary &&  record?.courseDetails?.subjects?.first && 
        record?.courseDetails?.subjects?.first.toLowerCase().includes("primary")){
      delete record.courseDetails.subjects
      delete record.courseDetails.ageRange
    }

    // No data, return to page
    if (!phase){
      res.redirect(`${recordPath}/course-details/phase${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/course-details/details${referrer}`)
    }
  })
 
  router.post(['/:recordtype/:uuid/course-details/details','/:recordtype/course-details/details'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)
    let courseDetails = _.get(data, 'record.courseDetails')

    // No data, return to page
    if (!courseDetails){
      res.redirect(`${recordPath}/course-details`)
    }

    let isPrimary = (record.courseDetails?.phase == "Primary")

    if (isPrimary) {
      // Primary captures subjects using combined radio options - we need to split this in to 
      // separate subjects. Where 'another' is selected, we'll preserve any second and third subjects.
      record.courseDetails.subjects = utils.mapPrimarySubjectsToSubjectSpecialisms(courseDetails?.primarySubjectsCombined, courseDetails.subjects)
      delete record.courseDetails?.primarySubjectsCombined
    }

    // Make an array of subjects data - easier to work with
    let subjectsArray = record?.courseDetails?.subjects && Object.values(record.courseDetails.subjects).filter(Boolean) || []

    // Map back to cardinal object
    courseDetails.subjects = utils.arrayToOrdinalObject(subjectsArray)

    // Merge autocomplete and radio answers
    if (courseDetails.ageRange == 'Other age range'){
      courseDetails.ageRange = courseDetails.ageRangeOther
      delete courseDetails.ageRangeOther
    }

    // Save back to record
    record.courseDetails = courseDetails

    if (utils.isDraft(record)){
      record = utils.setAcademicYear(record)
    }

    // Set qualification and duration as per selected route
    record = utils.setCourseDefaults(record)

    let isAllocated = utils.hasAllocatedPlaces(record)

    if (isAllocated) {
      res.redirect(`${recordPath}/course-details/allocated-place${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/course-details/confirm${referrer}`)
    }

  })

  // =============================================================================
  // Diversity section
  // =============================================================================

  // Diversity branching
  router.post(['/:recordtype/:uuid/diversity/information-disclosed','/:recordtype/diversity/information-disclosed'], function (req, res) {
    const data = req.session.data
    let record = data.record // copy record
    let diversityDisclosed = _.get(data, 'record.diversity.diversityDisclosed')
    let referrer = utils.getReferrer(req.query.referrer)
    let recordPath = utils.getRecordPath(req)
    // No data, return to page
    if (!diversityDisclosed){
      res.redirect(`${recordPath}/diversity/information-disclosed${referrer}`)
    }
    else if (diversityDisclosed == true || diversityDisclosed == "true"){
      res.redirect(`${recordPath}/diversity/ethnic-group${referrer}`)
    }
    else {
      if (utils.isDraft(record) && utils.sourceIsApply(record)){
        res.redirect(utils.orReferrer(`${recordPath}/overview`, req.query.referrer))
      }
      else res.redirect(`${recordPath}/diversity/confirm${referrer}`)
    }
  })

  // Ethnic group branching
  router.post(['/:recordtype/:uuid/diversity/ethnic-group','/:recordtype/diversity/ethnic-group'], function (req, res) {
    let data = req.session.data
    let record = data.record // copy record
    let ethnicGroup = _.get(data, 'record.diversity.ethnicGroup')
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    // No data, return to page
    if (!ethnicGroup){
      res.redirect(`${recordPath}/diversity/ethnic-group${referrer}`)
    }
    else if (ethnicGroup.includes("Not provided")){
      res.redirect(`${recordPath}/diversity/disabilities${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/diversity/ethnic-background${referrer}`)
    }
  })

  // Disabilities branching
  router.post(['/:recordtype/:uuid/diversity/disabilities','/:recordtype/diversity/disabilities'], function (req, res) {
    let data = req.session.data
    let record = data.record // copy record
    let disabledAnswer = _.get(data, 'record.diversity.disabledAnswer')
    let hasDisabilities = (disabledAnswer == "They shared that they’re disabled") ? true : false
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    // No data, return to page
    if (!disabledAnswer){
      res.redirect(`${recordPath}/diversity/disabilities${referrer}`)
    }
    else if (hasDisabilities){
      res.redirect(`${recordPath}/diversity/trainee-disabilities${referrer}`)
    }
    else {
      if (utils.isDraft(record) && utils.sourceIsApply(record)){
        res.redirect(utils.orReferrer(`${recordPath}/overview`, req.query.referrer))
      }
      else res.redirect(`${recordPath}/diversity/confirm${referrer}`)
    }
  })

  // =============================================================================
  // Degrees
  // =============================================================================

  // Add a degree - sends you to index one greater than current number of degrees
  router.get(['/:recordtype/:uuid/degree/add','/:recordtype/degree/add'], function (req, res) {
    const data = req.session.data
    let degrees = _.get(data, "record.degree.items")
    let degreeCount = (degrees) ? degrees.length : 0
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    res.redirect(`${recordPath}/degree/${degreeCount}/type${referrer}`)
  })

  // Delete degree at index
  router.get(['/:recordtype/:uuid/degree/:index/delete','/:recordtype/degree/:index/delete'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    degreeIndex = req.params.index
    let referrer = utils.getReferrer(req.query.referrer)

    if (_.get(data, "record.degree.items[" + degreeIndex + "]")){
      _.pullAt(data.record.degree.items, [degreeIndex]) //delete item at index
      // Clear data if there are no more degrees - so the task list thinks the section is not started
      req.flash('success', 'Trainee degree deleted')
      // Delete degree section if it’s empty
      if (data.record.degree.items.length == 0){
        delete data?.record?.degree
      }
    }
    if (referrer){
      if (req.params.recordtype == 'record'){
        // This updates the record immediately without a confirmation.
        // Probably needs a bespoke confirmation page as the empty degree
        // confirmation page looks weird - and we probably don't want
        // records without a dregree anyway.
        utils.updateRecord(data, data.record)
      }
      res.redirect(utils.getReferrerDestination(req.query.referrer))
    }
    else {
      res.redirect(`${recordPath}/degree/confirm${referrer}`)
    }
  })

  // Forward degree requests to the right template, including the index
  router.get(['/:recordtype/:uuid/degree/:index/:page','/:recordtype/degree/:index/:page'], function (req, res) {
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    res.render(`${req.params.recordtype}/degree/${req.params.page}`, {itemIndex: req.params.index})
  })

  // Save degree data from temporary store
  router.post(['/:recordtype/:uuid/degree/:index/confirm','/:recordtype/degree/:index/confirm'], function (req, res) {
    const data = req.session.data
    let record = data.record
    let newDegree = data.degreeTemp
    delete data.degreeTemp
    let referrer = utils.getReferrer(req.query.referrer)

    newDegree.id = faker.datatype.uuid()

    let existingDegrees = _.get(data, "record.degree.items") || []
    let degreeIndex = req.params.index
    let recordPath = utils.getRecordPath(req)

    // This is so we can look up isInternational if already answered
    if (existingDegrees[degreeIndex]) {
      newDegree = Object.assign({}, existingDegrees[degreeIndex], newDegree)
    }

    // This is a hack because the autocomplete doesn’t pick the righ type 
    // in the select - so we defer to the autocomplete value instead
    let selectedTypeRawAutocomplete = req.body?._autocompleteRawValue_degreeTypeUK
    if (selectedTypeRawAutocomplete){
      newDegree.typeUK = selectedTypeRawAutocomplete
    }

    // Save the correct type
    if (newDegree.isInternational == "true" && newDegree.typeInt){
      newDegree.type = newDegree.typeInt
      delete newDegree.typeUK
      delete newDegree.typeInt
    }
    if (newDegree.isInternational == "false" && newDegree.typeUK){
      newDegree.type = newDegree.typeUK
      delete newDegree.typeUK
      delete newDegree.typeInt
    }

    // Degree grade is collected using a choice of radios or 'other'
    // if 'other', users can type a degree grade. These are submitted to two different
    // data items, which we now combine in to a single grade.
    if (newDegree.baseGrade){
      if (newDegree.baseGrade == "Other"){
        newDegree.grade = newDegree.otherGrade
        delete newDegree.baseGrade
        delete newDegree.otherGrade
      }
      else {
        newDegree.grade = newDegree.baseGrade
        delete newDegree.baseGrade
        delete newDegree.otherGrade
      }
    }

    if (existingDegrees[degreeIndex]) {
      // Might be a partial update, so merge the new with the old
      existingDegrees[degreeIndex] = Object.assign({}, existingDegrees[degreeIndex], newDegree)
    }
    else {
      existingDegrees.push(newDegree)
    }
    _.set(data, 'record.degree.items', existingDegrees)

    // if (existingDegrees?.length > 1){
    //   res.redirect(`${recordPath}/degree/bursary-selection${referrer}`)
    // }
    // else {
      if (utils.isDraft(record) && utils.sourceIsApply(record)){
        res.redirect(utils.orReferrer(`${recordPath}/overview`, req.query.referrer))
      }
      else res.redirect(`${recordPath}/degree/confirm${referrer}`)
    // }

  })

  // =============================================================================
  // Placements
  // =============================================================================
  
  // Record: Can they add placements? Sends them onwards or marks placements complete
  router.post(['/:recordtype/:uuid/placements/can-add-placement-answer','/:recordtype/placements/can-add-placement-answer'], function (req, res) {
    const data = req.session.data
    
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let record = data.record // copy record
    
    if (!record?.placement?.hasPlacements) {
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    }
    // Are they able to add placement details? (Shared on both draft and record)
    if (record.placement.hasPlacements == 'Yes'){
      // carry on and add one
      delete record?.placement.status
      res.redirect(`${recordPath}/placements/add${referrer}`)
    }
    // Record specific routes
    if (req.params.recordtype == 'record') {
      utils.updateRecord(data, record)

      if (record.placement.hasPlacements == 'Not yet'){
    
        // send them back to the record
        if (referrer){
          res.redirect(utils.getReferrerDestination(req.query.referrer))
        }
        else {
          res.redirect(`${recordPath}`)
        }
      }
    } 
    // Draft specific routes
    else if (req.params.recordtype != 'record') {
      if (record.placement.hasPlacements == 'Not yet') {
        
        // mark the Placements section as complete
        _.set(record,'placement.status',"Completed")
        
        // send them to the confirmation
        if (referrer){
          res.redirect(utils.getReferrerDestination(req.query.referrer))
        }
        else {
          res.redirect(`${recordPath}/overview`)
          // res.redirect(`${recordPath}/placements/confirm${referrer}`)
        }
      }
    }
    else {
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    }
    
  })

  // Add a placement - generate a UUID and send the user to it
  router.get(['/:recordtype/:uuid/placements/add','/:recordtype/placements/add'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    let placementUuid = faker.datatype.uuid()
    
    // delete data.placementTemp
    
    res.redirect(`${recordPath}/placements/${placementUuid}/details${referrer}`)
  }) 

  // Delete placement at a given UUID
  router.get(['/:recordtype/:uuid/placements/:placementUuid/delete','/:recordtype/placements/:placementUuid/delete'], function (req, res) {
    const data = req.session.data
    let recordPath = utils.getRecordPath(req)
    let placementUuid = req.params.placementUuid
    let referrer = utils.getReferrer(req.query.referrer)
    let placements = data.record?.placement?.items || []
    let placementIndex = placements.findIndex(placement => placement.id == placementUuid)
    let minPlacementsRequired = data.settings.minPlacementsRequired
    
    if (_.get(data, "record.placement.items[" + placementIndex + "]")){
      _.pullAt(data.record.placement.items, [placementIndex]) //delete item at index
      // Clear data if there are no more degrees - so the task list thinks the section is not started
      req.flash('success', 'Trainee placement deleted')
      
      // Delete degree section if it’s empty
      if (data.record.placement.items.length == 0){
        delete data.record.placement
      }
      // Ensure section can't be complete if less than required placements
      else if (data.record.placement.items.length < minPlacementsRequired) {
        delete data.record.placement.status
      }
    }
    if (req.params.recordtype == 'record'){
      // This updates the record immediately without a confirmation.
      // Probably needs a bespoke confirmation page as the empty placement
      // confirmation page looks weird - and we probably don't want
      // records without a placement anyway.
      utils.updateRecord(data, data.record)
    }
    if (!data.record?.placement){
      res.redirect(`${recordPath}/placements/can-add-placement${referrer}`)
    } 
    // else if (referrer){
    //   res.redirect(utils.getReferrerDestination(req.query.referrer))
    // }
    else {
      res.redirect(`${recordPath}/placements/confirm${referrer}`)
    }
  })

  // Forward placement requests to the right template, including the index
  router.get(['/:recordtype/:uuid/placements/:placementUuid/:page','/:recordtype/placements/:placementUuid/:page'], function (req, res) {
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    res.render(`${req.params.recordtype}/placements/${req.params.page}`, {placementUuid: req.params.placementUuid})
  })

  // Save placement data from temporary store
  router.post(['/:recordtype/:uuid/placements/:placementUuid/confirm','/:recordtype/placements/:placementUuid/confirm'], function (req, res) {
    const data = req.session.data
    let placement = data.placementTemp
    delete data.placementTemp
    let referrer = utils.getReferrer(req.query.referrer)
    let record = data.record
    
    let placementUuid = req.params.placementUuid
    let existingPlacements = record?.placement?.items || []
    let placementIndex = existingPlacements.findIndex(placement => placement.id == placementUuid)
    let recordPath = utils.getRecordPath(req)

    if (existingPlacements.length && existingPlacements[placementIndex]) {
      // Might be a partial update, so merge the new with the old
      existingPlacements[placementIndex] = Object.assign({}, existingPlacements[placementIndex], placement)
    }
    else {
      placement.id = placementUuid
      existingPlacements.push(placement)
    }

    delete record?.placement?.hasPlacements
    delete record?.placement?.placementsNotRequiredReason
    
    _.set(record, 'placement.items', existingPlacements)

    res.redirect(`${recordPath}/placements/confirm${referrer}`)
  })

  // =============================================================================
  // Funding
  // =============================================================================

  // Forward on to the appropriate finacne pages depending on what the route needs
  router.get(['/:recordtype/:uuid/funding','/:recordtype/funding'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    if (utils.canStartFundingSection(record)){
      res.redirect(`${recordPath}/funding/initiatives${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/funding/not-available${referrer}`)
    }

  })


  // Forward on to bursaries or confirm
  router.post(['/:recordtype/:uuid/funding/initiatives','/:recordtype/funding/initiatives'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)
    if (utils.financialSupportApplies(record)){
      res.redirect(`${recordPath}/funding/financial-support${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/funding/confirm${referrer}`)
    }
  })

  // Forward on to confirm
  // This route not really needed as we don't always catch errors like this
  router.post(['/:recordtype/:uuid/funding/financial-support','/:recordtype/funding/financial-support'], function (req, res) {
    let data = req.session.data
    let record = data.record
    let recordPath = utils.getRecordPath(req)
    let referrer = utils.getReferrer(req.query.referrer)

    // No data
    if (!record?.funding?.source){
      res.redirect(`${recordPath}/funding/financial-support${referrer}`)
    }
    else {
      res.redirect(`${recordPath}/funding/confirm${referrer}`)
    }
  })


}

module.exports = router => {
  // Render a page for each organisation UUID
  router.get('/reports/choose-trainee-records', (req, res) => {
    const data = req.session.data

    // Delete any previous data
    delete data.reports

    const formOption = data?.settings?.traineeExportQuestionStyle

    if (formOption === 'Two stage') {
      res.redirect('/reports/choose-trainee-records/year')
    } else {
      res.redirect('/reports/choose-trainee-records/year-group')
    }
  })

  // Render a page for each organisation UUID
  router.post('/reports/choose-trainee-records/year-answer', (req, res) => {
    const data = req.session.data

    const dateAnswer = data?.reports?.year

    // Skip following question about type of year
    if (dateAnswer === 'All years') {
      res.redirect('./statuses')
    } else if (dateAnswer) {
      // Answer expected to be current year or previous year
      res.redirect('./year-type')
    } else {
      // No answer given, return to page
      res.redirect('/reports/date')
    }
  })
}

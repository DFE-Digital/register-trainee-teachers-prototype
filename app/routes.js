//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/// ------------------------------------------------------------------------ ///
/// Flash messaging
/// ------------------------------------------------------------------------ ///
const flash = require('connect-flash')
router.use(flash())

/// ------------------------------------------------------------------------ ///
/// User authentication
/// ------------------------------------------------------------------------ ///
// TODO: Replace with Passport
const passport = {
  user: {
    id: '3faa7586-951b-495c-9999-e5fc4367b507',
    first_name: 'Colin',
    last_name: 'Chapman',
    email: 'colin.chapman@example.gov.uk'
  }
}

/// ------------------------------------------------------------------------ ///
/// Controller modules
/// ------------------------------------------------------------------------ ///
const documentationController = require('./controllers/documentation')
const feedbackController = require('./controllers/feedback')
const traineeController = require('./controllers/trainee')
const traineeOutcomeController = require('./controllers/traineeOutcome')
const traineeWithdrawalController = require('./controllers/traineeWithdrawal')

/// ------------------------------------------------------------------------ ///
/// Authentication middleware
/// ------------------------------------------------------------------------ ///
const checkIsAuthenticated = (req, res, next) => {
  // the signed in user
  req.session.passport = passport
  // the base URL for navigation
  res.locals.baseUrl = ''
  next()
}

/// ------------------------------------------------------------------------ ///
/// ALL ROUTES
/// ------------------------------------------------------------------------ ///
router.all('*', (req, res, next) => {
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.flash = req.flash('success') // pass through 'success' messages only
  next()
})

/// ------------------------------------------------------------------------ ///
/// HOMEPAGE ROUTE
/// ------------------------------------------------------------------------ ///
router.get('/', (req, res) => {
  res.redirect('/trainees/6a4c4cef-e15f-4a3b-8888-15629dbf8b20')
})

/// ------------------------------------------------------------------------ ///
/// Trainee routes
/// ------------------------------------------------------------------------ ///

router.get('/trainees/:traineeId', checkIsAuthenticated, traineeController.show)
router.get('/trainees/:traineeId/personal', checkIsAuthenticated, traineeController.personal)

/// ------------------------------------------------------------------------ ///
/// Trainee outcome routes
/// ------------------------------------------------------------------------ ///

router.get('/trainees/:traineeId/outcome/stop', checkIsAuthenticated, traineeOutcomeController.stop_get)

router.get('/trainees/:traineeId/outcome/when', checkIsAuthenticated, traineeOutcomeController.when_get)
router.post('/trainees/:traineeId/outcome/when', checkIsAuthenticated, traineeOutcomeController.when_post)

router.get('/trainees/:traineeId/outcome/check', checkIsAuthenticated, traineeOutcomeController.check_get)
router.post('/trainees/:traineeId/outcome/check', checkIsAuthenticated, traineeOutcomeController.check_post)

/// ------------------------------------------------------------------------ ///
/// Trainee withdrawal routes
/// ------------------------------------------------------------------------ ///

router.get('/trainees/:traineeId/withdraw', checkIsAuthenticated, traineeWithdrawalController.start_get)

router.get('/trainees/:traineeId/withdraw/when', checkIsAuthenticated, traineeWithdrawalController.when_get)
router.post('/trainees/:traineeId/withdraw/when', checkIsAuthenticated, traineeWithdrawalController.when_post)

router.get('/trainees/:traineeId/withdraw/who', checkIsAuthenticated, traineeWithdrawalController.who_get)
router.post('/trainees/:traineeId/withdraw/who', checkIsAuthenticated, traineeWithdrawalController.who_post)

router.get('/trainees/:traineeId/withdraw/why', checkIsAuthenticated, traineeWithdrawalController.why_get)
router.post('/trainees/:traineeId/withdraw/why', checkIsAuthenticated, traineeWithdrawalController.why_post)

router.get('/trainees/:traineeId/withdraw/interested', checkIsAuthenticated, traineeWithdrawalController.interested_get)
router.post('/trainees/:traineeId/withdraw/interested', checkIsAuthenticated, traineeWithdrawalController.interested_post)

router.get('/trainees/:traineeId/withdraw/check', checkIsAuthenticated, traineeWithdrawalController.check_get)
router.post('/trainees/:traineeId/withdraw/check', checkIsAuthenticated, traineeWithdrawalController.check_post)

/// ------------------------------------------------------------------------ ///
/// Documentation routes
/// ------------------------------------------------------------------------ ///

// API documentation routes (with wildcard for versioned pages)
router.get('/docs/api', documentationController.api_get)
router.get('/docs/api/*', documentationController.api_page_get)

// CSV documentation routes
router.get('/docs/csv', documentationController.csv_get)
router.get('/docs/csv/*', documentationController.csv_page_get)

// Reference data documentation routes
router.get('/docs/reference-data', documentationController.referenceData_get)
router.get('/docs/reference-data/*', documentationController.referenceData_page_get)

/// ------------------------------------------------------------------------ ///
/// FEEDBACK ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/feedback', feedbackController.newFeedback_get)
router.post('/feedback', feedbackController.newFeedback_post)

router.get('/feedback/check', feedbackController.newFeedbackCheck_get)
router.post('/feedback/check', feedbackController.newFeedbackCheck_post)

router.get('/feedback/confirmation', feedbackController.newFeedbackConfirmation_get)

/// ------------------------------------------------------------------------ ///
///
/// ------------------------------------------------------------------------ ///

module.exports = router

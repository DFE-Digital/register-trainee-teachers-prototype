//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

require('dotenv').config()

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const session = require('express-session')

/// ------------------------------------------------------------------------ ///
/// Session configuration
/// ------------------------------------------------------------------------ ///
router.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-insecure-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  })
)

/// ------------------------------------------------------------------------ ///
/// Flash messaging
/// ------------------------------------------------------------------------ ///
const flash = require('connect-flash')
router.use(flash())

/// ------------------------------------------------------------------------ ///
/// Passport authentication
/// ------------------------------------------------------------------------ ///
const passport = require('./config/passport')

router.use(passport.initialize())
router.use(passport.session())

/// ------------------------------------------------------------------------ ///
/// Controller modules
/// ------------------------------------------------------------------------ ///
const accountController = require('./controllers/account')
const authenticationController = require('./controllers/authentication')
const documentationController = require('./controllers/documentation')
const feedbackController = require('./controllers/feedback')
const traineeBulkUpdateController = require('./controllers/traineeBulkUpdate')
const traineeController = require('./controllers/trainee')
const traineeOutcomeController = require('./controllers/traineeOutcome')
const traineeWithdrawalController = require('./controllers/traineeWithdrawal')
const userController = require('./controllers/user')

/// ------------------------------------------------------------------------ ///
/// Middleware
/// ------------------------------------------------------------------------ ///
const { checkIsAuthenticated } = require('./middleware/auth')

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
/// AUTHENTICATION ROUTES
/// ------------------------------------------------------------------------ ///
router.get('/sign-in', (req, res) => {
  res.redirect('/auth/sign-in')
})
router.get('/auth/sign-in', authenticationController.signIn_get)
router.get('/auth/sign-in/email', authenticationController.signInEmail_get)
router.post('/auth/sign-in/email', authenticationController.signInEmail_post)
router.get('/auth/sign-in/password', authenticationController.signInPassword_get)
router.post('/auth/sign-in/password', authenticationController.signInPassword_post)
router.get('/auth/persona', authenticationController.persona_get)
router.post('/auth/persona', authenticationController.persona_post)
router.get('/auth/sign-out', authenticationController.signOut_get)

// Redirect /support/sign-out to new auth route for backwards compatibility
router.get('/sign-out', (req, res) => {
  res.redirect('/auth/sign-out')
})

/// ------------------------------------------------------------------------ ///
/// HOMEPAGE ROUTE
/// ------------------------------------------------------------------------ ///
router.get('/', (req, res) => {
  res.redirect('/trainees/registered')
})

router.get('/trainees/draft', checkIsAuthenticated, traineeController.draft)
router.get('/trainees/registered', checkIsAuthenticated, traineeController.registered)

router.get('/trainees/bulk', checkIsAuthenticated, traineeBulkUpdateController.show_get)

/// ------------------------------------------------------------------------ ///
/// Trainee routes
/// ------------------------------------------------------------------------ ///

router.get('/trainees/:traineeId', checkIsAuthenticated, traineeController.about)
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

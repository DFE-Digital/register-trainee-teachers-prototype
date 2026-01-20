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
const providerController = require('./controllers/provider')
const traineeBulkUpdateController = require('./controllers/traineeBulkUpdate')
const traineeController = require('./controllers/trainee')
const traineeOutcomeController = require('./controllers/traineeOutcome')
const traineeWithdrawalController = require('./controllers/traineeWithdrawal')
const userController = require('./controllers/user')

/// ------------------------------------------------------------------------ ///
/// Middleware
/// ------------------------------------------------------------------------ ///
const { checkIsAuthenticated, checkProviderAccess } = require('./middleware/auth')

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
  res.redirect('/providers')
})

router.get('/account-not-authorised', (req, res) => {
  res.render('errors/unauthorised')
})

/// ------------------------------------------------------------------------ ///
/// USER ROUTES
/// ------------------------------------------------------------------------ ///
router.get('/providers/:providerId/users/new', checkIsAuthenticated, userController.newUser_get)
router.post('/providers/:providerId/users/new', checkIsAuthenticated, userController.newUser_post)

router.get('/providers/:providerId/users/new/check', checkIsAuthenticated, userController.newUserCheck_get)
router.post('/providers/:providerId/users/new/check', checkIsAuthenticated, userController.newUserCheck_post)

router.get('/providers/:providerId/users/:userId/edit', checkIsAuthenticated, userController.editUser_get)
router.post('/providers/:providerId/users/:userId/edit', checkIsAuthenticated, userController.editUser_post)

router.get('/providers/:providerId/users/:userId/edit/check', checkIsAuthenticated, userController.editUserCheck_get)
router.post('/providers/:providerId/users/:userId/edit/check', checkIsAuthenticated, userController.editUserCheck_post)

router.get('/providers/:providerId/users/:userId/delete', checkIsAuthenticated, userController.deleteUser_get)
router.post('/providers/:providerId/users/:userId/delete', checkIsAuthenticated, userController.deleteUser_post)

router.get('/providers/:providerId/users/:userId', checkIsAuthenticated, userController.userDetails)

router.get('/providers/:providerId/users', checkIsAuthenticated, userController.usersList)

/// ------------------------------------------------------------------------ ///
/// MY ACCOUNT ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/account', checkIsAuthenticated, accountController.userAccount)

/// ------------------------------------------------------------------------ ///
/// Provider routes
/// ------------------------------------------------------------------------ ///
router.get('/providers', checkIsAuthenticated, providerController.list)
router.get('/providers/:providerId', checkIsAuthenticated, checkProviderAccess, providerController.home)

router.get('/providers/:providerId/trainees/draft', checkIsAuthenticated, checkProviderAccess, traineeController.draft)
router.get('/providers/:providerId/trainees/registered', checkIsAuthenticated, checkProviderAccess, traineeController.registered)

router.get('/providers/:providerId/trainees/bulk', checkIsAuthenticated, checkProviderAccess, traineeBulkUpdateController.show_get)

/// ------------------------------------------------------------------------ ///
/// Trainee routes
/// ------------------------------------------------------------------------ ///

router.get('/providers/:providerId/trainees/:traineeId', checkIsAuthenticated, checkProviderAccess, traineeController.about)
router.get('/providers/:providerId/trainees/:traineeId/personal', checkIsAuthenticated, checkProviderAccess, traineeController.personal)

/// ------------------------------------------------------------------------ ///
/// Trainee outcome routes
/// ------------------------------------------------------------------------ ///

router.get('/providers/:providerId/trainees/:traineeId/outcome/stop', checkIsAuthenticated, checkProviderAccess, traineeOutcomeController.stop_get)

router.get('/providers/:providerId/trainees/:traineeId/outcome/when', checkIsAuthenticated, checkProviderAccess, traineeOutcomeController.when_get)
router.post('/providers/:providerId/trainees/:traineeId/outcome/when', checkIsAuthenticated, checkProviderAccess, traineeOutcomeController.when_post)

router.get('/providers/:providerId/trainees/:traineeId/outcome/check', checkIsAuthenticated, checkProviderAccess, traineeOutcomeController.check_get)
router.post('/providers/:providerId/trainees/:traineeId/outcome/check', checkIsAuthenticated, checkProviderAccess, traineeOutcomeController.check_post)

/// ------------------------------------------------------------------------ ///
/// Trainee withdrawal routes
/// ------------------------------------------------------------------------ ///

router.get('/providers/:providerId/trainees/:traineeId/withdraw', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.start_get)

router.get('/providers/:providerId/trainees/:traineeId/withdraw/when', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.when_get)
router.post('/providers/:providerId/trainees/:traineeId/withdraw/when', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.when_post)

router.get('/providers/:providerId/trainees/:traineeId/withdraw/who', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.who_get)
router.post('/providers/:providerId/trainees/:traineeId/withdraw/who', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.who_post)

router.get('/providers/:providerId/trainees/:traineeId/withdraw/why', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.why_get)
router.post('/providers/:providerId/trainees/:traineeId/withdraw/why', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.why_post)

router.get('/providers/:providerId/trainees/:traineeId/withdraw/interested', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.interested_get)
router.post('/providers/:providerId/trainees/:traineeId/withdraw/interested', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.interested_post)

router.get('/providers/:providerId/trainees/:traineeId/withdraw/check', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.check_get)
router.post('/providers/:providerId/trainees/:traineeId/withdraw/check', checkIsAuthenticated, checkProviderAccess, traineeWithdrawalController.check_post)

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

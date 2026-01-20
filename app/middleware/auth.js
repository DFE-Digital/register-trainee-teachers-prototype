const checkIsAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (!req.user.isActive) {
      return res.redirect('/account-not-authorised')
    }

    // Set base URLs for navigation
    res.locals.baseUrl = `/providers/${req.params.providerId}`
    res.locals.supportBaseUrl = `/providers/${req.params.providerId}`
    // Make user available in templates
    res.locals.passport = {
      user: {
        id: req.user.id,
        first_name: req.user.firstName,
        last_name: req.user.lastName,
        email: req.user.email
      }
    }
    res.locals.currentUser = {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    }
    return next()
  }

  // Save the original URL to redirect after login
  req.session.returnTo = req.originalUrl
  res.redirect('/auth/sign-in')
}

module.exports = {
  checkIsAuthenticated
}

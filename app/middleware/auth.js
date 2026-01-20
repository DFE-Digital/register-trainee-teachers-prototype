const getUserProviders = async (user) => {
  if (!user || typeof user.getProviders !== 'function') {
    return []
  }

  return user.getProviders({
    where: { deletedAt: null },
    through: { where: { deletedAt: null } },
    joinTableAttributes: [],
    order: [['operatingName', 'ASC']]
  })
}

const checkIsAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Save the original URL to redirect after login
    req.session.returnTo = req.originalUrl
    return res.redirect('/auth/sign-in')
  }

  if (!req.user.isActive) {
    return res.redirect('/account-not-authorised')
  }

  try {
    const providers = await getUserProviders(req.user)
    req.userProviders = providers

    const defaultProvider = providers.length === 1 ? providers[0] : null

    // Set base URLs for navigation
    res.locals.baseUrl = defaultProvider ? `/providers/${defaultProvider.id}` : ''
    res.locals.supportBaseUrl = res.locals.baseUrl
    res.locals.userProviders = providers
    res.locals.providerCount = providers.length
    res.locals.hasMultipleProviders = providers.length > 1
    res.locals.currentProvider = defaultProvider

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
  } catch (error) {
    return next(error)
  }
}

const checkProviderAccess = async (req, res, next) => {
  const { providerId } = req.params

  if (!providerId) {
    return next()
  }

  try {
    const providers = req.userProviders || await getUserProviders(req.user)
    const currentProvider = providers.find((provider) => provider.id === providerId)

    if (!currentProvider) {
      return res.redirect('/account-not-authorised')
    }

    res.locals.currentProvider = currentProvider
    res.locals.baseUrl = `/providers/${providerId}`
    res.locals.supportBaseUrl = res.locals.baseUrl

    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  checkIsAuthenticated,
  checkProviderAccess
}

const getProviderViewModel = (provider) => {
  if (!provider) {
    return null
  }

  return {
    id: provider.id,
    operatingName: provider.operatingName,
    code: provider.code
  }
}

exports.list = async (req, res) => {
  const providers = (res.locals.userProviders || []).map(getProviderViewModel)

  if (!providers.length) {
    return res.redirect('/account-not-authorised')
  }

  if (providers.length === 1) {
    return res.redirect(`/providers/${providers[0].id}`)
  }

  res.render('providers/list', {
    providers
  })
}

exports.home = async (req, res) => {
  const provider = getProviderViewModel(res.locals.currentProvider)

  if (!provider) {
    return res.redirect('/account-not-authorised')
  }

  res.render('providers/home', {
    provider
  })
}

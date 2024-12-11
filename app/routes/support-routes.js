const path = require('path')
const utils = require('./../lib/utils')

// In function because this is too big to pass around in session
const getSchools = () => {
  return require('./../data/gis-schools.js')
}

// Work out which part of the site we came from
const getPageContext = req => {
  const myUrl = new URL(req.url, `http://${req.headers.host}`) // Include the host to construct a full URL
  const requestUrl = myUrl.pathname

  if (requestUrl.startsWith('/support/users')) {
    return 'users'
  } else if (requestUrl.startsWith('/support/organisations')) {
    return 'organisations'
  } else if (requestUrl.startsWith('/support/schools')) {
    return 'schools'
  } else {
    console.log(`Error with getContext: context (${requestUrl}) not recognised`)
  }
}

const breadcrumbsInitial = {
  items: [
    {
      text: 'Support home',
      href: '/support'
    }
  ]
}

module.exports = router => {
  // Render a page for each organisation UUID
  router.get('/support/users/:uuid', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const user = data.users.all.find(user => user.id === uuid)

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Users',
        href: '/support/users'
      }])
    }

    if (!user) res.redirect('/support/users')
    else {
      res.render('support/users/view', {
        user,
        uuid,
        breadcrumbs,
        userUrl: `/support/users/${uuid}`,
        navActive: 'users'
      })
    }
  })

  // Render a page for each organisation UUID
  router.post([
    '/support/users/:userUuid/organisations/:providerUuid/edit-answer',
    '/support/organisations/:providerUuid/users/:userUuid/edit-answer',
    '/support/schools/:schoolUuid/users/:userUuid/edit-answer'
  ], (req, res, next) => {
    const data = req.session.data
    const userUuid = req.params.userUuid
    const providerUuid = req.params.providerUuid
    const schoolUuid = req.params.schoolUuid

    const context = getPageContext(req)

    const access = data.userOrganisationTemp.access

    let targetUrl

    if (context === 'users') {
      targetUrl = `/support/users/${userUuid}/organisations/${providerUuid}`
    } else if (context === 'organisations') {
      targetUrl = `/support/organisations/${providerUuid}/users/${userUuid}`
    } else {
      targetUrl = `/support/schools/${schoolUuid}/users/${userUuid}`
    }

    if (access === 'Remove') {
      targetUrl = `${targetUrl}/confirm-remove`
    } else if (access === 'Delete') {
      targetUrl = `${targetUrl}/confirm-delete`
    } else {
      targetUrl = `${targetUrl}/confirm`
    }

    res.redirect(targetUrl)
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/users/:uuid/organisations/:providerUuid/:page*', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const page = req.params.page
    const providerUuid = req.params.providerUuid
    const provider = data.providers.all.find(provider => provider.id === providerUuid)

    const user = data.users.all.find(user => user.id === uuid)
    const userUrl = `/support/users/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Users',
        href: '/support/users'
      },
      {
        text: user.fullName,
        href: userUrl
      }])
    }

    // Use our own render as some templates live at /index.html

    const targetUrl = path.join('support/users/organisations', page, req.params[0])

    if (!user) {
      res.redirect('/support/users')
    } else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          userUrl,
          provider,
          breadcrumbs,
          navActive: 'users',
          returnLink: {
            text: 'Cancel',
            href: `/support/users/${uuid}`
          }
        }
      )
    }
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/users/:uuid/:page*', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const user = data.users.all.find(user => user.id === uuid)

    // Use our own render as some templates live at /index.html

    const userUrl = `/support/users/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Users',
        href: '/support/users'
      },
      {
        text: user.fullName,
        href: userUrl
      }])
    }

    const targetUrl = path.join('support/users', req.params.page, req.params[0])

    if (!user) {
      res.redirect('/support/users')
    } else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          userUrl,
          breadcrumbs,
          navActive: 'users',
          returnLink: {
            text: 'Cancel',
            href: `/support/users/${uuid}`
          }
        }
      )
    }
  })

  // Render a page for each organisation UUID
  router.get('/support/organisations/:uuid', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const provider = data.providers.all.find(provider => provider.id === uuid)

    const providerUrl = `/support/organisations/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Organisations',
        href: '/support/organisations'
      }])
    }

    if (!provider) {
      res.redirect('/support/organisations')
    } else {
      res.render('support/organisations/view', {
        provider,
        uuid,
        breadcrumbs,
        providerUrl,
        navActive: 'organisations'
      })
    }
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/organisations/:uuid/users/:userUuid/:page*', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const page = req.params.page
    const userUuid = req.params.userUuid
    const provider = data.providers.all.find(provider => provider.id === uuid)

    const user = data.users.all.find(user => user.id === userUuid)
    const providerUrl = `/support/organisations/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Organisations',
        href: '/support/organisations'
      },
      {
        text: provider.name,
        href: providerUrl
      }])
    }

    const targetUrl = path.join('support/organisations/users', page, req.params[0])

    if (!user) {
      res.redirect('/support/organisations')
    } else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          provider,
          providerUrl,
          breadcrumbs,
          navActive: 'organisations',
          returnLink: {
            text: 'Cancel',
            href: `/support/organisations/${uuid}`
          }
        }
      )
    }
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/organisations/:uuid/:page*', (req, res, next) => {
    const data = req.session.data
    const uuid = req.params.uuid
    const provider = data.providers.all.find(provider => provider.id === uuid)

    // Use our own render as some templates live at /index.html
    const providerUrl = `/support/organisations/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Organisations',
        href: '/support/organisations'
      },
      {
        text: provider.name,
        href: providerUrl
      }])
    }

    const targetUrl = path.join('support/organisations', req.params.page, req.params[0])

    if (!provider) {
      res.redirect('/support/organisations')
    } else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          provider,
          navActive: 'organisations',
          providerUrl,
          breadcrumbs,
          returnLink: {
            text: 'Cancel',
            href: `./../${uuid}`
          }
        }
      )
    }
  })

  // Render a page for each organisation UUID
  router.get('/support/schools', (req, res, next) => {
    const allSchools = getSchools()

    res.render('support/schools/index', {
      schools: allSchools,
      navActive: 'schools'
    })
  })

  // Render a page for each organisation UUID
  router.get('/support/schools/:uuid', (req, res, next) => {
    const uuid = req.params.uuid
    const schools = getSchools()
    const school = schools.find(school => school.uuid === uuid)
    const schoolUrl = `/support/schools/${uuid}`

    const breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: 'Schools',
        href: '/support/schools'
      }])
    }

    if (!school) {
      res.redirect('/support/schools')
    } else {
      res.render('support/schools/view', {
        school,
        schoolUrl,
        breadcrumbs,
        uuid,
        navActive: 'schools'
      })
    }
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/schools/:uuid/:page*', (req, res, next) => {
    const uuid = req.params.uuid
    const schools = getSchools()
    const school = schools.find(school => school.uuid === uuid)
    const schoolUrl = `/support/schools/${uuid}`
    const targetUrl = path.join('support/schools', req.params.page, req.params[0])

    if (!school) {
      res.redirect('/support/schools')
    } else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          school,
          schoolUrl,
          navActive: 'schools',
          returnLink: {
            text: 'Cancel',
            href: `./../${uuid}`
          }
        }
      )
    }
  })

  // Catch funding route within support
  router.get('/support/funding/', (req, res) => {
    res.redirect(
      '/support/funding/index'
    )
  })
}

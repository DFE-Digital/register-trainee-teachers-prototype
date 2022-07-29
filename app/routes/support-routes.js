const _ = require('lodash')
const filters = require('./../filters.js')()
const moment = require('moment')
const path = require('path')
const seedRandom = require('seedrandom')
const url = require('url')
const utils = require('./../lib/utils')
const weighted = require('weighted')
const { faker } = require('@faker-js/faker')

// In function because this is too big to pass around in session
const getSchools = () => {
  return require('./../data/gis-schools.js')
}

// Work out which part of the site we came from
const getPageContext = req => {
  let requestUrl = url.parse(req.url).pathname

  if (requestUrl.startsWith('/support/users')) {
    return 'users'
  }
  else if (requestUrl.startsWith('/support/organisations')) {
    return 'organisations'
  }
  else if (requestUrl.startsWith('/support/schools')) {
    return 'schools'
  }
  else {
    console.log(`Error with getContext: context (${requestUrl}) not recognised`)
  }
}

let breadcrumbsInitial = {
  items: [
    {
      text: "Support home",
      href: "/support"
    }
  ]
}

module.exports = router => {

  // Render a page for each organisation UUID
  router.get('/support/users/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let user = data.users.all.find(user => user.id == uuid)

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Users",
        href: "/support/users"
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
    '/support/schools/:schoolUuid/users/:userUuid/edit-answer',
    ], function(req, res, next) {

    const data = req.session.data
    let userUuid = req.params.userUuid
    let providerUuid = req.params.providerUuid
    let schoolUuid = req.params.schoolUuid

    // let user = data.users.all.find(user => user.id == userUuid)
    let userUrl = `/support/users/${userUuid}`

    // let provider = data.providers.all.find(provider => provider.id == providerUuid)
    let providerUrl = `/support/organisations/${providerUuid}`


    let context = getPageContext(req)

    let access = data.userOrganisationTemp.access


    let targetUrl

    if (context == 'users'){
      targetUrl = `/support/users/${userUuid}/organisations/${providerUuid}`
    }
    else if (context =='organisations'){
      targetUrl = `/support/organisations/${providerUuid}/users/${userUuid}`
    }
    else {
      targetUrl = `/support/schools/${schoolUuid}/users/${userUuid}`
    }

    if (access == "Remove"){
      targetUrl = `${targetUrl}/confirm-remove`
    }
    else if (access == "Archive"){
      targetUrl = `${targetUrl}/confirm-archive`
    }
    else {
      targetUrl = `${targetUrl}/confirm`
    }

    res.redirect(targetUrl)

  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/users/:uuid/organisations/:providerUuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let page = req.params.page
    let providerUuid = req.params.providerUuid
    let provider = data.providers.all.find(provider => provider.id == providerUuid)

    let user = data.users.all.find(user => user.id == uuid)
    let userUrl = `/support/users/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Users",
        href: "/support/users"
      },
      {
        text: user.fullName,
        href: userUrl
      }])
    }

    // Use our own render as some templates live at /index.html

    let targetUrl = path.join('support/users/organisations', page, req.params[0])

    if (!user) res.redirect('/support/users')
    else {
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
  router.get('/support/users/:uuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let user = data.users.all.find(user => user.id == uuid)

    // Use our own render as some templates live at /index.html

    let userUrl = `/support/users/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Users",
        href: "/support/users"
      },
      {
        text: user.fullName,
        href: userUrl
      }])
    }

    let targetUrl = path.join('support/users', req.params.page, req.params[0])

    if (!user) res.redirect('/support/users')
    else {
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
  router.get('/support/organisations/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let provider = data.providers.all.find(provider => provider.id == uuid)

    let providerUrl = `/support/organisations/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Organisations",
        href: "/support/organisations"
      }])
    }

    if (!provider) res.redirect('/support/organisations')
    else {
      res.render('support/organisations/view', {
        provider,
        uuid,
        breadcrumbs,
        navActive: 'organisations',
        providerUrl,
        navActive: 'organisations'
      })
    }
    
  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/organisations/:uuid/users/:userUuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let page = req.params.page
    let userUuid = req.params.userUuid
    let provider = data.providers.all.find(provider => provider.id == uuid)

    let user = data.users.all.find(user => user.id == userUuid)
    let providerUrl = `/support/organisations/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Organisations",
        href: "/support/organisations"
      },
      {
        text: provider.name,
        href: providerUrl
      }])
    }

    let targetUrl = path.join('support/organisations/users', page, req.params[0])

    if (!user) res.redirect('/support/organisations')
    else {
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
  router.get('/support/organisations/:uuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let provider = data.providers.all.find(provider => provider.id == uuid)
    
    // Use our own render as some templates live at /index.html
    let providerUrl = `/support/organisations/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Organisations",
        href: "/support/organisations"
      },
      {
        text: provider.name,
        href: providerUrl
      }])
    }

    let targetUrl = path.join('support/organisations', req.params.page, req.params[0])

    if (!provider) res.redirect('/support/organisations')
    else {
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
  router.get('/support/schools', function(req, res, next) {
    const data = req.session.data

    const allSchools = getSchools()

    // const first100Schools = allSchools.slice(0, 100)
    
    res.render('support/schools/index', {
      schools: allSchools,
      navActive: 'schools'
    })
    

  })

  // Render a page for each organisation UUID
  router.get('/support/schools/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid

    const schools = getSchools()

    let school = schools.find(school => school.uuid == uuid)

    let schoolUrl = `/support/schools/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Schools",
        href: "/support/schools"
      }])
    }

    if (!school) res.redirect('/support/schools')
    else {
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
  router.get('/support/schools/:uuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid

    const schools = getSchools()
    let school = schools.find(school => school.uuid == uuid)

    let schoolUrl = `/support/schools/${uuid}`

    let breadcrumbs = {
      items: breadcrumbsInitial.items.concat([{
        text: "Schools",
        href: "/support/schools"
      },
      {
        text: school.name,
        href: schoolUrl
      }])
    }

    let targetUrl = path.join('support/schools', req.params.page, req.params[0])

    if (!school) res.redirect('/support/schools')
    else {
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

}

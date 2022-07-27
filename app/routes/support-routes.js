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

module.exports = router => {

  // Render a page for each organisation UUID
  router.get('/support/users/:uuid', function(req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let user = data.users.all.find(user => user.id == uuid)

    if (!user) res.redirect('/support/users')
    else {
      res.render('support/users/view', {
        user,
        uuid,
        userUrl: `/support/users/${uuid}`,
        navActive: 'users'
      })
    }

  })

  // Render organisation pages, passing along the organisation UUID
  router.get('/support/users/:uuid/organisations/:providerUuid/:page*', function (req, res, next) {
    const data = req.session.data
    let uuid = req.params.uuid
    let page = req.params.page
    let providerUuid = req.params.providerUuid
    let provider = data.providers.all.find(provider => provider.id == providerUuid)

    let user = data.users.all.find(user => user.id == uuid)

    // Use our own render as some templates live at /index.html

    let targetUrl = path.join('support/users/organisations', page, req.params[0])

    if (!user) res.redirect('/support/users')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          userUrl: `/support/users/${uuid}`,
          provider,
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

    let targetUrl = path.join('support/users', req.params.page, req.params[0])

    if (!user) res.redirect('/support/users')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          userUrl: `/support/users/${uuid}`,
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

    if (!provider) res.redirect('/support/organisations')
    else {
      res.render('support/organisations/view', {
        provider,
        uuid,
        navActive: 'organisations',
        providerUrl: `/support/organisations/${uuid}`,
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

    // Use our own render as some templates live at /index.html

    let targetUrl = path.join('support/organisations/users', page, req.params[0])

    if (!user) res.redirect('/support/organisations')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          user,
          userUrl: `/support/organisations/${uuid}`,
          provider,
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

    let targetUrl = path.join('support/organisations', req.params.page, req.params[0])

    if (!provider) res.redirect('/support/organisations')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          provider,
          navActive: 'organisations',
          providerUrl: `/support/organisations/${uuid}`,
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

    console.log(schools[1])

    let school = schools.find(school => school.uuid == uuid)

    if (!school) res.redirect('/support/schools')
    else {
      res.render('support/schools/view', {
        school,
        schoolUrl: `/support/schools/${uuid}`,
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

    // Use our own render as some templates live at /index.html

    let targetUrl = path.join('support/schools', req.params.page, req.params[0])

    if (!school) res.redirect('/support/schools')
    else {
      utils.render(
        targetUrl, res, next, {
          uuid,
          school,
          schoolUrl: `/support/schools/${uuid}`,
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

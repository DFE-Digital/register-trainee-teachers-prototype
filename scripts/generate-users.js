// To generate new users:
// $ node scripts/generate-users.js


const fs            = require('fs')
const path          = require('path')
const { faker }     = require('@faker-js/faker')
faker.locale        = 'en_GB'
const weighted      = require('weighted')
const moment        = require('moment')
const _             = require('lodash')
const utils         = require('../app/lib/utils.js')
const userFilters   = require('../app/filters/users.js').filters
const permissions   = require('../app/data/permissions.js')

let providers = {}

// Combine the two provider files together
// todo: should a single file provide these? the same code exists in session data defaults
providers.accreditingProviders    = require('../app/data/accrediting-providers')
providers.leadSchools = require('../app/data/lead-schools')
providers.all = providers.accreditingProviders.all.concat(providers.leadSchools.selected)
providers.selected = providers.accreditingProviders.selected.concat(providers.leadSchools.selected)


// Create a single user
const generateUser = (provider, role='team member') => {

  if (!provider) console.log("Error in generateUser: provider missing")

  let user = {}

  user.id = faker.datatype.uuid()
  let firstName = faker.name.firstName()
  let familyName = faker.name.lastName()
  user.fullName = `${firstName} ${familyName}`

  let emailDomain = userFilters.makeFakeSchoolDomain(provider.name)
  user.email = `${firstName}.${familyName}@${emailDomain}`.toLowerCase()

  // Shuffle the possible permissions - used so that we can pick the first n and to get some selected randomly
  let shuffledPermissions = faker.helpers.shuffle(permissions.allUserPermissions[provider.type])
  
  let userPermissions = []

  // Team members have a varied number of permissions
  if (role == 'team member'){
    // How many permissions should we have
    let targetCountOfPermissions = utils.getRandomArbitrary(1, shuffledPermissions.length + 1)
    // Assign those permissions
    userPermissions = shuffledPermissions.slice(0, Math.min(shuffledPermissions.length, targetCountOfPermissions))
  }
  // Admins have all permissions
  else if (role == 'team admin'){
    // Team admins have all permissions plus the ability to manage team members
    userPermissions = ['manage team members', ...shuffledPermissions]
  }

  // Sort the permissions logically
  userPermissions = userFilters.sortPermissions(userPermissions)

  provider.access = {
    role,
    permissions: userPermissions
  }

  user.providers = [provider]

  return user
}

const generateFakeUsers = () => {
  let users = []

  providers.selected.forEach(provider => {

    let isAccrediting = provider.type == "accreditingProvider"
    // Create between 2 and 10 users per provider
    let numberOfUsersToCreate = utils.getRandomArbitrary(2, (isAccrediting)? 10 : 3)

    Array(numberOfUsersToCreate).fill().map((item, index) => {
      // First user always a team admin. After that, 20% chance.
      let role = "team admin"
      if (index != 0) {
        role = weighted.select(['team admin', 'team member'], [0.2,0.8])
      }
      let user = generateUser(provider, role)

      users.push(user)
    })

  })

  return users
}

/**
 * Generate JSON file
 *
 * @param {String} filePath Location of generated file
 * @param {String} count Number of courses to generate
 *
 */
const generateUsersFile = (filePath) => {
  const users = generateFakeUsers()

  console.log(`Generated ${users.length} fake users`)

  const filedata = JSON.stringify(users, null, 2)
  fs.writeFile(
    filePath,
    filedata,
    (error) => {
      if (error) {
        console.error(error)
      }
      // console.log(`Course data generated: ${filePath}`)
    }
  )
}

generateUsersFile(path.join(__dirname, '../app/data/users.json'))

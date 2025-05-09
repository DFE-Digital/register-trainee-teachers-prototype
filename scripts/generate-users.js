// To generate new users:
// $ node scripts/generate-users.js

const fs = require('fs')
const path = require('path')
const { fakerUK: faker } = require('@faker-js/faker')
const weighted = require('weighted')
const utils = require('../app/lib/utils.js')
const userFilters = require('../app/filters/users.js').filters
const permissions = require('../app/data/permissions.js')

const providers = {}

// Combine the two provider files together
// todo: should a single file provide these? the same code exists in session data defaults
providers.accreditingProviders = require('../app/data/accrediting-providers')
providers.leadPartners = require('../app/data/lead-schools')
providers.all = providers.accreditingProviders.all.concat(providers.leadPartners.selected)
providers.selected = providers.accreditingProviders.selected.concat(providers.leadPartners.selected)

// Create a single user
const generateUser = (provider, role = 'team member') => {
  if (!provider) console.log('Error in generateUser: provider missing')

  const user = {}

  user.id = faker.string.uuid()
  const firstName = faker.person.firstName()
  const familyName = faker.person.lastName()
  user.fullName = `${firstName} ${familyName}`

  const emailDomain = userFilters.makeFakeSchoolDomain(provider.name)
  user.email = `${firstName}.${familyName}@${emailDomain}`.toLowerCase()

  // Shuffle the possible permissions - used so that we can pick the first n and to get some selected randomly
  const shuffledPermissions = faker.helpers.shuffle(permissions.allUserPermissions[provider.type])

  let userPermissions = []

  // Team members have a varied number of permissions
  if (role === 'team member') {
    // How many permissions should we have
    const targetCountOfPermissions = utils.getRandomArbitrary(1, shuffledPermissions.length + 1)
    // Assign those permissions
    userPermissions = shuffledPermissions.slice(0, Math.min(shuffledPermissions.length, targetCountOfPermissions))
  } else if (role === 'team admin') {
    // Admins have all permissions
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
  const users = []

  providers.selected.forEach(provider => {
    const isAccrediting = provider.type === 'accreditingProvider'
    // Create between 2 and 10 users per provider
    const numberOfUsersToCreate = utils.getRandomArbitrary(2, (isAccrediting) ? 10 : 3)

    Array(numberOfUsersToCreate).fill().forEach((_, index) => {
      // First user always a team admin. After that, 20% chance.
      let role = 'team admin'
      if (index !== 0) {
        role = weighted.select(['team admin', 'team member'], [0.2, 0.8])
      }
      const user = generateUser(provider, role)

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

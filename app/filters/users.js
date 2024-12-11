const permissions = require('../data/permissions.js')

// Leave this filters line
const filters = {}

// Return an array of users that belong to the current signed in provider
filters.getProviderUsers = (data) => {
  data = data || this?.ctx?.data || false

  const currentProvider = data.settings.userActiveProvider

  const providerUsers = data.users.byProvider?.[currentProvider]

  return providerUsers
}

// Generate a user’s email address
// Input: { data, user: {fullName}, provider}
filters.getUserEmail = (params) => {
  const data = params.data || this?.ctx?.data || false
  const user = params.user || data.settings.defaultUser
  const activeProvider = params.provider || data?.settings?.userActiveProvider
  return `${user.fullName.split(' ').join('.')}@${filters.makeFakeSchoolDomain(activeProvider)}`.toLowerCase()
}

// User a provider’s name to generate a somewhat realistic domain name
filters.makeFakeSchoolDomain = (input, additionalWords = [], tld = 'ac.uk') => {
  // Default words to strip out
  const defaultWords = [
    'academy',
    'college',
    'for boys',
    'for girls',
    'grammar',
    'hei',
    'scitt', // should come before itt
    'itt',
    'of ',
    'school',
    'the ',
    'university'
  ]

  // Combine default words and additional words
  const wordsToRemove = defaultWords.concat(additionalWords)

  // Normalize input
  let output = input.toLowerCase()

  // Remove specified words and phrases
  wordsToRemove.forEach(word => {
    const wordPattern = new RegExp(`\\b${word}\\b`, 'gi') // Match whole words
    output = output.replace(wordPattern, '')
  })

  // Remove punctuation and split into words
  const cleanedWords = output
    .replace(/[.,'’/#!$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
    .trim()
    .split(/\s+/) // Split by whitespace
    .filter(Boolean) // Remove empty parts

  // If only one word remains, append 'school'
  if (cleanedWords.length === 1) {
    cleanedWords.push('school')
  }

  // Join words with hyphens
  const domainName = cleanedWords.join('-')

  // Return the final domain
  return `${domainName}.${tld}`
}

// Accrediting provider admins have the most permissions
const allPossiblePermissions = permissions.allAdminPermissions.accreditingProvider

// Take a user’s urrent permissions and sort them by a predefined order
filters.sortPermissions = array => array.sort((a, b) => allPossiblePermissions.indexOf(a) - allPossiblePermissions.indexOf(b))

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

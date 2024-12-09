// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const string = require('string')
const _ = require('lodash')
const { marked } = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')

// Leave this filters line
const filters = {}

// Create url / slugs from text
// This is a heading => this-is-a-heading
filters.slugify = (input) => {
  if (!input) throw 'Error in slugify: no input', input
  else return string(input).slugify().toString()
}

// Split a string using a separator
filters.split = (string, separator) => {
  if (!string || typeof string !== 'string') return
  else return string.split(separator)
}

// Hyphen separate a string
// This is a string => this-is-a-string
filters.kebabCase = (string) => {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
}

// Sentence case - uppercase first latter
filters.sentenceCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)) {
    return input.charAt(0).toUpperCase() + input.slice(1)
  } else return input
}

filters.startLowerCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)) {
    return input.charAt(0).toLowerCase() + input.slice(1)
  } else return input
}

// Is it a string or not?
filters.isString = str => {
  const isString = _.isString(str)
  return _.isString(str)
}

// Assessment only => an Assesment only
// Provider-led => a provider led
filters.prependWithAOrAn = string => {
  const vowelRegex = '^[aieouAIEOU].*'
  const matched = string.match(vowelRegex)
  if (matched) {
    return `an ${string}`
  } else {
    return `a ${string}`
  }
}

// Format a number as £x,xxx
filters.currency = input => {
  const inputAsInt = parseInt(input, 10)
  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  if (inputAsInt > 0) { return `£${numberWithCommas(inputAsInt)}` }

  // makes negative number positive and puts minus sign in front of £
  else if (inputAsInt < 0) { return `–£${numberWithCommas(inputAsInt * -1)}` } else return '–'
}

// Format a number as £xxxx
filters.currencyForCsv = input => {
  const inputAsInt = parseInt(input, 10)
  if (inputAsInt > 0) { return `£${inputAsInt}` }

  // makes negative number positive and puts minus sign in front of £
  else if (inputAsInt < 0) { return `-£${inputAsInt * -1}` } else return 0
}

// Emulate support for string literals in Nunjucks
// Usage:
// {{ 'The count is ${count}' | stringLiteral }}
filters.stringLiteral = function (str) {
  return (new Function('with (this) { return `' + str + '` }')).call(this.ctx)
}

// Format text using markdown
// Documentation at https://marked.js.org/
filters.markdown = (markdown) => {
  if (!markdown) {
    console.log('Error with markdown: no input given')
    return null
  }

  marked.use(gfmHeadingId())

  const text = markdown.replace(/\\r/g, '\n').replace(/\\t/g, ' ')
  const html = marked.parse(text)

  // Add govuk-* classes
  let govukHtml = html.replace(/<p>/g, '<p class="govuk-body">')
  govukHtml = govukHtml.replace(/<ol>/g, '<ol class="govuk-list govuk-list--number">')
  govukHtml = govukHtml.replace(/<ul>/g, '<ul class="govuk-list govuk-list--bullet">')
  govukHtml = govukHtml.replace(/<h2/g, '<h2 class="govuk-heading-l"')
  govukHtml = govukHtml.replace(/<h3/g, '<h3 class="govuk-heading-m"')
  govukHtml = govukHtml.replace(/<h4/g, '<h4 class="govuk-heading-s"')

  return govukHtml
}

// Checks if a string starts with something
filters.startsWith = (string, target) => {
  if (typeof string === 'string') {
    return string.startsWith(target)
  } else {
    return false
  }
}

// Make a string possessive
// {{ "James Joyce" | possessive }}
//     James Joyce’s
// {{ "Joyce James" | possessive }}
//     Joyce James’
// {{ "JAMES JOYCE" | possessive }}
//     JAMES JOYCE’S
// {{ "Joyce James" | possessive }}
//     JOYCE JAMES’

filters.possessive = (noun) => {
  if (typeof noun !== 'string' || noun.length === 0) return ''

  const isAllUpperCase = (input) => {
    return input === input.toUpperCase()
  }

  const lastLetterOfNoun = noun.split('').slice(-1)
  if (lastLetterOfNoun === 's' || lastLetterOfNoun === 'S') {
    return noun + '’'
  } else if (isAllUpperCase(noun)) {
    return noun + '’S'
  } else if (!isAllUpperCase(noun)) {
    return noun + '’s'
  } else {
    console.log('Error with possessive filter')
  }
}

filters.padDigits = (input, targetLength) => {
  return input.toString().padStart(targetLength, 0)
}

// Return string wrapped in a nowrap class.
filters.nowrap = (input) => {
  return `<span class="app-nowrap">${input}</span>`
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const string = require('string')
const _ = require('lodash');
const { marked } = require('marked')
const GovukHTMLRenderer = require('govuk-markdown')
// Leave this filters line
var filters = {}


// Create url / slugs from text
// This is a heading => this-is-a-heading
filters.slugify = (input) => {
  if (!input) throw "Error in slugify: no input", input;
  else return string(input).slugify().toString();
}

// Split a string using a separator
filters.split = (string, separator) => {
  if (!string || typeof string != "string") return
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
  if (_.isString(input)){
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
  else return input
}

filters.startLowerCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)){
    return input.charAt(0).toLowerCase() + input.slice(1);
  }
  else return input
}

// Is it a string or not?
filters.isString = str => {
  let isString = _.isString(str)
  return _.isString(str)
}

// Assessment only => an Assesment only
// Provider-led => a provider led
filters.prependWithAOrAn = string => {
  var vowelRegex = '^[aieouAIEOU].*'
  var matched = string.match(vowelRegex)
  if(matched){
    return `an ${string}`
  }
  else{
    return `a ${string}`
  }
}

// Format a number as £x,xxx
filters.currency = input => {
  let inputAsInt = parseInt(input, 10)
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  if ( inputAsInt > 0 ) { return `£${numberWithCommas(inputAsInt)}` }

  // makes negative number positive and puts minus sign in front of £
  else if ( inputAsInt < 0 ) { return `–£${numberWithCommas(inputAsInt * -1 )}` }
  else return '–'
}

// Format a number as £xxxx
filters.currencyForCsv = input => {
  let inputAsInt = parseInt(input, 10)
  if ( inputAsInt > 0 ) { return `£${inputAsInt}` }

  // makes negative number positive and puts minus sign in front of £
  else if ( inputAsInt < 0 ) { return `-£${inputAsInt * -1 }` }
  else return 0
}

// Emulate support for string literals in Nunjucks
// Usage:
// {{ 'The count is ${count}' | stringLiteral }}
filters.stringLiteral = function(str) {
  return (new Function('with (this) { return `' + str + '` }')).call(this.ctx)
}

// Format text using markdown
// Documentation at https://marked.js.org/
filters.markdown = (input, params = {}) => {

  marked.setOptions({
    renderer: new GovukHTMLRenderer(),
    headerIds: true,
    headingsStartWith: params.headingsStartWith ?? 'xl',
    smartypants: true
  })

  // Offset headings - useful where embedded content
  // needs to start at h2 rather than h1
  // https://marked.js.org/using_pro#walk-tokens
  let headingOffset = params.headingOffset ?? 0
  const walkTokens = (token) => {
    if (token.type === 'heading') {
      token.depth += headingOffset;
    }
  }

  marked.use({ walkTokens })

  if (input) return marked(input)
  else {
    console.log("Error with markdown: no input given")
  }
}

// Checks if a string starts with something
filters.startsWith = (string, target) => {
  if (typeof string == "string"){
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
  if (typeof noun !== 'string' || noun.length == 0) return ""

  const isAllUpperCase = (input) => {
    return input == input.toUpperCase()
  }

  const lastLetterOfNoun = noun.split('').slice(-1)
  if (lastLetterOfNoun == "s" || lastLetterOfNoun == "S") {
    return noun + "’"
  } else if (isAllUpperCase(noun)) {
    return noun + "’S"
  } else if (! isAllUpperCase(noun)) {
    return noun + "’s"
  } else {
    console.log("Error with possessive filter")
  }
}

filters.padDigits = (input, targetLength) => {
  return input.toString().padStart(targetLength, 0);
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

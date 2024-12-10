// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
let filters = {}

// Utils has a bunch of shared functions used by filters and routes
const utils = require('./../lib/utils')

// expose general utils as filters
filters = utils

// Log to terminal
filters.debug = (item) => {
  console.log('Debug', item)
  return item
}

// Expose all of lodash
filters.lodash = function (test, name, ...args) {
  return _[name](test, ...args)
}

// Adds an index for each object in array
filters.addIndexCount = array => {
  array.forEach((item, index) => {
    item.index = index
  })
  return array
}

// Search for an id in arrays
filters.getById = (items, id) => {
  return items.find(item => item.id === id)
}

// General purpose search in arrays
filters.find = (items, key, value) => {
  return items.find(item => item[key] === value)
}

// Decorate attributes
// Add name, value, id, idPrefix and checked attributes to GOVUK form components
// Generate the attributes based on the application ID and the section they’re in

// Copied from Apply, but modified to work with data directly

/* Usage:
{{ govukCheckboxes({
  fieldset: {
    legend: {
      text: "Nationality",
      classes: "govuk-fieldset__legend--s"
    }
  },
  items: [
    {
      text: "British"
    },
    {
      text: "Irish"
    },
    {
      text: "Other"
    }
  ]
} | decorateAttributes(data, "data.nationality"))}}

Will populate name and id, and add value and checked for each item
*/
filters.decorateAttributes = (originalObject, data, value) => {
  const obj = _.cloneDeep(originalObject)

  // Map dot or bracket notation to path parts
  const pathParts = _.toPath(value)
  // Path parts includes the string name of data, which we don't need
  const storedValue = _.get(data, [...pathParts].splice(1))

  // Strip data from path as autodata store auto-adds it.
  if (pathParts[0] === 'data') {
    pathParts.shift(1)
  }

  if (obj.items !== undefined) {
    obj.items = obj.items.map(item => {
      if (item.divider) return item

      let checked = storedValue ? '' : item.checked
      let selected = storedValue ? '' : item.selected
      if (typeof item.value === 'undefined') {
        item.value = item.text
      }

      // If data is an array, check it exists in the array
      if (Array.isArray(storedValue)) {
        if (storedValue.indexOf(item.value) !== -1) {
          checked = 'checked'
          selected = 'selected'
        }
      } else {
        // The data is just a simple value, check it matches
        if (storedValue === item.value) {
          checked = 'checked'
          selected = 'selected'
        }
      }

      item.checked = (item.checked !== undefined) ? item.checked : checked
      item.selected = (item.selected !== undefined) ? item.selected : selected
      return item
    })

    obj.idPrefix = (obj.idPrefix) ? obj.idPrefix : pathParts.join('-')
  } else {
    // Check for undefined because the value may exist and be intentionally blank
    if (typeof obj.value === 'undefined') {
      obj.value = storedValue
    }
  }
  obj.id = (obj.id) ? obj.id : pathParts.join('-')
  obj.name = (obj.name) ? obj.name : pathParts.map(s => `[${s}]`).join('')
  return obj
}

// Return first x items of array / string
filters.limitTo = (input, limit) => {
  if (typeof limit !== 'number') {
    limit = parseInt(limit) // assume limit is a string of a number
  }

  if (typeof input === 'string') {
    if (limit >= 0) {
      return input.substring(0, limit)
    } else {
      return input.substr(limit)
    }
  }
  if (Array.isArray(input)) {
    limit = Math.min(limit, input.length)
    if (limit >= 0) {
      return input.slice(0, limit)
    } else {
      return input.slice(input.length + limit, input.length)
    }
  }
  return input
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

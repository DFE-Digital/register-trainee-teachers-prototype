const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

const fs = require('fs')
const path = require('path')
const individualFiltersFolder = path.join(__dirname, './filters')

const filters = {}

// Import filters from filters folder
if (fs.existsSync(individualFiltersFolder)) {
  const files = fs.readdirSync(individualFiltersFolder)
  files.forEach(file => {
    const fileData = require(path.join(individualFiltersFolder, file))
    // Loop through each exported function in file (likely just one)
    Object.keys(fileData).forEach((filterGroup) => {
      // Get each method from the file
      Object.keys(fileData[filterGroup]).forEach(filterName => {
        filters[filterName] = fileData[filterGroup][filterName]
      })
    })
  })
}

filters.selected = function (dataKey, selectWhenMatchesValue) {
  if (this.ctx.data === undefined) {
    return ''
  }

  const dataValue = this.ctx.data[dataKey]

  if (dataValue === undefined && selectWhenMatchesValue === '') {
    return 'selected'
  }

  if (dataValue === selectWhenMatchesValue) {
    return 'selected'
  }
}

filters.dateStringFromData = function (dataKey) {
  if (this.ctx.data === undefined) {
    return ''
  }
  const day = this.ctx.data[dataKey + '-day']
  const month = this.ctx.data[dataKey + '-month']
  const year = this.ctx.data[dataKey + '-year']
  const filtered = [day, month, year].filter(function (element) {
    return element && element !== ''
  })
  return filtered.join('/')
}

filters.compact = function (arr) {
  return arr.filter(function (element) {
    return element && element !== ''
  })
}

filters.tick = function (value) {
  if (value && value !== '') {
    return '<span class="summary-validation-symbol summary-validation-symbol--valid">&check;</span>'
  } else {
    return '<span class="summary-validation-symbol summary-validation-symbol--invalid">&#x274C;</span>'
  }
}

/* ------------------------------------------------------------------
  keep the following line to return your filters to the app
------------------------------------------------------------------ */

for (let filterName of Object.keys(filters)) {
  addFilter(filterName, filters[filterName])
}

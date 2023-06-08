// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
var CSV = require('csv-string')
const _ = require('lodash');
// Leave this filters line
var filters = {}


/*
=====================================================================
arrayToGovukTable

Convert an array to form needed for govukTable macro
=====================================================================

Expects array or nested array.

Usage:

{% set tableData = [
  ["1 January", "Friday", "New Year’s Day"],
  ["2 April", "Friday", "Good Friday"],
  ["5 April", "Monday", "Easter Monday"]
  ]
%}

{{ govukTable({
  caption: "2021 Bank holidays",
  firstCellIsHeader: true,
  head: [
    {
      text: "Date"
    },
    {
      text: "Day of week"
    },
    {
      text: "Holiday name"
    }
  ],
  rows: tableData | arrayToGovukTable
}) }}

*/

filters.arrayToGovukTable = (array) => {
  // Coerce to nested array
  array = (Array.isArray(array[0])) ? array : [array]
  let tableData = []
  array.forEach(row => {
    let rowData = []
    row.forEach(item => {
      rowData.push({
        html: item  // html for flexibility
      })
    })
    tableData.push(rowData)
  })
  // tableData = (tableData.length == 1) ? tableData[0] : tableData
  return tableData;
}

/*
=====================================================================
csvToArray

Convert a CSV string to array or nested array
=====================================================================

Expects CSV string. Requires 'csv-string' npm module

Usage:

let csvData =
  "Product images,✔,✔,✔,✗
  Case images,✔,✔,✔,✗
  Attachments uploaded with a document,✔,✔,✔,✗
  Generic attachments,✔,✔,✗,✗"

{% set arrayData = csvData | csvToArray %}

*/

filters.csvToArray = (csvString) => {
  array = CSV.parse(csvString);
  // Flatten nested array if it's only a single line
  array = (array.length == 1) ? array[0] : array
  return array;
}


/*
=====================================================================
csvToGovukTable

Convert a CSV string to form needed for govukTable macro
=====================================================================

Expects a CSV string. Requires csvToArray filter (above)

Usage:

{% set tableData =
  "1 Janury, Friday, New Year’s Day
  2 April, Friday, Good Friday
  5 April, Monday, Easter Monday"
%}


{{ govukTable({
  caption: "2021 Bank holidays",
  firstCellIsHeader: true,
  head: [
    {
      text: "Date"
    },
    {
      text: "Day of week"
    },
    {
      text: "Holiday name"
    }
  ],
  rows: tableData | csvToGovukTable
}) }}

*/

filters.csvToGovukTable = (csvString) => {
  let array = filters.csvToArray(csvString)
  return filters.arrayToGovukTable(array);
}

/*
=====================================================================
arrayToSumaryList

Convert a nested array to form needed for govukSummaryList
=====================================================================

Expects nested array. Key and value are required, the others optional

Usage:

let summaryListData = [
  [ "Full name", "Ed Horsford", "/change-name"],
  [ "Email address", "test@example.com", "/change-email"],
  [ "Password", "Set 22 days ago", "/reset", "Reset", "your password"],
]

{{ govukSummaryList({
  rows: summaryListData | arrayToSummaryList
}) }}

*/

filters.arrayToSummaryList = array => {
  let arrData = []
  array.forEach( row => {
    let key = row[0]  // required
    let value = row[1] // required
    let href = (row[2] != null) ? row[2] : false
    let text = (row[3] != null ) ? row[3] : "Change"
    let visuallyHiddenText = (row[4] != null ) ? row[4] : row[0].toLowerCase()
    let rowData = {
      key: {
        text: key
      },
      value: {
        html: value // html for flexibility
      }
    }
    // Action (optional)
    if (href){
      let item = {
        href,
        text,
        visuallyHiddenText
      }
      rowData.actions = {
        items: [item]
      }
    }
    arrData.push(rowData)
  })
  return arrData;
}

filters.csvToSummaryList = (csvString) => {
  arr = CSV.parse(csvString);
  let arrData = filters.arrayToSummaryList(arr)
  return arrData;
}

// Map a flat array, nested array to Object array that GOV.UK Selects use

// input: 
//   ['one', 'two', 'three']

// output:
//   [ 
//     {
//       text: 'one',
//       value: 'one'
//     },
//     {
//       text: 'two',
//       value: 'two'
//     },
//     {
//       text: 'three',
//       value: 'three'
//     }
//   ]
filters.toSelectItems = (array, includeDefaultEmpty=false, defaultSelected=false) => {

  let defaultItem = [{
    value: "",
    text: "Please select",
    disabled: true,
    selected: defaultSelected
  }]

  let items = array.map(item => {

    if (Array.isArray(item)){
      return {
        text: item[0],
        value: item[1]
      }
    }
    else if (_.isString(item)){
      return {
          text: item,
          value: item
        }
    }
    else if (item instanceof Object){
      return item
    }

  })

  if (includeDefaultEmpty){
    return defaultItem.concat(items)
  }
  else return items

}




// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

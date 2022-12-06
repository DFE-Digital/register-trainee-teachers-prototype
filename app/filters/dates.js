// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const moment = require("moment");
moment.locale('en-GB')
const _ = require('lodash');

// Leave this filters line
var filters = {}


/*
  ====================================================================
  govukDate
  --------------------------------------------------------------------
  Process a date and return it in GOV.UK format
  Accepts arrays (as provided by design system date inputs) as 
  well as javascript dates
  ====================================================================

  Usage:

    {{ [1,1,1970] | govukDate }}

  = 1 January 1970

*/

filters.govukDate = (date, format) => {
  if (Array.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  return filters.dateToGovukDate(date, format)
}

/*
  ====================================================================
  govukDateTime
  --------------------------------------------------------------------
  Process a date and return it in GOV.UK format with a time
  Accepts arrays (as provided by design system date inputs) as 
  well as javascript dates
  ====================================================================

  Usage:

    {{ [1,1,1970] | govukDateTime }}

  = 1 January 1970 at 2:03pm

*/

filters.govukDateTime = (date, format) => {
  if (Array.isArray(date)){
    // Array doesn't include time information
    return filters.arrayToGovukDate(date, format)
  }

  else return `${filters.dateToGovukDate(date, format)} at ${filters.time(date)}`
}

/*
  ====================================================================
  arrayToGovukDate
  --------------------------------------------------------------------
  Convert array to govuk date
  Useful for converting the arrays provided by the govukDate input
  pattern to a real date. Primarly an internal function to be used by 
  the govukDate filter.
  ====================================================================

  Usage:

  {{ [1, 2, 2020] | arrayToGovukDate }}

  = 1 February 2020

*/

filters.arrayToGovukDate = (array, format) => {
  let dateObject = filters.arrayToDateObject(array)
  let govukDate = filters.dateToGovukDate(dateObject, format)
  return govukDate
}

/*
  ====================================================================
  dateToGovukDate
  --------------------------------------------------------------------
  Convert js date object to govuk date (1 February 2020)
  Internal function to be used by govukDate filter
  ====================================================================

  Usage:

  {{ date | dateToGovukDate }}

  = 1 February 2020

*/

filters.dateToGovukDate = (date, format=false) => {
  if (date){
    let theDate = moment(date, format)
    if (theDate.isValid()){
      return theDate.format('D MMMM YYYY')
    }
  }
  return ''
}

/*
  ====================================================================
  arrayToDateObject
  --------------------------------------------------------------------
  Convert array to javascript date object
  ====================================================================

  Usage:

  {{ [1,2,2020] | arrayToDateObject }}

  = 2020-02-01T00:00:00.000Z

*/

filters.arrayToDateObject = (array) => {
  return new Date(array[2], array[1] -1, array[0])
}

/*
  ====================================================================
  today
  --------------------------------------------------------------------
  Today's date as javascript date object
  ====================================================================

  Usage:

    {{ "" | today }}

  = 2020-02-01T00:00:00.000Z

*/

filters.today = () => {
  return new Date()
}

/*
  ====================================================================
  todayGovuk | yesterdayGovuk
  --------------------------------------------------------------------
  Today’s or yesterday's date GOV.UK formatted
  ====================================================================

  Usage:

    {{ "" | todayGovuk }}

  = 19 March 2020

*/

filters.todayGovuk = () => {
  return moment().format('D MMMM YYYY')
}

filters.yesterdayGovuk = () => {
  return moment().subtract(1, 'days').format('D MMMM YYYY')
}

/*
  ====================================================================
  toDateArray
  --------------------------------------------------------------------
  Convert a date in to an array of three numbers - useful for sending
  dates to govuk date inputs
  ====================================================================

  Usage:

    {{ "1 January 2021" | toDateArray }}

  = [1, 1, 2021]

*/

// Output date array - for use in design system macros macros
filters.toDateArray = (date) => {
  if (!date) return []
  if (_.isArray(date)) return date
  else {
    return [moment(date).date(), moment(date).month() + 1, moment(date).year()]
  }
}

/*
  ====================================================================
  toDateObject
  --------------------------------------------------------------------
  Convert an array to date
  ====================================================================

  Usage:

  {{ "[05, 06, 2021]" | toDateObject }}
  = Sat Jun 05 2021 00:00:00 GMT+0100 (British Summer Time)

  {{ "2021-06-05T19:21:48.168Z" | toDateObject }}
  = Sat Jun 05 2021 20:21:48 GMT+0100 (British Summer Time)

*/

filters.toDateObject = (date) => {
  if (!date) return false
  if (_.isArray(date)) return filters.arrayToDateObject(date)
  else {
    return moment(date).toDate()
  }
}

/*
  ====================================================================
  prettyMonth
  --------------------------------------------------------------------
  Return month names from numbers.
  ====================================================================

  Usage:

  {{ 1 | prettyMonth }}

  = January

*/

filters.prettyMonth = (monthNumber) => {
  if (monthNumber){
    return moment().month(monthNumber - 1).format("MMMM");
  }
  else return ''
}

/*
  ====================================================================
  sortDateArrays
  --------------------------------------------------------------------
  Add support for sorting by date arrays
  ====================================================================
  Copied from https://github.com/mozilla/nunjucks/blob/master/nunjucks/src/filters.js#L425

  Requires positional args, no named args
*/

//
filters.sortDateArrays = (arr, reversed, attr) => {

    let array = _.map(arr, v => v)


    array.sort((a, b) => {
      let x = (attr) ? a[attr] : a
      let y = (attr) ? b[attr] : b

      // Convert arrays of 3 to date objects
      x = (_.isArray(x) && (x.length == 3)) ? filters.arrayToDateObject(x) : x
      y = (_.isArray(y) && (y.length == 3)) ? filters.arrayToDateObject(y) : y

      // console.log({x}, {attr})
      // if (!caseSens && _.isString(x) && _.isString(y)) {
      //   x = x.toLowerCase()
      //   y = y.toLowerCase()
      // }

      if (x < y) {
        return reversed ? 1 : -1
      } else if (x > y) {
        return reversed ? -1 : 1
      } else {
        return 0
      }
    })

    return array
  }

// https://momentjs.com/docs/#/displaying/format/
filters.formatDate = (date, format, dateFormat) => {

  var returnDate;
  // No date provided.
  if (!date){
    // console.log('error for', date, 'format', format);
    return ''
    // throw "Error in formatDate: no date provided";
  }
  // Check for valid date
  else if (dateFormat && moment(date, dateFormat).isValid()){
    returnDate = moment(date, dateFormat);
  }
  else if ( moment(date).isValid() ){
    returnDate = moment(date);
  }
  // Invalid date
  else {
    throw "Error in formatDate: invalid date";
  };

  switch (true)
    {
      // 2018-03-21
      case (format == 'dashDate'):
        return returnDate.format('YYYY-MM-DD');

      // 2018-03-21
      case (format == 'dashDateForward'):
        return returnDate.format('DD-MM-YYYY' );

      // 2018/03/21
      case (format == 'slashDate'):
        return returnDate.format('YYYY/MM/DD');

      // 2018/03/21
      case (format == 'slashDateForward'):
        return returnDate.format('DD/MM/YYYY');

      // 2018/03
      case (format == 'yearMonth'):
        return returnDate.format('YYYY/MM');

      // 2018-03-21T00:00:00.000Z
      case (format == 'iso8601'):
        return returnDate.toISOString();

      // a year ago
      case (format == 'relative'):
        return moment(returnDate).fromNow()
        // return timeAgoInDays(returnDate)

      // 21st March 2018
      case (format == 'pretty'):
        return returnDate.format('Do MMMM YYYY');

      // March 21st 2018, 12:00:00 am
      case (format == 'full'):
        return returnDate.format('MMMM Do YYYY, h:mm:ss a');

      // pass format through to moment
      case _.isString(format):
        return returnDate.format(format);

      // Default
      default:
        return returnDate.format();
    }
}

// Check if date is in last x units

// Usage: {{ date | isInLast(5, "weeks") }}
filters.isInLast = (date, count, units) => {
  // Convert to date Object if date is an array (as provided by design system date component)
  if (_.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  let compareDate = moment().subtract(count, units)
  return moment(date).isBetween(compareDate, moment())
}

// Check if date is in next x units

// Usage: {{ date | isInLast(5, "weeks") }}
filters.isInNext = (date, count, units) => {
  // Convert to date Object if date is an array (as provided by design system date component)
  if (_.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  let compareDate = moment().add(count, units)
  return moment(date).isBetween(compareDate, moment())
}

/*
  ====================================================================
  isInPast
  --------------------------------------------------------------------
  Check if a date is in the past
  ====================================================================
*/

// Usage: {{ date | isInPast }} // true
filters.isInPast = (date) => {
  // Convert to date Object if date is an array (as provided by design system date component)
  if (_.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  // Compare the end of day so that checks for today’s date don’t return true
  return moment(date).endOf('day').isBefore()
}

/*
  ====================================================================
  isInFuture
  --------------------------------------------------------------------
  Check if a date is in the future
  ====================================================================
*/

// Usage: {{ date | isInFuture }} // true
filters.isInFuture = (date) => {
  // Convert to date Object if date is an array (as provided by design system date component)
  if (_.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  return moment(date).isAfter()
}

/*
  ====================================================================
  isAfter
  --------------------------------------------------------------------
  Check if a date is after another date
  ====================================================================
*/

// Usage: {{ date | isInFuture }} // true
filters.isAfter = (date, compareDate) => {
  // Convert to date Object if date is an array (as provided by design system date component)
  if (_.isArray(date)){
    date = filters.arrayToDateObject(date)
  }
  if (_.isArray(compareDate)){
    compareDate = filters.arrayToDateObject(compareDate)
  }
  return moment(date).isAfter(compareDate)
}

// Expose moment as a filter
/* Usage:

{{ date | moment('subtract', 1, "week") }} // return the date 1 week ago

*/

filters.moment = (date, name, ...args) => {
  return moment(date)[name](...args)
}

/*
  ====================================================================
  time
  --------------------------------------------------------------------
  Pretty format a timestamp
  ====================================================================

  Usage:

    {{ 2021-05-28T17:21:36.307Z | time }}

  = 6:21pm

*/
filters.time = (str) => {
  var m = moment(str)
  if (m.minutes() > 0) {
    return m.format('h:mma')
  } else {
    return m.format('ha')
  }
}


// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

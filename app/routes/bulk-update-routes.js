const _ = require('lodash')
const moment = require('moment')
const path = require('path')
const utils = require('./../lib/utils')
const url = require('url')
const filters = require('./../filters.js')()

module.exports = router => { 

  /* 
  =========================================================
  Add (missing) details routes
  =========================================================
  */

  /* Review errors or skip */
  router.get('/bulk-update/add-details/errors-found-answer', function(req, res) {
    const data = req.session.data
    if (data?.bulk?.addDetailsFixErrors == "Fix errors now") {
      res.redirect('/bulk-update/add-details/fix-errors');
    } else if (data?.bulk?.addDetailsFixErrors == "Skip fixing errors") {
      delete data?.bulk?.addDetailsFixErrors
      res.redirect('/bulk-update/add-details/check-pending-updates');
    } else {
      res.redirect('/bulk-update/add-details/errors-found');
    }
  });

  /* Set-up check updates page up as coming from upload */
  router.get('/bulk-update/add-details/fix-file', function(req, res) {
    const data = req.session.data
    data.bulk = {
      addDetailsFixErrors: true,
    }
    res.redirect('/bulk-update/add-details/check-pending-updates');
  });

  /* Clear review errors answer */
  router.get('/bulk-update/add-details/no-update', function(req, res) {
    const data = req.session.data
    delete data?.bulk?.addDetailsFixErrors
    res.redirect('/bulk-update/add-details/check-pending-updates');
  });


  /* 
  =========================================================
  Recommened trainees for QTS or EYTS routes
  =========================================================
  */

  /* Review errors or skip */
  router.get('/bulk-update/recommend/errors-found-answer', function(req, res) {
    const data = req.session.data
    if (data?.bulk?.recommendFixErrors == "Fix errors now") {
      res.redirect('/bulk-update/recommend/fix-errors');
    } else if (data?.bulk?.recommendFixErrors == "Skip fixing errors") {
      delete data?.bulk?.recommendFixErrors
      res.redirect('/bulk-update/recommend/check-pending-updates');
    } else {
      res.redirect('/bulk-update/recommend/errors-found');
    }
  });

  /* Set-up check updates page up as coming from upload */
  router.get('/bulk-update/recommend/fix-file', function(req, res) {
    const data = req.session.data
    data.bulk = {
      recommendFixErrors: true,
    }
    res.redirect('/bulk-update/recommend/check-pending-updates');
  });

  /* Clear review errors answer */
  router.get('/bulk-update/recommend/no-update', function(req, res) {
    const data = req.session.data
    delete data?.bulk?.recommendFixErrors
    res.redirect('/bulk-update/recommend/check-pending-updates');
  });

}

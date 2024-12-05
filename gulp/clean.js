/*
  clean.js
  ===========
  removes folders:
    - public
*/

const { rimrafSync } = require('rimraf')
const gulp = require('gulp')

const config = require('./config.json')

gulp.task('clean', (done) => {
  rimrafSync([config.paths.public, '.port.tmp'])
  return done()
})

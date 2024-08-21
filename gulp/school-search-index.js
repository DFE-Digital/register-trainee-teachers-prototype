const gulp = require('gulp')
const lunr = require('./../scripts/generate-search-index') // generate

gulp.task('school-search-index', (done) => {
  // Generate search index
  lunr()

  done()
})

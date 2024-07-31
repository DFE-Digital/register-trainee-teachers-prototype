const gulp = require('gulp')
const lunr = require('./../scripts/generate_search_index') // generate

gulp.task('school-search-index', (done) => {
  // Generate search index
  lunr()

  done()
})

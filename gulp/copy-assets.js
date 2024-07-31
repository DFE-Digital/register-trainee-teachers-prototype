/*
  copy.js
  ===========
  copies images and javascript folders to public
*/

const gulp = require('gulp')

const config = require('./config.json')

gulp.task('copy-images', () => {
  return gulp.src(
    config.paths.assets + 'images/*.+(png|jpg|jpeg|gif|svg|ico)',
    { encoding: false }
  )
    .pipe(gulp.dest(config.paths.public + 'images/'))
})

gulp.task('copy-javascripts', () => {
  return gulp.src(config.paths.assets + 'javascripts/*')
    .pipe(gulp.dest(config.paths.public + 'javascripts/'))
})

gulp.task('copy-data', () => {
  return gulp.src(config.paths.assets + 'data/**')
    .pipe(gulp.dest(config.paths.public + 'data/'))
})

gulp.task('copy-downloads', () => {
  return gulp.src(config.paths.assets + 'downloads/**')
    .pipe(gulp.dest(config.paths.public + 'downloads/'))
})

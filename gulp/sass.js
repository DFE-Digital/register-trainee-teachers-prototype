/*
  sass.js
  ===========
  compiles sass from assets folder
  also includes sourcemaps
*/

const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const path = require('path')
const fs = require('fs')

const extensions = require('../lib/extensions/extensions')
const config = require('./config.json')
const stylesheetDirectory = config.paths.public + 'stylesheets'

gulp.task('sass-extensions', (done) => {
  const fileContents = '$govuk-extensions-url-context: "/extension-assets"; ' + extensions.getFileSystemPaths('sass')
    .map(filePath => `@import "${filePath.split(path.sep).join('/')}";`)
    .join('\n')
  fs.writeFile(path.join(config.paths.lib + 'extensions', '_extensions.scss'), fileContents, done)
})

gulp.task('sass', () => {
  return gulp.src(config.paths.assets + '/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', (error) => {
      // write a blank application.css to force browser refresh on error
      if (!fs.existsSync(stylesheetDirectory)) {
        fs.mkdirSync(stylesheetDirectory)
      }
      fs.writeFileSync(path.join(stylesheetDirectory, 'application.css'), '')
      console.error('\n', error.messageFormatted, '\n')
      this.emit('end')
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(stylesheetDirectory))
})

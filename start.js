// Core dependencies
const path = require('path')
const fs = require('fs')

checkFiles()

runGulp()

// Warn if node_modules folder doesn't exist
function checkFiles () {
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '/node_modules'))
  if (!nodeModulesExists) {
    console.error('ERROR: Node module folder missing. Try running `npm install`')
    process.exit(0)
  }

  // Create template .env file if it doesn't exist
  const envExists = fs.existsSync(path.join(__dirname, '/.env'))
  if (!envExists) {
    fs.createReadStream(path.join(__dirname, '/lib/template.env'))
      .pipe(fs.createWriteStream(path.join(__dirname, '/.env')))
  }
}

// Create template session data defaults file if it doesn't exist
const dataDirectory = path.join(__dirname, '/app/data')
const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

if (!sessionDataDefaultsFileExists) {
  console.log('Creating session data defaults file')
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory)
  }

  fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
    .pipe(fs.createWriteStream(sessionDataDefaultsFile))
}

// Run gulp
function runGulp () {
  const spawn = require('cross-spawn')

  process.env.FORCE_COLOR = 1
  const gulp = spawn('./node_modules/.bin/gulp')
  gulp.stdout.pipe(process.stdout)
  gulp.stderr.pipe(process.stderr)
  process.stdin.pipe(gulp.stdin)

  gulp.on('exit', function (code) {
    console.log('gulp exited with code ' + code.toString())
  })
}

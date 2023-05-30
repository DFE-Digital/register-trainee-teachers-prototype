# Register trainee teachers (prototype)

This prototype is based on the [GOV.UK prototype kit](https://github.com/alphagov/govuk-prototype-kit)

## Installation

### Requirements

- node.js - version 16.x.x or later

### Install dependencies

`npm install`

### Start the app

`npm start`

Go to [http://localhost:3000]() in your browser.

## Deployed prototype

URL: https://register-prototype.herokuapp.com/

This version deploys automatically from merges to master and is the 'latest' version for UR and UX iteration.

## Design history

URL: https://bat-design-history.netlify.app/register-trainee-teachers/

A history of the design of this service

## Updating seed data

There are three types of seed data:

1. Courses
2. Trainees
3. Trainee problems

Each set of data is generated independently. If one is regenerated, later types should also be regenerated. For example, if updating courses, then trainees and then trainee problems should be regenerated. If regenerating trainee problems, the other types don't need to be regenerated.

### Generating courses

`node scripts/generate-courses.js`

This will generate ficticous Publish courses - ones that can either be picked in the UI, or used when generating trainees to pretend that they're on courses.

### Generating trainees

`node scripts/generate-records.js`

This will generate fake trainees for several providers - draft and non draft, SCITT and HEI, HESA, etc. It attempts to generate reasonably realistic trainees, though errors and problems are intentionally high.

The file `app/data/seed-records.js` can be used to add some hardcoded records. These have mostly been used for user research to have some fixed records that don't change. When updating `seed-records.js`, the trainees seeds need to be regenerated. Seed records do not need to be complete - any missing bits of data will be filled in by `generate-records.js`.

### Generating trainee problems

`node scripts/generate-trainee-problems.js`

This generates ficticious problems and assigns them to random trainees. Problems can also be hardcoded with `app/data/seed-trainee-problems.json`. Regnerate problems after updating the seed problems.

## Training routes and funding

Most training route and funding data is kept in `app/data/training-route-data.js`.

This file controls:

* The types of training route available
* What data / task list section each route should have
* Funding available for each route


## Changes needed each academic year

Things that need to be updated in the new academic year:

* Update course generator to generate courses for next year (a year ahead of current), removing the oldest year
* Update `app/data/years.js` to update the current academic year, removing the oldest year
* Update `app/data/training-route-data.js` to update the funding available for each route
* Regenerate courses
* Regenerate trainees
* Regenerate trainee problems



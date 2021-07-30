// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const ittSubjects = require('./itt-subjects.js')
let modernLanguages = ittSubjects.modernLanguagesSubjects


// A non-exhaustive list of routes
// Publish and non publish can overlap

let applyRoutes = [
  'Provider-led (postgrad)',
  'School direct (salaried)',
  'School direct (fee funded)',
]

// Not all these routes will be enabled
let publishRoutes = [
  'Teaching apprenticeship (postgrad)',
  'Provider-led (postgrad)',
  'Provider-led (undergrad)',
  'School direct (salaried)',
  'School direct (fee funded)',
]

let nonPublishRoutes = [
  'Provider-led (postgrad)',
  'Provider-led (undergrad)',
  'Assessment only',
  'Teach First (postgrad)',
  'Early years (salaried)',
  'Early years (postgrad)',
  'Early years (assessment only)',
  'Early years (undergrad)',
  'Opt-in (undergrad)'
]

// These sections should have a default status of 'review'
// rather than 'not started'
let applyReviewSections = [
  'personalDetails',
  'contactDetails',
  'diversity',
  'degree',
]

// Create array of unique values
let allRoutesArray = [...new Set([...publishRoutes, ...nonPublishRoutes])].sort()
let allRoutes = {}

// Add detail about publish or non publish
allRoutesArray.forEach(route => {
  allRoutes[route] = {
    isPublishRoute: publishRoutes.includes(route),
    isNonPublishRoute: nonPublishRoutes.includes(route)
  }
})


// Sensible defaults for route data
let defaultRouteData = {
  defaultEnabled: false,
  qualifications: [
    "QTS"
  ],
  qualificationsSummary: "QTS",
  duration: 1,
  sections: [
    'trainingDetails',
    'courseDetails',
    'personalDetails',
    'contactDetails',
    'diversity',
    'degree',
    // 'placement',
    'funding'
  ],
  initiatives: [
    "Now teach",
    "Transition to teach"
  ],
  bursariesAvailable: false
}

// Data for each route
let baseRouteData = {
  "Assessment only": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'funding'
    ],
    bursariesAvailable: false
  },
  "Provider-led (undergrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      // 'undergraduateQualification',
      // 'placement',
      'funding'
    ],
    fields: [
      "studyMode",
    ],
    initiatives: [
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Mathematics",
          "Physics"
          ],
        value: "9000"
      }
    ],
    courseDatesAreAmgiguous: true
  },
  "Provider-led (postgrad)": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
    fields: [
      "studyMode",
    ],
    initiatives: [
      "Maths and physics chairs programme / Researchers in schools",
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Chemistry",
          "Computing",
          "Mathematics",
          "Physics"
          ],
        value: "24000"
      },
      {
        subjects: [
          "Languages",
          "Classics"
          ],
        value: "10000"
      },
      {
        subjects: [
          "Biology"
          ],
        value: "7000"
      }
    ]
  },
  "School direct (salaried)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'schools',
      // 'placement',
      'funding'
    ],
    fields: [
      "leadSchool",
      "employingSchool",
      "studyMode"
    ],
    initiatives: [
      "Future Teaching Scholars",
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: false
  },
  "School direct (fee funded)": {
    defaultEnabled: true,
    hasAllocatedPlaces: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'schools',
      // 'placement',
      'funding'
    ],
    fields: [
      "leadSchool",
      "studyMode"
    ],
    initiatives: [
      "Maths and physics chairs programme / Researchers in schools",
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Chemistry",
          "Computing",
          "Mathematics",
          "Physics"
          ],
        value: "24000"
      },
      {
        subjects: [
          "Languages",
          "Classics"
          ],
        value: "10000"
      },
      {
        subjects: [
          "Biology"
          ],
        value: "7000"
      }
    ]
  },
  "Teach first (postgrad)": {},
  "Teaching apprenticeship (postgrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'schools',
      // 'placement',
      'funding'
    ],
    fields: [
      "leadSchool",
      'employingSchool',
      "studyMode"
      // "apprenticeshipStartDate"
    ],
    initiatives: [
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: false,
    courseDatesAreAmgiguous: true
  },
  "Opt-in (undergrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      // 'undergraduateQualification',
      // 'placement',
      'funding'
    ],
    fields: [
      "studyMode"
    ],
    initiatives: [
      "Now teach",
      "Transition to teach"
    ],
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Languages",
          "Computing",
          "Mathematics",
          "Physics"
          ],
        value: "9000"
      }
    ],
    courseDatesAreAmgiguous: true
  },
  "Early years (salaried)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      // 'placement',
      'funding'
    ],
    fields: [
      "employingSchool",
      "studyMode"
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Early years"
          ],
        value: "14000"
      }
    ]
  },
  "Early years (postgrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      // 'placement',
      'funding'
    ],
    fields: [
      "studyMode",
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: true,
    bursaries: [
      {
        subjects: [
          "Early years"
          ],
        value: "",
        tiersApply: true,
        tiers: [
          {
            name: "Tier 1",
            hint: "First-class honours degree, doctoral degree, medical masters (distinction)",
            value: "5000"
          },
          {
            name: "Tier 2",
            hint: "2:1 honours degree, master’s degree",
            value: "4000"
          },
          {
            name: "Tier 3",
            hint: "2:2 honours degree",
            value: "2000"
          }
        ]
      }
    ]
  },
  "Early years (assessment only)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      'degree',
      'funding'
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: false
  },
  "Early years (undergrad)": {
    defaultEnabled: true,
    sections: [
      'trainingDetails',
      'courseDetails',
      'personalDetails',
      'contactDetails',
      'diversity',
      // 'undergraduateQualification',
      // 'placement',
      'funding'
    ],
    fields: [
      "studyMode",
    ],
    qualifications: [
      "EYTS"
    ],
    qualificationsSummary: "EYTS full time",
    bursariesAvailable: false,
    courseDatesAreAmgiguous: true
  }
}

let trainingRoutes = {}


// Combine route data
Object.keys(allRoutes).forEach(routeName => {
  let routeData = Object.assign({}, defaultRouteData, allRoutes[routeName], baseRouteData[routeName])
  routeData.name = routeName

  // Expand 'Languages' in to each individual language
  if (routeData.bursaries){
    routeData.bursaries.forEach(bursaryLevel => {
      if (bursaryLevel.subjects.includes('Languages')){
        _.pull(bursaryLevel.subjects, 'Languages')
        bursaryLevel.subjects = bursaryLevel.subjects.concat(modernLanguages)
      }
    })
  }
  trainingRoutes[routeName] = routeData
})

let enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled == true).map(route => route.name)

// Count initiatives
let allInitiatives = []
Object.keys(trainingRoutes).forEach(routeName => {
  let initiatives = trainingRoutes[routeName]?.initiatives || []
  allInitiatives = allInitiatives.concat(initiatives)
})

allInitiatives = [...new Set(allInitiatives)].sort()

let allocatedSubjects = [
  "Physical education"
]

let levels = {
  "Early years": {
    "hint": "ages 0 to 5",
    "ageRanges": null
  },
  "Primary": {
    "hint": "ages 3 to 11",
    "ageRanges": [
      "3 to 7", // 6.51%
      "3 to 11", // 9.76%
      "5 to 11", // 40.97%
    ], 
    "otherAgeRanges": [
      "3 to 8",
      "3 to 9",
      "5 to 9",
      "5 to 14"
      "7 to 11",
      "7 to 14"
    ]
  },
  "Middle": {
    "hint": "ages 7 to 14",
    "ageRanges": null
  },
  "Secondary": {
    "hint": "ages 11 to 19",
    "ageRanges": [
      "11 to 16", // 26.42%
      "11 to 19", // 13.8%
    ],
    "otherAgeRanges": [
      "5 to 14",
      "7 to 11",
      "7 to 14",
      "14 to 19"
    ]
  }
}

// remainingAgeRanges = [
// programme and diploma aren't in production
//   "0 to 5 programme", // 0.99%
//   "5 to 14 programme", // 0.01%
//   "7 to 16 programme", // 0.01%
//   "9 to 14 programme", // 0.01%
//   "9 to 16 programme", // 0.01%
//   // primary
//   "3 to 8 programme", // 0.02%
//   "3 to 9 programme", // 0.08%
//   "5 to 9 programme", // 0.14%
//   "7 to 11 programme", // 0.76%
//   // middle
//   "7 to 14 programme", // 0.12%
//   // secondary
//   "14 to 19 programme", // 0.36%
//   "14 to 19 diploma" // 0.03%
// ]


module.exports = {
  allRoutes: allRoutesArray,
  allInitiatives,
  trainingRoutes,
  allocatedSubjects,
  enabledTrainingRoutes,
  levels,
  defaultSections: defaultRouteData.sections,
  applyRoutes,
  publishRoutes,
  nonPublishRoutes,
  applyReviewSections
}

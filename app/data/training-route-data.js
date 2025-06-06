// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const ittSubjects = require('./itt-subjects.js')
const modernLanguages = ittSubjects.modernLanguagesSubjects

// A non-exhaustive list of routes
// Publish and non publish can overlap

const applyRoutes = [
  'Teaching apprenticeship (postgraduate)',
  'Primary and secondary (postgraduate)',
  'School direct (salaried)',
  'School direct (fee funded)'
]

// Not all these routes will be enabled
const publishRoutes = [
  'Teaching apprenticeship (postgraduate)',
  'Teacher degree apprenticeship (salaried)', // Publish refers to the TDA route as "Teaching apprenticeship (salaried)"
  'Primary and secondary (postgraduate)',
  'Primary and secondary (postgraduate salaried)', // New route as part of the ITT reforms
  'School direct (salaried)',
  'School direct (fee funded)'
]

const nonPublishRoutes = [
  'Primary and secondary (postgraduate)',
  'Primary and secondary (undergraduate)',
  'Assessment only',
  // 'Teach First (postgraduate)',
  'Early years graduate employment based',
  'Early years graduate entry',
  'Early years assessment only',
  'Early years undergraduate',
  'Opt-in (undergraduate)',
  'High potential initial teacher training (HPITT)',
  'International qualified teacher status (iQTS)'
]

// These sections are all collected in to one super section for Apply.
// If any of these are encountered, we defer to a different bit of data
const applyReviewSections = [
  'personalDetails',
  'diversity',
  'degree'
]

// Create array of unique values
const allRoutesArray = [...new Set([...publishRoutes, ...nonPublishRoutes])].sort()
const allRoutes = {}

// Add detail about publish or non publish
allRoutesArray.forEach(route => {
  allRoutes[route] = {
    isPublishRoute: publishRoutes.includes(route),
    isNonPublishRoute: nonPublishRoutes.includes(route)
  }
})

// Sensible defaults for route data
const defaultRouteData = {
  defaultEnabled: false,
  qualifications: [
    'QTS'
  ],
  qualificationsSummary: 'QTS',
  academicQualificationsApply: true,
  duration: 1,
  sections: [
    // 'trainingDetails',
    'courseDetails',
    'personalDetails',
    'diversity',
    'degree',
    'placement',
    'funding'
  ],
  initiatives: [
    'Get an International Relocation Payment',
    'Now Teach'
  ],
  financialSupportAvailable: false
}

// Data for each route
const baseRouteData = {
  'Assessment only': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    academicQualificationsApply: false,
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'funding'
    ],
    financialSupportAvailable: false
  },
  'Primary and secondary (undergraduate)': {
    defaultEnabled: true,
    courseLevel: 'Undergraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'schools',
      // 'undergraduateQualification',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'employingSchool',
      'studyMode'
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Mathematics',
          'Physics'
        ],
        value: '9000'
      }
    ]
  },
  'Primary and secondary (postgraduate)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'funding'
    ],
    qualificationsSummary: 'QTS',
    hasAllocatedPlaces: true,
    fields: [
      'leadPartner',
      'employingSchool',
      'studyMode'
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Chemistry',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '27000',
        scholarship: '29000'
      },
      {
        type: 'bursary',
        subjects: [
          'Languages'
        ],
        value: '25000',
        scholarship: '27000'
      },
      {
        type: 'bursary',
        subjects: [
          'Geography',
          'Ancient languages'
        ],
        value: '25000'
      },
      {
        type: 'bursary',
        subjects: [
          'Design and technology',
          'Biology'
        ],
        value: '20000'
      },
      {
        type: 'bursary',
        subjects: [
          'English'
        ],
        value: '15000'
      }
    ]
  },
  'School direct (salaried)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'employingSchool',
      'studyMode'
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Chemistry',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '27000'
      },
      {
        type: 'bursary',
        subjects: [
          'Geography',
          'Languages',
          'Ancient languages'
        ],
        value: '25000'
      },
      {
        type: 'bursary',
        subjects: [
          'Design and technology',
          'Biology'
        ],
        value: '20000'
      },
      {
        type: 'bursary',
        subjects: [
          'English'
        ],
        value: '15000'
      }
    ]
  },
  'School direct (fee funded)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    hasAllocatedPlaces: true,
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'studyMode'
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Chemistry',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '27000',
        scholarship: '29000'
      },
      {
        type: 'bursary',
        subjects: [
          'Languages'
        ],
        value: '25000',
        scholarship: '27000'
      },
      {
        type: 'bursary',
        subjects: [
          'Geography',
          'Ancient languages'
        ],
        value: '25000'
      },
      {
        type: 'bursary',
        subjects: [
          'Design and technology',
          'Biology'
        ],
        value: '20000'
      },
      {
        type: 'bursary',
        subjects: [
          'English'
        ],
        value: '15000'
      }
    ]
  },
  'Teach first (postgraduate)': {},
  'Teaching apprenticeship (postgraduate)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'employingSchool',
      'studyMode'
      // "apprenticeshipStartDate"
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'grant',
        subjects: [
          'Chemistry',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '18000'
      },
      {
        type: 'grant',
        subjects: [
          'Geography',
          'Languages',
          'Ancient languages'
        ],
        value: '16000'
      },
      {
        type: 'grant',
        subjects: [
          'Design and technology',
          'Biology'
        ],
        value: '11000'
      },
      {
        type: 'grant',
        subjects: [
          'English'
        ],
        value: '1000'
      }
    ]
  },
  'Teacher degree apprenticeship (salaried)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'schools',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'employingSchool',
      'studyMode'
      // "apprenticeshipStartDate"
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'grant',
        subjects: [
          'Chemistry',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '18000'
      },
      {
        type: 'grant',
        subjects: [
          'Geography',
          'Languages',
          'Ancient languages'
        ],
        value: '16000'
      },
      {
        type: 'grant',
        subjects: [
          'Design and technology',
          'Biology'
        ],
        value: '11000'
      },
      {
        type: 'grant',
        subjects: [
          'English'
        ],
        value: '1000'
      }
    ]
  },
  'Opt-in (undergraduate)': {
    defaultEnabled: true,
    courseLevel: 'Undergraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      // 'undergraduateQualification',
      'placement',
      'funding'
    ],
    fields: [
      'studyMode'
    ],
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Languages',
          'Ancient languages',
          'Computing',
          'Mathematics',
          'Physics'
        ],
        value: '9000'
      }
    ]
  },
  'Early years graduate employment based': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'placement',
      'funding'
    ],
    fields: [
      // "employingSchool", // probably not a thing
      'studyMode'
    ],
    qualifications: [
      'EYTS'
    ],
    qualificationsSummary: 'EYTS full time',
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'grant',
        subjects: [
          'Early years'
        ],
        value: '14000'
      }
    ]
  },
  'Early years graduate entry': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'placement',
      'funding'
    ],
    fields: [
      'studyMode'
    ],
    qualifications: [
      'EYTS'
    ],
    qualificationsSummary: 'EYTS full time',
    financialSupportAvailable: true,
    financialSupport: [
      {
        type: 'bursary',
        subjects: [
          'Early years'
        ],
        value: '',
        tiersApply: true,
        tiers: [
          {
            name: 'Tier 1',
            hint: 'First-class honours degree, doctoral degree, medical masters (distinction)',
            value: '5000'
          },
          {
            name: 'Tier 2',
            hint: '2:1 honours degree, master’s degree',
            value: '4000'
          },
          {
            name: 'Tier 3',
            hint: '2:2 honours degree',
            value: '2000'
          }
        ]
      }
    ]
  },
  'Early years assessment only': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    academicQualificationsApply: false,
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'funding'
    ],
    qualifications: [
      'EYTS'
    ],
    qualificationsSummary: 'EYTS full time',
    financialSupportAvailable: false
  },
  'Early years undergraduate': {
    defaultEnabled: true,
    courseLevel: 'Undergraduate',
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'schools',
      // 'undergraduateQualification',
      'placement',
      'funding'
    ],
    fields: [
      'leadPartner',
      'studyMode'
    ],
    qualifications: [
      'EYTS'
    ],
    qualificationsSummary: 'EYTS full time',
    financialSupportAvailable: false
  },
  'High potential initial teacher training (HPITT)': {
    disableForNewDrafts: true, // we want to show trainees on this route, but not allow new ones
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    defaultEnabled: false,
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'funding'
    ],
    financialSupportAvailable: false,
    fields: [
      'region'
    ]
  },
  'International qualified teacher status (iQTS)': {
    defaultEnabled: true,
    courseLevel: 'Postgraduate',
    qualifications: [
      'QTS'
    ],
    qualificationsSummary: 'QTS',
    hasAllocatedPlaces: false,
    sections: [
      // 'trainingDetails',
      'courseDetails',
      'personalDetails',
      'diversity',
      'degree',
      'iqts'
      // 'schools',
      // 'placement'
      // 'funding'
    ],
    // fields: [
    //   "leadPartner",
    //   "studyMode"
    // ],

    financialSupportAvailable: false,
    financialSupport: [
    ]
  }
}

const trainingRoutes = {}

// Combine route data
Object.keys(allRoutes).forEach(routeName => {
  const routeData = Object.assign({}, defaultRouteData, allRoutes[routeName], baseRouteData[routeName])
  routeData.name = routeName

  // Expand 'Languages' in to each individual language
  if (routeData.financialSupport) {
    routeData.financialSupport.forEach(financialSupportLevel => {
      if (financialSupportLevel.subjects.includes('Languages')) {
        _.pull(financialSupportLevel.subjects, 'Languages')
        financialSupportLevel.subjects = financialSupportLevel.subjects.concat(modernLanguages)
      }
    })
  }
  trainingRoutes[routeName] = routeData
})

const enabledTrainingRoutes = Object.values(trainingRoutes).filter(route => route.defaultEnabled === true).map(route => route.name)

// Count initiatives
let allInitiatives = []
Object.keys(trainingRoutes).forEach(routeName => {
  const initiatives = trainingRoutes[routeName]?.initiatives || []
  allInitiatives = allInitiatives.concat(initiatives)
})

allInitiatives = [...new Set(allInitiatives)].sort()

const allocatedSubjects = [
  'Physical education'
]

const phases = {
  'Early years': {
    hint: 'ages 0 to 5',
    ageRanges: null
  },
  Primary: {
    hint: 'ages 3 to 11',
    ageRanges: [
      '3 to 7', // 6.51%
      '3 to 11', // 9.76%
      '5 to 11' // 40.97%
    ],
    otherAgeRanges: [
      '3 to 8',
      '3 to 9',
      '5 to 9',
      '7 to 11'
    ]
  },
  Middle: {
    hint: 'ages 7 to 14',
    ageRanges: null
  },
  Secondary: {
    hint: 'ages 11 to 19',
    ageRanges: [
      '11 to 16', // 26.42%
      '11 to 18' // from Publish

    ],
    otherAgeRanges: [
      '5 to 14',
      '7 to 11',
      '7 to 14',
      '7 to 16',
      '9 to 14',
      '9 to 16',
      '11 to 19', // 13.8% in dttp
      '14 to 19'
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
  phases,
  defaultSections: defaultRouteData.sections,
  applyRoutes,
  publishRoutes,
  nonPublishRoutes,
  applyReviewSections
}

/*
Publish course age ranges 9/2021
  * - those that exist in DTTP*

Primary
  *"5_to_11"=>1373,*
  *"3_to_7"=>316,*
  *"3_to_11"=>185,*
  *"7_to_11"=>50,*
"4_to_11"=>45,
  *"7_to_14"=>28,*
  *"3_to_9"=>1,*
"2_to_7"=>4,
"2_to_11"=>1,

Secondary
  *"11_to_16"=>6520,*
"11_to_18"=>3749,
  *"14_to_19"=>292,*
  *"11_to_19"=>55,*
"13_to_18"=>7,
"14_to_18"=>6,
"9_to_13"=>2,
"2_to_19"=>2,
"3_to_16"=>1,
"4_to_19"=>2,
"5_to_18"=>1,
"7_to_18"=>1,

Age ranges DTTP has but no courses use
3-8
5-9
5-14
7-16
9-14
9-16

Values to add in DTTP

Primary
4 - 11 (45)
2 - 7 (4)
2 - 11 (1)

Secondary
11 - 18 (3749)
13 - 18 (7)
14 - 18 (6)
9 - 13 (2)
2 - 19 (2)
4 - 19 (2)
3 - 16 (1)
5 - 18 (1)
7 - 18 (1)

*/

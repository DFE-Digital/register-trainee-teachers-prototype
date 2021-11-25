let seedRecords = []

// Very detailed draft for user research - matches seed data
seedRecords.push({
  "status": "Draft",
  "events": {
    "items": []
  },
  "route": "Provider-led (postgrad)",
  "reference": "LK5849",
  trainingDetails: null,
  courseDetails: null,
  "personalDetails": {
    "nationality": [
      "Irish",
      "American"
    ],
    "givenName": "Sarah Lilia",
    "middleNames": "",
    "familyName": "Jones",
    "dateOfBirth": [
      "3",
      "12",
      "1987"
    ],
    "sex": "Female"
  },
  "contactDetails": {
    "internationalAddress": "",
    "addressType": "domestic",
    "address": {
      "line1": "260 Bradford Street",
      "line2": "Deritend",
      "level2": "Birmingham",
      "postcode": "B12 0QY"
    },
    "phoneNumber": "07700 900941",
    "email": "s.jones@example.com",
    "status": [
      "Completed"
    ]
  },
  "diversity": {
    "diversityDisclosed": "true",
    "ethnicGroup": "White",
    "ethnicBackground": "Irish",
    "ethnicBackgroundOther": "",
    "disabledAnswer": "They shared that they’re disabled",
    "disabilities": [
      "Physical disability or mobility issue",
      "Social or communication impairment"
    ],
    "disabilitiesOther": "",
    "status": [
      "Completed"
    ]
  },
  "degree": {
    "items": [
      {
        "isInternational": "true",
        "subject": "Biology",
        "country": "United States",
        "endDate": "2013",
        "type": "Bachelor degree",
        "id": "31dc5e93-b521-425c-98d8-dec96eb2388c"
      },
      {
        "isInternational": "false",
        "subject": "Sport and exercise sciences",
        "institution": "The University of Manchester",
        "endDate": "2016",
        "type": "Bachelor of Science",
        "grade": "First-class honours",
        "id": "1faf0ae6-4c01-4224-9e49-06beffc0c5d0"
      }
    ],
    "degreeToBeUsedForBursaries": "31dc5e93-b521-425c-98d8-dec96eb2388c",
    "status": [
      "Completed"
    ]
  },
  placement: null,
  funding: null
})

// Partially complete apply draft with one piece of invalid data, course is eligible for a bursary
seedRecords.push({
  status: 'Draft',
  "reference": "LD9987",
  personalDetails: {
    givenName: "Samantha",
    familyName: "Koch",
    sex: 'Female'
  },
  source: "Apply",
  applyData: {
    recruitedDate: "2021-05-23T18:24:34.886Z",
    applicationDate: "2021-04-10T18:17:24.509Z"
  },
  "updatedDate": "2021-06-13T19:28:56.667Z",
  route: 'Provider-led (postgrad)',
  "courseDetails": {
    "ageRange": "11 to 19",
    "code": "P369",
    "duration": 1,
    "id": "f6f63798-910c-4174-8f72-3eed1c6cb2f9",
    "isPublishCourse": true,
    "level": "Secondary",
    "qualifications": [
      "QTS",
      "PGCE"
    ],
    "qualificationsSummary": "PGCE with QTS full time",
    "route": "Provider-led (postgrad)",
    "startDateVague": "2021-09-01T01:00:00.000Z",
    "studyMode": "Full time",
    "courseNameLong": "Mathematics (X348)",
    "courseNameShort": "Mathematics",
    "publishSubjects": {
      first: "Mathematics"
    },
    "subjects": {
      first: null
    }
  },
  degree: {
    "items": [
      {
        "isInternational": "false",
        "institution": "Brunel University London",
        "subject": "Mathematics",
        "endDate": "2014",
        "id": "a24f59d5-7e0c-4ee5-b7db-f0d192c6fe05",
        "type": "Bachelor of Science",
        "grade": "First-class honours"
      },
      {
        "type": "**invalid**Masters",
        "subject": "Civil engineering",
        "isInternational": "false",
        "institution": "Heythrop College",
        "country": "United Kingdom",
        "grade": "Distinction",
        "predicted": false,
        "startDate": "2012",
        "endDate": "2016",
        "id": "0c79cba8-cdc3-431d-96f2-62f59855cb97"
      }
    ]
  },
  trainingDetails: null,
  funding: null,
  invalidAllowed: false
})

// Fully complete draft - ready to submit
seedRecords.push({
  status: 'Draft',
  "reference": "YY5889",
  personalDetails: {
    givenName: "Jill",
    familyName: "Bachmann",
    sex: 'Female',
    status: 'Completed'
  },
  route: 'School direct (salaried)',
  "trainingDetails": {
    "traineeStarted": false,
    "commencementDate": false,
    "traineeId": "2020/21-053",
    "status": [
      "Completed"
    ]
  },
  courseDetails: {
    "isPublishCourse" : true,
    status: 'Completed'
  },
  contactDetails: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  degree: {
    status: 'Completed'
  },
  schools: {
    status: 'Completed'
  },
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

seedRecords.push({
  status: 'Draft',
  "reference": "MA3203",
  personalDetails: {
    givenName: "Rachel",
    familyName: "Laverty",
    sex: 'Female',
    status: 'Completed'
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    "traineeStarted": false,
    "commencementDate": false,
    "traineeId": "2020/21-085",
    status: [
      "Completed"
    ]
  },
  source: "Apply",
  applyData: {
    recruitedDate: "2021-05-23T18:24:34.886Z",
    applicationDate: "2021-04-10T18:17:24.509Z",
    status: "Completed"
  },
  courseDetails: {
    status: 'Completed'
  },
  contactDetails: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  degree: {
    status: 'Completed'
  },
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

seedRecords.push({
  status: 'Draft',
  "reference": "WK4201",
  personalDetails: {
    givenName: "George",
    familyName: "Briggs",
    sex: 'Male',
    status: 'Completed'
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    "traineeStarted": false,
    "commencementDate": false,
    "traineeId": "2020/21-102",
    status: [
      "Completed"
    ]
  },
  courseDetails: {
    status: 'Completed'
  },
  contactDetails: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  degree: {
    status: 'Completed'
  },
  placement: {
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

// Registered records

seedRecords.push({
  status: 'Pending TRN',
  "reference": "GJ8729",
  submittedDate: new Date(),
  personalDetails: {
    givenName: "Becky",
    familyName: "Brothers",
    nationality: ["British"],
    sex: 'Female'
  },
  diversity: {
    "diversityDisclosed": "true",
    "ethnicGroup": "Black, African, Black British or Caribbean",
    "ethnicGroupSpecific": "Caribbean",
    "disabledAnswer": "Not provided"
  },
  route: 'Teaching apprenticeship (postgrad)',
  courseDetails: {
    isPublishCourse: true,
    startDate: "2021-12-06T00:00:00.000Z"
  },
  trainingDetails: {
    commencementDate: null
  },
  id: "f202cc6d-3a97-4353-be40-6cd5f3b0a6d9"
})

seedRecords.push({
  status: "TRN received",
  "reference": "MM4938",
  trainingDetails: {
    traineeId: "2020/21-023"
  },
  // submittedDate: "2021-05-28T12:37:21.384Z",
  // updatedDate: "2021-08-04T04:26:19.269Z",
  trn: "8405624",
  route: 'Assessment only',
  courseDetails: {
    isPublishCourse: false,
    startDate: "2021-09-01T00:00:00.000Z"
  },
  trainingDetails: {
    commencementDate: null
  },
  personalDetails: {
    givenName: "Bea",
    familyName: "Waite",
    sex: "Female",
    nationality: ["French"]
  },
  id: "7461a519-4acc-4635-a1e9-d9ad55d24f3f"
})

seedRecords.push({
  status: "TRN received",
  "reference": "YW1442",
  trainingDetails: {
    traineeId: "2020/21-074",
    traineeStarted: null,
    commencementDate: null
  },
  // submittedDate: "2020-06-28T12:37:21.384Z",
  // updatedDate: "2020-07-04T04:26:19.269Z",
  trn: "8594837",
  route: 'Provider-led (postgrad)',
  courseDetails: {
    isPublishCourse: 'false',
    startDate: "2021-09-01T00:00:00.000Z"
  },
  trainingDetails: {
    commencementDate: null
  },
  personalDetails: {
    givenName: "Janine",
    familyName: "Newman",
    sex: "Female"
  },
  id: "e432974c-e719-4ab0-96a2-a144532cec80"
})

seedRecords.push({
  status: "TRN received",
  "reference": "KG4872",
  trainingDetails: {
    traineeId: "2020/21-092"
  },
  route: 'Provider-led (postgrad)',
  courseDetails: {
    isPublishCourse: false,
    startDate: "2021-09-01T00:00:00.000Z"
  },
  trainingDetails: {
    commencementDate: null
  },
  // submittedDate: "2020-05-28T12:37:21.384Z",
  // updatedDate: "2020-07-15T04:26:19.269Z",
  trn: "8694898",
  personalDetails: {
    givenName: "Martin",
    familyName: "Cable",
    sex: "Male"
  },
})

seedRecords.push({
  status: "TRN received",
  "reference": "RN3219",
  trainingDetails: {
    traineeId: "2020/21-092"
  },
  route: 'Early years (postgrad)',
  courseDetails: {
    isPublishCourse: false,
    startDate: "2021-09-01T00:00:00.000Z"
  },
  trainingDetails: {
    commencementDate: null
  },
  // submittedDate: "2020-05-28T12:37:21.384Z",
  // updatedDate: "2020-07-15T04:26:19.269Z",
  trn: "7785421",
  personalDetails: {
    givenName: "Delia",
    familyName: "Klein",
    sex: "Female"
  },
  "placement": {
    "items": [
      {
        "location": "Sacred Heart Newcastle SCITT",
        "startMonth": "1",
        "duration": "2",
        "id": "cd8d959f-a246-4402-b2c8-e1bbb9e1fc48"
      },
      {
        "location": "University of Wales Trinity Saint David (UWTSD Swansea)",
        "startMonth": "5",
        "duration": "12",
        "id": "29477b76-3f2e-4571-bb5f-7e62a2fb994a"
      }
    ],
  }
})

seedRecords.push({
  status: "TRN received",
  personalDetails: {
    givenName: "Lana",
    familyName: "Cardno",
    sex: "Female"
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    commencementDate: null
  },
  courseDetails: {
    isPublishCourse: true,
    startDate: "2021-09-01T00:00:00.000Z"
  },
  id: "2a4f4dc6-8653-4499-ae5c-22d2cdb5a3de"
})

seedRecords.push({
  status: "TRN received",
  personalDetails: {
    givenName: "Darren",
    familyName: "Perry",
    sex: "Male"
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    commencementDate: null
  },
  courseDetails: {
    isPublishCourse: true,
    startDate: "2021-12-12T00:00:00.000Z"
  },
  id: "04ad18c1-4cc2-4d3d-a979-0dc1f07fc6b4"
})

seedRecords.push({
  status: "TRN received",
  personalDetails: {
    givenName: "Jodie",
    familyName: "Fletcher",
    sex: "Female"
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    commencementDate: null
  },
  courseDetails: {
    isPublishCourse: true,
    startDate: "2021-12-12T00:00:00.000Z"
  },
  id: "e8ebf77e-cd81-4b31-8111-5c38b1277184"
})

seedRecords.push({
  status: "TRN received",
  personalDetails: {
    givenName: "Angela",
    familyName: "Scholz",
    sex: "Female"
  },
  route: 'Provider-led (postgrad)',
  trainingDetails: {
    commencementDate: null
  },
  courseDetails: {
    isPublishCourse: true,
    startDate: "2021-12-12T00:00:00.000Z"
  },
  id: "0e74f2b2-a597-46a9-993c-ecbb6d81c4bf"
})

// Special bespoke record for HPITT - for developers to compare against
seedRecords.push({
  status: "Draft",
  "reference": "RM3522",
  trainingDetails: {
    traineeId: "2021/22-075"
  },
  route: 'High potential initial teacher training (HPITT)',
  courseDetails: {
    isPublishCourse: false,
    "status": [
      "Completed"
    ]
  },
  personalDetails: {
    status: 'Completed'
  },
  contactDetails: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  degree: {
    status: 'Completed'
  },
  diversity: {
    status: 'Completed'
  },
  trainingDetails: {
    region: "South East and South coast",
    status: 'Completed'
  },
  funding: {
    status: 'Completed'
  }
})

seedRecords.push({
  status: "TRN received",
  "reference": "RJ3112",
  trainingDetails: {
    traineeId: "2021/22-076"
  },
  route: 'High potential initial teacher training (HPITT)',
  courseDetails: {
    isPublishCourse: false
  }
})

module.exports = seedRecords

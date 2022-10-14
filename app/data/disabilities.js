let disabilities = [
  {
    text: "Autistic spectrum condition or another condition affecting speech, language, communication or social skills",
    value: "Autistic spectrum condition or another condition affecting speech, language, communication or social skills"
  },
  {
    text: "Blindness or a visual impairment not corrected by glasses",
    value: "Blindness or a visual impairment not corrected by glasses"
  },
  {
    text: "Condition affecting motor, cognitive, social and emotional skills, speech or language since childhood",
    value: "Condition affecting motor, cognitive, social and emotional skills, speech or language since childhood"
  },
  {
    text: "Deafness or a serious hearing impairment",
    value: "Deafness or a serious hearing impairment"
  },
  {
    text: "Dyslexia, dyspraxia or attention deficit hyperactivity disorder (ADHD) or another learning difference",
    value: "Dyslexia, dyspraxia or attention deficit hyperactivity disorder (ADHD) or another learning difference"
  },
  {
    text: "Long term illness",
    value: "Long term illness",
    hint: {
      text: "For example, cancer, HIV, diabetes, chronic heart disease or epilepsy"
    }
  },
  {
    text: "Mental health condition",
    value: "Mental health condition",
    hint: {
      text: "For example, depression, schizophrenia or anxiery disorder"
    }
  },
  {
    text: "Physical disability or mobility issue",
    value: "Physical disability or mobility issue",
    hint: {
      text: "For example, impaired use of arms or legs, use of a wheelchair or crutches"
    }
  }
]

let otherOption = {
  text: "Another disability, health condition or impairment affecting daily life",
  value: "Another disability, health condition or impairment affecting daily life"
}

let noneOption = {
  text: "Trainee said they do not have any of these disabilites or health conditions",
  value: "Trainee said they do not have any disabilites or health conditions",
  behaviour: "exclusive"
}

let notProvidedOption = {
  text: "Trainee did not provide any information",
  value: "Trainee did not provide any information",
  behaviour: "exclusive"
}


module.exports = {
  items: disabilities,
  all: disabilities.concat(otherOption).concat(noneOption).concat(notProvidedOption),
  otherOption,
  noneOption,
  notProvidedOption
}

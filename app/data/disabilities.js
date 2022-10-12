let disabilities = [
  {
    text: "Blind",
    value: "Blind",
    hint: {
      text: "Or a serious visual impairment which is not corrected by glasses"
    }
  },
  {
    text: "Deaf",
    value: "Deaf",
    hint: {
      text: "Or a serious hearing impairment"
    }
  },
  {
    text: "Development condition",
    value: "Development condition",
    hint: {
      text: "A condition had since childhood which affects motor, cognitive, social and emotional skills, and speech and language"
    }
  },
  {
    text: "Learning difficulty",
    value: "Learning difficulty",
    hint: {
      text: "For example, dyslexia, dyspraxia or ADHD"
    }
  },
  {
    text: "Long-standing illness",
    value: "Long-standing illness",
    hint: {
      text: "For example, cancer, HIV, diabetes, chronic heart disease or epilepsy"
    }
  },
  {
    text: "Mental health condition",
    value: "Mental health condition",
    hint: {
      text: "For example, depression, schizophrenia or anxiety disorder"
    }
  },
  {
    text: "Physical disability or mobility issue",
    value: "Physical disability or mobility issue",
    hint: {
      text: "For example, impaired use of arms or legs, use of a wheelchair or crutches"
    }
  },
  {
    text: "Social or communication impairment",
    value: "Social or communication impairment",
    hint: {
      text: "For example a speech and language impairment or an autistic spectrum condition"
    }
  }
]

let otherOption = {
  text: "Other",
  value: "Other"
}

let noneOption = {
  text: "I do not have any of these disabilities or health conditions",
  value: "No disabilities or health conditions",
  behaviour: "exclusive"
}

let notProvidedOption = {
  text: "Prefer not to say",
  value: "Prefer not to say",
  behaviour: "exclusive"
}


module.exports = {
  items: disabilities,
  all: disabilities.concat(otherOption).concat(noneOption).concat(notProvidedOption),
  otherOption,
  noneOption,
  notProvidedOption
}

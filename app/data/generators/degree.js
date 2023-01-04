const { faker }          = require('@faker-js/faker')
const weighted           = require('weighted')
const degreeData         = require('../degree')
const degreeInstitutions = require('../degree-instituions')

module.exports = (params, application) => {

  const isApplyDraft = (application.source == 'Apply' && application.status == "Draft")
  
  const item = (faker) => {
    let subject = faker.helpers.arrayElement(degreeData().subjects)
    const predicted = faker.datatype.boolean()
    const endDate = faker.helpers.arrayElement(['2020','2019','2018','2017','2016','2015'])
    const startDate = (parseInt(endDate) - 4).toString()
    const id = faker.datatype.uuid()
    const sectionIsComplete = (params?.degree?.status == "Completed")
    const invalidAllowed = (params?.invalidAllowed === false) ? false : true

    // Make 1/3rd of subjects be invalid responses for Apply applications
    // But don’t spit out invalid data if the section is marked as completed
    if (isApplyDraft && !sectionIsComplete && invalidAllowed){
      let invalidSubject = `**invalid**${faker.helpers.arrayElement(degreeData().invalidSubjects)}`
      subject = weighted.select([subject, invalidSubject], [0.7, 0.3])
    }

    if (application.isInternationalTrainee) {
      return {
        // type: 'Diplôme',
        type: 'Bachelor degree', // ENIC equivalent
        subject,
        isInternational: "true",
        institution: 'University of Paris',
        country: 'France',
        // grade: 'Pass',
        predicted,
        enic: { // ENIC key not used? probably copied from Manage
          reference: '4000228363',
          comparable: 'Bachelor degree'
        },
        startDate,
        endDate,
        id
      }
    } else {
      let type = faker.helpers.arrayElement(degreeData().types.all).text
      let institution = faker.helpers.arrayElement(degreeInstitutions).name

      // Make 1/3rd of types and institutions be invalid responses
      // But don’t spit out invalid data if the section is marked as completed
      if (isApplyDraft && !sectionIsComplete  && invalidAllowed){
        let randomInvalidType = `**invalid**${faker.helpers.arrayElement(degreeData().invalidTypes)}`
        type = weighted.select([type, randomInvalidType], [0.7, 0.3])

        let randomInvalidInstitution = `**invalid**${faker.helpers.arrayElement(degreeData().invalidInstitutions)}`
        institution = weighted.select([institution, randomInvalidInstitution], [0.7, 0.3])
      }

      const level = type.level
      let grade

      if (level <= 6){
        grade = faker.helpers.arrayElement([
          'First-class honours',
          'Upper second-class honours (2:1)',
          'Lower second-class honours (2:2)',
          'Third-class honours',
          'Pass'
        ])
      }
      else {
        grade = faker.helpers.arrayElement([
          'First-class honours',
          'Upper second-class honours (2:1)',
          'Lower second-class honours (2:2)',
          'Pass',
          'Merit',
          'Distinction',
          'Pass',
          'Merit',
          'Distinction'
        ])
      }

      return {
        type,
        subject,
        isInternational: "false",
        institution,
        // country: 'United Kingdom',
        grade,
        predicted,
        startDate,
        endDate,
        id
      }
    }
  }

  // Number of qualifications to add
  const count = weighted.select({
    1: 0.9,
    2: 0.1
  })
  const items = []
  for (var i = 0; i < count; i++) {
    items.push(item(faker))
  }

  // Trainees with multiple degrees must have a single degree selected for the
  // purposes of bursaries
  let degreeToBeUsedForBursaries
  if (items.length > 1 && !isApplyDraft){
    degreeToBeUsedForBursaries = faker.helpers.arrayElement(items).id
  }

  return {
    items: items
  }
}

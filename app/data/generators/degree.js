const faker   = require('faker')
const weighted = require('weighted')
const degreeData = require('../degree')

module.exports = (params, application) => {

  const isApplyDraft = (application.source == 'Apply' && application.status == "Draft")
  
  const item = (faker) => {
    let subject = faker.helpers.randomize(degreeData().subjects)
    const predicted = faker.datatype.boolean()
    const endDate = faker.helpers.randomize(['2020','2019','2018','2017','2016','2015'])
    const startDate = (parseInt(endDate) - 4).toString()
    const id = faker.datatype.uuid()
    const sectionIsComplete = (params?.degree?.status == "Completed")
    const invalidAllowed = (params?.invalidAllowed === false) ? false : true

    // Make 1/3rd of subjects be invalid responses for Apply applications
    // But don’t spit out invalid data if the section is marked as completed
    if (isApplyDraft && !sectionIsComplete && invalidAllowed){
      let invalidSubject = `**invalid**${faker.helpers.randomize(degreeData().invalidSubjects)}`
      subject = weighted.select([subject, invalidSubject], [0.9, 0.1])
    }

    if (application.isInternationalTrainee) {
      return {
        // type: 'Diplôme',
        type: 'Bachelor degree', // ENIC equivalent
        subject,
        isInternational: "true",
        org: 'University of Paris',
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
      let type = faker.helpers.randomize(degreeData().types.all).text
      let org = faker.helpers.randomize(degreeData().orgs)

      // Make 1/3rd of types and orgs be invalid responses
      // But don’t spit out invalid data if the section is marked as completed
      if (isApplyDraft && !sectionIsComplete  && invalidAllowed){
        let randomInvalidType = `**invalid**${faker.helpers.randomize(degreeData().invalidTypes)}`
        type = weighted.select([type, randomInvalidType], [0.9, 0.1])

        let randomInvalidOrg = `**invalid**${faker.helpers.randomize(degreeData().invalidInstitutions)}`
        org = weighted.select([org, randomInvalidOrg], [0.9, 0.1])
      }

      const level = type.level
      const grade = faker.helpers.randomize([
        'First-class honours',
        'Upper second-class honours (2:1)',
        'Lower second-class honours (2:2)',
        'Third-class honours',
        'Pass',
        ...(level !== 6) ? ['Merit'] : [],
        ...(level !== 6) ? ['Distinction'] : [],
        ...(level !== 6) ? ['Not applicable'] : [],
        ...(level !== 6) ? ['Unknown'] : []
      ])

      return {
        type,
        subject,
        isInternational: "false",
        org,
        // country: 'United Kingdom',
        grade,
        predicted,
        startDate,
        endDate,
        id
      }
    }
  }

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
    degreeToBeUsedForBursaries = faker.helpers.randomize(items).id
  }

  return {
    items: items
  }
}

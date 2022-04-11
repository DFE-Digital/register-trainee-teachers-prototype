const { faker }         = require('@faker-js/faker')
const weighted = require('weighted')

module.exports = () => {

  let ethnicGroup
  let ethnicBackground
  let disabledAnswer
  let disabilities

  const ethnicGroups = {
    "Asian or Asian British" : [
      "Bangladeshi",
      "Chinese",
      "Indian",
      "Pakistani",
      "Any other Asian background",
      "Not provided"
    ],
    "Black, African, Black British or Caribbean" : [
      "African",
      "Caribbean",
      "Any other Black, African or Caribbean background",
      "Not provided"
    ],
    "Mixed or multiple ethnic groups" : [
      "White and Asian",
      "White and Black African",
      "White and Black Caribbean",
      "Any other Mixed or Multiple ethnic background",
      "Not provided"
    ],
    "White" : [
      "English, Welsh, Scottish, Northern Irish or British",
      "Irish",
      "Gypsy or Irish Traveller",
      "Any other White background",
      "Not provided"
    ],
    "Other ethnic group" : [
      "Arab",
      "Any other ethnic group",
      "Not provided"
    ]
  }

    ethnicGroup = faker.helpers.randomize([
      "Asian or Asian British",
      "Black, African, Black British or Caribbean",
      "Mixed or multiple ethnic groups",
      "White",
      "Other ethnic group",
      "Not provided"
    ])

    if (ethnicGroup != "Not provided"){
      ethnicBackground = faker.helpers.randomize(
        ethnicGroups[ethnicGroup]
        )
    }

    disabledAnswer = faker.helpers.randomize([
      "They shared that they’re disabled",
      "They shared that they’re not disabled",
      "Not provided"])

    disabilityCount = faker.datatype.number(1, 3); // up to 3 disabilities

    let disabilityChoices = [
      "Blind",
      "Deaf",
      "Learning difficulty",
      "Long-standing illness",
      "Mental health condition",
      "Physical disability or mobility issue",
      "Social or communication impairment",
      "Other"
    ]
    let shuffledDisabilities = disabilityChoices.sort(() => 0.5 - Math.random());

    if ((disabledAnswer=="They shared that they’re disabled") && disabilityCount){
      disabilities = shuffledDisabilities.slice(0, disabilityCount).sort();
    }


  return {
    ethnicGroup,
    ethnicBackground,
    disabledAnswer,
    disabilities
  }
}

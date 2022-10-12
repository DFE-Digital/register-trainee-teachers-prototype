const { faker }         = require('@faker-js/faker')
const weighted = require('weighted')

const disabilities = require('../disabilities.js')

module.exports = () => {

  let ethnicGroup
  let ethnicBackground

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
      "Roma",
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

    let hasDisability = weighted.select([true, false], [0.3,0.7])

    let disabilityCount = faker.helpers.shuffle([1, 2, 3])[0] // up to 3 disabilities

    let disabilityChoices = disabilities.items.map(item => item.value)

    let shuffledDisabilities = faker.helpers.shuffle(disabilityChoices)

    let selectedDisabilities

    if (hasDisability){
      selectedDisabilities = shuffledDisabilities.slice(0, disabilityCount).sort();
    }
    else {
      selectedDisabilities = [weighted.select(
        [disabilities.noneOption.value, disabilities.notProvidedOption.value],
        [0.5, 0.5]
      )]
    }

  return {
    ethnicGroup,
    ethnicBackground,
    disabilities: selectedDisabilities
  }
}

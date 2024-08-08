const { fakerEN_GB: faker } = require('@faker-js/faker')

module.exports = (application) => {
  const events = { items: [] }

  const date = faker.helpers.arrayElement([
    '2021-08-12',
    '2021-08-11',
    faker.date.past(),
    faker.date.past(),
    faker.date.past(),
    faker.date.past(),
    faker.date.past()
  ])

  const addEvent = (content, description) => {
    events.items.push({
      title: content,
      user: 'Provider',
      date: date,
      ...( description? { description } : {})
    })
  }

if ( application.source !== "Manual" ){
  addEvent("Record imported from " +  application.source )
}
else {
  addEvent("Record created")
}

if (application.status == 'Pending TRN'){
  addEvent("Trainee submitted for TRN")
}

if (application.status == 'TRN received'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
}

if (application.status == 'EYTS recommended'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for EYTS")
}

if (application.status == 'EYTS awarded'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for EYTS")
  addEvent("EYTS awarded")
}

if (application.status == 'QTS recommended'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for QTS")
}

if (application.status == 'QTS awarded'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee recommended for QTS")
  addEvent("QTS awarded")
}

if (application.status == 'Deferred'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee deferred")
}

let withdrawalTextHtml = `Date trainee withdrew: 1 September 2021`

if (application.status == 'Withdrawn'){
  addEvent("Trainee submitted for TRN")
  addEvent("TRN received")
  addEvent("Trainee withdrawn", withdrawalTextHtml)
}


  return events
}

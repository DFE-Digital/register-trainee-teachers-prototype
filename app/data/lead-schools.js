let selectedLeadSchools = [
  {
    name: "Whitmore High School",
    postcode: "HA2 0AD",
    urn: "102239"
  },
  {
    name: "Crispin School Academy",
    postcode: "BA16 0AD",
    urn: "136913"
  },
  {
    name: "Watford Grammar School for Girls",
    postcode: "WD18 0AE",
    urn: "136289"
  },
  {
    name: "The Joseph Whitaker School",
    postcode: "NG21 0AG",
    urn: "137628"
  },
  {
    name: "Heckmondwike Grammar School",
    postcode: "WF16 0AH",
    urn: "136283"
  },
  {
    name: "Emmanuel College",
    postcode: "NE11 0AN",
    urn: "108420"
  },
  {
    name: "Moorside High School",
    postcode: "M27 0AP",
    urn: "144199"
  },
  {
    name: "Hope Academy",
    postcode: "WA12 0AQ",
    urn: "136421"
  },
  // {
  //   name: "Lord Scudamore Primary Academy",
  //   postcode: "HR4 0AS",
  //   urn: "136761"
  // },
  // {
  //   name: "Barnsbury Primary School and Nursery",
  //   postcode: "GU22 0BB",
  //   urn: "140540"
  // },
  // {
  //   name: "Millennium Primary School",
  //   postcode: "SE10 0BG",
  //   urn: "143211"
  // },
  // {
  //   name: "Higham Lane School",
  //   postcode: "CV10 0BJ",
  //   urn: "137767"
  // },
  // {
  //   name: "Tarporley High School and Sixth Form College",
  //   postcode: "CW6 0BL", 
  //   urn: "138483"
  // },
  // {
  //   name: "Southgate School",
  //   postcode: "EN4 0BL",
  //   urn: "142727"
  // },
  // {
  //   name: "Thames Ditton Junior School",
  //   postcode: "KT7 0BS",
  //   urn: "124967"
  // },
  {
    name: "West Park Primary School",
    postcode: "TS26 0BU",
    urn: "141717"
  },
  {
    name: "Beam Primary School",
    postcode: "RM10 9ED",
    urn: "101202"
  },
]


module.exports = {
  selected: selectedLeadSchools.map(school => {
    return {
      type: "leadSchool",
      ...school
    }
  })
}

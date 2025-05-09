const { fakerEN_GB: faker } = require('@faker-js/faker')

// Seed allows the UUIDs to be consistent each time we run this. The seed should be different than that used by lead-schools.js so we get different UUIDs for each.
faker.seed(124)

// const all = [
//   '2Schools Consortium',
//   'AA Teamworks West Yorkshire SCITT',
//   'Alban Federation',
//   'Alliance for Learning SCITT',
//   'Altius Alliance',
//   'Anglia Ruskin University',
//   'ARK Teacher Training',
//   'Ashton on Mersey School SCITT',
//   'Associated Merseyside Partnership SCITT',
//   'Astra SCITT',
//   'Barr Beacon SCITT',
//   'Bath Spa University',
//   'Billericay Educational Consortium',
//   'Birmingham City University',
//   'Birmingham Primary Training Partnership SCITT',
//   'Bishop Grosseteste University',
//   'Bishop Rawstorne School Direct Programme',
//   'Bishop’s Stortford SCITT',
//   'BLT SCITT',
//   'Bluecoat SCITT Alliance Nottingham',
//   'Bournemouth Poole & Dorset Teacher Training Partnership',
//   'Bourton Meadow Initial Teacher Training Centre',
//   'Bradford Birth to 19 SCITT',
//   'Bradford College',
//   'Bromley Schools Collegiate',
//   'Brunel University London',
//   'Buckingham Partnership',
//   'Buile Hill VA College SCITT',
//   'Buile Hill Visual Arts College',
//   'Cabot Learning Federation SCITT',
//   'Canterbury Christ Church University',
//   'Carmel Teacher Training (SCITT)',
//   'Carmel Teacher Training Partnership (CTTP)',
//   'Chepping View Primary Academy SCITT',
//   'Chepping View Primary Academy',
//   'Cheshire East SCITT',
//   'Chiltern Training Group',
//   'City of Westminster College',
//   'Colchester Teacher Training Consortium',
//   'Compton SCITT',
//   'Consilium SCITT',
//   'Cornwall School Centred Initial Teacher Training. (Cornwall SCITT)',
//   'Cornwall SCITT Partnership (3-11)',
//   'Coventry University',
//   'Cramlington Learning Village',
//   'Cramlington Teaching School Alliance SCITT',
//   'CREC Early Years Partnership',
//   'Cumbria Primary Teacher Training',
//   'Devon Primary SCITT',
//   'Devon Secondary Teacher Training Group (DSTTG)',
//   'Doncaster ITT Partnership',
//   'Dorset Teacher Training Partnership',
//   'Dove House School Academy Trust',
//   'Durham SCITT',
//   'Durham University',
//   'e-Qualitas',
//   'East London Alliance SCITT',
//   'East Midlands Teacher Training Partnership',
//   'East of England Teacher Training',
//   'EAST SCITT',
//   'Edge Hill University',
//   'Educate Teacher Training',
//   'Endeavour Learning SCITT',
//   'Essex and Thames SCITT',
//   'Essex Primary SCITT',
//   'Essex Teacher Training',
//   'Exceed SCITT',
//   'Fareham and Gosport Primary SCITT',
//   'Forest Independent Primary Collegiate SCITT',
//   'Fylde Coast Teaching School SCITT',
//   'Gateshead Primary SCITT',
//   'George Abbot SCITT',
//   'George Spencer Academy SCITT',
//   'GLF Schools’ Teacher Training',
//   'Gloucestershire Initial Teacher Education Partnership (GITEP)',
//   'Goldsmiths, University of London',
//   'Gorse SCITT',
//   'Hamwic SCITT',
//   'Harris ITE',
//   'Haybridge Alliance SCITT',
//   'Henry Maynard Training E17',
//   'High Force Education (SCITT)',
//   'Hillingdon SCITT',
//   'Huddersfield Horizon SCITT',
//   'Hull SCITT',
//   'i2i Teaching Partnership',
//   'Inspiration Teacher Training',
//   'Inspiring Leaders with Discovery Schools Trust',
//   'Inspiring Leaders with Flying High Partnership',
//   'Inspiring Leaders with Redhill Secondary Teacher Training',
//   'Isle of Wight SCITT',
//   'Jewish Teacher Training Partnership',
//   'Keele and North Staffordshire Teacher Education',
//   'Keele University',
//   'Kent and Medway Training',
//   'King Edward’s Consortium',
//   'Kingsbridge EIP SCITT',
//   'Kingston University',
//   'King’s College London (University of London)',
//   'Kirklees and Calderdale SCITT',
//   'Lampton LWA SCITT',
//   'Landau Forte College Derby SCITT',
//   'Leeds Beckett University',
//   'Leeds SCITT',
//   'Leeds Trinity University',
//   'Leicester & Leicestershire SCITT',
//   'Leicestershire Secondary SCITT',
//   'Lincolnshire Teaching School Alliance SCITT',
//   'Liverpool Hope University',
//   'Liverpool John Moores University',
//   'London East Teacher Training Alliance',
//   'London Metropolitan University',
//   'London South Bank University',
//   'Loughborough University',
//   'Manchester Nexus SCITT',
//   'Matthew Moss ITT Partnership',
//   'Mersey Boroughs ITT Partnership',
//   'Merseyside, Cheshire and Greater Manchester Teacher Training Consortium',
//   'Mid Essex Initial Teacher Training',
//   'Mid Somerset Consortium for Teacher Training',
//   'Middlesex University',
//   'NELTA (North East London Teaching Alliance)',
//   'Newman University',
//   'Norfolk GTP Provider',
//   'Norfolk Teacher Training Centre',
//   'North East Partnership SCITT (Physical Education)',
//   'North Essex Teacher Training (NETT)',
//   'North Lincolnshire SCITT Partnership',
//   'North Manchester ITT Partnership',
//   'North Tyneside SCITT',
//   'North West SHARES SCITT',
//   'North West Teaching School Alliance',
//   'North Wiltshire SCITT',
//   'Northampton Teacher Training Partnership',
//   'Northern Lights SCITT',
//   'Nottingham City Primary SCITT',
//   'Nottingham Trent University',
//   'Nottinghamshire TORCH SCITT',
//   'Oxford Brookes University',
//   'Oxford University',
//   'Oxon-Bucks SCITT',
//   'Park Community School',
//   'Partnership London SCITT (PLS)',
//   'Pennine Lancashire SCITT',
//   'Pioneers Partnership SCITT',
//   'Plymouth Marjon University',
//   'Poole SCITT',
//   'Portsmouth Primary SCITT',
//   'Prestolee SCITT',
//   'Primary Catholic Partnership SCITT',
//   'Prince Henry’s High School & South Worcestershire SCITT',
//   'Red Kite Teacher Training',
//   'Redcar and Cleveland Teacher Training Partnership',
//   'Ripley TSA SCITT',
//   'Roehampton University',
//   'Royal Academy of Dance',
//   'Rushey Mead School',
//   'Sacred Heart Newcastle SCITT',
//   'SAF Initial Teacher Training',
//   'SCITT in East London Schools (SCITTELS)',
//   'Selby College',
//   'Services for Education',
//   'Sheffield Hallam University',
//   'Shotton Hall SCITT',
//   'Somerset SCITT Consortium',
//   'South Birmingham SCITT',
//   'South Coast SCITT',
//   'South Cumbria SCITT',
//   'South West Teacher Training',
//   'Southfields Academy Teaching School SCITT',
//   'St Joseph’s College SCITT',
//   'St Mary’s University, Twickenham',
//   'St. George’s Academy Partnership',
//   'St. Joseph’s College Stoke Secondary Partnership',
//   'Staffordshire University',
//   'Star Teachers SCITT',
//   'Stockton-on-Tees Teacher Training Partnership',
//   'Stourport SCITT',
//   'Suffolk and Norfolk Primary SCITT',
//   'Suffolk and Norfolk Secondary SCITT',
//   'Surrey County Council',
//   'Surrey South Farnham SCITT',
//   'Sussex Teacher Training Partnership',
//   'Sutton Park SCITT',
//   'Sutton SCITT',
//   'Swindon SCITT',
//   'Tarleton Academy',
//   'Teach East',
//   'Teach Kent & Sussex',
//   'Teach SouthEast',
//   'Teach@Salesian',
//   'Teach@SJB',
//   'Teaching London: LDBS SCITT',
//   'Tes Institute',
//   'Thamesmead SCITT',
//   'The Arthur Terry School SCITT',
//   'The Basingstoke Alliance SCITT',
//   'The Bedfordshire Schools Training Partnership',
//   'The Buckingham Partnership',
//   'The Cambridge Partnership',
//   'The Cambridge Teaching Schools Network SCITT',
//   'The Cherwell OTSA SCITT',
//   'The Coventry SCITT',
//   'The Deepings SCITT',
//   'The Duston Education Trust',
//   'The GORSE Academies Trust',
//   'The Grand Union Training Partnership',
//   'The Hampshire SCITT Partnership',
//   'The Havering Teacher Training Partnership',
//   'The John Taylor SCITT',
//   'The Learning Institute South West',
//   'The London Diocesan Board For Schools',
//   'The Manchester Metropolitan University',
//   'The National Mathematics and Physics SCITT',
//   'The National Modern Languages SCITT',
//   'The National SCITT in Outstanding Primary Schools',
//   'The OAKS (Ormiston and Keele SCITT)',
//   'The Open University',
//   'The Pimlico-London SCITT',
//   'The Robert Owen Society',
//   'The Royal Borough of Windsor and Maidenhead SCITT',
//   'The Royal Central School of Speech and Drama',
//   'The Sheffield SCITT',
//   'The Shire Foundation',
//   'The Solent SCITT',
//   'The South Downs SCITT',
//   'The Tommy Flowers SCITT Milton Keynes',
//   'The University of Aberdeen',
//   'The University of Buckingham',
//   'The University of Edinburgh',
//   'The University of Gloucestershire',
//   'The University of Hull',
//   'The University of Manchester',
//   'The University of Nottingham',
//   'The University of Reading',
//   'The University of Sheffield',
//   'The University of Strathclyde',
//   'The University of Warwick',
//   'The University of York',
//   'Three Counties Alliance SCITT',
//   'Titan Partnership Ltd',
//   'TKAT SCITT',
//   'Tudor Grange SCITT',
//   'Two Mile Ash ITT Partnership',
//   'UCL, University College London (University of London)',
//   'University Campus Oldham',
//   'University College Birmingham',
//   'University of Bath',
//   'University of Bedfordshire',
//   'University of Birmingham',
//   'University of Bolton',
//   'University of Brighton',
//   'University of Bristol',
//   'University of Cambridge',
//   'University of Central Lancashire',
//   'University of Chester',
//   'University of Chichester',
//   'University of Cumbria',
//   'University of Derby',
//   'University of Dundee',
//   'University of East Anglia',
//   'University of East London',
//   'University of Exeter',
//   'University of Glasgow',
//   'University of Greenwich',
//   'University of Hertfordshire',
//   'University of Huddersfield',
//   'University of Leicester',
//   'University of Newcastle Upon Tyne',
//   'University of Northampton',
//   'University of Northumbria at Newcastle',
//   'University of Plymouth',
//   'University of Portsmouth',
//   'University of South Wales (formerly University of Wales, Newport)',
//   'University of Southampton',
//   'University of Sunderland',
//   'University of Sussex',
//   'University of the Highlands and Islands',
//   'University of the West of England, Bristol',
//   'University of the West of Scotland',
//   'University of Wales Trinity Saint David (UWTSD Swansea)',
//   'University of Winchester',
//   'University of Wolverhampton',
//   'University of Worcester',
//   'Wakefield Regional Partnership For Initial Teacher Training',
//   'Wandsworth Primary Schools  Consortium',
//   'Wessex Schools Training Partnership',
//   'West Berkshire Training Partnership',
//   'West Essex SCITT',
//   'West Midlands Consortium',
//   'Wildern Partnership',
//   'Wildern School',
//   'York St John University',
//   'Yorkshire and Humber Teacher Training',
//   'Yorkshire Wolds Teacher Training',
//   'Webury Hill SCITT' // Fake SCITT
// ]

// const permanentAccreditingProviders = [
//   'Webury Hill SCITT', // Fake SCITT
//   'Coventry University'
//   // "The University of Buckingham",
//   // "Leeds SCITT",
//   // "Leeds Trinity University",
//   // "Bournemouth Poole",
//   // "Dorset Teacher Training Partnership",
//   // "South Coast SCITT"
// ]

const higherEducationInstitutions = [
  'University of Lincoln',
  // "Durham University",
  'King’s Oak University'
  // "Imperial College London"
]

const scitt = [
  'Webury Hill SCITT', // Fake SCITT
  // "West Essex SCITT",
  'The John Taylor SCITT'
]

// // Returns a smaller set of providers as the real set is too big
// const getSelectedProviders = (providers, permanentProviders) => {
//   // One in 50 providers
//   let reducedProviders = providers.filter((provider, index) => {
//     return (index % 50 === 0)
//   })

//   reducedProviders = reducedProviders.concat(permanentAccreditingProviders).sort()
//   return [...new Set(reducedProviders)] // Uniq
// }

const makeObject = (providers, type) => {
  return providers.map(provider => {
    return {
      name: provider,
      type: 'accreditingProvider',
      accreditingProviderType: type,
      id: faker.string.uuid(),
      ukprn: faker.number.int({ min: 100000, max: 999999 }),
      providerCode: faker.string.alphanumeric(3).toUpperCase(),
      accreditationId: faker.number.int({ min: 1000, max: 9999 }),
      shouldImportFromApply: faker.datatype.boolean()
    }
  })
}

const allProviders = makeObject(higherEducationInstitutions, 'HEI').concat(makeObject(scitt, 'SCITT'))

// const selected = getSelectedProviders(all, permanentAccreditingProviders)

module.exports = {
  all: allProviders,
  selected: allProviders
}

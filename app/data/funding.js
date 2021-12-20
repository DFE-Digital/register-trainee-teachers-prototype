var CSV = require('csv-string')
const _ = require('lodash')

// csv of monthly funding for SCITTS
let monthlyFundingScittsCsv = 
`Academic year,Provider ID,Provider name,Description,Total funding,August,September,October,November,December,January,February,March,April,May,June,July
2021/22,12345,example provider,FE ITT Bursary for AY 2021/22,401000,0,18900,32880,42911,50932,36511,36511,36511,36461,36461,36461,36461
2021/22,12345,example provider,Training bursary trainees,1285000,0,22032,22032,22032,396504,115650,115650,167050,115650,115650,115650,77100
2021/22,12345,example provider,Early Years ITT Bursaries & Training Grants,241000,0,16020,16020,16020,38700,21690,21690,31330,21690,21690,21690,14460
2021/22,12345,example provider,FE ITT in-year adjs for AY 2021/22,-112000,0,0,-5000,-15000,-13600,-11200,-11200,-11200,-11200,-11200,-11200,-11200
2021/22,12345,example provider,FE ITT Annex G adj for AY 2018/19,-1500,0,0,0,-750,-750,0,0,0,0,0,0,0
2021/22,12345,example provider,Course extension trainee payments for AY 20/21,45500,0,0,0,22750,22750,0,0,0,0,0,0,0
2021/22,12345,example provider,Course extension provider payments for AY 20/21,14000,0,0,0,7000,7000,0,0,0,0,0,0,0
2021/22,12345,example provider,EY 21/22 in-year adjustment for withdrawals,-11667,0,0,0,0,-5833,-5833,0,0,0,0,0,0`

let monthlyFundingScittsArray = CSV.parse(monthlyFundingScittsCsv)
monthlyFundingScittsArray.shift() // remove header row

let monthlyFundingScitts = []
monthlyFundingScittsArray.forEach(row => {
  let description = row[3]
  let monthlyPayments = row.slice(5, 17).map(value => parseInt(value))
  monthlyFundingScitts.push({
    description,
    monthlyPayments
  })
})

// csv training bursaries and scholarships for SCITTS
let annualFundingScittsCsv =
`Provider,Provider name,Academic Year,Subject,Route,Lead School,Lead School ID,Cohort Level,Core Allocated places,Final Bursary Awards PG ITT/Tier 1 EYITT,Final Bursary Awards Tier 2 EYITT,Final Bursary Awards Tier 3 EYITT,Final Bursary Awards UG ITT/Tier 4 EYITT,Final Bursary Awards Scholarship,Final Bursary Awards No Bursary Awarded,Bursary Funding Data PG ITT/Tier 1 EYITT,Bursary Funding Data Tier 2 EYITT,Bursary Funding Data Tier £ EYITT,Bursary Funding Data UG ITT/Tier 4 EYITT,Bursary Funding Data Scholarship,Initial Bursary Funding PG ITT/Tier 1 EYITT,Initial Bursary Funding Tier 2 EYITT,Initial Bursary Funding Tier 3 EYITT,Initial Bursary Funding UG ITT/Tier 4 EYITT,Initial Bursary Funding Scholarship,Total Bursary Funding
12345,example provider,2021/22,Social sciences,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Health & social care,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Drama,School Direct tuition fee,Brockhill Park Performing Arts College,137458,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Modern Languages,Provider-led,,,PG,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Design & technology,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Physics,School Direct tuition fee,St Joseph's Catholic Primary School,137422,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Physics,Provider-led,,,PG,0,2,0,0,0,1,0,24000,0,0,0,26000,48000,0,0,0,0,48000
12345,example provider,2021/22,Physical education,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Chemistry,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Citizenship,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Mathematics,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Physics,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Psychology,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Economics,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Music,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Biology,School Direct tuition fee,West Park Primary School,141931,PG,0,1,0,0,0,0,0,7000,0,0,0,0,7000,0,0,0,0,7000
12345,example provider,2021/22,Computing,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Primary,School Direct tuition fee,Mulberry School for Girls,143629,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Psychology,School Direct tuition fee,Dunraven School,137093,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Business studies,Provider-led,,,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Geography,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,History,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Computing,Provider-led,,,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,English,Provider-led,,,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Drama,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Chemistry,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,2,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,History,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,History,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Biology,Provider-led,,,PG,0,0,0,0,0,0,0,7000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,English,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Business studies,School Direct tuition fee,Riddlesdown Collegiate,138178,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Primary,Provider-led,,,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Drama,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Religious education,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Geography,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Economics,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Primary,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Classics,Provider-led,,,PG,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Biology,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,7000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Geography,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Religious education,School Direct tuition fee,St Joseph's Catholic Primary School,137422,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Music,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Mathematics,School Direct tuition fee,St Joseph's Catholic Primary School,137422,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Business studies,School Direct tuition fee,Ifield School,119040,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Psychology,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Mathematics,School Direct tuition fee,West Park Primary School,141931,PG,0,2,0,0,0,0,0,24000,0,0,0,26000,48000,0,0,0,0,48000
12345,example provider,2021/22,Dance,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Drama,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Mathematics,Provider-led,,,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Dance,School Direct tuition fee,Dunraven School,137093,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Media Studies,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Business studies,School Direct tuition fee,Dunraven School,137093,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Modern Languages,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Religious education,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Music,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Dance,School Direct tuition fee,Brockhill Park Performing Arts College,137458,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Design & technology,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Religious education,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Art & design,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Physical education,Provider-led,,,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Art & design,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Classics,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Social sciences,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Physics,School Direct tuition fee,West Park Primary School,141931,PG,0,1,0,0,0,0,0,24000,0,0,0,26000,24000,0,0,0,0,24000
12345,example provider,2021/22,Design & technology,School Direct tuition fee,Ifield School,119040,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Primary with mathematics,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Business studies,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Modern Languages,School Direct tuition fee,West Park Primary School,141931,PG,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Computing,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Primary,School Direct tuition fee,St Elphege's RC Infants' School,102997,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Primary,School Direct tuition fee,Beam Primary School,137353,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Chemistry,Provider-led,,,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Early Years ITT,EYITT Graduate employment-based,,,PG,113,0,0,0,0,0,113,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Early Years ITT,EYITT Graduate Entry,,,PG,9,2,6,0,0,0,0,5000,4000,2000,0,0,10000,24000,0,0,0,34000
12345,example provider,2021/22,Physical Education,School Direct tuition fee,Brockhill Park Performing Arts College,137458,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Physical Education,School Direct tuition fee,Dunraven School,137093,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
12345,example provider,2021/22,Mathematics,School Direct tuition fee,Dunraven School,137093,PG,0,0,0,0,0,0,0,24000,0,0,0,26000,0,0,0,0,0,0
12345,example provider,2021/22,Primary,School Direct tuition fee,Swiss Cottage School - Development and Research Centre,100096,PG,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0`

let annualFundingScittsArray = CSV.parse(annualFundingScittsCsv)
annualFundingScittsArray.shift() // remove header row

let annualFundingScitts = []
annualFundingScittsArray.forEach(row => {
  let provider                           =          row[2]
  let subject                            =          row[3]
  let route                              =          row[4]
  let leadSchool                         =          row[5]
  let cohortLevel                        =          row[7]
  let coreAllocatedPlaces                = parseInt(row[8],  10)
  let numberOfTtraineesPgIttOrTier1EyItt = parseInt(row[9],  10)
  let numberOfTtraineesTier2EyItt        = parseInt(row[10], 10)
  let numberOfTtraineesTier3EyItt        = parseInt(row[11], 10)
  let numberOfTtraineesUGIttOrTier4EyItt = parseInt(row[12], 10)
  let numberOfTtraineesScholarship       = parseInt(row[13], 10)
  let numberOfTtraineesNoBursaryAwarded  = parseInt(row[14], 10)
  let amountPgIttOrTier1EyItt            = parseInt(row[15], 10)
  let amountTier2EyItt                   = parseInt(row[16], 10)
  let amountTier3EyItt                   = parseInt(row[17], 10)
  let amountUGIttOrTier4EyItt            = parseInt(row[18], 10)
  let amountScholarship                  = parseInt(row[19], 10)
  let numberOfTrainees = [
    numberOfTtraineesPgIttOrTier1EyItt,
    numberOfTtraineesTier2EyItt,
    numberOfTtraineesTier3EyItt,
    numberOfTtraineesUGIttOrTier4EyItt,
    numberOfTtraineesScholarship,
    numberOfTtraineesNoBursaryAwarded
  ]
  let hasTrainees = numberOfTrainees.some( type => parseInt(type) )
  if (hasTrainees)
    { annualFundingScitts.push(
      { provider,
        subject,
        route,
        leadSchool,
        cohortLevel,
        coreAllocatedPlaces,
        numberOfTtraineesPgIttOrTier1EyItt,
        numberOfTtraineesTier2EyItt,
        numberOfTtraineesTier3EyItt,
        numberOfTtraineesUGIttOrTier4EyItt,
        numberOfTtraineesScholarship,
        numberOfTtraineesNoBursaryAwarded,
        amountPgIttOrTier1EyItt,
        amountTier2EyItt,
        amountTier3EyItt,
        amountUGIttOrTier4EyItt,
        amountScholarship
    })
  }
})

let monthlyFundingLeadSchoolsCsv = 
`Academic year,Lead school URN,Lead school name,Provider ID,Provider name,Description,Total funding,August,September,October,November,December,January,February,March,April,May,June,July
2021/22,12345,example lead school,,,Course extension trainee funding,6500,0,1625,1625,1625,1625,0,0,0,0,0,0,0
2021/22,12345,example lead school,,,Course extension provider funding,2000,0,500,500,500,500,0,0,0,0,0,0,0
2021/22,12345,example lead school,,,School Direct (salaried),82000,0,5220,5220,5220,13860,7380,7380,10660,7380,7380,7380,4920
2021/22,12345,example lead school,,,Postgraduate Teaching Apprenticeship,30000,0,1350,1350,1350,6750,2700,2700,3900,2700,2700,2700,1800`

let monthlyFundingLeadSchoolsArray = CSV.parse(monthlyFundingLeadSchoolsCsv)
monthlyFundingLeadSchoolsArray.shift()

let monthlyFundingLeadSchools = []
monthlyFundingLeadSchoolsArray.forEach(row => {
  let description = row[5]
  let monthlyPayments = row.slice(7, 19).map(value => parseInt(value))
  monthlyFundingLeadSchools.push({
    description,
    monthlyPayments
  })
})

let annualFundingLeadSchoolsCsv =
`Academic year,Lead school URN,Lead school name,Subject,Description,Funding/trainee,Trainees
2021/22,12345, example lead school,Physics,School Direct salaried,24000,2
2021/22,12345, example lead school,English,School Direct salaried,0,0
2021/22,12345, example lead school,Biology,School Direct salaried,7000,0
2021/22,12345, example lead school,Business studies,School Direct salaried,0,0
2021/22,12345, example lead school,Religious education,School Direct salaried,0,0
2021/22,12345, example lead school,Modern Languages,School Direct salaried,10000,2
2021/22,12345, example lead school,Chemistry,School Direct salaried,24000,0
2021/22,12345, example lead school,Primary with mathematics,School Direct salaried,0,0
2021/22,12345, example lead school,History,School Direct salaried,0,0`

let annualFundingLeadSchoolsArray = CSV.parse(annualFundingLeadSchoolsCsv)
annualFundingLeadSchoolsArray.shift() // remove header row

let annualFundingLeadSchools = []
annualFundingLeadSchoolsArray.forEach(row => {
  let subject          =          row[3]
  let route            =          row[4]
  let numberOfTrainees = parseInt(row[6], 10)
  let amountPerTrainee = parseInt(row[5], 10)
  annualFundingLeadSchools.push({
    subject,
    route,
    numberOfTrainees,
    amountPerTrainee
    })
})

module.exports = {
  monthlyFundingScitts,
  annualFundingScitts,
  monthlyFundingLeadSchools,
  annualFundingLeadSchools
}

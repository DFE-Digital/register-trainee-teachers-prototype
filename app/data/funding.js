const CSV = require('csv-string')
const _ = require('lodash')

// csv of monthly funding for SCITTS
const monthlyFundingScittsCsv =
`Academic year,Provider ID,Provider name,Description,Total funding,August,September,October,November,December,January,February,March,April,May,June,July
2021/22,0,Weybury SCITT,Course extension trainee payments for AY 20/21,3900,975,975,975,487.5,487.5,0,0,0,0,0,0,0
2021/22,0,Weybury SCITT,Training bursary trainees,245000,0,25245,25245,25245,12465,22050,22050,31850,22050,22050,22050,14700
2021/22,0,Weybury SCITT,Early Years ITT Bursaries & Training Grants,1117000,0,46800,52380,49590,253350,100530,100530,145210,100530,100530,100530,67020
2021/22,0,Weybury SCITT,Course extension provider payments for AY 20/21,1000,0,250,250,250,250,0,0,0,0,0,0,0
2021/22,0,Weybury SCITT,EY 21/22 in-year adjustment for withdrawals,-12833.34,0,0,0,0,-6416.67,-6416.67,0,0,0,0,0,0`

const monthlyFundingScittsArray = CSV.parse(monthlyFundingScittsCsv)
monthlyFundingScittsArray.shift() // remove header row

const monthlyFundingScitts = []
monthlyFundingScittsArray.forEach(row => {
  const descriptions = row[3]
  const monthlyPayments = row.slice(5, 17).map(value => parseInt(value))
  const cumulativeMonthlyPayments = monthlyPayments.map((payment, index, array) => {
    return array.slice(0, index + 1).reduce((a, b) => a + b, 0)
  })
  monthlyFundingScitts.push({
    descriptions,
    monthlyPayments,
    cumulativeMonthlyPayments
  })
})

// csv training bursaries and scholarships for SCITTS
const annualFundingScittsCsv =
`Provider,Provider name,Academic Year,Subject,Route,Lead Partner,Lead Partner ID,Cohort Level,Core Allocated places,Final Bursary Awards PG ITT/Tier 1 EYITT,Final Bursary Awards Tier 2 EYITT,Final Bursary Awards Tier 3 EYITT,Final Bursary Awards UG ITT/Tier 4 EYITT,Final Bursary Awards Scholarship,Final Bursary Awards No Bursary Awarded,Bursary Funding Data PG ITT/Tier 1 EYITT,Bursary Funding Data Tier 2 EYITT,Bursary Funding Data Tier £ EYITT,Bursary Funding Data UG ITT/Tier 4 EYITT,Bursary Funding Data Scholarship,Initial Bursary Funding PG ITT/Tier 1 EYITT,Initial Bursary Funding Tier 2 EYITT,Initial Bursary Funding Tier 3 EYITT,Initial Bursary Funding UG ITT/Tier 4 EYITT,Initial Bursary Funding Scholarship,Total Bursary Funding
0,Weybury SCITT,2021/22,Physics,Provider-led,,,PG,0,2,0,0,0,0,0,24000,0,0,0,26000,48000,0,0,0,0,48000
0,Weybury SCITT,2021/22,English,Provider-led,,,PG,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Mathematics,Provider-led,,,PG,0,6,0,0,0,0,0,24000,0,0,0,26000,144000,0,0,0,0,144000
0,Weybury SCITT,2021/22,Modern Languages,Provider-led,,,PG,0,2,0,0,0,0,0,10000,0,0,0,0,20000,0,0,0,0,20000
0,Weybury SCITT,2021/22,Business studies,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Chemistry,Provider-led,,,PG,0,0,0,0,0,1,0,24000,0,0,0,26000,0,0,0,0,0,26000
0,Weybury SCITT,2021/22,Art & design,Provider-led,,,PG,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,History,Provider-led,,,PG,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Computing,Provider-led,,,PG,0,0,0,0,1,0,0,24000,0,0,0,26000,0,0,0,0,26000,26000
0,Weybury SCITT,2021/22,Primary,Provider-led,,,PG,0,0,0,0,0,21,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Physical education,Provider-led,,,PG,0,0,0,0,0,11,14,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Geography,Provider-led,,,PG,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Design & technology,Provider-led,,,PG,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Primary with mathematics,Provider-led,,,PG,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Religious education,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Drama,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Biology,Provider-led,,,PG,0,1,0,0,0,0,0,7000,0,0,0,0,7000,0,0,0,0,7000
0,Weybury SCITT,2021/22,Early Years ITT,EYITT Graduate employment-based,,,PG,0,0,0,75,0,0,1,0,0,0,0,0,0,0,0,0,0,0
0,Weybury SCITT,2021/22,Early Years ITT,EYITT Graduate Entry,,,PG,0,3,1,0,0,0,0,5000,4000,2000,0,0,15000,8000,2000,0,0,25000
0,Weybury SCITT,2021/22,Primary Mathematics Specialist,Provider-led,,,PG,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`

const annualFundingScittsArray = CSV.parse(annualFundingScittsCsv)
annualFundingScittsArray.shift() // remove header row

const annualFundingScitts = []
annualFundingScittsArray.forEach(row => {
  const provider = row[2]
  const subject = row[3]
  const route = row[4]
  const leadPartner = row[5]
  const cohortLevel = row[7]
  const coreAllocatedPlaces = parseInt(row[8], 10)
  const numberOfTraineesPgIttOrTier1EyItt = parseInt(row[9], 10)
  const numberOfTraineesTier2EyItt = parseInt(row[10], 10)
  const numberOfTraineesTier3EyItt = parseInt(row[11], 10)
  const numberOfTraineesUGIttOrTier4EyItt = parseInt(row[12], 10)
  const numberOfTraineesScholarship = parseInt(row[13], 10)
  const numberOfTraineesNoBursaryAwarded = parseInt(row[14], 10)
  const amountPgIttOrTier1EyItt = parseInt(row[15], 10)
  const amountTier2EyItt = parseInt(row[16], 10)
  const amountTier3EyItt = parseInt(row[17], 10)
  const amountUGIttOrTier4EyItt = parseInt(row[18], 10)
  const amountScholarship = parseInt(row[19], 10)
  const numberOfTrainees = [
    numberOfTraineesPgIttOrTier1EyItt,
    numberOfTraineesTier2EyItt,
    numberOfTraineesTier3EyItt,
    numberOfTraineesUGIttOrTier4EyItt,
    numberOfTraineesScholarship,
    numberOfTraineesNoBursaryAwarded
  ]
  const hasTrainees = numberOfTrainees.some(type => parseInt(type))
  if (hasTrainees) {
    annualFundingScitts.push(
      {
        provider,
        subject,
        route,
        leadPartner,
        cohortLevel,
        coreAllocatedPlaces,
        numberOfTraineesPgIttOrTier1EyItt,
        numberOfTraineesTier2EyItt,
        numberOfTraineesTier3EyItt,
        numberOfTraineesUGIttOrTier4EyItt,
        numberOfTraineesScholarship,
        numberOfTraineesNoBursaryAwarded,
        amountPgIttOrTier1EyItt,
        amountTier2EyItt,
        amountTier3EyItt,
        amountUGIttOrTier4EyItt,
        amountScholarship
      })
  }
})

const monthlyFundingLeadPartnersCsv =
`Academic year,Lead partner URN,Lead partner name,Provider ID,Provider name,Description,Total funding,August,September,October,November,December,January,February,March,April,May,June,July
2021/22,12345,example lead partner,,,Course extension trainee funding,6500,0,1625,1625,1625,1625,0,0,0,0,0,0,0
2021/22,12345,example lead partner,,,Course extension provider funding,2000,0,500,500,500,500,0,0,0,0,0,0,0
2021/22,12345,example lead partner,,,School Direct (salaried),82000,0,5220,5220,5220,13860,7380,7380,10660,7380,7380,7380,4920
2021/22,12345,example lead partner,,,Postgraduate Teaching Apprenticeship,30000,0,1350,1350,1350,6750,2700,2700,3900,2700,2700,2700,1800`

const monthlyFundingLeadPartnersArray = CSV.parse(monthlyFundingLeadPartnersCsv)
monthlyFundingLeadPartnersArray.shift()

const monthlyFundingLeadPartners = []
monthlyFundingLeadPartnersArray.forEach(row => {
  const descriptions = row[5]
  const monthlyPayments = row.slice(7, 19).map(value => parseInt(value))
  const cumulativeMonthlyPayments = monthlyPayments.map((payment, index, array) => {
    return array.slice(0, index + 1).reduce((a, b) => a + b, 0)
  })
  monthlyFundingLeadPartners.push({
    descriptions,
    monthlyPayments,
    cumulativeMonthlyPayments
  })
})

const annualFundingLeadPartnersCsv =
`Academic year,Lead partner URN,Lead partner name,Subject,Description,Funding/trainee,Trainees
2021/22,12345, example lead partner,Physics,School Direct salaried,24000,2
2021/22,12345, example lead partner,English,School Direct salaried,0,0
2021/22,12345, example lead partner,Biology,School Direct salaried,7000,0
2021/22,12345, example lead partner,Business studies,School Direct salaried,0,0
2021/22,12345, example lead partner,Religious education,School Direct salaried,0,0
2021/22,12345, example lead partner,Modern Languages,School Direct salaried,10000,2
2021/22,12345, example lead partner,Chemistry,School Direct salaried,24000,0
2021/22,12345, example lead partner,Primary with mathematics,School Direct salaried,0,0
2021/22,12345, example lead partner,History,School Direct salaried,0,0`

const annualFundingLeadPartnersArray = CSV.parse(annualFundingLeadPartnersCsv)
annualFundingLeadPartnersArray.shift() // remove header row

const annualFundingLeadPartners = []
annualFundingLeadPartnersArray.forEach(row => {
  const subject = row[3]
  const route = row[4]
  const numberOfTrainees = parseInt(row[6], 10)
  const amountPerTrainee = parseInt(row[5], 10)
  annualFundingLeadPartners.push({
    subject,
    route,
    numberOfTrainees,
    amountPerTrainee
  })
})

module.exports = {
  monthlyFundingScitts,
  annualFundingScitts,
  monthlyFundingLeadPartners,
  annualFundingLeadPartners
}

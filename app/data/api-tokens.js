// Accepted token statuses
const tokenStatus = ["Active", "Expired", "Revoked"]

// This is to simulate some fake API tokens for testing
const tokens = [{
   tokenName: 'Bayer Group',
   tokenStatus: 'Active',
   createdBy: 'Shad Prosacco',
   dateCreated: '3rd March 2025',
   lastUsedDate: '5th March 2025',
   dateRevoked: '',
   dateExpired: '',
   tokenActions: 'Revoke'
  },
  {
    tokenName: 'Bayer Group Vendor Test',
    tokenStatus: 'Revoked',
    createdBy: 'Stefanie Runte',
    dateCreated: '31st December 2024',
    lastUsedDate: '19th January 2025',
    dateRevoked: '25th January 2025',
    dateExpired: '',
    tokenActions: ''
  },
  {
    tokenName: 'Weimann-Reinger',
    tokenStatus: 'Expired',
    createdBy: 'Jedediah Littel',
    dateCreated: '1st September 2024',
    lastUsedDate: '14th December 2024',
    dateRevoked: '',
    dateExpired: '31st December 2024',
    tokenActions: ''
  }
]

function generateNewToken() {
  const part1 = 'yweuyi'
  const part2 = 172351273
  const token = `${part1}${part2}`;
  console.log(token)
  return token
}

module.exports = {
  tokens,
  tokenStatus,
  generateNewToken
}

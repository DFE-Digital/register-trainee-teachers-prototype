// This is to simulate some fake API tokens for testing

const tokens = [{
   tokenName: 'Bayer Group',
   tokenStatus: 'Active',
   createdBy: 'Shad Prosacco',
   dateCreated: '03/03/2025',
   lastUsedDate: '05/03/2025',
   dateRevoked: '',
   dateExpired: '',
   tokenActions: 'Revoke'
  },
  {
    tokenName: 'Bayer Group Vendor Test',
    tokenStatus: 'Revoked',
    createdBy: 'Stefanie Runte',
    dateCreated: '31/12/2024',
    lastUsedDate: '19/01/2025',
    dateRevoked: '25/01/2025',
    dateExpired: '',
    tokenActions: ''
  },
  {
    tokenName: 'Weimann-Reinger',
    tokenStatus: 'Expired',
    createdBy: 'Jedediah Littel',
    dateCreated: '01/09/2024',
    lastUsedDate: '14/12/2024',
    dateRevoked: '',
    dateExpired: '31/12/2024',
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
  generateNewToken
}

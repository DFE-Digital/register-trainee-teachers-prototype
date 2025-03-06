// This is to simulate some fake API tokens for testing

const tokens = [{
   tokenName: 'Bayer Group Vendor Test',
   tokenStatus: 'Active',
   createdBy: 'John Doe',
   dateCreated: '01/12/2024',
   lastUsedDate: '01/02/2024',
   dateRevoked: '01/12/2024',
   dateExpired: '01/12/2024',
   tokenActions: 'Revoke'
  },
  {
    tokenName: 'For Ernest Ryan',
    tokenStatus: 'Expired',
    createdBy: 'John Doe',
    dateCreated: '01/12/2024',
    lastUsedDate: '01/02/2024',
    dateRevoked: '01/12/2024',
    dateExpired: '01/12/2024',
    tokenActions: 'Revoke'
  },
  {
    tokenName: 'Carlie Yundt\'s',
    tokenStatus: 'Expired',
    createdBy: 'John Doe',
    dateCreated: '01/12/2024',
    lastUsedDate: '19/02/2024',
    dateRevoked: '01/12/2024',
    dateExpired: '01/12/2024',
    tokenActions: 'Revoke'
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

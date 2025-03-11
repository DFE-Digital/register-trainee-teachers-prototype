// Accepted token statuses
const tokenStatus = ["Active", "Expired", "Revoked"]

// This is to simulate some fake API tokens for testing
const tokens = [{
   tokenName: 'ByteForge Solutions',
   tokenStatus: 'Active',
   createdBy: 'Shad Prosacco',
   dateCreated: '3rd March 2025',
   lastUsedDate: '5th March 2025',
   revokedBy: '',
   dateRevoked: '',
   dateExpired: '',
   tokenActions: 'Revoke'
  },
  {
    tokenName: 'NexaTech Innovations Vendor Test',
    tokenStatus: 'Revoked',
    createdBy: 'Stefanie Runte',
    dateCreated: '31st December 2024',
    lastUsedDate: '19th January 2025',
    revokedBy: 'Stefanie Runte',
    dateRevoked: '25th January 2025',
    dateExpired: '',
    tokenActions: ''
  },
  {
    tokenName: 'BayerGroup_Vendor_Integration_Token_External_API_Access_Production_2025',
    tokenStatus: 'Expired',
    createdBy: 'Jedediah Littel',
    dateCreated: '1st September 2024',
    lastUsedDate: '14th December 2024',
    dateRevoked: '',
    revokedBy: '',
    dateExpired: '31st December 2024',
    tokenActions: ''
  }
]

function generateNewToken () {
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

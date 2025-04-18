const allUserPermissions = {
  accreditingProvider: [
    'view trainees',
    // "add trainees",
    'add and edit trainees',
    'export trainees',
    'view funding'
  ],
  leadPartner: [
    'view trainees',
    'view funding'
    // "export trainees"
  ]
}

const allAdminPermissions = allUserPermissions
// Push in `manage team members`
Object.keys(allAdminPermissions).forEach(type => {
  allAdminPermissions[type].unshift('manage team members')
})

module.exports = {
  allUserPermissions,
  allAdminPermissions
}
